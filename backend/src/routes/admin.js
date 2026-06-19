import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireAdminRole } from '../middleware/adminAuth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { assignPlanToUser, cancelSubscription, validateCoupon } from '../services/billingService.js';
import { writeAuditLog } from '../services/auditService.js';

export const adminRouter = Router();

const ACTIVE_WINDOW_MINUTES = 15;
const ONLINE_WINDOW_MINUTES = 5;
const MEMBERSHIP_PRICE = 999;

const isMissingDatabaseFeature = (error) => {
  const message = `${error?.code || ''} ${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return [
    '42p01',
    '42703',
    'pgrst106',
    'does not exist',
    'could not find',
    'schema must be one of',
    'relationship'
  ].some((pattern) => message.includes(pattern));
};

const safeQuery = async (query, fallback) => {
  const result = await query;
  if (result.error) {
    if (isMissingDatabaseFeature(result.error)) return fallback;
    throw result.error;
  }
  return result;
};

const postReportUpdateSchema = z.object({
  status: z.enum(['open', 'reviewing', 'resolved', 'dismissed']).optional(),
  adminResponse: z.string().trim().max(1000).optional().nullable()
});

const mapMember = (member) => member ? {
  id: member.id,
  name: member.full_name || member.email || 'Member',
  email: member.email || '',
  accountType: member.account_type || 'business'
} : null;

const listPostReports = async () => {
  const { data: reports } = await safeQuery(
    supabaseAdmin
      .schema('postverse')
      .from('post_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
    { data: [] }
  );

  const postIds = [...new Set((reports || []).map((report) => report.post_id).filter(Boolean))];
  const reporterIds = [...new Set((reports || []).map((report) => report.reporter_id).filter(Boolean))];
  const reviewerIds = [...new Set((reports || []).map((report) => report.reviewed_by).filter(Boolean))];

  const [{ data: posts }, { data: reporters }] = await Promise.all([
    postIds.length
      ? safeQuery(
          supabaseAdmin
            .schema('postverse')
            .from('posts')
            .select('id, author_id, account_type, caption, media_url, media_type, status, published_at, created_at')
            .in('id', postIds),
          { data: [] }
        )
      : { data: [] },
    [...new Set([...reporterIds, ...reviewerIds])].length
      ? safeQuery(
          supabaseAdmin
            .schema('core')
            .from('members')
            .select('id, email, full_name, account_type')
            .in('id', [...new Set([...reporterIds, ...reviewerIds])]),
          { data: [] }
        )
      : { data: [] }
  ]);

  const authorIds = [...new Set((posts || []).map((post) => post.author_id).filter(Boolean))];
  const { data: authors } = authorIds.length
    ? await safeQuery(
        supabaseAdmin
          .schema('core')
          .from('members')
          .select('id, email, full_name, account_type')
          .in('id', authorIds),
        { data: [] }
      )
    : { data: [] };

  const postsById = Object.fromEntries((posts || []).map((post) => [post.id, post]));
  const membersById = Object.fromEntries([...(reporters || []), ...(authors || [])].map((member) => [member.id, member]));

  return (reports || []).map((report) => {
    const post = postsById[report.post_id] || null;
    return {
      id: report.id,
      postId: report.post_id,
      reason: report.reason,
      details: report.details || '',
      status: report.status,
      adminResponse: report.admin_response || '',
      createdAt: report.created_at,
      updatedAt: report.updated_at,
      reviewedAt: report.reviewed_at,
      reporter: mapMember(membersById[report.reporter_id]),
      reviewer: mapMember(membersById[report.reviewed_by]),
      post: post ? {
        id: post.id,
        authorId: post.author_id,
        author: mapMember(membersById[post.author_id]),
        accountType: post.account_type,
        caption: post.caption,
        mediaUrl: post.media_url,
        mediaType: post.media_type,
        status: post.status,
        publishedAt: post.published_at || post.created_at
      } : null
    };
  });
};

const updatePostReport = async (reportId, reviewerId, payload) => {
  const update = {
    updated_at: new Date().toISOString()
  };

  if (payload.status) update.status = payload.status;
  if (payload.adminResponse !== undefined) update.admin_response = payload.adminResponse || null;

  if (payload.status && ['resolved', 'dismissed'].includes(payload.status)) {
    update.reviewed_by = reviewerId;
    update.reviewed_at = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .schema('postverse')
    .from('post_reports')
    .update(update)
    .eq('id', reportId)
    .select('*')
    .single();

  if (error) {
    if (isMissingDatabaseFeature(error)) {
      const setupError = new Error('Post reporting is not configured yet.');
      setupError.status = 503;
      throw setupError;
    }
    throw error;
  }

  return data;
};

const fallbackPlans = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    code: 'BUSINESSVERSE_ANNUAL',
    name: 'BusinessVerse Annual Membership',
    description: 'Business visibility, daily posts, creator discovery, and direct collaboration.',
    account_type: 'business',
    amount_inr: 999,
    duration_days: 365,
    features: ['Business listing', '365 days marketing', 'Daily posts', 'Creator discovery'],
    is_active: true,
    setup_required: true
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    code: 'CREATORVERSE_ANNUAL',
    name: 'CreatorVerse Annual Membership',
    description: 'Creator profile, daily posts, business discovery, and direct collaboration.',
    account_type: 'creator',
    amount_inr: 999,
    duration_days: 365,
    features: ['Creator listing', '365 days marketing', 'Daily posts', 'Business discovery'],
    is_active: true,
    setup_required: true
  }
];

const listQuerySchema = z.object({
  accountType: z.enum(['business', 'creator']).optional(),
  search: z.string().trim().optional().default(''),
  subscriptionStatus: z.string().trim().optional().default('all'),
  accountStatus: z.string().trim().optional().default('all'),
  sortBy: z.enum(['created_at', 'last_active_at', 'email', 'full_name', 'subscription_status']).optional().default('created_at'),
  sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().min(5).max(100).optional().default(25)
});

const trafficQuerySchema = z.object({
  range: z.enum(['day', 'week', 'month', 'year']).optional().default('month'),
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional()
});

const planSchema = z.object({
  code: z.string().trim().min(2).max(80).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().optional().nullable(),
  accountType: z.enum(['business', 'creator']).optional().nullable(),
  amountInr: z.number().int().nonnegative(),
  durationDays: z.number().int().positive(),
  features: z.array(z.string().trim()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0)
});

const couponSchema = z.object({
  code: z.string().trim().min(2).max(80).transform((value) => value.toUpperCase()),
  title: z.string().trim().min(2).max(160),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().int().nonnegative(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().optional().default(1),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  applicablePlanIds: z.array(z.string().uuid()).optional().default([]),
  userIds: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true)
}).superRefine((payload, ctx) => {
  if (payload.discountType === 'percentage' && payload.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['discountValue'],
      message: 'Percentage discount cannot be more than 100.'
    });
  }
});

const assignPlanSchema = z.object({
  userId: z.string().uuid(),
  planId: z.string().uuid(),
  action: z.enum(['assign', 'upgrade', 'downgrade', 'extend', 'free_access']).default('assign'),
  freeAccess: z.boolean().optional().default(false)
});

const countRows = async (schema, table, filters = []) => {
  let query = supabaseAdmin.schema(schema).from(table).select('*', { count: 'exact', head: true });
  filters.forEach(([column, value]) => {
    query = query.eq(column, value);
  });
  const { count, error } = await query;
  if (error) {
    if (isMissingDatabaseFeature(error)) return 0;
    throw error;
  }
  return count || 0;
};

const sumPostMetrics = async () => {
  const { data, error } = await supabaseAdmin
    .schema('postverse')
    .from('post_metrics')
    .select('views, likes, comments, shares, saves, inquiries, reach, impressions');

  if (error) {
    if (isMissingDatabaseFeature(error)) {
      const fallback = await safeQuery(
        supabaseAdmin.schema('postverse').from('post_metrics').select('views, saves, inquiries'),
        { data: [] }
      );
      return (fallback.data || []).reduce((total, row) => ({
        ...total,
        views: total.views + (row.views || 0),
        saves: total.saves + (row.saves || 0),
        inquiries: total.inquiries + (row.inquiries || 0)
      }), { views: 0, likes: 0, comments: 0, shares: 0, saves: 0, inquiries: 0, reach: 0, impressions: 0 });
    }
    throw error;
  }

  return (data || []).reduce((total, row) => ({
    views: total.views + (row.views || 0),
    likes: total.likes + (row.likes || 0),
    comments: total.comments + (row.comments || 0),
    shares: total.shares + (row.shares || 0),
    saves: total.saves + (row.saves || 0),
    inquiries: total.inquiries + (row.inquiries || 0),
    reach: total.reach + (row.reach || 0),
    impressions: total.impressions + (row.impressions || 0)
  }), {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    inquiries: 0,
    reach: 0,
    impressions: 0
  });
};

const getDateWindow = ({ range, start, end }) => {
  if (start && end) {
    return { startDate: new Date(start), endDate: new Date(end) };
  }

  const endDate = new Date();
  const startDate = new Date(endDate);
  if (range === 'day') startDate.setDate(endDate.getDate() - 1);
  if (range === 'week') startDate.setDate(endDate.getDate() - 7);
  if (range === 'month') startDate.setMonth(endDate.getMonth() - 1);
  if (range === 'year') startDate.setFullYear(endDate.getFullYear() - 1);

  return { startDate, endDate };
};

const dayKey = (value) => new Date(value).toISOString().slice(0, 10);

const groupByDay = (rows, dateKey = 'created_at', valueFn = () => 1) => {
  const grouped = new Map();
  (rows || []).forEach((row) => {
    const key = dayKey(row[dateKey]);
    grouped.set(key, (grouped.get(key) || 0) + valueFn(row));
  });
  return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));
};

const percent = (part, total) => total ? Math.round((part / total) * 1000) / 10 : 0;

const getMemberProfiles = async (memberIds = []) => {
  const ids = [...new Set(memberIds)].filter(Boolean);
  if (!ids.length) return {};

  const [
    { data: businessProfiles },
    { data: creatorProfiles }
  ] = await Promise.all([
    safeQuery(supabaseAdmin.schema('businessverse').from('profiles').select('*').in('owner_id', ids), { data: [] }),
    safeQuery(supabaseAdmin.schema('creatorverse').from('profiles').select('*').in('owner_id', ids), { data: [] })
  ]);

  return {
    business: Object.fromEntries((businessProfiles || []).map((profile) => [profile.owner_id, profile])),
    creator: Object.fromEntries((creatorProfiles || []).map((profile) => [profile.owner_id, profile]))
  };
};

const getProfileImages = async (profilesByType) => {
  const assetIds = [
    ...Object.values(profilesByType.business || {}).map((profile) => profile.logo_asset_id),
    ...Object.values(profilesByType.creator || {}).map((profile) => profile.profile_asset_id)
  ].filter(Boolean);

  if (!assetIds.length) return {};

  const { data } = await safeQuery(
    supabaseAdmin
      .schema('core')
      .from('media_assets')
      .select('id, public_url')
      .in('id', assetIds),
    { data: [] }
  );
  return Object.fromEntries((data || []).map((asset) => [asset.id, asset.public_url]));
};

const selectMembersForAdmin = async ({ accountType, search, subscriptionStatus = 'all', accountStatus = 'all', sortBy = 'created_at', sortDir = 'desc', from = 0, to = 99 } = {}) => {
  const baseColumns = 'id, email, full_name, mobile_number, account_type, subscription_status, subscription_expires_at, created_at';
  const richColumns = `${baseColumns}, account_status, last_active_at`;

  const buildQuery = (columns) => {
    let request = supabaseAdmin
      .schema('core')
      .from('members')
      .select(columns, { count: 'exact' });

    if (accountType) request = request.eq('account_type', accountType);
    if (subscriptionStatus !== 'all') request = request.eq('subscription_status', subscriptionStatus);
    if (columns.includes('account_status') && accountStatus !== 'all') request = request.eq('account_status', accountStatus);
    if (search) {
      request = request.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,mobile_number.ilike.%${search}%`);
    }

    const safeSortBy = columns.includes(sortBy) ? sortBy : 'created_at';
    return request.order(safeSortBy, { ascending: sortDir === 'asc', nullsFirst: false }).range(from, to);
  };

  const rich = await buildQuery(richColumns);
  if (!rich.error) return rich;
  if (!isMissingDatabaseFeature(rich.error)) throw rich.error;

  const fallback = await buildQuery(baseColumns);
  if (fallback.error) throw fallback.error;
  return {
    ...fallback,
    data: (fallback.data || []).map((member) => ({
      ...member,
      account_status: 'active',
      last_active_at: null
    }))
  };
};

const shapeAdminMember = (member, profilesByType, assetsById) => {
  const isCreator = member.account_type === 'creator';
  const profile = isCreator ? profilesByType.creator?.[member.id] : profilesByType.business?.[member.id];
  const imageAssetId = isCreator ? profile?.profile_asset_id : profile?.logo_asset_id;
  const lastActiveAt = member.last_active_at ? new Date(member.last_active_at) : null;
  const online = lastActiveAt ? Date.now() - lastActiveAt.getTime() <= ONLINE_WINDOW_MINUTES * 60 * 1000 : false;

  return {
    id: member.id,
    profileImage: assetsById[imageAssetId] || null,
    userName: isCreator
      ? profile?.full_name || member.full_name || member.email
      : profile?.business_name || member.full_name || member.email,
    email: member.email,
    mobileNumber: member.mobile_number,
    accountType: member.account_type,
    registrationDate: member.created_at,
    lastActiveDate: member.last_active_at,
    subscriptionStatus: member.subscription_status,
    subscriptionExpiresAt: member.subscription_expires_at,
    onlineStatus: online ? 'online' : 'offline',
    accountStatus: member.account_status || 'active',
    profileDetails: profile || null
  };
};

const buildAdminUserDetail = async (userId) => {
  const { data: member, error: memberError } = await supabaseAdmin
    .schema('core')
    .from('members')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (memberError) throw memberError;
  if (!member) return null;

  const profilesByType = await getMemberProfiles([userId]);
  const assetsById = await getProfileImages(profilesByType);

  const postsResult = await safeQuery(
    supabaseAdmin.schema('postverse').from('posts').select('id, caption, media_type, status, created_at, published_at').eq('author_id', userId).order('created_at', { ascending: false }),
    { data: [] }
  );

  let metricsResult = await safeQuery(
    supabaseAdmin.schema('postverse').from('posts').select('id, created_at, post_metrics(views, likes, comments, shares, saves, inquiries, reach, impressions)').eq('author_id', userId),
    { data: null }
  );

  if (metricsResult.data === null) {
    metricsResult = await safeQuery(
      supabaseAdmin.schema('postverse').from('posts').select('id, created_at, post_metrics(views, saves, inquiries)').eq('author_id', userId),
      { data: [] }
    );
  }

  const trafficResult = await safeQuery(
    supabaseAdmin.schema('admin').from('traffic_events').select('route, duration_seconds, created_at').eq('user_id', userId).order('created_at', { ascending: true }).limit(1000),
    { data: [] }
  );

  const posts = postsResult.data || [];
  const metrics = metricsResult.data || [];
  const traffic = trafficResult.data || [];

  const totals = (metrics || []).reduce((sum, post) => {
    const row = Array.isArray(post.post_metrics) ? post.post_metrics[0] || {} : post.post_metrics || {};
    return {
      likes: sum.likes + (row.likes || 0),
      comments: sum.comments + (row.comments || 0),
      shares: sum.shares + (row.shares || 0),
      reach: sum.reach + (row.reach || 0),
      impressions: sum.impressions + (row.impressions || 0),
      views: sum.views + (row.views || 0)
    };
  }, { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0, views: 0 });

  const engagementBase = totals.impressions || totals.reach || totals.views;

  return {
    user: shapeAdminMember(member, profilesByType, assetsById),
    profile: member.account_type === 'creator' ? profilesByType.creator[userId] : profilesByType.business[userId],
    activityAnalytics: {
      totalPosts: posts.length,
      totalFollowers: 0,
      totalFollowing: 0,
      totalLikes: totals.likes,
      totalComments: totals.comments,
      totalShares: totals.shares,
      totalReach: totals.reach,
      totalImpressions: totals.impressions,
      engagementRate: percent(totals.likes + totals.comments + totals.shares, engagementBase)
    },
    growthAnalytics: {
      dailyGrowth: groupByDay(posts),
      weeklyGrowth: groupByDay(posts),
      monthlyGrowth: groupByDay(posts),
      historicalPerformance: groupByDay(metrics, 'created_at', (post) => {
        const row = Array.isArray(post.post_metrics) ? post.post_metrics[0] || {} : post.post_metrics || {};
        return (row.views || 0) + (row.impressions || 0);
      })
    },
    subscriptionAnalytics: {
      currentPlan: member.subscription_status === 'active' ? 'Annual Membership Rs 999' : 'No active plan',
      previousPlans: [],
      subscriptionHistory: [{
        status: member.subscription_status,
        startedAt: member.subscription_started_at,
        expiresAt: member.subscription_expires_at
      }],
      paymentHistory: member.subscription_status === 'active' ? [{
        amount: MEMBERSHIP_PRICE,
        currency: 'INR',
        status: 'active',
        paidAt: member.subscription_started_at
      }] : []
    },
    posts,
    traffic: {
      totalEvents: traffic?.length || 0,
      averageDurationSeconds: traffic?.length
        ? Math.round((traffic || []).reduce((sum, event) => sum + (event.duration_seconds || 0), 0) / traffic.length)
        : 0,
      routeBreakdown: Object.entries((traffic || []).reduce((map, event) => {
        map[event.route] = (map[event.route] || 0) + 1;
        return map;
      }, {})).map(([route, count]) => ({ route, count }))
    }
  };
};

const logAudit = async ({ actorId, actorRole, action, entityType, entityId, metadata = {}, ipAddress = null }) => {
  const { error } = await supabaseAdmin
    .schema('admin')
    .from('audit_logs')
    .insert({
      actor_id: actorId,
      actor_role: actorRole,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      ip_address: ipAddress
    });

  if (error && !isMissingDatabaseFeature(error)) throw error;
};

const resolveUserIds = async (userIds) => {
  if (!userIds || !userIds.length) return [];
  const resolved = [];
  const emailsToLookUp = [];

  for (const idOrEmail of userIds) {
    const trimmed = idOrEmail.trim();
    if (!trimmed) continue;
    if (/^[0-9a-f-]{36}$/i.test(trimmed)) {
      resolved.push(trimmed);
    } else if (trimmed.includes('@')) {
      emailsToLookUp.push(trimmed.toLowerCase());
    } else {
      const error = new Error(`Invalid identifier: "${trimmed}". Must be a user ID or email address.`);
      error.status = 400;
      throw error;
    }
  }

  if (emailsToLookUp.length) {
    const { data: members, error } = await supabaseAdmin
      .schema('core')
      .from('members')
      .select('id, email')
      .in('email', emailsToLookUp);

    if (error) throw error;

    const emailToIdMap = Object.fromEntries((members || []).map((m) => [m.email.toLowerCase(), m.id]));

    for (const email of emailsToLookUp) {
      const id = emailToIdMap[email];
      if (!id) {
        const error = new Error(`User with email "${email}" not found.`);
        error.status = 400;
        throw error;
      }
      resolved.push(id);
    }
  }

  return [...new Set(resolved)];
};

adminRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .schema('admin')
      .from('users')
      .select('role')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    res.json({ role: data?.role || null });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/health', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  const startedAt = Date.now();
  try {
    const { error: dbError } = await supabaseAdmin.schema('core').from('members').select('id', { head: true, count: 'exact' }).limit(1);
    const { data: apiLogs } = await safeQuery(
      supabaseAdmin
        .schema('admin')
        .from('api_request_logs')
        .select('status_code, duration_ms, created_at')
        .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(500),
      { data: [] }
    );

    const errors = (apiLogs || []).filter((log) => log.status_code >= 500);
    const avgResponseTime = (apiLogs || []).length
      ? Math.round(apiLogs.reduce((sum, log) => sum + (log.duration_ms || 0), 0) / apiLogs.length)
      : Date.now() - startedAt;

    res.json({
      health: {
        website: 'operational',
        application: 'operational',
        database: dbError ? 'degraded' : 'operational',
        api: errors.length ? 'degraded' : 'operational',
        server: 'operational',
        errorCount15m: errors.length,
        averageResponseTimeMs: avgResponseTime,
        checkedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/superadmin/overview', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const activeSince = new Date(Date.now() - ACTIVE_WINDOW_MINUTES * 60 * 1000).toISOString();
    const onlineSince = new Date(Date.now() - ONLINE_WINDOW_MINUTES * 60 * 1000).toISOString();
    const [
      totalUsers,
      businessUsers,
      creatorUsers,
      activeUsers,
      onlineUsersResult,
      totalPosts,
      activeSubscriptions,
      commentsCount,
      likesCount,
      sharesCount,
      metrics,
      admins
    ] = await Promise.all([
      countRows('core', 'members'),
      countRows('core', 'members', [['account_type', 'business']]),
      countRows('core', 'members', [['account_type', 'creator']]),
      countRows('core', 'members', [['account_status', 'active']]),
      safeQuery(
        supabaseAdmin.schema('core').from('members').select('*', { count: 'exact', head: true }).gte('last_active_at', onlineSince),
        { count: 0 }
      ).then(({ count }) => count || 0),
      countRows('postverse', 'posts', [['status', 'published']]),
      countRows('core', 'members', [['subscription_status', 'active']]),
      countRows('postverse', 'post_comments', [['status', 'visible']]),
      countRows('postverse', 'post_reactions', [['reaction_type', 'like']]),
      countRows('postverse', 'post_shares'),
      sumPostMetrics(),
      countRows('admin', 'users')
    ]);

    const { data: recentMembers } = await selectMembersForAdmin({ from: 0, to: 7 });

    const profilesByType = await getMemberProfiles((recentMembers || []).map((member) => member.id));
    const assetsById = await getProfileImages(profilesByType);

    res.json({
      stats: {
        totalUsers,
        totalBusinessVerseUsers: businessUsers,
        totalCreatorVerseUsers: creatorUsers,
        totalActiveUsers: activeUsers,
        totalOnlineUsers: onlineUsersResult,
        totalPosts,
        totalComments: commentsCount || metrics.comments,
        totalLikes: likesCount || metrics.likes,
        totalShares: sharesCount || metrics.shares,
        totalRevenue: activeSubscriptions * MEMBERSHIP_PRICE,
        totalSubscriptions: activeSubscriptions,
        totalReach: metrics.reach,
        totalImpressions: metrics.impressions,
        totalAdmins: admins,
        activeWindowMinutes: ACTIVE_WINDOW_MINUTES
      },
      recentMembers: (recentMembers || []).map((member) => shapeAdminMember(member, profilesByType, assetsById))
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/superadmin/traffic', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const query = trafficQuerySchema.parse(req.query);
    const { startDate, endDate } = getDateWindow(query);

    const { data: events } = await safeQuery(
      supabaseAdmin
        .schema('admin')
        .from('traffic_events')
        .select('id, user_id, event_name, route, referrer, device_type, browser, country, region, city, session_id, duration_seconds, bounce, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true })
        .limit(10000),
      { data: [] }
    );

    const sessions = new Set((events || []).map((event) => event.session_id).filter(Boolean));
    const visitors = new Set((events || []).map((event) => event.user_id || event.session_id || event.id));
    const durations = (events || []).map((event) => event.duration_seconds).filter((value) => Number.isFinite(value));
    const bounceEvents = (events || []).filter((event) => event.bounce === true).length;

    const groupCount = (key) => Object.entries((events || []).reduce((map, event) => {
      const value = event[key] || 'Unknown';
      map[value] = (map[value] || 0) + 1;
      return map;
    }, {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

    const { data: growthMembers, error: growthError } = await supabaseAdmin
      .schema('core')
      .from('members')
      .select('id, account_type, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (growthError) throw growthError;

    res.json({
      summary: {
        realTimeVisitors: (events || []).filter((event) => new Date(event.created_at) >= new Date(Date.now() - 5 * 60 * 1000)).length,
        totalEvents: events.length,
        uniqueVisitors: visitors.size,
        sessions: sessions.size,
        averageSessionDurationSeconds: durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : 0,
        bounceRate: percent(bounceEvents, events.length),
        retentionRate: percent(new Set((events || []).filter((event) => event.user_id).map((event) => event.user_id)).size, visitors.size),
        range: { start: startDate.toISOString(), end: endDate.toISOString() }
      },
      charts: {
        dailyTraffic: groupByDay(events),
        userGrowth: groupByDay(growthMembers),
        businessGrowth: groupByDay((growthMembers || []).filter((member) => member.account_type === 'business')),
        creatorGrowth: groupByDay((growthMembers || []).filter((member) => member.account_type === 'creator')),
        deviceAnalytics: groupCount('device_type'),
        browserAnalytics: groupCount('browser'),
        geographicTraffic: groupCount('city')
      }
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/superadmin/users', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const from = (query.page - 1) * query.pageSize;
    const to = from + query.pageSize - 1;

    const { data, count } = await selectMembersForAdmin({
      accountType: query.accountType,
      search: query.search,
      subscriptionStatus: query.subscriptionStatus,
      accountStatus: query.accountStatus,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      from,
      to
    });

    const profilesByType = await getMemberProfiles((data || []).map((member) => member.id));
    const assetsById = await getProfileImages(profilesByType);

    res.json({
      users: (data || []).map((member) => shapeAdminMember(member, profilesByType, assetsById)),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / query.pageSize)
      }
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/superadmin/users/:id', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const userId = req.params.id;
    const detail = await buildAdminUserDetail(userId);
    if (!detail) return res.status(404).json({ error: 'User not found' });

    await logAudit({
      actorId: req.user.id,
      actorRole: req.adminRole,
      action: 'superadmin.user.deep_access.viewed',
      entityType: 'core.members',
      entityId: userId,
      metadata: { accountType: detail.user.accountType, email: detail.user.email },
      ipAddress: req.ip?.replace('::ffff:', '') || null
    });

    res.json(detail);
  } catch (error) {
    next(error);
  }
});

const editUserSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  email: z.string().email().optional(),
  mobileNumber: z.string().trim().optional().nullable(),
  accountStatus: z.enum(['active', 'suspended', 'deactivated']).optional(),
  businessName: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  website: z.string().url().optional().or(z.literal('')).nullable(),
  aboutCompany: z.string().trim().max(1000).optional().nullable(),
  skills: z.array(z.string().trim()).optional(),
  portfolioUrl: z.string().url().optional().or(z.literal('')).nullable(),
  aboutMe: z.string().trim().max(1000).optional().nullable(),
  contactDetails: z.object({
    email: z.string().email().optional().or(z.literal('')).nullable(),
    mobile: z.string().trim().optional().or(z.literal('')).nullable()
  }).optional().default({})
});

adminRouter.put('/superadmin/users/:id', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const userId = req.params.id;
    const payload = editUserSchema.parse(req.body);

    const { data: member, error: memberError } = await supabaseAdmin
      .schema('core')
      .from('members')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (memberError) throw memberError;
    if (!member) return res.status(404).json({ error: 'User not found' });

    const memberUpdate = {};
    if (payload.fullName !== undefined) memberUpdate.full_name = payload.fullName;
    if (payload.email !== undefined) memberUpdate.email = payload.email;
    if (payload.mobileNumber !== undefined) memberUpdate.mobile_number = payload.mobileNumber;
    if (payload.accountStatus !== undefined) memberUpdate.account_status = payload.accountStatus;
    memberUpdate.updated_at = new Date().toISOString();

    const { data: updatedMember, error: updateMemError } = await supabaseAdmin
      .schema('core')
      .from('members')
      .update(memberUpdate)
      .eq('id', userId)
      .select('*')
      .single();

    if (updateMemError) throw updateMemError;

    let updatedProfile = null;
    if (member.account_type === 'creator') {
      const creatorUpdate = {};
      if (payload.fullName !== undefined) creatorUpdate.full_name = payload.fullName;
      if (payload.skills !== undefined) creatorUpdate.skills = payload.skills;
      if (payload.city !== undefined) creatorUpdate.city = payload.city;
      if (payload.state !== undefined) creatorUpdate.state = payload.state;
      if (payload.portfolioUrl !== undefined) creatorUpdate.portfolio_url = payload.portfolioUrl || null;
      if (payload.aboutMe !== undefined) creatorUpdate.about_me = payload.aboutMe || null;
      if (payload.contactDetails !== undefined) {
        creatorUpdate.contact_details = {
          email: payload.contactDetails.email || null,
          mobile: payload.contactDetails.mobile || null
        };
      }
      creatorUpdate.updated_at = new Date().toISOString();

      const { data: profileData, error: profileError } = await supabaseAdmin
        .schema('creatorverse')
        .from('profiles')
        .update(creatorUpdate)
        .eq('owner_id', userId)
        .select('*')
        .maybeSingle();

      if (profileError) throw profileError;
      updatedProfile = profileData;
    } else {
      const businessUpdate = {};
      if (payload.businessName !== undefined) businessUpdate.business_name = payload.businessName;
      if (payload.industry !== undefined) businessUpdate.industry = payload.industry;
      if (payload.city !== undefined) businessUpdate.city = payload.city;
      if (payload.state !== undefined) businessUpdate.state = payload.state;
      if (payload.website !== undefined) businessUpdate.website = payload.website || null;
      if (payload.aboutCompany !== undefined) businessUpdate.about_company = payload.aboutCompany || null;
      if (payload.contactDetails !== undefined) {
        businessUpdate.contact_details = {
          email: payload.contactDetails.email || null,
          mobile: payload.contactDetails.mobile || null
        };
      }
      businessUpdate.updated_at = new Date().toISOString();

      const { data: profileData, error: profileError } = await supabaseAdmin
        .schema('businessverse')
        .from('profiles')
        .update(businessUpdate)
        .eq('owner_id', userId)
        .select('*')
        .maybeSingle();

      if (profileError) throw profileError;
      updatedProfile = profileData;
    }

    await logAudit({
      actorId: req.user.id,
      actorRole: req.adminRole,
      action: 'superadmin.user.updated',
      entityType: 'core.members',
      entityId: userId,
      metadata: { memberUpdate, profileUpdate: payload },
      ipAddress: req.ip?.replace('::ffff:', '') || null
    });

    res.json({
      success: true,
      member: updatedMember,
      profile: updatedProfile
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/superadmin/audit-logs', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const { data } = await safeQuery(
      supabaseAdmin
        .schema('admin')
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
      { data: [] }
    );
    res.json({ logs: data || [] });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/superadmin/notifications', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const { data } = await safeQuery(
      supabaseAdmin
        .schema('admin')
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
      { data: [] }
    );
    res.json({ notifications: data || [] });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/superadmin/notifications/:id/read', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .schema('admin')
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) throw error;
    await writeAuditLog({ actorId: req.user.id, actorRole: req.adminRole, action: 'admin.notification.read', entityType: 'admin.notifications', entityId: data.id });
    res.json({ notification: data });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/superadmin/plans', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('billing_list_plans');
    if (error) {
      if (isMissingDatabaseFeature(error)) return res.json({ plans: fallbackPlans });
      throw error;
    }
    res.json({ plans: data || [] });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/superadmin/plans', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const payload = planSchema.parse(req.body);
    const { data, error } = await supabaseAdmin.rpc('billing_create_plan', {
      p_code: payload.code,
      p_name: payload.name,
      p_description: payload.description || null,
      p_account_type: payload.accountType || null,
      p_amount_inr: payload.amountInr,
      p_duration_days: payload.durationDays,
      p_features: JSON.stringify(payload.features),
      p_is_active: payload.isActive,
      p_sort_order: payload.sortOrder
    });
    if (error) throw error;
    await writeAuditLog({ actorId: req.user.id, actorRole: req.adminRole, action: 'billing.plan.created', entityType: 'billing.plans', entityId: data?.id, metadata: data });
    res.status(201).json({ plan: data });
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/superadmin/plans/:id', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const payload = planSchema.parse(req.body);
    const { data, error } = await supabaseAdmin.rpc('billing_update_plan', {
      p_id: req.params.id,
      p_code: payload.code,
      p_name: payload.name,
      p_description: payload.description || null,
      p_account_type: payload.accountType || null,
      p_amount_inr: payload.amountInr,
      p_duration_days: payload.durationDays,
      p_features: JSON.stringify(payload.features),
      p_is_active: payload.isActive,
      p_sort_order: payload.sortOrder
    });
    if (error) throw error;
    await writeAuditLog({ actorId: req.user.id, actorRole: req.adminRole, action: 'billing.plan.updated', entityType: 'billing.plans', entityId: data?.id, metadata: data });
    res.json({ plan: data });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/superadmin/plans/:id', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('billing_delete_plan', { p_id: req.params.id });
    if (error) throw error;
    await writeAuditLog({ actorId: req.user.id, actorRole: req.adminRole, action: 'billing.plan.deleted', entityType: 'billing.plans', entityId: req.params.id, metadata: data });
    res.json({ plan: data });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/superadmin/coupons', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('billing_list_coupons');
    if (error) {
      if (isMissingDatabaseFeature(error)) return res.json({ coupons: [] });
      throw error;
    }
    res.json({ coupons: data || [] });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/superadmin/coupons/validate', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const quote = await validateCoupon({
      code: req.body?.couponCode,
      planId: req.body?.planId,
      userId: req.body?.userId || req.user.id
    });
    res.json({ quote });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/superadmin/coupons', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const payload = couponSchema.parse(req.body);
    const resolvedUserIds = await resolveUserIds(payload.userIds);
    const { data, error } = await supabaseAdmin.rpc('billing_create_coupon', {
      p_code: payload.code,
      p_title: payload.title,
      p_discount_type: payload.discountType,
      p_discount_value: payload.discountValue,
      p_usage_limit: payload.usageLimit || null,
      p_per_user_limit: payload.perUserLimit,
      p_starts_at: payload.startsAt || null,
      p_ends_at: payload.endsAt || null,
      p_applicable_plan_ids: payload.applicablePlanIds,
      p_user_ids: resolvedUserIds,
      p_is_active: payload.isActive
    });
    if (error) throw error;
    await writeAuditLog({ actorId: req.user.id, actorRole: req.adminRole, action: 'billing.coupon.created', entityType: 'billing.coupons', entityId: data?.id, metadata: data });
    res.status(201).json({ coupon: data });
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/superadmin/coupons/:id', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const payload = couponSchema.parse(req.body);
    const resolvedUserIds = await resolveUserIds(payload.userIds);
    const { data, error } = await supabaseAdmin.rpc('billing_update_coupon', {
      p_id: req.params.id,
      p_code: payload.code,
      p_title: payload.title,
      p_discount_type: payload.discountType,
      p_discount_value: payload.discountValue,
      p_usage_limit: payload.usageLimit || null,
      p_per_user_limit: payload.perUserLimit,
      p_starts_at: payload.startsAt || null,
      p_ends_at: payload.endsAt || null,
      p_applicable_plan_ids: payload.applicablePlanIds,
      p_user_ids: resolvedUserIds,
      p_is_active: payload.isActive
    });
    if (error) throw error;
    await writeAuditLog({ actorId: req.user.id, actorRole: req.adminRole, action: 'billing.coupon.updated', entityType: 'billing.coupons', entityId: data?.id, metadata: data });
    res.json({ coupon: data });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/superadmin/coupons/:id/status', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('billing_patch_coupon_status', {
      p_id: req.params.id,
      p_is_active: Boolean(req.body?.isActive)
    });
    if (error) throw error;
    await writeAuditLog({ actorId: req.user.id, actorRole: req.adminRole, action: data?.is_active ? 'billing.coupon.activated' : 'billing.coupon.deactivated', entityType: 'billing.coupons', entityId: data?.id, metadata: data });
    res.json({ coupon: data });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/superadmin/coupons/:id', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('billing_delete_coupon', { p_id: req.params.id });
    if (error) throw error;
    await writeAuditLog({ actorId: req.user.id, actorRole: req.adminRole, action: 'billing.coupon.deleted', entityType: 'billing.coupons', entityId: req.params.id, metadata: data });
    res.json({ coupon: data });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/superadmin/coupons/:id/redemptions', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const couponId = req.params.id;
    const { data: redemptions, error: redError } = await supabaseAdmin.rpc('billing_list_coupon_redemptions', { p_coupon_id: couponId });
    if (redError) throw redError;

    const redemptionList = redemptions || [];
    if (redemptionList.length > 0) {
      const userIds = redemptionList.map((r) => r.user_id);
      const planIds = [...new Set(redemptionList.map((r) => r.plan_id).filter(Boolean))];

      const [{ data: members, error: memError }, plansResult] = await Promise.all([
        supabaseAdmin.schema('core').from('members').select('id, email, full_name, mobile_number').in('id', userIds),
        plansResult = planIds.length
          ? supabaseAdmin.rpc('billing_list_plans').then(({ data, error }) => ({ data: (data || []).filter((p) => planIds.includes(p.id)), error }))
          : Promise.resolve({ data: [], error: null })
      ]);

      if (memError) throw memError;
      if (plansResult.error) throw plansResult.error;

      const membersMap = Object.fromEntries((members || []).map((m) => [m.id, m]));
      const plansMap = Object.fromEntries((plansResult.data || []).map((p) => [p.id, p]));

      const enriched = redemptionList.map((r) => ({
        ...r,
        member: membersMap[r.user_id] || { email: 'Unknown', full_name: 'Unknown', mobile_number: '' },
        plan: plansMap[r.plan_id] || { name: 'Unknown', code: 'Unknown' }
      }));

      res.json({ redemptions: enriched });
    } else {
      res.json({ redemptions: [] });
    }
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/superadmin/subscriptions/assign', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const payload = assignPlanSchema.parse(req.body);
    const eventTypeMap = {
      assign: 'assigned',
      upgrade: 'upgraded',
      downgrade: 'downgraded',
      extend: 'extended',
      free_access: 'free_access'
    };
    const result = await assignPlanToUser({
      userId: payload.userId,
      planId: payload.planId,
      actorId: req.user.id,
      actorRole: req.adminRole,
      eventType: eventTypeMap[payload.action],
      freeAccess: payload.freeAccess || payload.action === 'free_access',
      source: 'admin',
      extendFromCurrent: payload.action === 'extend',
      metadata: { action: payload.action }
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/superadmin/subscriptions/cancel', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const payload = z.object({ userId: z.string().uuid(), reason: z.string().optional() }).parse(req.body);
    const subscription = await cancelSubscription({
      userId: payload.userId,
      actorId: req.user.id,
      actorRole: req.adminRole,
      metadata: { reason: payload.reason || 'Cancelled by superadmin' }
    });
    res.json({ subscription });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/superadmin/billing', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('billing_list_all');
    if (error) {
      if (isMissingDatabaseFeature(error)) return res.json({ subscriptions: [], orders: [], invoices: [], transactions: [] });
      throw error;
    }
    res.json(data || { subscriptions: [], orders: [], invoices: [], transactions: [] });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/superadmin/versefeed-analytics', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    let { data, error } = await supabaseAdmin
      .schema('postverse')
      .from('posts')
      .select('id, author_id, account_type, caption, media_type, published_at, created_at, post_metrics(views, likes, comments, shares, reach, impressions)')
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(500);

    if (error && isMissingDatabaseFeature(error)) {
      const fallback = await safeQuery(
        supabaseAdmin
          .schema('postverse')
          .from('posts')
          .select('id, author_id, account_type, caption, media_type, published_at, created_at, post_metrics(views, saves, inquiries)')
          .eq('status', 'published')
          .order('published_at', { ascending: false, nullsFirst: false })
          .limit(500),
        { data: [] }
      );
      data = fallback.data;
      error = null;
    }

    if (error) throw error;

    const posts = (data || []).map((post) => {
      const metrics = Array.isArray(post.post_metrics) ? post.post_metrics[0] || {} : post.post_metrics || {};
      const engagementScore = (metrics.likes || 0) * 3 + (metrics.comments || 0) * 5 + (metrics.shares || 0) * 7 + (metrics.views || 0);
      const hashtags = [...String(post.caption || '').matchAll(/#[\w]+/g)].map((match) => match[0].toLowerCase());
      return { ...post, metrics, engagementScore, hashtags };
    });

    const rank = (key) => [...posts].sort((a, b) => (b.metrics?.[key] || 0) - (a.metrics?.[key] || 0)).slice(0, 10);
    const hashtagMap = new Map();
    posts.forEach((post) => {
      post.hashtags.forEach((tag) => {
        const current = hashtagMap.get(tag) || { hashtag: tag, uses: 0, views: 0, reach: 0, engagement: 0 };
        current.uses += 1;
        current.views += post.metrics.views || 0;
        current.reach += post.metrics.reach || 0;
        current.engagement += post.engagementScore || 0;
        hashtagMap.set(tag, current);
      });
    });
    const hashtags = [...hashtagMap.values()];

    const userMap = new Map();
    posts.forEach((post) => {
      const current = userMap.get(post.author_id) || { userId: post.author_id, accountType: post.account_type, posts: 0, views: 0, reach: 0, engagement: 0 };
      current.posts += 1;
      current.views += post.metrics.views || 0;
      current.reach += post.metrics.reach || 0;
      current.engagement += post.engagementScore || 0;
      userMap.set(post.author_id, current);
    });
    const users = [...userMap.values()];

    res.json({
      posts: {
        mostViewed: rank('views'),
        mostLiked: rank('likes'),
        mostShared: rank('shares'),
        mostCommented: rank('comments'),
        highestEngagement: [...posts].sort((a, b) => b.engagementScore - a.engagementScore).slice(0, 10),
        trending: [...posts].sort((a, b) => (b.engagementScore / Math.max(1, (Date.now() - new Date(b.published_at || b.created_at).getTime()) / 86400000)) - (a.engagementScore / Math.max(1, (Date.now() - new Date(a.published_at || a.created_at).getTime()) / 86400000))).slice(0, 10)
      },
      hashtags: {
        mostUsed: [...hashtags].sort((a, b) => b.uses - a.uses).slice(0, 10),
        mostViewed: [...hashtags].sort((a, b) => b.views - a.views).slice(0, 10),
        highestReach: [...hashtags].sort((a, b) => b.reach - a.reach).slice(0, 10),
        trending: [...hashtags].sort((a, b) => b.engagement - a.engagement).slice(0, 10)
      },
      leaderboards: {
        topCreators: users.filter((user) => user.accountType === 'creator').sort((a, b) => b.engagement - a.engagement).slice(0, 10),
        topBusinesses: users.filter((user) => user.accountType === 'business').sort((a, b) => b.engagement - a.engagement).slice(0, 10),
        mostActiveUsers: [...users].sort((a, b) => b.posts - a.posts).slice(0, 10),
        highestReachAccounts: [...users].sort((a, b) => b.reach - a.reach).slice(0, 10),
        mostConsistentAccounts: [...users].sort((a, b) => b.posts - a.posts).slice(0, 10)
      }
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/superadmin/reports/:type', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const type = req.params.type;
    const now = new Date();
    const start = new Date(now);
    start.setFullYear(now.getFullYear() - 1);

    const [membersResult, postsResult, metricsResult, subGrowthResult, revGrowthResult] = await Promise.all([
      safeQuery(supabaseAdmin.schema('core').from('members').select('id, account_type, subscription_status, created_at').gte('created_at', start.toISOString()), { data: [] }),
      safeQuery(supabaseAdmin.schema('postverse').from('posts').select('id, account_type, created_at').gte('created_at', start.toISOString()), { data: [] }),
      safeQuery(supabaseAdmin.schema('postverse').from('post_metrics').select('views, likes, comments, shares, reach, impressions, updated_at'), { data: [] }),
      supabaseAdmin.rpc('billing_subscription_growth', { p_start: start.toISOString(), p_end: now.toISOString() }),
      supabaseAdmin.rpc('billing_revenue_growth', { p_start: start.toISOString(), p_end: now.toISOString() })
    ]);

    const members = membersResult.data || [];
    const posts = postsResult.data || [];
    const metrics = metricsResult.data || [];

    const reportData = {
      userGrowth: groupByDay(members),
      creatorGrowth: groupByDay(members.filter((m) => m.account_type === 'creator')),
      businessGrowth: groupByDay(members.filter((m) => m.account_type === 'business')),
      subscriptionGrowth: subGrowthResult.error ? [] : (subGrowthResult.data || []),
      platformGrowth: groupByDay(posts),
      revenueGrowth: revGrowthResult.error ? [] : (revGrowthResult.data || []),
      engagementGrowth: groupByDay(metrics, 'updated_at', (row) => (row.likes || 0) + (row.comments || 0) + (row.shares || 0))
    };

    res.json({ report: { type, generatedAt: new Date().toISOString(), data: reportData } });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/superadmin/post-reports', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const reports = await listPostReports();
    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/superadmin/post-reports/:id', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const payload = postReportUpdateSchema.parse(req.body || {});
    await updatePostReport(req.params.id, req.user.id, payload);
    const reports = await listPostReports();
    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/superadmin/realtime', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendSnapshot = async () => {
      const onlineSince = new Date(Date.now() - ONLINE_WINDOW_MINUTES * 60 * 1000).toISOString();
      const [
        totalUsers,
        onlineUsers,
        totalPosts,
        notifications
      ] = await Promise.all([
        countRows('core', 'members'),
        safeQuery(supabaseAdmin.schema('core').from('members').select('*', { count: 'exact', head: true }).gte('last_active_at', onlineSince), { count: 0 }).then(({ count }) => count || 0),
        countRows('postverse', 'posts', [['status', 'published']]),
        safeQuery(supabaseAdmin.schema('admin').from('notifications').select('*', { count: 'exact', head: true }).is('read_at', null), { count: 0 }).then(({ count }) => count || 0)
      ]);

      res.write(`event: snapshot\n`);
      res.write(`data: ${JSON.stringify({ totalUsers, onlineUsers, totalPosts, notifications, at: new Date().toISOString() })}\n\n`);
    };

    await sendSnapshot();
    const interval = setInterval(() => {
      sendSnapshot().catch((error) => {
        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      });
    }, 10000);

    req.on('close', () => clearInterval(interval));
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/post-reports', requireAuth, requireAdminRole('admin'), async (req, res, next) => {
  try {
    const reports = await listPostReports();
    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/post-reports/:id', requireAuth, requireAdminRole('admin'), async (req, res, next) => {
  try {
    const payload = postReportUpdateSchema.parse(req.body || {});
    await updatePostReport(req.params.id, req.user.id, payload);
    const reports = await listPostReports();
    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/overview', requireAuth, requireAdminRole('admin'), async (req, res, next) => {
  try {
    const [
      members,
      activeSubscriptions,
      businessProfiles,
      creatorProfiles,
      publishedPosts,
      mediaAssets
    ] = await Promise.all([
      countRows('core', 'members'),
      countRows('core', 'members', [['subscription_status', 'active']]),
      countRows('businessverse', 'profiles'),
      countRows('creatorverse', 'profiles'),
      countRows('postverse', 'posts', [['status', 'published']]),
      countRows('core', 'media_assets')
    ]);

    res.json({
      stats: {
        members,
        activeSubscriptions,
        businessProfiles,
        creatorProfiles,
        publishedPosts,
        mediaAssets
      },
      role: req.adminRole
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/members', requireAuth, requireAdminRole('admin'), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .schema('core')
      .from('members')
      .select('id, email, full_name, mobile_number, account_type, subscription_status, subscription_expires_at, account_status, last_active_at, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json({ members: data });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/members/:id', requireAuth, requireAdminRole('admin'), async (req, res, next) => {
  try {
    const detail = await buildAdminUserDetail(req.params.id);
    if (!detail) return res.status(404).json({ error: 'User not found' });

    await logAudit({
      actorId: req.user.id,
      actorRole: req.adminRole,
      action: 'admin.user.readonly_viewed',
      entityType: 'core.members',
      entityId: req.params.id,
      metadata: { accountType: detail.user.accountType, email: detail.user.email },
      ipAddress: req.ip?.replace('::ffff:', '') || null
    });

    res.json(detail);
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/superadmin', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const { data: admins, error: adminsError } = await supabaseAdmin
      .schema('admin')
      .from('users')
      .select('user_id, role, created_at')
      .order('created_at', { ascending: false });

    if (adminsError) throw adminsError;

    const stats = {
      estimatedAnnualRevenue: (await countRows('core', 'members', [['subscription_status', 'active']])) * MEMBERSHIP_PRICE,
      admins: admins.length,
      totalMembers: await countRows('core', 'members'),
      totalPosts: await countRows('postverse', 'posts')
    };

    res.json({ stats, admins });
  } catch (error) {
    next(error);
  }
});
