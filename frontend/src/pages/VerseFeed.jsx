import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  BriefcaseBusiness,
  Camera,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Play,
  Search,
  Send,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/* ─────────────────────────────────────────────
   MOCK DATA  (replace with real API calls later)
───────────────────────────────────────────── */
const MOCK_STORIES = [
  { id: 1, name: 'Aurora Foods', type: 'business', initial: 'A', color: 'bg-orange-500', viewed: false },
  { id: 2, name: 'Riya Sharma', type: 'creator', initial: 'R', color: 'bg-blue-600', viewed: false },
  { id: 3, name: 'Northstar Dig.', type: 'business', initial: 'N', color: 'bg-orange-400', viewed: true },
  { id: 4, name: 'Karan Mehta', type: 'creator', initial: 'K', color: 'bg-indigo-500', viewed: true },
  { id: 5, name: 'GreenLeaf Co.', type: 'business', initial: 'G', color: 'bg-emerald-500', viewed: false },
  { id: 6, name: 'Priya Arts', type: 'creator', initial: 'P', color: 'bg-purple-600', viewed: true },
  { id: 7, name: 'BlueSky Tech', type: 'business', initial: 'B', color: 'bg-sky-500', viewed: false },
];

const MOCK_POSTS = [
  {
    id: 1,
    author: 'Aurora Foods Pvt Ltd',
    handle: '@aurorafoods',
    type: 'business',
    city: 'Ahmedabad',
    timeAgo: '2h ago',
    mediaType: 'image',
    mediaUrl: null,
    mediaBg: 'from-orange-100 to-amber-50',
    mediaIcon: BriefcaseBusiness,
    mediaIconColor: 'text-orange-400',
    title: 'New retail-ready packaging launch 🚀',
    caption:
      'Excited to showcase our latest product range, built for distributors and creator partnerships across India. Looking for brand ambassadors and content creators in the FMCG space.',
    tags: ['#FMCG', '#Packaging', '#BusinessVerse'],
    likes: 124,
    comments: 18,
    liked: false,
    bookmarked: false,
  },
  {
    id: 2,
    author: 'Riya Sharma',
    handle: '@riyacreates',
    type: 'creator',
    city: 'Mumbai',
    timeAgo: '5h ago',
    mediaType: 'video',
    mediaUrl: null,
    mediaBg: 'from-blue-100 to-indigo-50',
    mediaIcon: Camera,
    mediaIconColor: 'text-blue-500',
    title: 'Portfolio reel update — product photography ✨',
    caption:
      'Just dropped my latest portfolio reel! Available for D2C product shoots, Instagram reels content, and brand storytelling projects. Collaborations open for Q3.',
    tags: ['#Photography', '#D2C', '#CreatorVerse'],
    likes: 278,
    comments: 34,
    liked: true,
    bookmarked: false,
  },
  {
    id: 3,
    author: 'Northstar Digital',
    handle: '@northstardigital',
    type: 'business',
    city: 'Bengaluru',
    timeAgo: '8h ago',
    mediaType: 'image',
    mediaUrl: null,
    mediaBg: 'from-violet-100 to-purple-50',
    mediaIcon: BriefcaseBusiness,
    mediaIconColor: 'text-violet-500',
    title: 'Hiring creators for our SaaS launch campaign 🎬',
    caption:
      'Open collaboration brief for explainer videos and launch content this month. Budget allocated. Reach out if you make clean tech/SaaS content. DMs open.',
    tags: ['#SaaS', '#Hiring', '#BusinessVerse'],
    likes: 91,
    comments: 22,
    liked: false,
    bookmarked: true,
  },
  {
    id: 4,
    author: 'Karan Mehta',
    handle: '@karanm',
    type: 'creator',
    city: 'Delhi',
    timeAgo: '12h ago',
    mediaType: 'video',
    mediaUrl: null,
    mediaBg: 'from-pink-100 to-rose-50',
    mediaIcon: Camera,
    mediaIconColor: 'text-pink-500',
    title: 'Behind the scenes — brand shoot day 📸',
    caption:
      "Spent the day shooting for a premium lifestyle brand. The energy on set was incredible! If you are a business looking for authentic visual storytelling, let's connect.",
    tags: ['#BTS', '#Lifestyle', '#CreatorVerse'],
    likes: 342,
    comments: 47,
    liked: false,
    bookmarked: false,
  },
  {
    id: 5,
    author: 'GreenLeaf Organics',
    handle: '@greenleaforg',
    type: 'business',
    city: 'Pune',
    timeAgo: '1d ago',
    mediaType: 'image',
    mediaUrl: null,
    mediaBg: 'from-green-100 to-emerald-50',
    mediaIcon: BriefcaseBusiness,
    mediaIconColor: 'text-emerald-500',
    title: 'Introducing our zero-waste packaging line 🌿',
    caption:
      "Our new eco packaging is here. Looking for creators passionate about sustainability, wellness, and organic living to spread the word. India's green future starts here.",
    tags: ['#Organic', '#Sustainability', '#BusinessVerse'],
    likes: 198,
    comments: 31,
    liked: false,
    bookmarked: false,
  },
  {
    id: 6,
    author: 'Priya Artworks',
    handle: '@priyaart',
    type: 'creator',
    city: 'Jaipur',
    timeAgo: '1d ago',
    mediaType: 'image',
    mediaUrl: null,
    mediaBg: 'from-yellow-100 to-amber-50',
    mediaIcon: Camera,
    mediaIconColor: 'text-yellow-500',
    title: 'Commission slots open for August 🎨',
    caption:
      "Taking on 3 new brand illustration projects for August. I specialize in premium digital art, brand identity kits, and social-first visual campaigns. Portfolio in bio.",
    tags: ['#Illustration', '#BrandDesign', '#CreatorVerse'],
    likes: 215,
    comments: 28,
    liked: true,
    bookmarked: true,
  },
];

const SUGGESTED = [
  { id: 1, name: 'BlueSky Technologies', handle: '@bluesky', type: 'business', city: 'Hyderabad', initial: 'B', color: 'bg-sky-500' },
  { id: 2, name: 'Meera Visuals', handle: '@meeravis', type: 'creator', city: 'Chennai', initial: 'M', color: 'bg-purple-600' },
  { id: 3, name: 'Indigo Brands', handle: '@indigobrands', type: 'business', city: 'Kolkata', initial: 'I', color: 'bg-indigo-500' },
];

const TRENDING_TAGS = ['#CreatorVerse', '#BusinessVerse', '#MakeInIndia', '#D2C', '#StartupIndia', '#SaaS'];

/* ─────────────────────────────────────────────
   VERSE BADGE
───────────────────────────────────────────── */
function VerseBadge({ type }) {
  return type === 'business' ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-orange-500">
      <BriefcaseBusiness size={9} />
      BusinessVerse
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-blue-600">
      <Camera size={9} />
      CreatorVerse
    </span>
  );
}

/* ─────────────────────────────────────────────
   POST CARD
───────────────────────────────────────────── */
function PostCard({ post }) {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [bookmarked, setBookmarked] = useState(post.bookmarked);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  const handleLike = () => {
    setLiked((p) => !p);
    setLikes((p) => (liked ? p - 1 : p + 1));
  };

  const Icon = post.mediaIcon;

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_2px_16px_rgba(15,23,42,0.06)] transition-shadow duration-300 hover:shadow-[0_8px_32px_rgba(15,23,42,0.1)]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white ${
              post.type === 'business' ? 'bg-orange-500' : 'bg-blue-600'
            }`}
          >
            {post.author[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-950">{post.author}</span>
              <VerseBadge type={post.type} />
            </div>
            <div className="mt-0.5 text-xs font-semibold text-slate-400">
              {post.handle} · {post.city} · {post.timeAgo}
            </div>
          </div>
        </div>
        <button className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Caption */}
      <div className="px-5 pt-4">
        <p className="text-[15px] font-bold leading-7 text-slate-800">{post.title}</p>
        <p className="mt-1 text-sm leading-7 text-slate-500">{post.caption}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs font-bold text-blue-500 hover:underline cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Media */}
      <div className={`relative mx-5 mt-4 flex h-52 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${post.mediaBg}`}>
        <div className="flex flex-col items-center gap-3 opacity-30">
          <Icon size={48} className={post.mediaIconColor} />
          {post.mediaType === 'video' && (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/60 shadow">
              <Play size={20} className="ml-1 text-slate-700" />
            </div>
          )}
        </div>
        {post.mediaType === 'video' && (
          <div className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
            ▶ Video
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-5">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${
              liked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
            }`}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            <span>{likes}</span>
          </button>
          <button
            onClick={() => setShowComment((p) => !p)}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-400 transition-colors hover:text-blue-500"
          >
            <MessageCircle size={18} />
            <span>{post.comments}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm font-bold text-slate-400 transition-colors hover:text-slate-700">
            <Share2 size={18} />
          </button>
        </div>
        <button
          onClick={() => setBookmarked((p) => !p)}
          className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${
            bookmarked ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'
          }`}
        >
          <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Comment box */}
      {showComment && (
        <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-3">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white placeholder:text-slate-400"
          />
          <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow transition hover:bg-blue-700">
            <Send size={14} />
          </button>
        </div>
      )}
    </article>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const VerseFeed = () => {
  const { member } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = [
    { key: 'all', label: 'All Posts' },
    { key: 'business', label: 'BusinessVerse' },
    { key: 'creator', label: 'CreatorVerse' },
  ];

  const filteredPosts = useMemo(() => {
    let posts = MOCK_POSTS;
    if (activeFilter !== 'all') posts = posts.filter((p) => p.type === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.author.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.caption.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return posts;
  }, [activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f4f6fb] pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* ── PAGE HEADER ── */}
        <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-blue-600" />
              <span className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-600">VerseFeed</span>
            </div>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-4xl">
              What's happening in the Verse
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Businesses &amp; creators posting their best work — one post every 24 hours.
            </p>
          </div>
          {member && (
            <Link
              to="/post-verse"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
            >
              <Zap size={15} />
              Post Today
            </Link>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* ── LEFT COLUMN ── */}
          <div className="min-w-0 space-y-5">

            {/* Stories bar */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
                {/* "Your Story" slot */}
                {member && (
                  <div className="flex shrink-0 flex-col items-center gap-1.5 px-3">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-blue-300 bg-blue-50 text-blue-600 transition hover:bg-blue-100">
                      <span className="text-xl font-black">+</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">Your Post</span>
                  </div>
                )}

                {MOCK_STORIES.map((s) => (
                  <div key={s.id} className="flex shrink-0 flex-col items-center gap-1.5 px-3 cursor-pointer">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full text-sm font-black text-white transition-transform hover:scale-105 ${s.color} ${
                        !s.viewed ? 'ring-2 ring-offset-2 ring-blue-500' : 'ring-2 ring-offset-2 ring-slate-200'
                      }`}
                    >
                      {s.initial}
                    </div>
                    <span className="w-16 truncate text-center text-[10px] font-bold text-slate-500">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter + Search bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${
                      activeFilter === f.key
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 sm:max-w-xs">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts, creators, businesses..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Feed posts */}
            {filteredPosts.length > 0 ? (
              <div className="space-y-5">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
                <Sparkles size={32} className="text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-500">No posts found</p>
                <p className="mt-1 text-xs text-slate-400">Try a different filter or search term</p>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="hidden space-y-5 lg:block">

            {/* Daily rule reminder */}
            <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-[0_8px_24px_rgba(37,99,235,0.25)]">
              <div className="text-[10px] font-black uppercase tracking-widest text-blue-200">Daily Rule</div>
              <h3 className="mt-2 text-lg font-black leading-snug">1 post every 24 hours</h3>
              <p className="mt-2 text-xs font-semibold leading-6 text-blue-100">
                No spam. No feed domination. Every business and creator gets equal visibility.
              </p>
              {member && (
                <Link
                  to="/post-verse"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
                >
                  <Zap size={12} />
                  Post Today
                </Link>
              )}
            </div>

            {/* Suggested to follow */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
                <Users size={13} />
                Suggested For You
              </div>
              <div className="mt-4 space-y-4">
                {SUGGESTED.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white ${s.color}`}>
                        {s.initial}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-950 leading-tight">{s.name}</div>
                        <div className="text-[10px] font-semibold text-slate-400">{s.handle} · {s.city}</div>
                        <VerseBadge type={s.type} />
                      </div>
                    </div>
                    <button className="shrink-0 rounded-full border border-blue-200 px-3 py-1.5 text-[11px] font-bold text-blue-600 transition hover:bg-blue-50">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending tags */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
                <TrendingUp size={13} />
                Trending Tags
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {TRENDING_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer note */}
            <p className="px-1 text-[11px] font-semibold leading-5 text-slate-400">
              VerseFeed shows posts from verified BusinessVerse and CreatorVerse members. 1 post per 24 hours per account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerseFeed;
