import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { uploadMediaAsset } from '../services/mediaService.js';
import { assertCanPublishPost, getPostEligibility, isSubscriptionActive } from '../services/postPolicyService.js';

const maxUploadBytes = Math.max(env.MAX_IMAGE_MB, env.MAX_VIDEO_MB) * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxUploadBytes }
});

const postSchema = z.object({
  caption: z.string().trim().min(1).max(500),
  accountType: z.enum(['business', 'creator'])
});

const commentSchema = z.object({
  body: z.string().trim().min(1).max(500)
});

export const postsRouter = Router();

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

const postSelectWithFullMetrics = 'id, author_id, account_type, caption, media_url, media_type, created_at, published_at, post_metrics(views, likes, comments, shares, saves, inquiries, reach, impressions)';
const postSelectWithBasicMetrics = 'id, author_id, account_type, caption, media_url, media_type, created_at, published_at, post_metrics(views, saves, inquiries)';

const ensurePostMetricRow = async (postId) => {
  const { error } = await supabaseAdmin
    .schema('postverse')
    .from('post_metrics')
    .upsert({ post_id: postId }, { onConflict: 'post_id' });

  if (error && !isMissingDatabaseFeature(error)) throw error;
};

const recalculatePostMetrics = async (postId) => {
  const [
    { count: likes, error: likesError },
    { count: comments, error: commentsError },
    { count: shares, error: sharesError },
    { data: currentMetrics, error: metricsError }
  ] = await Promise.all([
    supabaseAdmin.schema('postverse').from('post_reactions').select('*', { count: 'exact', head: true }).eq('post_id', postId).eq('reaction_type', 'like'),
    supabaseAdmin.schema('postverse').from('post_comments').select('*', { count: 'exact', head: true }).eq('post_id', postId).eq('status', 'visible'),
    supabaseAdmin.schema('postverse').from('post_shares').select('*', { count: 'exact', head: true }).eq('post_id', postId),
    supabaseAdmin.schema('postverse').from('post_metrics').select('views, saves, inquiries, reach, impressions').eq('post_id', postId).maybeSingle()
  ]);

  if ([likesError, commentsError, sharesError, metricsError].some(isMissingDatabaseFeature)) return null;
  if (likesError) throw likesError;
  if (commentsError) throw commentsError;
  if (sharesError) throw sharesError;
  if (metricsError) throw metricsError;

  const { data, error } = await supabaseAdmin
    .schema('postverse')
    .from('post_metrics')
    .upsert({
      post_id: postId,
      likes: likes || 0,
      comments: comments || 0,
      shares: shares || 0,
      views: currentMetrics?.views || 0,
      saves: currentMetrics?.saves || 0,
      inquiries: currentMetrics?.inquiries || 0,
      reach: currentMetrics?.reach || 0,
      impressions: currentMetrics?.impressions || 0,
      updated_at: new Date().toISOString()
    }, { onConflict: 'post_id' })
    .select('*')
    .single();

  if (error) {
    if (isMissingDatabaseFeature(error)) return null;
    throw error;
  }
  return data;
};

const assertPublishedPost = async (postId) => {
  const { data, error } = await supabaseAdmin
    .schema('postverse')
    .from('posts')
    .select('id, status')
    .eq('id', postId)
    .maybeSingle();

  if (error) throw error;
  if (!data || data.status !== 'published') {
    const notFound = new Error('Published post not found');
    notFound.status = 404;
    throw notFound;
  }

  return data;
};

const fetchMemberOrBlockFeed = async (userId) => {
  const { data, error } = await supabaseAdmin
    .schema('core')
    .from('members')
    .select('id, account_type, subscription_status, subscription_expires_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;

  if (!isSubscriptionActive(data)) {
    const accessError = new Error('Please purchase a plan to access this feature.');
    accessError.status = 402;
    accessError.code = 'SUBSCRIPTION_REQUIRED';
    accessError.redirectTo = '/pricing';
    throw accessError;
  }

  return data;
};

const getAuthorProfiles = async (authorIds = []) => {
  const uniqueAuthorIds = [...new Set(authorIds)].filter(Boolean);
  if (!uniqueAuthorIds.length) return {};

  const safeProfileQuery = async (query, fallback) => {
    const result = await query;
    if (result.error) {
      if (isMissingDatabaseFeature(result.error)) return fallback;
      throw result.error;
    }
    return result;
  };

  const [
    { data: members },
    { data: businessProfiles },
    { data: creatorProfiles }
  ] = await Promise.all([
    safeProfileQuery(supabaseAdmin.schema('core').from('members').select('id, email, full_name, account_type').in('id', uniqueAuthorIds), { data: [] }),
    safeProfileQuery(supabaseAdmin.schema('businessverse').from('profiles').select('owner_id, business_name, industry, city, state, logo_asset_id').in('owner_id', uniqueAuthorIds), { data: [] }),
    safeProfileQuery(supabaseAdmin.schema('creatorverse').from('profiles').select('owner_id, full_name, skills, city, state, profile_asset_id').in('owner_id', uniqueAuthorIds), { data: [] })
  ]);

  const assetIds = [
    ...(businessProfiles || []).map((profile) => profile.logo_asset_id),
    ...(creatorProfiles || []).map((profile) => profile.profile_asset_id)
  ].filter(Boolean);

  let assetsById = {};
  if (assetIds.length) {
    const { data: assets } = await safeProfileQuery(supabaseAdmin
      .schema('core')
      .from('media_assets')
      .select('id, public_url')
      .in('id', assetIds), { data: [] });

    assetsById = Object.fromEntries((assets || []).map((asset) => [asset.id, asset.public_url]));
  }

  const membersById = Object.fromEntries((members || []).map((member) => [member.id, member]));
  const businessById = Object.fromEntries((businessProfiles || []).map((profile) => [profile.owner_id, profile]));
  const creatorById = Object.fromEntries((creatorProfiles || []).map((profile) => [profile.owner_id, profile]));

  return Object.fromEntries(uniqueAuthorIds.map((authorId) => {
    const member = membersById[authorId];
    const business = businessById[authorId];
    const creator = creatorById[authorId];
    const accountType = member?.account_type || (creator ? 'creator' : 'business');

    if (accountType === 'creator') {
      return [authorId, {
        id: authorId,
        accountType,
        name: creator?.full_name || member?.full_name || member?.email || 'CreatorVerse Member',
        city: creator?.city || '',
        state: creator?.state || '',
        category: Array.isArray(creator?.skills) ? creator.skills.slice(0, 2).join(', ') : '',
        avatarUrl: assetsById[creator?.profile_asset_id] || null
      }];
    }

    return [authorId, {
      id: authorId,
      accountType,
      name: business?.business_name || member?.full_name || member?.email || 'BusinessVerse Member',
      city: business?.city || '',
      state: business?.state || '',
      category: business?.industry || '',
      avatarUrl: assetsById[business?.logo_asset_id] || null
    }];
  }));
};

const shapePost = (post, author) => ({
  id: post.id,
  authorId: post.author_id,
  authorName: author?.name || 'MyIndianStartup Member',
  authorAccountType: author?.accountType || post.account_type,
  authorCity: author?.city || '',
  authorState: author?.state || '',
  authorCategory: author?.category || '',
  authorAvatarUrl: author?.avatarUrl || null,
  accountType: post.account_type,
  caption: post.caption,
  mediaUrl: post.media_url,
  mediaType: post.media_type,
  publishedAt: post.published_at || post.created_at,
  createdAt: post.created_at,
  metrics: {
    views: (Array.isArray(post.post_metrics) ? post.post_metrics[0]?.views : post.post_metrics?.views) || 0,
    likes: (Array.isArray(post.post_metrics) ? post.post_metrics[0]?.likes : post.post_metrics?.likes) || 0,
    comments: (Array.isArray(post.post_metrics) ? post.post_metrics[0]?.comments : post.post_metrics?.comments) || 0,
    shares: (Array.isArray(post.post_metrics) ? post.post_metrics[0]?.shares : post.post_metrics?.shares) || 0,
    saves: (Array.isArray(post.post_metrics) ? post.post_metrics[0]?.saves : post.post_metrics?.saves) || 0,
    inquiries: (Array.isArray(post.post_metrics) ? post.post_metrics[0]?.inquiries : post.post_metrics?.inquiries) || 0,
    reach: (Array.isArray(post.post_metrics) ? post.post_metrics[0]?.reach : post.post_metrics?.reach) || 0,
    impressions: (Array.isArray(post.post_metrics) ? post.post_metrics[0]?.impressions : post.post_metrics?.impressions) || 0
  }
});

const fetchPublishedPosts = async ({ limit = 50, excludeAuthorId = null } = {}) => {
  const buildQuery = (selectColumns) => {
    let query = supabaseAdmin
      .schema('postverse')
      .from('posts')
      .select(selectColumns)
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (excludeAuthorId) {
      query = query.neq('author_id', excludeAuthorId);
    }

    return query;
  };

  const { data, error } = await buildQuery(postSelectWithFullMetrics);
  let posts = data || [];

  if (error) {
    if (!isMissingDatabaseFeature(error)) throw error;

    const fallback = await buildQuery(postSelectWithBasicMetrics);
    if (fallback.error) {
      if (isMissingDatabaseFeature(fallback.error)) posts = [];
      else throw fallback.error;
    } else {
      posts = fallback.data || [];
    }
  }

  const authorsById = await getAuthorProfiles(posts.map((post) => post.author_id));
  return posts.map((post) => shapePost(post, authorsById[post.author_id]));
};

const fetchUserPostsForOverview = async (userId) => {
  const buildQuery = (selectColumns) => supabaseAdmin
    .schema('postverse')
    .from('posts')
    .select(selectColumns.replace('author_id, account_type, ', ''))
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  const { data, error } = await buildQuery(postSelectWithFullMetrics);
  if (!error) return data || [];

  if (!isMissingDatabaseFeature(error)) throw error;

  const fallback = await buildQuery(postSelectWithBasicMetrics);
  if (fallback.error) {
    if (isMissingDatabaseFeature(fallback.error)) return [];
    throw fallback.error;
  }
  return fallback.data || [];
};

postsRouter.get('/eligibility', requireAuth, async (req, res, next) => {
  try {
    const eligibility = await getPostEligibility(req.user.id);
    res.json({ eligibility });
  } catch (error) {
    next(error);
  }
});

postsRouter.get('/overview', requireAuth, async (req, res, next) => {
  try {
    const eligibility = await getPostEligibility(req.user.id);

    const posts = await fetchUserPostsForOverview(req.user.id);

    const publishedPosts = (posts || []).filter((post) => post.status === 'published');
    const totals = publishedPosts.reduce((sum, post) => {
      const metrics = Array.isArray(post.post_metrics) ? post.post_metrics[0] || {} : post.post_metrics || {};
      return {
        views: sum.views + (metrics.views || 0),
        saves: sum.saves + (metrics.saves || 0),
        inquiries: sum.inquiries + (metrics.inquiries || 0)
      };
    }, { views: 0, saves: 0, inquiries: 0 });

    res.json({
      eligibility,
      analytics: {
        postsPublished: publishedPosts.length,
        totalViews: totals.views,
        totalSaves: totals.saves,
        totalInquiries: totals.inquiries,
        profileCompletion: eligibility.profile.completion,
        canPostToday: eligibility.allowed
      },
      history: publishedPosts.slice(0, 10).map((post) => ({
        id: post.id,
        caption: post.caption,
        mediaType: post.media_type,
        mediaUrl: post.media_url,
        publishedAt: post.published_at || post.created_at,
        views: (Array.isArray(post.post_metrics) ? post.post_metrics[0]?.views : post.post_metrics?.views) || 0,
        saves: (Array.isArray(post.post_metrics) ? post.post_metrics[0]?.saves : post.post_metrics?.saves) || 0,
        inquiries: (Array.isArray(post.post_metrics) ? post.post_metrics[0]?.inquiries : post.post_metrics?.inquiries) || 0
      }))
    });
  } catch (error) {
    next(error);
  }
});

postsRouter.get('/feed', requireAuth, async (req, res, next) => {
  try {
    await fetchMemberOrBlockFeed(req.user.id);
    const posts = await fetchPublishedPosts({ limit: 50 });
    res.json({ posts });
  } catch (error) {
    next(error);
  }
});

postsRouter.get('/recommendations', requireAuth, async (req, res, next) => {
  try {
    const member = await fetchMemberOrBlockFeed(req.user.id);
    const recommendedPosts = await fetchPublishedPosts({ limit: 8, excludeAuthorId: req.user.id });
    const oppositeType = member.account_type === 'business' ? 'creator' : 'business';

    res.json({
      recommendations: recommendedPosts
        .sort((a, b) => {
          const aBoost = a.accountType === oppositeType ? 1 : 0;
          const bBoost = b.accountType === oppositeType ? 1 : 0;
          return bBoost - aBoost;
        })
        .slice(0, 6)
        .map((post) => ({
          ...post,
          reason: post.accountType === oppositeType
            ? member.account_type === 'business'
              ? 'Recommended creator for business collaboration'
              : 'Recommended business opportunity for creators'
            : 'Active member in your network'
        }))
    });
  } catch (error) {
    next(error);
  }
});

postsRouter.get('/:id/comments', requireAuth, async (req, res, next) => {
  try {
    await fetchMemberOrBlockFeed(req.user.id);
    await assertPublishedPost(req.params.id);

    const { data, error } = await supabaseAdmin
      .schema('postverse')
      .from('post_comments')
      .select('id, post_id, author_id, body, created_at')
      .eq('post_id', req.params.id)
      .eq('status', 'visible')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) throw error;
    res.json({ comments: data || [] });
  } catch (error) {
    next(error);
  }
});

postsRouter.post('/:id/comments', requireAuth, async (req, res, next) => {
  try {
    await fetchMemberOrBlockFeed(req.user.id);
    await assertPublishedPost(req.params.id);
    const payload = commentSchema.parse(req.body);

    const { data, error } = await supabaseAdmin
      .schema('postverse')
      .from('post_comments')
      .insert({
        post_id: req.params.id,
        author_id: req.user.id,
        body: payload.body
      })
      .select('*')
      .single();

    if (error) throw error;

    const metrics = await recalculatePostMetrics(req.params.id);
    res.status(201).json({ comment: data, metrics });
  } catch (error) {
    next(error);
  }
});

postsRouter.post('/:id/like', requireAuth, async (req, res, next) => {
  try {
    await fetchMemberOrBlockFeed(req.user.id);
    await assertPublishedPost(req.params.id);

    const { data: existing, error: existingError } = await supabaseAdmin
      .schema('postverse')
      .from('post_reactions')
      .select('id')
      .eq('post_id', req.params.id)
      .eq('user_id', req.user.id)
      .eq('reaction_type', 'like')
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      const { error } = await supabaseAdmin.schema('postverse').from('post_reactions').delete().eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .schema('postverse')
        .from('post_reactions')
        .insert({ post_id: req.params.id, user_id: req.user.id, reaction_type: 'like' });
      if (error) throw error;
    }

    const metrics = await recalculatePostMetrics(req.params.id);
    res.json({ liked: !existing, metrics });
  } catch (error) {
    next(error);
  }
});

postsRouter.post('/:id/share', requireAuth, async (req, res, next) => {
  try {
    await fetchMemberOrBlockFeed(req.user.id);
    await assertPublishedPost(req.params.id);

    const { error } = await supabaseAdmin
      .schema('postverse')
      .from('post_shares')
      .insert({
        post_id: req.params.id,
        user_id: req.user.id,
        channel: req.body?.channel || 'internal'
      });

    if (error) throw error;
    const metrics = await recalculatePostMetrics(req.params.id);
    res.status(201).json({ shared: true, metrics });
  } catch (error) {
    next(error);
  }
});

postsRouter.post('/:id/impression', requireAuth, async (req, res, next) => {
  try {
    await fetchMemberOrBlockFeed(req.user.id);
    await assertPublishedPost(req.params.id);
    await ensurePostMetricRow(req.params.id);

    const { data: current, error: currentError } = await supabaseAdmin
      .schema('postverse')
      .from('post_metrics')
      .select('views, reach, impressions')
      .eq('post_id', req.params.id)
      .single();

    if (currentError) throw currentError;

    const { data, error } = await supabaseAdmin
      .schema('postverse')
      .from('post_metrics')
      .update({
        views: (current.views || 0) + 1,
        impressions: (current.impressions || 0) + 1,
        reach: (current.reach || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('post_id', req.params.id)
      .select('*')
      .single();

    if (error) throw error;
    res.json({ metrics: data });
  } catch (error) {
    next(error);
  }
});

postsRouter.post('/', requireAuth, upload.single('file'), async (req, res, next) => {
  let postId = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image or video file is required', code: 'MEDIA_REQUIRED' });
    }

    const payload = postSchema.parse(req.body);
    await assertCanPublishPost(req.user.id, payload.accountType);

    const { data: post, error: postError } = await supabaseAdmin
      .schema('postverse')
      .from('posts')
      .insert({
        author_id: req.user.id,
        account_type: payload.accountType,
        caption: payload.caption,
        status: 'uploading'
      })
      .select('*')
      .single();

    if (postError) throw postError;
    postId = post.id;

    const asset = await uploadMediaAsset({
      file: req.file,
      userId: req.user.id,
      purpose: 'post',
      postId: post.id
    });

    const { data: publishedPost, error: publishError } = await supabaseAdmin
      .schema('postverse')
      .from('posts')
      .update({
        media_asset_id: asset.id,
        media_url: asset.public_url,
        media_type: asset.media_type,
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id)
      .select('*')
      .single();

    if (publishError) throw publishError;

    await supabaseAdmin
      .schema('postverse')
      .from('post_metrics')
      .upsert({ post_id: post.id }, { onConflict: 'post_id' });

    const [eligibility, recommendations] = await Promise.all([
      getPostEligibility(req.user.id),
      fetchPublishedPosts({ limit: 6, excludeAuthorId: req.user.id })
    ]);

    res.status(201).json({ post: publishedPost, asset, eligibility, recommendations });
  } catch (error) {
    if (postId) {
      await supabaseAdmin
        .schema('postverse')
        .from('posts')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .eq('id', postId);
    }

    next(error);
  }
});
