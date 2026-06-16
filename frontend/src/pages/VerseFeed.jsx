import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  BriefcaseBusiness,
  Camera,
  Heart,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Play,
  Search,
  Send,
  Share2,
  Sparkles,
  UserCheck,
  UserPlus,
  Users
} from 'lucide-react';
import { apiRequest } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

const MembershipRequiredNotice = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-orange-600">
        Membership required
      </div>
      <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
        Purchase a membership plan to open VerseFeed.
      </h2>
      <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
        VerseFeed is available only for active BusinessVerse and CreatorVerse members. Complete your yearly membership to view posts, connect with members, and publish daily visibility updates.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate('/pricing')}
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(37,99,235,0.25)] transition hover:bg-blue-700"
        >
          View Membership Plans
        </button>
      </div>
    </div>
  );
};

const FeedUnavailableNotice = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-[1.75rem] border border-amber-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-amber-700">
        Feed temporarily unavailable
      </div>
      <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
        VerseFeed is not connected right now.
      </h2>
      <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
        We could not reach the production backend for VerseFeed. Please check that the deployed frontend has the correct API URL, then refresh the page.
      </p>
      <button
        type="button"
        onClick={() => navigate('/pricing')}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-black text-white transition hover:bg-slate-800"
      >
        Review Membership
      </button>
    </div>
  );
};

const VerseBadge = ({ type }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${
    type === 'creator' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-500'
  }`}>
    {type === 'creator' ? <Camera size={9} /> : <BriefcaseBusiness size={9} />}
    {type === 'creator' ? 'CreatorVerse' : 'BusinessVerse'}
  </span>
);

const initialsFrom = (value) => (value || 'MI')
  .split(/[.\s@_-]+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join('') || 'MI';

const handleFrom = (value) => `@${String(value || 'member')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '')
  .slice(0, 24) || 'member'}`;

const timeAgo = (value) => {
  if (!value) return '';
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const showcasePosts = [
  {
    id: 'showcase-business-launch',
    showcase: true,
    authorName: 'Gujarat Foods Co.',
    authorCity: 'Ahmedabad',
    authorCategory: 'Festive retail packaging launch',
    accountType: 'business',
    caption: 'Launching our festive snack boxes for retailers and cafe partners across Gujarat. Open for creator collaborations, product shoots, and local distribution leads.',
    mediaUrl: '/assets/auth-characters.png',
    mediaType: 'image',
    publishedAt: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    metrics: { views: 1240, likes: 186, comments: 24, shares: 18 }
  },
  {
    id: 'showcase-creator-video',
    showcase: true,
    authorName: 'Kavya Visuals',
    authorCity: 'Mumbai',
    authorCategory: 'Portfolio reel update: product videos',
    accountType: 'creator',
    caption: 'New product-video reel format for food brands: quick hook, clean closeups, and direct CTA. Available for monthly content packages.',
    mediaUrl: '',
    posterUrl: '/assets/auth-characters.png',
    mediaType: 'video',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    metrics: { views: 2180, likes: 312, comments: 41, shares: 29 }
  },
  {
    id: 'showcase-creator-portfolio',
    showcase: true,
    authorName: 'ReelCraft Studio',
    authorCity: 'Bengaluru',
    authorCategory: 'UGC, photography, marketplace creatives',
    accountType: 'creator',
    caption: 'Portfolio update: product photography, marketplace images, and 15-second ad creatives for D2C startups. DM for collaboration.',
    mediaUrl: '/assets/auth-characters.png',
    mediaType: 'image',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    metrics: { views: 930, likes: 142, comments: 17, shares: 11 }
  }
];

const showcaseRecommendations = [
  {
    id: 'showcase-rec-creator',
    authorName: 'Kavya Visuals',
    accountType: 'creator',
    authorAvatarUrl: '',
    reason: 'Recommended creator for product video collaborations'
  },
  {
    id: 'showcase-rec-business',
    authorName: 'Gujarat Foods Co.',
    accountType: 'business',
    authorAvatarUrl: '',
    reason: 'Active business opportunity in Food & Beverage'
  },
  {
    id: 'showcase-rec-studio',
    authorName: 'ReelCraft Studio',
    accountType: 'creator',
    authorAvatarUrl: '',
    reason: 'UGC and marketplace content specialist'
  }
];

const postTags = (post) => {
  const category = String(post.authorCategory || '').split(/[,\s/]+/).filter(Boolean)[0];
  return [
    post.accountType === 'creator' ? '#CreatorVerse' : '#BusinessVerse',
    category ? `#${category.replace(/[^a-zA-Z0-9]/g, '')}` : null,
    post.authorCity ? `#${String(post.authorCity).replace(/\s+/g, '')}` : null
  ].filter(Boolean);
};

const mediaGradient = (post) => {
  if (post.mediaType === 'video') return 'from-blue-100 to-indigo-50';
  if (post.accountType === 'creator') return 'from-violet-100 to-purple-50';
  return 'from-orange-100 to-amber-50';
};

const PostCard = ({ post, token, onMetrics, onFollow }) => {
  const [liked, setLiked] = useState(Boolean(post.viewer?.liked));
  const [saved, setSaved] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(post.commentsPreview || []);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [metrics, setMetrics] = useState(post.metrics || {});
  const isCreator = post.accountType === 'creator';
  const isShowcase = Boolean(post.showcase);
  const MediaIcon = isCreator ? Camera : BriefcaseBusiness;
  const caption = post.caption || '';
  const tags = postTags(post);
  const shouldCollapseCaption = caption.length > 150;
  const visibleCaption = shouldCollapseCaption && !expanded ? `${caption.slice(0, 150).trim()}...` : caption;
  const visibleTags = expanded ? tags : tags.slice(0, 3);
  const hasMoreContent = shouldCollapseCaption || tags.length > visibleTags.length;
  const isFollowingAuthor = Boolean(post.viewer?.followingAuthor);
  const canConnect = Boolean(post.authorId && !post.viewer?.ownPost && !isShowcase);

  useEffect(() => {
    setLiked(Boolean(post.viewer?.liked));
  }, [post.id, post.viewer?.liked]);

  useEffect(() => {
    setMetrics(post.metrics || {});
  }, [post.id, post.metrics]);

  useEffect(() => {
    setComments(post.commentsPreview || []);
  }, [post.id, post.commentsPreview]);

  useEffect(() => {
    if (!token || !post.id || isShowcase) return;
    apiRequest(`/api/posts/${post.id}/impression`, { method: 'POST', token }).then((payload) => {
      if (payload.metrics) {
        setMetrics(payload.metrics);
        onMetrics?.(post.id, payload.metrics);
      }
    }).catch(() => {});
  }, [post.id, token, isShowcase]);

  const handleLike = async () => {
    if (isShowcase) {
      setLiked((current) => {
        const nextLiked = !current;
        setMetrics((metricState) => ({ ...metricState, likes: Math.max(0, (metricState.likes || 0) + (nextLiked ? 1 : -1)) }));
        return nextLiked;
      });
      return;
    }

    const previousLiked = liked;
    const nextLiked = !previousLiked;
    setLiked(nextLiked);
    setMetrics((current) => ({
      ...current,
      likes: Math.max(0, (current.likes || 0) + (nextLiked ? 1 : -1))
    }));
    try {
      const payload = await apiRequest(`/api/posts/${post.id}/like`, { method: 'POST', token });
      setLiked(Boolean(payload.liked));
      if (payload.metrics) {
        setMetrics(payload.metrics);
        onMetrics?.(post.id, payload.metrics);
      }
    } catch (error) {
      setLiked(previousLiked);
      setMetrics((current) => ({
        ...current,
        likes: Math.max(0, (current.likes || 0) + (nextLiked ? -1 : 1))
      }));
      window.alert(error.message || 'Could not update like.');
    }
  };

  const handleComment = async () => {
    if (isShowcase) {
      if (comment.trim()) {
        setComments((current) => [
          ...current,
          {
            id: `showcase-comment-${Date.now()}`,
            authorName: 'You',
            body: comment.trim(),
            createdAt: new Date().toISOString()
          }
        ]);
      }
      setMetrics((current) => ({ ...current, comments: (current.comments || 0) + 1 }));
      setComment('');
      return;
    }

    const body = comment.trim();
    if (!body) return;

    try {
      const payload = await apiRequest(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        token,
        body: { body }
      });
      if (payload.metrics) {
        setMetrics(payload.metrics);
        onMetrics?.(post.id, payload.metrics);
      }
      if (payload.comment) {
        setComments((current) => [...current, payload.comment]);
      }
      setComment('');
    } catch (error) {
      window.alert(error.message || 'Could not publish comment.');
    }
  };

  const toggleComments = async () => {
    const nextOpen = !commentOpen;
    setCommentOpen(nextOpen);
    if (!nextOpen || isShowcase) return;

    setCommentsLoading(true);
    try {
      const payload = await apiRequest(`/api/posts/${post.id}/comments`, { token });
      setComments(payload.comments || []);
    } catch (error) {
      window.alert(error.message || 'Could not load comments.');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleShare = async () => {
    if (isShowcase) {
      setMetrics((current) => ({ ...current, shares: (current.shares || 0) + 1 }));
      return;
    }

    try {
      const payload = await apiRequest(`/api/posts/${post.id}/share`, {
        method: 'POST',
        token,
        body: { channel: 'internal' }
      });
      if (payload.metrics) {
        setMetrics(payload.metrics);
        onMetrics?.(post.id, payload.metrics);
      }
    } catch (error) {
      window.alert(error.message || 'Could not record share.');
    }
  };

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_2px_14px_rgba(15,23,42,0.055)] transition-shadow duration-300 hover:shadow-[0_8px_28px_rgba(15,23,42,0.09)]">
      <div className="flex items-center justify-between gap-4 px-4 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] text-xs font-black text-white ${isCreator ? 'bg-blue-600' : 'bg-orange-500'}`}>
            {post.authorAvatarUrl ? <img src={post.authorAvatarUrl} alt={post.authorName} className="h-full w-full object-cover" /> : initialsFrom(post.authorName)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-black text-slate-950">{post.authorName}</span>
              <VerseBadge type={post.accountType} />
              {isShowcase && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-500">Showcase</span>}
            </div>
            <div className="mt-0.5 text-xs font-semibold text-slate-400">
              {handleFrom(post.authorName)} · {post.authorCity || 'India'} · {timeAgo(post.publishedAt)}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {canConnect && (
            <button
              type="button"
              onClick={() => onFollow?.(post.authorId, !isFollowingAuthor)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-black transition ${
                isFollowingAuthor
                  ? 'border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200'
                  : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
              }`}
            >
              {isFollowingAuthor ? <UserCheck size={13} /> : <UserPlus size={13} />}
              <span>{isFollowingAuthor ? 'Connected' : 'Connect'}</span>
            </button>
          )}
          <button type="button" className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="More post options">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-3">
        {post.authorCategory && <p className="text-[15px] font-black leading-7 text-slate-800">{post.authorCategory}</p>}
        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-500">
          {visibleCaption}
          {hasMoreContent && !expanded && (
            <button type="button" onClick={() => setExpanded(true)} className="ml-1 font-black text-slate-700 hover:text-blue-600">
              more
            </button>
          )}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <span key={tag} className="cursor-pointer text-xs font-bold text-blue-500 hover:underline">{tag}</span>
          ))}
          {expanded && hasMoreContent && (
            <button type="button" onClick={() => setExpanded(false)} className="text-xs font-black text-slate-500 hover:text-blue-600">
              show less
            </button>
          )}
        </div>
      </div>

      <div className={`relative mx-4 mt-3 flex h-[240px] items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br sm:h-[280px] xl:h-[315px] ${mediaGradient(post)}`}>
        {post.mediaUrl && post.mediaType !== 'video' ? (
          <img src={post.mediaUrl} alt="VerseFeed post" className="h-full w-full object-contain" />
        ) : post.mediaType === 'video' ? (
          <div className="relative h-full w-full">
            {post.mediaUrl ? (
              <video src={post.mediaUrl} controls className="h-full w-full bg-slate-950 object-contain" />
            ) : (
              <div className="relative grid h-full place-items-center overflow-hidden">
                <img src={post.posterUrl || '/assets/auth-characters.png'} alt="VerseFeed video preview" className="h-full w-full object-cover opacity-80" />
                <div className="absolute grid h-16 w-16 place-items-center rounded-full bg-white/90 text-slate-950 shadow-2xl">
                  <Play className="ml-1 h-7 w-7" fill="currentColor" />
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
              <Play className="mr-1 inline h-3 w-3" />
              Video
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 opacity-40">
            <MediaIcon size={52} className={isCreator ? 'text-blue-500' : 'text-orange-500'} />
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">Verse media</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm font-bold transition ${liked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            <span>{metrics.likes || 0}</span>
          </button>
          <button type="button" onClick={toggleComments} className="flex items-center gap-1.5 text-sm font-bold text-slate-400 transition hover:text-blue-600">
            <MessageCircle size={18} />
            <span>{metrics.comments || 0}</span>
          </button>
          <button type="button" onClick={handleShare} className="flex items-center gap-1.5 text-sm font-bold text-slate-400 transition hover:text-slate-700">
            <Share2 size={18} />
            <span>{metrics.shares || 0}</span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => setSaved((current) => !current)}
          className={`transition ${saved ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}
        >
          <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {commentOpen && (
        <div className="border-t border-slate-100 px-4 py-3">
          <div className="space-y-3">
            {commentsLoading ? (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading comments...
              </div>
            ) : comments.length ? comments.map((item) => (
              <div key={item.id} className="flex gap-2">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl text-[10px] font-black text-white ${item.accountType === 'creator' ? 'bg-blue-600' : 'bg-orange-500'}`}>
                  {item.authorAvatarUrl ? <img src={item.authorAvatarUrl} alt={item.authorName} className="h-full w-full object-cover" /> : initialsFrom(item.authorName)}
                </div>
                <div className="min-w-0 rounded-2xl bg-slate-50 px-3 py-2">
                  <div className="truncate text-xs font-black text-slate-900">{item.authorName}</div>
                  <div className="mt-0.5 text-xs leading-5 text-slate-600">{item.body}</div>
                </div>
              </div>
            )) : (
              <div className="text-xs font-bold text-slate-400">No comments yet. Start the conversation.</div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <input
              type="text"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleComment();
              }}
              placeholder="Write a comment..."
              className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white placeholder:text-slate-400"
            />
            <button type="button" onClick={handleComment} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow transition hover:bg-blue-700" aria-label="Send comment">
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

const VerseFeed = () => {
  const { member, token } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [connections, setConnections] = useState({ stats: { following: 0, followers: 0 }, following: [], followers: [] });
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [connectionNotice, setConnectionNotice] = useState('');
  const [error, setError] = useState('');

  const filters = [
    { key: 'all', label: 'All Posts' },
    { key: 'business', label: 'BusinessVerse' },
    { key: 'creator', label: 'CreatorVerse' }
  ];
  const activeSubscription = ['active', 'trialing', 'paid'].includes(String(member?.subscription_status || '').toLowerCase());
  const hasLivePosts = posts.length > 0;
  const visibleFollowing = connections.following || [];
  const visibleFollowers = connections.followers || [];
  const connectedMembers = useMemo(() => {
    const seen = new Set();
    return [...visibleFollowing, ...visibleFollowers].filter((item) => {
      if (!item?.id) return false;
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [visibleFollowers, visibleFollowing]);
  const connectionStats = useMemo(() => ({
    totalConnections: connectedMembers.length
  }), [connectedMembers.length]);

  useEffect(() => {
    const loadFeed = async () => {
      if (!token) return;
      if (!activeSubscription) {
        setLoading(false);
        setError('');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const [feedData, recommendationData, connectionData] = await Promise.all([
          apiRequest('/api/posts/feed', { token }),
          apiRequest('/api/posts/recommendations', { token }),
          apiRequest('/api/posts/connections', { token }).catch(() => ({ stats: { following: 0, followers: 0 }, following: [], followers: [] }))
        ]);
        setPosts(feedData.posts || []);
        setRecommendations(recommendationData.recommendations || []);
        setConnections({
          stats: connectionData.stats || { following: (connectionData.following || []).length, followers: (connectionData.followers || []).length },
          following: connectionData.following || [],
          followers: connectionData.followers || []
        });
      } catch (requestError) {
        if (
          requestError.status === 402
          || requestError.code === 'SUBSCRIPTION_REQUIRED'
          || requestError.payload?.code === 'SUBSCRIPTION_REQUIRED'
          || requestError.redirectTo === '/pricing'
        ) {
          navigate('/pricing', { replace: true, state: { from: '/verse-feed' } });
        } else {
          const friendlyError = requestError.status === 404 || requestError.code === 'API_URL_MISSING'
            ? 'FEED_UNAVAILABLE'
            : requestError.message || 'Could not load VerseFeed.';
          setError(friendlyError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [activeSubscription, navigate, token]);

  const filteredPosts = useMemo(() => {
    let nextPosts = hasLivePosts ? posts : showcasePosts;
    if (activeFilter !== 'all') nextPosts = nextPosts.filter((post) => post.accountType === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      nextPosts = nextPosts.filter((post) => [
        post.authorName,
        post.authorCity,
        post.authorCategory,
        post.caption,
        ...postTags(post)
      ].some((value) => String(value || '').toLowerCase().includes(q)));
    }
    return nextPosts;
  }, [activeFilter, hasLivePosts, posts, searchQuery]);

  const updatePostMetrics = (postId, metrics) => {
    setPosts((current) => current.map((post) => (
      post.id === postId ? { ...post, metrics: { ...post.metrics, ...metrics } } : post
    )));
  };

  const updateFollowState = (userId, following) => {
    setRecommendations((current) => current.map((item) => (
      item.authorId === userId ? { ...item, isFollowing: following, viewer: { ...(item.viewer || {}), followingAuthor: following } } : item
    )));
    setPosts((current) => current.map((post) => (
      post.authorId === userId ? { ...post, viewer: { ...(post.viewer || {}), followingAuthor: following } } : post
    )));
  };

  const loadConnections = async () => {
    if (!token) return;
    const connectionData = await apiRequest('/api/posts/connections', { token });
    setConnections({
      stats: connectionData.stats || { following: (connectionData.following || []).length, followers: (connectionData.followers || []).length },
      following: connectionData.following || [],
      followers: connectionData.followers || []
    });
  };

  const handleFollow = async (userId, desiredState) => {
    if (!userId) return;

    const currentlyFollowing = recommendations.some((item) => item.authorId === userId && (item.isFollowing || item.viewer?.followingAuthor))
      || posts.some((post) => post.authorId === userId && post.viewer?.followingAuthor);
    const nextFollowing = typeof desiredState === 'boolean' ? desiredState : !currentlyFollowing;
    updateFollowState(userId, nextFollowing);

    try {
      setConnectionNotice('');
      const payload = await apiRequest(`/api/posts/users/${userId}/follow`, {
        method: 'POST',
        token,
        body: { following: nextFollowing }
      });
      updateFollowState(userId, Boolean(payload.following));
      if (payload.viewerStats) {
        setConnections((current) => ({ ...current, stats: payload.viewerStats }));
      }
      loadConnections().catch(() => {});
    } catch (error) {
      updateFollowState(userId, currentlyFollowing);
      if (error.status === 402 || error.code === 'SUBSCRIPTION_REQUIRED') {
        navigate('/pricing', { replace: true, state: { from: '/verse-feed' } });
        return;
      }
      setConnectionNotice(error.message || 'Could not update connection status.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] pt-24 pb-16">
      <div className="mx-auto max-w-[82rem] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-slate-200/70 bg-[#f4f6fb] py-5">
          <div className="mx-auto max-w-[82rem]">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-blue-600" />
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">VerseFeed</span>
            </div>
            <h1 className="mt-1 text-[2rem] font-black tracking-[-0.04em] text-slate-950 sm:text-3xl md:text-4xl">
              What's happening in the Verse
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Businesses and creators posting their best work, one post every 24 hours.
            </p>
          </div>
        </div>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="min-w-0 space-y-5">
            {activeSubscription && (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                    {filters.map((filter) => (
                      <button
                        key={filter.key}
                        type="button"
                        onClick={() => setActiveFilter(filter.key)}
                        className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${
                          activeFilter === filter.key ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <div className="relative w-full sm:max-w-xs">
                    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search posts, creators, businesses..."
                      className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </>
            )}

            {activeSubscription && !hasLivePosts && !loading && !error && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
                Showcase posts are visible until members publish live posts.
              </div>
            )}

            {!activeSubscription ? (
              <MembershipRequiredNotice />
            ) : loading ? (
              <div className="space-y-5">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-40 rounded-full bg-slate-200" />
                        <div className="h-3 w-28 rounded-full bg-slate-100" />
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      <div className="h-4 w-full rounded-full bg-slate-100" />
                      <div className="h-4 w-10/12 rounded-full bg-slate-100" />
                    </div>
                    <div className="mt-5 h-72 rounded-[1.5rem] bg-gradient-to-br from-slate-100 to-slate-50" />
                    <div className="mt-5 flex items-center gap-6">
                      <div className="h-4 w-16 rounded-full bg-slate-100" />
                      <div className="h-4 w-16 rounded-full bg-slate-100" />
                      <div className="h-4 w-16 rounded-full bg-slate-100" />
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-36 rounded-full bg-slate-200" />
                        <div className="h-3 w-24 rounded-full bg-slate-100" />
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      <div className="h-4 w-11/12 rounded-full bg-slate-100" />
                      <div className="h-4 w-8/12 rounded-full bg-slate-100" />
                    </div>
                    <div className="mt-5 h-64 rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-white" />
                  </div>
                </div>
              </div>
            ) : error ? (
              error === 'FEED_UNAVAILABLE' ? <FeedUnavailableNotice /> : (
                <div className="rounded-[1.75rem] border border-rose-100 bg-white p-6 text-sm font-semibold leading-6 text-rose-700 shadow-sm sm:p-8">
                  {error}
                </div>
              )
            ) : filteredPosts.length ? (
              <div className="space-y-5">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    token={token}
                    onMetrics={updatePostMetrics}
                    onFollow={handleFollow}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
                <Sparkles size={32} className="text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-500">No posts found</p>
                <p className="mt-1 text-xs text-slate-400">Try a different filter or search term.</p>
              </div>
            )}
          </div>

          <aside className="order-last lg:order-none">
            <div className="space-y-4 lg:sticky lg:top-28 lg:w-[330px] xl:w-[350px]">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <Users size={13} />
                  My Network
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-600">
                  Live
                </span>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <div className="text-2xl font-black text-slate-950">{connectionStats.totalConnections}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Connections</div>
              </div>
              <div className="mt-4 space-y-3">
                {connectedMembers.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {connectedMembers.slice(0, 5).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => item.id && navigate(`/member-profile/${item.id}`)}
                            className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white text-xs font-black text-white ${item.accountType === 'creator' ? 'bg-blue-600' : 'bg-orange-500'}`}
                          >
                            {item.avatarUrl ? <img src={item.avatarUrl} alt={item.name} className="h-full w-full object-cover" /> : initialsFrom(item.name)}
                          </button>
                        ))}
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="truncate text-sm font-black text-slate-900">
                          {connectedMembers.slice(0, 3).map((item) => item.name).join(', ')}
                          {connectedMembers.length > 3 ? ` and ${connectedMembers.length - 3} more` : ''}
                        </div>
                        <div className="truncate text-xs font-semibold text-slate-500">
                          Connected businesses and creators in your network
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {connectedMembers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate('/search-verse')}
                    className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-black text-slate-800 transition hover:bg-slate-100"
                  >
                    Explore Connections
                  </button>
                )}
                {!connectedMembers.length && (
                  <p className="rounded-2xl bg-slate-50 px-3 py-3 text-xs font-semibold leading-5 text-slate-500">
                    Start connecting with creators and businesses to build your connection circle.
                  </p>
                )}
                {connectionNotice && (
                  <p className="rounded-2xl border border-amber-100 bg-amber-50 px-3 py-3 text-xs font-bold leading-5 text-amber-700">
                    {connectionNotice}
                  </p>
                )}
              </div>
            </div>

            <p className="px-1 text-[11px] font-semibold leading-5 text-slate-400">
              VerseFeed shows posts from verified BusinessVerse and CreatorVerse members. One post per 24 hours per account.
            </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default VerseFeed;
