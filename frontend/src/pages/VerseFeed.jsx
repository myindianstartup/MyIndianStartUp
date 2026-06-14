import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  BriefcaseBusiness,
  Camera,
  Heart,
  Loader2,
  MessageCircle,
  Play,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { apiRequest } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import WorkspaceSidebar from '@/components/dashboard/WorkspaceSidebar';

const GateModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
        <Zap className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-2xl font-black tracking-[-0.03em] text-slate-900">Membership required</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">Please purchase a plan to access this feature.</p>
      <button
        type="button"
        onClick={onClose}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-800 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-900"
      >
        Go to Pricing
      </button>
    </div>
  </div>
);

const VerseBadge = ({ type }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
    type === 'creator' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-500'
  }`}>
    {type === 'creator' ? <Camera size={10} /> : <BriefcaseBusiness size={10} />}
    {type === 'creator' ? 'CreatorVerse' : 'BusinessVerse'}
  </span>
);

const initialsFrom = (value) => (value || 'MI')
  .split(/[.\s@_-]+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join('') || 'MI';

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

const PostCard = ({ post, token, onMetrics }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [metrics, setMetrics] = useState(post.metrics || {});
  const isCreator = post.accountType === 'creator';

  useEffect(() => {
    if (!token || !post.id) return;
    apiRequest(`/api/posts/${post.id}/impression`, { method: 'POST', token }).then((payload) => {
      if (payload.metrics) {
        setMetrics(payload.metrics);
        onMetrics?.(post.id, payload.metrics);
      }
    }).catch(() => {});
  }, [post.id, token]);

  const handleLike = async () => {
    try {
      const payload = await apiRequest(`/api/posts/${post.id}/like`, { method: 'POST', token });
      setLiked(Boolean(payload.liked));
      if (payload.metrics) {
        setMetrics(payload.metrics);
        onMetrics?.(post.id, payload.metrics);
      }
    } catch (error) {
      window.alert(error.message || 'Could not update like.');
    }
  };

  const handleComment = async () => {
    const body = window.prompt('Write a comment');
    if (!body?.trim()) return;

    try {
      const payload = await apiRequest(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        token,
        body: { body: body.trim() }
      });
      if (payload.metrics) {
        setMetrics(payload.metrics);
        onMetrics?.(post.id, payload.metrics);
      }
    } catch (error) {
      window.alert(error.message || 'Could not publish comment.');
    }
  };

  const handleShare = async () => {
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
    <article className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-sm font-black text-white ${isCreator ? 'bg-blue-600' : 'bg-orange-500'}`}>
            {post.authorAvatarUrl ? <img src={post.authorAvatarUrl} alt={post.authorName} className="h-full w-full object-cover" /> : initialsFrom(post.authorName)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-black text-slate-950">{post.authorName}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <VerseBadge type={post.accountType} />
              <span className="text-xs font-semibold text-slate-400">{post.authorCity || 'India'} · {timeAgo(post.publishedAt)}</span>
            </div>
          </div>
        </div>
        <div className="text-right text-xs font-bold text-slate-400">{post.authorCategory}</div>
      </div>

      <div className="px-5 pt-4">
        <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{post.caption}</p>
      </div>

      <div className="mx-5 mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
        {post.mediaType === 'video' ? (
          <div className="relative">
            <video src={post.mediaUrl} controls className="max-h-[420px] w-full bg-slate-950 object-contain" />
            <div className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
              <Play className="mr-1 inline h-3 w-3" />
              Video
            </div>
          </div>
        ) : (
          <img src={post.mediaUrl} alt="VerseFeed post" className="max-h-[520px] w-full object-cover" />
        )}
      </div>

      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm font-bold transition ${liked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            <span>{metrics.likes || 0}</span>
          </button>
          <button type="button" onClick={handleComment} className="flex items-center gap-1.5 text-sm font-bold text-slate-400 transition hover:text-blue-600">
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
    </article>
  );
};

const VerseFeed = () => {
  const { member, token } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [gateOpen, setGateOpen] = useState(false);
  const [error, setError] = useState('');

  const filters = [
    { key: 'all', label: 'All Posts' },
    { key: 'business', label: 'BusinessVerse' },
    { key: 'creator', label: 'CreatorVerse' }
  ];

  useEffect(() => {
    const loadFeed = async () => {
      if (!token) return;

      setLoading(true);
      setError('');
      try {
        const [feedData, recommendationData] = await Promise.all([
          apiRequest('/api/posts/feed', { token }),
          apiRequest('/api/posts/recommendations', { token })
        ]);
        setPosts(feedData.posts || []);
        setRecommendations(recommendationData.recommendations || []);
      } catch (requestError) {
        if (requestError.message === 'Please purchase a plan to access this feature.') {
          setGateOpen(true);
        } else {
          setError(requestError.message || 'Could not load VerseFeed.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [token]);

  const filteredPosts = useMemo(() => {
    let nextPosts = posts;
    if (activeFilter !== 'all') nextPosts = nextPosts.filter((post) => post.accountType === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      nextPosts = nextPosts.filter((post) => [
        post.authorName,
        post.authorCity,
        post.authorCategory,
        post.caption
      ].some((value) => String(value || '').toLowerCase().includes(q)));
    }
    return nextPosts;
  }, [activeFilter, posts, searchQuery]);

  const updatePostMetrics = (postId, metrics) => {
    setPosts((current) => current.map((post) => (
      post.id === postId ? { ...post, metrics: { ...post.metrics, ...metrics } } : post
    )));
  };

  const closeGate = () => {
    setGateOpen(false);
    navigate('/pricing');
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] pt-28 pb-16">
      {gateOpen && <GateModal onClose={closeGate} />}
      <div className="mx-auto grid max-w-7xl gap-8 px-6 md:px-12 lg:grid-cols-[280px_1fr]">
        <WorkspaceSidebar />

        <div className="min-w-0">
          <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-slate-600" />
                <span className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-600">VerseFeed</span>
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950 md:text-4xl">
                What's happening in the Verse
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Real posts from active BusinessVerse and CreatorVerse members.
              </p>
            </div>
            {member && (
              <Link
                to="/post-verse"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-800 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-0.5 hover:bg-slate-900"
              >
                <Zap size={15} />
                Post Today
              </Link>
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="min-w-0 space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                  {filters.map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setActiveFilter(filter.key)}
                      className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${
                        activeFilter === filter.key ? 'bg-slate-800 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <div className="relative flex-1 sm:max-w-xs">
                  <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search posts, creators, businesses..."
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-8 text-sm font-bold text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading VerseFeed...
                </div>
              ) : error ? (
                <div className="rounded-3xl border border-rose-100 bg-rose-50 p-8 text-sm font-semibold text-rose-600">{error}</div>
              ) : filteredPosts.length ? (
                filteredPosts.map((post) => <PostCard key={post.id} post={post} token={token} onMetrics={updatePostMetrics} />)
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
                  <Sparkles size={32} className="text-slate-300" />
                  <p className="mt-3 text-sm font-bold text-slate-500">No posts found</p>
                  <p className="mt-1 text-xs text-slate-400">Published member posts will appear here.</p>
                </div>
              )}
            </div>

            <aside className="hidden space-y-5 xl:block">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Daily Rule</div>
                <h3 className="mt-2 text-lg font-black leading-snug text-slate-900">1 post every 24 hours</h3>
                <p className="mt-2 text-xs font-semibold leading-6 text-slate-500">
                  No spam. No feed domination. Every member receives a fair slot.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <Users size={13} />
                  Recommended For You
                </div>
                <div className="mt-4 space-y-4">
                  {recommendations.length ? recommendations.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-sm font-black text-white ${item.accountType === 'creator' ? 'bg-blue-600' : 'bg-orange-500'}`}>
                          {item.authorAvatarUrl ? <img src={item.authorAvatarUrl} alt={item.authorName} className="h-full w-full object-cover" /> : initialsFrom(item.authorName)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-black text-slate-950">{item.authorName}</div>
                          <div className="mt-1 text-[10px] font-semibold text-slate-400">{item.reason}</div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm font-semibold text-slate-500">Recommendations appear after members start posting.</p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <TrendingUp size={13} />
                  Discovery Tips
                </div>
                <ul className="mt-4 space-y-3 text-sm font-semibold leading-6 text-slate-600">
                  <li>Keep captions clear and collaboration-focused.</li>
                  <li>Post product, service, portfolio, or opportunity updates.</li>
                  <li>Use one strong media file instead of multiple posts.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerseFeed;
