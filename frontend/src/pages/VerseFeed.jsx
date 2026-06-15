import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  BriefcaseBusiness,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
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
  Users,
  Zap
} from 'lucide-react';
import { API_URL, apiRequest } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

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

const storyTimeLeft = (value) => {
  if (!value) return '';
  const diff = new Date(value).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours >= 1) return `${hours}h ${minutes}m left`;
  return `${Math.max(1, minutes)}m left`;
};

const showcaseStories = [
  { id: 'story-kavya', name: 'Kavya Studio', type: 'creator', image: '/assets/auth-characters.png', viewed: false },
  { id: 'story-gujarat', name: 'Gujarat Foods', type: 'business', image: '/assets/india-coverage-map.png', viewed: false },
  { id: 'story-reelcraft', name: 'ReelCraft', type: 'creator', image: '/assets/auth-characters.png', viewed: true },
  { id: 'story-urban', name: 'Urban Spices', type: 'business', image: '/assets/india-coverage-map.png', viewed: true },
  { id: 'story-brand', name: 'Brand Shoots', type: 'creator', image: '/assets/auth-characters.png', viewed: false },
  { id: 'story-d2c', name: 'D2C Leads', type: 'business', image: '/assets/india-coverage-map.png', viewed: true }
];

const storyStickerOptions = ['Launch', 'Hiring', 'Collab', 'Offer', 'New', 'Open'];

const cleanMention = (value = '') => value.replace(/^@+/, '').replace(/[^a-zA-Z0-9_.]/g, '').slice(0, 32);

const cleanCompanyTag = (value = '') => String(value || '').replace(/\s+/g, ' ').trim().slice(0, 40);

const storyMetadataOverlays = (metadata = {}) => ({
  sticker: String(metadata.sticker || '').trim(),
  mention: cleanMention(metadata.mention || ''),
  companyTag: cleanCompanyTag(metadata.companyTag || '')
});

const uniqueByKey = (items, keyFn) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
    mediaUrl: '/assets/india-coverage-map.png',
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

const StoryViewer = ({ story, storyCount = 0, currentIndex = 0, onClose, onNavigate }) => {
  if (!story) return null;
  const overlays = storyMetadataOverlays(story.metadata);
  const canNavigate = storyCount > 1;
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < storyCount - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
      {canNavigate && (
        <button
          type="button"
          onClick={() => canGoPrevious && onNavigate?.(currentIndex - 1)}
          disabled={!canGoPrevious}
          className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
          aria-label="Previous story"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
      )}
      <div className="relative flex h-full max-h-[760px] w-full max-w-sm flex-col overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-x-4 top-4 z-10 h-1 rounded-full bg-white/25">
          <div className="h-full w-full rounded-full bg-white" />
        </div>
        {canNavigate && (
          <div className="absolute left-1/2 top-7 z-20 -translate-x-1/2 rounded-full bg-black/35 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur">
            {currentIndex + 1} / {storyCount}
          </div>
        )}
        {story.expiresAt && (
          <div className="absolute left-4 right-4 top-20 z-20 flex justify-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur">
              <Clock className="h-3.5 w-3.5" />
              {storyTimeLeft(story.expiresAt)}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-7 z-20 rounded-full bg-black/40 px-3 py-1.5 text-xs font-black text-white backdrop-blur transition hover:bg-black/60"
        >
          Close
        </button>
        <div className="absolute left-4 top-7 z-20 flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-xs font-black text-white ${story.type === 'creator' ? 'bg-blue-600' : 'bg-orange-500'}`}>
            {story.image ? <img src={story.image} alt={story.name} className="h-full w-full object-cover" /> : initialsFrom(story.name)}
          </div>
          <div>
            <div className="text-sm font-black text-white">{story.name}</div>
            <div className="text-[11px] font-bold text-white/60">{timeAgo(story.createdAt)}</div>
          </div>
        </div>
        <div className="grid flex-1 place-items-center bg-black">
          {story.mediaType === 'video' ? (
            <video src={story.mediaUrl || story.image} controls autoPlay className="h-full w-full object-contain" />
          ) : (
            <img src={story.mediaUrl || story.image} alt={story.name} className="h-full w-full object-contain" />
          )}
        </div>
        {overlays.sticker && (
          <div className="absolute right-6 top-24 rounded-2xl bg-white/90 px-4 py-2 text-sm font-black text-slate-950 shadow-2xl backdrop-blur">
            {overlays.sticker}
          </div>
        )}
        {overlays.companyTag && (
          <div className="absolute left-6 top-24 max-w-[80%] rounded-2xl bg-blue-600/90 px-4 py-2 text-sm font-black text-white shadow-2xl backdrop-blur">
            {overlays.companyTag}
          </div>
        )}
        {overlays.mention && (
          <div className="absolute left-6 bottom-28 max-w-[80%] rounded-2xl bg-white/15 px-4 py-2 text-sm font-black text-white shadow-2xl backdrop-blur">
            @{overlays.mention}
          </div>
        )}
        {story.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-20 text-sm font-semibold leading-6 text-white">
            {story.caption}
          </div>
        )}
        {canNavigate && (
          <div className="absolute inset-x-0 bottom-4 z-20 flex justify-between px-4 sm:hidden">
            <button
              type="button"
              onClick={() => canGoPrevious && onNavigate?.(currentIndex - 1)}
              disabled={!canGoPrevious}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur disabled:opacity-30"
              aria-label="Previous story"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => canGoNext && onNavigate?.(currentIndex + 1)}
              disabled={!canGoNext}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur disabled:opacity-30"
              aria-label="Next story"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
      {canNavigate && (
        <button
          type="button"
          onClick={() => canGoNext && onNavigate?.(currentIndex + 1)}
          disabled={!canGoNext}
          className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
          aria-label="Next story"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      )}
    </div>
  );
};

const StoryEditor = ({
  draft,
  uploading,
  error,
  mentionOptions = [],
  companyOptions = [],
  onPickMedia,
  onDraftChange,
  onClose,
  onShare
}) => {
  if (!draft) return null;
  const overlays = storyMetadataOverlays(draft);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/80 px-3 py-4 backdrop-blur-sm">
      <div className="grid h-[calc(100vh-2rem)] w-full max-w-4xl grid-rows-[minmax(220px,38vh)_minmax(0,1fr)] overflow-hidden overscroll-contain rounded-[2rem] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)] lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-none">
        <div className="relative grid min-h-0 place-items-center bg-slate-950 lg:min-h-[560px]">
          {draft.previewUrl ? (
            draft.mediaType === 'video' ? (
              <video src={draft.previewUrl} controls className="h-full max-h-[86vh] w-full object-contain" />
            ) : (
              <img src={draft.previewUrl} alt="Story preview" className="h-full max-h-[86vh] w-full object-contain" />
            )
          ) : (
            <button
              type="button"
              onClick={onPickMedia}
              className="mx-8 flex max-w-xs flex-col items-center rounded-[2rem] border border-dashed border-white/25 bg-white/10 px-8 py-10 text-center text-white transition hover:bg-white/15"
            >
              <Camera className="h-10 w-10" />
              <span className="mt-4 text-lg font-black">Choose photo or video</span>
              <span className="mt-2 text-sm font-semibold text-white/60">Pick media, preview it, add caption, then share.</span>
            </button>
          )}
          {draft.previewUrl && draft.caption && (
            <div className="absolute inset-x-6 bottom-8 rounded-3xl bg-black/40 px-5 py-3 text-center text-lg font-black leading-7 text-white shadow-2xl backdrop-blur">
              {draft.caption}
            </div>
          )}
          {overlays.sticker && (
            <div className="absolute right-8 top-24 rounded-2xl bg-white/90 px-4 py-2 text-sm font-black text-slate-950 shadow-2xl backdrop-blur">
              {overlays.sticker}
            </div>
          )}
          {overlays.companyTag && (
            <div className="absolute left-8 top-24 max-w-[70%] rounded-2xl bg-blue-600/90 px-4 py-2 text-sm font-black text-white shadow-2xl backdrop-blur">
              {overlays.companyTag}
            </div>
          )}
          {overlays.mention && (
            <div className="absolute left-8 bottom-24 max-w-[70%] rounded-2xl bg-white/15 px-4 py-2 text-sm font-black text-white shadow-2xl backdrop-blur">
              @{overlays.mention}
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-col overflow-y-auto overscroll-contain bg-white">
          <div className="p-6 pb-4">
          <div className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-600">Story Editor</div>
          <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-slate-950">Create your story</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            Preview your image or video, add a short caption, then share it for 24 hours.
          </p>

          <label className="mt-6 grid gap-2">
            <span className="text-sm font-black text-slate-800">Caption / overlay text</span>
            <textarea
              value={draft.caption}
              onChange={(event) => onDraftChange({ caption: event.target.value })}
              maxLength={250}
              rows={5}
              placeholder="Write something for your story..."
              className="resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <span className="text-right text-[11px] font-bold text-slate-400">{draft.caption.length}/250</span>
          </label>

          <div className="mt-4">
            <div className="text-sm font-black text-slate-800">Sticker</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {storyStickerOptions.map((sticker) => (
                <button
                  key={sticker}
                  type="button"
                  onClick={() => onDraftChange({ sticker: draft.sticker === sticker ? '' : sticker })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-black transition ${
                    draft.sticker === sticker
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  {sticker}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-800">Mention someone</span>
              <input
                value={draft.mention ? `@${cleanMention(draft.mention)}` : ''}
                onChange={(event) => onDraftChange({ mention: cleanMention(event.target.value) })}
                placeholder="@creator or @business"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              {mentionOptions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {mentionOptions.slice(0, 5).map((option) => (
                    <button
                      key={option.handle}
                      type="button"
                      onClick={() => onDraftChange({ mention: option.handle })}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-black transition ${
                        cleanMention(draft.mention) === option.handle
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      @{option.handle}
                    </button>
                  ))}
                </div>
              )}
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-800">Company tag</span>
              <input
                value={draft.companyTag}
                onChange={(event) => onDraftChange({ companyTag: cleanCompanyTag(event.target.value) })}
                placeholder="Tag company or brand"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              {companyOptions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {companyOptions.slice(0, 5).map((option) => (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => onDraftChange({ companyTag: option.name })}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-black transition ${
                        cleanCompanyTag(draft.companyTag) === option.name
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              )}
            </label>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
              {error}
            </div>
          )}
          </div>

          <div className="sticky bottom-0 mt-auto flex gap-3 border-t border-slate-100 bg-white/95 p-6 pt-4 shadow-[0_-12px_28px_rgba(15,23,42,0.06)] backdrop-blur">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onShare}
              disabled={uploading || !draft.file}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(37,99,235,0.25)] transition hover:bg-blue-700 disabled:opacity-60"
            >
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              Share Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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
  const storyInputRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [connections, setConnections] = useState({ stats: { following: 0, followers: 0 }, following: [], followers: [] });
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [storyUploading, setStoryUploading] = useState(false);
  const [storyDraft, setStoryDraft] = useState(null);
  const [storyError, setStoryError] = useState('');
  const [activeStory, setActiveStory] = useState(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [connectionNotice, setConnectionNotice] = useState('');
  const [error, setError] = useState('');

  const filters = [
    { key: 'all', label: 'All Posts' },
    { key: 'business', label: 'BusinessVerse' },
    { key: 'creator', label: 'CreatorVerse' }
  ];
  const hasLivePosts = posts.length > 0;
  const visibleStories = stories.length ? stories : showcaseStories;
  const visibleRecommendations = recommendations.length ? recommendations : showcaseRecommendations;
  const visibleFollowing = connections.following || [];
  const activeStoryIndex = activeStory ? visibleStories.findIndex((story) => story.id === activeStory.id) : -1;
  const storyMentionOptions = useMemo(() => uniqueByKey([
    ...visibleRecommendations.map((item) => ({
      name: item.authorName,
      handle: cleanMention(handleFrom(item.authorName)),
      type: item.accountType
    })),
    ...(hasLivePosts ? posts : showcasePosts).map((post) => ({
      name: post.authorName,
      handle: cleanMention(handleFrom(post.authorName)),
      type: post.accountType
    }))
  ], (item) => item.handle), [hasLivePosts, posts, visibleRecommendations]);
  const storyCompanyOptions = useMemo(() => uniqueByKey([
    ...visibleRecommendations
      .filter((item) => item.accountType === 'business')
      .map((item) => ({ name: cleanCompanyTag(item.authorName) })),
    ...(hasLivePosts ? posts : showcasePosts)
      .filter((post) => post.accountType === 'business')
      .map((post) => ({ name: cleanCompanyTag(post.authorName) }))
  ], (item) => item.name.toLowerCase()), [hasLivePosts, posts, visibleRecommendations]);

  useEffect(() => {
    const loadFeed = async () => {
      if (!token) return;

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
        apiRequest('/api/posts/stories', { token })
          .then((storyData) => setStories(storyData.stories || []))
          .catch(() => setStories([]));
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

  useEffect(() => () => {
    if (storyDraft?.previewUrl) URL.revokeObjectURL(storyDraft.previewUrl);
  }, [storyDraft?.previewUrl]);

  useEffect(() => {
    if (!storyDraft && !activeStory) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [activeStory, storyDraft]);

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

  const closeGate = () => {
    setGateOpen(false);
    navigate('/pricing');
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
      setConnectionNotice(error.message || 'Could not update connection status.');
    }
  };

  const handleStoryFileSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      window.alert('Please choose an image or video story.');
      return;
    }

    if (storyDraft?.previewUrl) URL.revokeObjectURL(storyDraft.previewUrl);
    setStoryError('');
    setStoryDraft((current) => ({
      ...(current || {}),
      file,
      previewUrl: URL.createObjectURL(file),
      mediaType: file.type.startsWith('video/') ? 'video' : 'image',
      caption: current?.caption || '',
      sticker: current?.sticker || '',
      mention: current?.mention || '',
      companyTag: current?.companyTag || ''
    }));
  };

  const closeStoryEditor = () => {
    if (storyDraft?.previewUrl) URL.revokeObjectURL(storyDraft.previewUrl);
    setStoryError('');
    setStoryDraft(null);
  };

  const shareStoryDraft = async () => {
    if (!storyDraft?.file) {
      setStoryError('Choose a photo or video before sharing your story.');
      return;
    }
    if (!token) return;

    setStoryError('');
    setStoryUploading(true);
    try {
      const formData = new FormData();
      formData.append('accountType', member?.account_type === 'creator' ? 'creator' : 'business');
      formData.append('caption', storyDraft.caption.trim());
      formData.append('metadata', JSON.stringify({
        sticker: storyDraft.sticker || '',
        mention: cleanMention(storyDraft.mention || ''),
        companyTag: cleanCompanyTag(storyDraft.companyTag || '')
      }));
      formData.append('file', storyDraft.file);

      const response = await fetch(`${API_URL}/api/posts/stories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Story upload failed.');

      const storyData = await apiRequest('/api/posts/stories', { token });
      setStories(storyData.stories || []);
      closeStoryEditor();
    } catch (uploadError) {
      setStoryError(uploadError.message || 'Story upload failed. Please try again.');
    } finally {
      setStoryUploading(false);
    }
  };

  const markStoryViewed = async (story) => {
    if (!story?.id || story.id.startsWith('story-')) return;

    setStories((current) => current.map((item) => (
      item.id === story.id ? { ...item, viewed: true } : item
    )));

    try {
      await apiRequest(`/api/posts/stories/${story.id}/view`, { method: 'POST', token });
    } catch {
      // Viewing a story should never interrupt feed browsing.
    }
  };

  const openStory = async (story) => {
    setActiveStory(story);
    markStoryViewed(story);
  };

  const navigateStory = (nextIndex) => {
    const nextStory = visibleStories[nextIndex];
    if (!nextStory) return;

    setActiveStory(nextStory);
    markStoryViewed(nextStory);
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] pt-24 pb-16">
      {gateOpen && <GateModal onClose={closeGate} />}
      <StoryViewer
        story={activeStory}
        storyCount={visibleStories.length}
        currentIndex={activeStoryIndex >= 0 ? activeStoryIndex : 0}
        onClose={() => setActiveStory(null)}
        onNavigate={navigateStory}
      />
      <StoryEditor
        draft={storyDraft}
        uploading={storyUploading}
        error={storyError}
        mentionOptions={storyMentionOptions}
        companyOptions={storyCompanyOptions}
        onPickMedia={() => storyInputRef.current?.click()}
        onDraftChange={(changes) => {
          setStoryError('');
          setStoryDraft((current) => current ? { ...current, ...changes } : current);
        }}
        onClose={closeStoryEditor}
        onShare={shareStoryDraft}
      />
      <div className="mx-auto max-w-[82rem] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-slate-200/70 bg-[#f4f6fb] py-5">
          <div className="mx-auto max-w-[82rem]">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-blue-600" />
              <span className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-600">VerseFeed</span>
            </div>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-4xl">
              What's happening in the Verse
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Businesses and creators posting their best work, one post every 24 hours.
            </p>
          </div>
        </div>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="min-w-0 space-y-5">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-1 overflow-x-auto py-2">
                {member && (
                  <button type="button" onClick={() => {
                    setStoryError('');
                    setStoryDraft({ file: null, previewUrl: '', mediaType: 'image', caption: '', sticker: '', mention: '', companyTag: '' });
                  }} className="flex shrink-0 flex-col items-center gap-1.5 px-3">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-blue-300 bg-blue-50 text-blue-600 transition hover:bg-blue-100">
                      {storyUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="text-xl font-black">+</span>}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">Your Story</span>
                  </button>
                )}
                <input ref={storyInputRef} type="file" accept="image/*,video/*" className="sr-only" onChange={handleStoryFileSelect} />

                {visibleStories.map((story) => (
                  <button key={story.id} type="button" onClick={() => openStory(story)} className="flex shrink-0 cursor-pointer flex-col items-center gap-1.5 px-3">
                    <div className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-full text-sm font-black text-white transition-transform hover:scale-105 ${
                      story.viewed ? 'ring-2 ring-slate-200 ring-offset-2' : story.type === 'creator' ? 'ring-2 ring-blue-500 ring-offset-2' : 'ring-2 ring-orange-500 ring-offset-2'
                    }`}>
                      <img src={story.image} alt={story.name} className="h-full w-full object-cover" />
                    </div>
                    <span className="w-16 truncate text-center text-[10px] font-bold text-slate-500">{story.name}</span>
                    {story.expiresAt && <span className="text-[9px] font-black text-slate-400">{storyTimeLeft(story.expiresAt)}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
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
              <div className="relative flex-1 sm:max-w-xs">
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

            {!hasLivePosts && !loading && !error && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
                Showcase posts are visible until members publish live posts.
              </div>
            )}

            {loading ? (
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-8 text-sm font-bold text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading VerseFeed...
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-rose-100 bg-rose-50 p-8 text-sm font-semibold text-rose-600">{error}</div>
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

          <aside className="hidden lg:block">
            <div className="fixed right-8 top-28 w-[330px] space-y-4 xl:w-[350px] 2xl:right-[calc((100vw-82rem)/2+2rem)]">
            <div className="rounded-[1.5rem] border border-blue-100 bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-[0_8px_24px_rgba(37,99,235,0.25)]">
              <div className="text-[10px] font-black uppercase tracking-widest text-blue-200">Daily Rule</div>
              <h3 className="mt-2 text-lg font-black leading-snug">1 post every 24 hours</h3>
              <p className="mt-2 text-xs font-semibold leading-6 text-blue-100">
                No spam. No feed domination. Every business and creator gets equal visibility.
              </p>
            </div>

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
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-2xl font-black text-slate-950">{connections.stats?.following || 0}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Following</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-2xl font-black text-slate-950">{connections.stats?.followers || 0}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Followers</div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {visibleFollowing.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-xs font-black text-white ${item.accountType === 'creator' ? 'bg-blue-600' : 'bg-orange-500'}`}>
                      {item.avatarUrl ? <img src={item.avatarUrl} alt={item.name} className="h-full w-full object-cover" /> : initialsFrom(item.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-black text-slate-900">{item.name}</div>
                      <div className="truncate text-[10px] font-semibold text-slate-400">{item.category || item.city || 'Connected member'}</div>
                    </div>
                  </div>
                ))}
                {!visibleFollowing.length && (
                  <p className="rounded-2xl bg-slate-50 px-3 py-3 text-xs font-semibold leading-5 text-slate-500">
                    Start connecting with creators and businesses to build your network.
                  </p>
                )}
                {connectionNotice && (
                  <p className="rounded-2xl border border-amber-100 bg-amber-50 px-3 py-3 text-xs font-bold leading-5 text-amber-700">
                    {connectionNotice}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
                <Users size={13} />
                People You May Know
              </div>
              <div className="mt-4 space-y-4">
                {visibleRecommendations.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-sm font-black text-white ${item.accountType === 'creator' ? 'bg-blue-600' : 'bg-orange-500'}`}>
                        {item.authorAvatarUrl ? <img src={item.authorAvatarUrl} alt={item.authorName} className="h-full w-full object-cover" /> : initialsFrom(item.authorName)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black leading-tight text-slate-950">{item.authorName}</div>
                        <div className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">{item.reason}</div>
                        <div className="mt-1"><VerseBadge type={item.accountType} /></div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFollow(item.authorId, !(item.isFollowing || item.viewer?.followingAuthor))}
                      disabled={!item.authorId || item.viewer?.ownPost}
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                        item.isFollowing || item.viewer?.followingAuthor
                          ? 'border-slate-200 bg-slate-100 text-slate-500'
                          : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {item.isFollowing || item.viewer?.followingAuthor ? <UserCheck size={12} /> : <UserPlus size={12} />}
                      {item.isFollowing || item.viewer?.followingAuthor ? 'Connected' : 'Connect'}
                    </button>
                  </div>
                ))}
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
