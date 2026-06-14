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

const storySchema = z.object({
  caption: z.string().trim().max(250).optional().nullable(),
  accountType: z.enum(['business', 'creator']),
  metadata: z.string().optional().nullable()
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
    'invalid input value for enum',
    'schema must be one of',
    'relationship'
  ].some((pattern) => message.includes(pattern));
};

const postSelectWithFullMetrics = 'id, author_id, account_type, caption, media_url, media_type, created_at, published_at, post_metrics(views, likes, comments, shares, saves, inquiries, reach, impressions)';
const postSelectWithBasicMetrics = 'id, author_id, account_type, caption, media_url, media_type, created_at, published_at, post_metrics(views, saves, inquiries)';

const publicMemberSelect = 'id, email, full_name, account_type';

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
    safeProfileQuery(supabaseAdmin.schema('core').from('members').select(publicMemberSelect).in('id', uniqueAuthorIds), { data: [] }),
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

const getFollowingSet = async (viewerId, userIds = []) => {
  const targets = [...new Set(userIds)].filter((id) => id && id !== viewerId);
  if (!viewerId || !targets.length) return new Set();

  const { data, error } = await supabaseAdmin
    .schema('postverse')
    .from('user_follows')
    .select('following_id')
    .eq('follower_id', viewerId)
    .in('following_id', targets);

  if (error) {
    if (isMissingDatabaseFeature(error)) return new Set();
    throw error;
  }

  return new Set((data || []).map((row) => row.following_id));
};

const getLikedPostSet = async (viewerId, postIds = []) => {
  const ids = [...new Set(postIds)].filter(Boolean);
  if (!viewerId || !ids.length) return new Set();

  const { data, error } = await supabaseAdmin
    .schema('postverse')
    .from('post_reactions')
    .select('post_id')
    .eq('user_id', viewerId)
    .eq('reaction_type', 'like')
    .in('post_id', ids);

  if (error) {
    if (isMissingDatabaseFeature(error)) return new Set();
    throw error;
  }

  return new Set((data || []).map((row) => row.post_id));
};

const fetchCommentPreview = async (postIds = []) => {
  const ids = [...new Set(postIds)].filter(Boolean);
  if (!ids.length) return {};

  const { data, error } = await supabaseAdmin
    .schema('postverse')
    .from('post_comments')
    .select('id, post_id, author_id, body, created_at')
    .in('post_id', ids)
    .eq('status', 'visible')
    .order('created_at', { ascending: true })
    .limit(200);

  if (error) {
    if (isMissingDatabaseFeature(error)) return {};
    throw error;
  }

  const authorsById = await getAuthorProfiles((data || []).map((comment) => comment.author_id));
  return (data || []).reduce((grouped, comment) => {
    const author = authorsById[comment.author_id] || {};
    const shaped = {
      id: comment.id,
      postId: comment.post_id,
      authorId: comment.author_id,
      authorName: author.name || 'Member',
      authorAvatarUrl: author.avatarUrl || null,
      accountType: author.accountType || 'business',
      body: comment.body,
      createdAt: comment.created_at
    };
    grouped[comment.post_id] = [...(grouped[comment.post_id] || []), shaped].slice(-3);
    return grouped;
  }, {});
};

const storyMarker = '__MIS_STORY__';

const encodeStoryCaption = ({ caption = '', metadata = null }) => `${storyMarker}${JSON.stringify({
  caption,
  metadata: metadata || {},
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
})}`;

const decodeStoryCaption = (value = '') => {
  if (!value.startsWith(storyMarker)) return null;
  try {
    return JSON.parse(value.slice(storyMarker.length));
  } catch {
    return { caption: '', metadata: {}, expiresAt: null };
  }
};

const uploadStoryAsset = async ({ file, userId }) => {
  try {
    return await uploadMediaAsset({ file, userId, purpose: 'story' });
  } catch (error) {
    if (!isMissingDatabaseFeature(error)) throw error;
    return uploadMediaAsset({ file, userId, purpose: 'post' });
  }
};

const fetchStoriesFromHiddenPosts = async (viewerId) => {
  let { data, error } = await supabaseAdmin
    .schema('postverse')
    .from('posts')
    .select('id, author_id, account_type, caption, media_url, media_type, created_at')
    .eq('status', 'hidden')
    .like('caption', `${storyMarker}%`)
    .order('created_at', { ascending: false })
    .limit(40);

  if (error) {
    if (isMissingDatabaseFeature(error)) {
      const fallback = await supabaseAdmin
        .schema('postverse')
        .from('posts')
        .select('id, author_id, account_type, caption, media_url, media_type, created_at')
        .eq('status', 'draft')
        .like('caption', `${storyMarker}%`)
        .order('created_at', { ascending: false })
        .limit(40);

      if (fallback.error) {
        if (isMissingDatabaseFeature(fallback.error)) return [];
        throw fallback.error;
      }

      data = fallback.data || [];
      error = null;
    }
  }

  if (error) {
    throw error;
  }

  const now = Date.now();
  const activeStories = (data || [])
    .map((post) => ({ post, storyData: decodeStoryCaption(post.caption) }))
    .filter(({ storyData }) => storyData && (!storyData.expiresAt || new Date(storyData.expiresAt).getTime() > now));

  const authorsById = await getAuthorProfiles(activeStories.map(({ post }) => post.author_id));
  const followingSet = await getFollowingSet(viewerId, activeStories.map(({ post }) => post.author_id));

  return activeStories.map(({ post, storyData }) => {
    const author = authorsById[post.author_id] || {};
    return {
      id: post.id,
      authorId: post.author_id,
      name: author.name || 'Member',
      type: post.account_type,
      image: post.media_url,
      mediaUrl: post.media_url,
      mediaType: post.media_type,
      caption: storyData.caption || '',
      metadata: storyData.metadata || {},
      viewed: followingSet.has(post.author_id),
      createdAt: post.created_at,
      expiresAt: storyData.expiresAt
    };
  });
};

const shapePost = (post, author, extras = {}) => ({
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
  },
  viewer: {
    liked: Boolean(extras.liked),
    followingAuthor: Boolean(extras.followingAuthor),
    ownPost: Boolean(extras.ownPost)
  },
  commentsPreview: extras.commentsPreview || []
});

const fetchPublishedPosts = async ({ limit = 50, excludeAuthorId = null, viewerId = null, withComments = false } = {}) => {
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
  const [followingSet, likedSet, commentsByPost] = await Promise.all([
    getFollowingSet(viewerId, posts.map((post) => post.author_id)),
    getLikedPostSet(viewerId, posts.map((post) => post.id)),
    withComments ? fetchCommentPreview(posts.map((post) => post.id)) : {}
  ]);

  return posts.map((post) => shapePost(post, authorsById[post.author_id], {
    liked: likedSet.has(post.id),
    followingAuthor: followingSet.has(post.author_id),
    ownPost: viewerId === post.author_id,
    commentsPreview: commentsByPost[post.id] || []
  }));
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
    const posts = await fetchPublishedPosts({ limit: 50, viewerId: req.user.id, withComments: true });
    res.json({ posts });
  } catch (error) {
    next(error);
  }
});

postsRouter.get('/recommendations', requireAuth, async (req, res, next) => {
  try {
    const member = await fetchMemberOrBlockFeed(req.user.id);
    const recommendedPosts = await fetchPublishedPosts({ limit: 20, excludeAuthorId: req.user.id, viewerId: req.user.id });
    const oppositeType = member.account_type === 'business' ? 'creator' : 'business';

    res.json({
      recommendations: recommendedPosts
        .filter((post) => !post.viewer.followingAuthor)
        .sort((a, b) => {
          const aBoost = a.accountType === oppositeType ? 1 : 0;
          const bBoost = b.accountType === oppositeType ? 1 : 0;
          return bBoost - aBoost;
        })
        .slice(0, 6)
        .map((post) => ({
          ...post,
          isFollowing: post.viewer.followingAuthor,
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

postsRouter.get('/connections', requireAuth, async (req, res, next) => {
  try {
    await fetchMemberOrBlockFeed(req.user.id);

    const [{ data: following, error: followingError }, { data: followers, error: followersError }] = await Promise.all([
      supabaseAdmin.schema('postverse').from('user_follows').select('following_id, created_at').eq('follower_id', req.user.id).order('created_at', { ascending: false }),
      supabaseAdmin.schema('postverse').from('user_follows').select('follower_id, created_at').eq('following_id', req.user.id).order('created_at', { ascending: false })
    ]);

    if (followingError) throw followingError;
    if (followersError) throw followersError;

    const followingProfiles = await getAuthorProfiles((following || []).map((row) => row.following_id));
    const followerProfiles = await getAuthorProfiles((followers || []).map((row) => row.follower_id));

    res.json({
      following: (following || []).map((row) => ({ ...followingProfiles[row.following_id], followedAt: row.created_at })),
      followers: (followers || []).map((row) => ({ ...followerProfiles[row.follower_id], followedAt: row.created_at }))
    });
  } catch (error) {
    next(error);
  }
});

postsRouter.post('/users/:userId/follow', requireAuth, async (req, res, next) => {
  try {
    await fetchMemberOrBlockFeed(req.user.id);
    const targetUserId = req.params.userId;
    if (targetUserId === req.user.id) {
      const error = new Error('You cannot follow your own account.');
      error.status = 400;
      throw error;
    }

    const { data: target, error: targetError } = await supabaseAdmin
      .schema('core')
      .from('members')
      .select('id')
      .eq('id', targetUserId)
      .maybeSingle();

    if (targetError) throw targetError;
    if (!target) {
      const error = new Error('Member not found.');
      error.status = 404;
      throw error;
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .schema('postverse')
      .from('user_follows')
      .select('id')
      .eq('follower_id', req.user.id)
      .eq('following_id', targetUserId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      const { error } = await supabaseAdmin.schema('postverse').from('user_follows').delete().eq('id', existing.id);
      if (error) throw error;
      res.json({ following: false });
      return;
    }

    const { error } = await supabaseAdmin
      .schema('postverse')
      .from('user_follows')
      .insert({ follower_id: req.user.id, following_id: targetUserId });

    if (error) throw error;
    res.status(201).json({ following: true });
  } catch (error) {
    next(error);
  }
});

postsRouter.get('/stories', requireAuth, async (req, res, next) => {
  try {
    await fetchMemberOrBlockFeed(req.user.id);

    let { data, error } = await supabaseAdmin
      .schema('postverse')
      .from('stories')
      .select('id, author_id, account_type, caption, media_url, media_type, metadata, created_at, expires_at')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(40);

    if (error) {
      const legacyStories = await supabaseAdmin
        .schema('postverse')
        .from('stories')
        .select('id, author_id, account_type, caption, media_url, media_type, created_at, expires_at')
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(40);

      if (!legacyStories.error) {
        data = legacyStories.data || [];
        error = null;
      }
    }

    if (error) {
      if (isMissingDatabaseFeature(error)) {
        const stories = await fetchStoriesFromHiddenPosts(req.user.id);
        res.json({ stories, fallback: true });
        return;
      }
      throw error;
    }

    const [authorsById, viewedSet] = await Promise.all([
      getAuthorProfiles((data || []).map((story) => story.author_id)),
      (async () => {
        const ids = (data || []).map((story) => story.id);
        if (!ids.length) return new Set();
        const { data: views, error: viewsError } = await supabaseAdmin
          .schema('postverse')
          .from('story_views')
          .select('story_id')
          .eq('viewer_id', req.user.id)
          .in('story_id', ids);
        if (viewsError) {
          if (isMissingDatabaseFeature(viewsError)) return new Set();
          throw viewsError;
        }
        return new Set((views || []).map((view) => view.story_id));
      })()
    ]);

    res.json({
      stories: (data || []).map((story) => {
        const author = authorsById[story.author_id] || {};
        return {
          id: story.id,
          authorId: story.author_id,
          name: author.name || 'Member',
          type: story.account_type,
          image: story.media_url,
          mediaUrl: story.media_url,
          mediaType: story.media_type,
          caption: story.caption || '',
          metadata: story.metadata || {},
          viewed: viewedSet.has(story.id),
          createdAt: story.created_at,
          expiresAt: story.expires_at
        };
      })
    });
  } catch (error) {
    next(error);
  }
});

postsRouter.post('/stories', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Story image or video file is required', code: 'MEDIA_REQUIRED' });
    }

    const payload = storySchema.parse(req.body);
    await fetchMemberOrBlockFeed(req.user.id);

    let metadata = {};
    if (payload.metadata) {
      try {
        metadata = JSON.parse(payload.metadata);
      } catch {
        metadata = {};
      }
    }

    const asset = await uploadStoryAsset({
      file: req.file,
      userId: req.user.id
    });

    const { data, error } = await supabaseAdmin
      .schema('postverse')
      .from('stories')
      .insert({
        author_id: req.user.id,
        account_type: payload.accountType,
        caption: payload.caption || '',
        media_asset_id: asset.id,
        media_url: asset.public_url,
        media_type: asset.media_type,
        metadata
      })
      .select('*')
      .single();

    if (error) {
      if (!isMissingDatabaseFeature(error)) throw error;

      let { data: fallbackStory, error: fallbackError } = await supabaseAdmin
        .schema('postverse')
        .from('posts')
        .insert({
          author_id: req.user.id,
          account_type: payload.accountType,
          caption: encodeStoryCaption({ caption: payload.caption || '', metadata }),
          media_asset_id: asset.id,
          media_url: asset.public_url,
          media_type: asset.media_type,
          status: 'hidden',
          published_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (fallbackError && isMissingDatabaseFeature(fallbackError)) {
        const draftFallback = await supabaseAdmin
          .schema('postverse')
          .from('posts')
          .insert({
            author_id: req.user.id,
            account_type: payload.accountType,
            caption: encodeStoryCaption({ caption: payload.caption || '', metadata }),
            media_asset_id: asset.id,
            media_url: asset.public_url,
            media_type: asset.media_type,
            status: 'draft',
            published_at: new Date().toISOString()
          })
          .select('*')
          .single();

        fallbackStory = draftFallback.data;
        fallbackError = draftFallback.error;
      }

      if (fallbackError) throw fallbackError;
      res.status(201).json({ story: fallbackStory, asset, fallback: true });
      return;
    }
    res.status(201).json({ story: data, asset });
  } catch (error) {
    if (isMissingDatabaseFeature(error)) {
      error.status = 503;
      error.code = 'STORY_SCHEMA_REQUIRED';
      error.message = 'Story database is not ready. Please apply the latest Supabase schema migration and try again.';
    }
    next(error);
  }
});

postsRouter.post('/stories/:id/view', requireAuth, async (req, res, next) => {
  try {
    await fetchMemberOrBlockFeed(req.user.id);

    const { error } = await supabaseAdmin
      .schema('postverse')
      .from('story_views')
      .upsert({ story_id: req.params.id, viewer_id: req.user.id }, { onConflict: 'story_id,viewer_id' });

    if (error) throw error;
    res.status(201).json({ viewed: true });
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
    const authorsById = await getAuthorProfiles((data || []).map((comment) => comment.author_id));
    res.json({
      comments: (data || []).map((comment) => {
        const author = authorsById[comment.author_id] || {};
        return {
          id: comment.id,
          postId: comment.post_id,
          authorId: comment.author_id,
          authorName: author.name || 'Member',
          authorAvatarUrl: author.avatarUrl || null,
          accountType: author.accountType || 'business',
          body: comment.body,
          createdAt: comment.created_at
        };
      })
    });
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
    const authorsById = await getAuthorProfiles([req.user.id]);
    const author = authorsById[req.user.id] || {};
    res.status(201).json({
      comment: {
        id: data.id,
        postId: data.post_id,
        authorId: data.author_id,
        authorName: author.name || 'Member',
        authorAvatarUrl: author.avatarUrl || null,
        accountType: author.accountType || 'business',
        body: data.body,
        createdAt: data.created_at
      },
      metrics
    });
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
