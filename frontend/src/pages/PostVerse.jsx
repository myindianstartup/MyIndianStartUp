import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Image,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Upload,
  Video,
  Zap
} from 'lucide-react';
import { API_URL, apiRequest } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import WorkspaceSidebar from '@/components/dashboard/WorkspaceSidebar';

const accountThemes = {
  business: {
    title: 'Business Dashboard',
    accentText: 'text-orange-600',
    accentBg: 'bg-orange-500',
    accentBgHover: 'hover:bg-orange-600',
    accentRing: 'focus:border-orange-500 focus:ring-orange-100',
    shadow: 'shadow-[0_14px_32px_rgba(249,115,22,0.22)]'
  },
  creator: {
    title: 'Creator Dashboard',
    accentText: 'text-blue-600',
    accentBg: 'bg-blue-600',
    accentBgHover: 'hover:bg-blue-700',
    accentRing: 'focus:border-blue-600 focus:ring-blue-100',
    shadow: 'shadow-[0_14px_32px_rgba(37,99,235,0.22)]'
  }
};

const formatRemaining = (seconds = 0) => {
  if (!seconds || seconds <= 0) return 'Ready now';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
};

const shortDate = (value) => {
  if (!value) return 'Not published';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
};

const GateModal = ({ gate, onClose }) => {
  if (!gate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h3 className="mt-5 text-2xl font-black tracking-[-0.03em] text-slate-900">{gate.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{gate.message}</p>
        {gate.detail && <p className="mt-2 text-xs font-bold text-slate-400">{gate.detail}</p>}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-800 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-900"
        >
          {gate.actionLabel || 'Continue'}
        </button>
      </div>
    </div>
  );
};

const PostVerse = () => {
  const { member, token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const accountType = member?.account_type === 'creator' ? 'creator' : 'business';
  const theme = accountThemes[accountType];

  const [overview, setOverview] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedType, setSelectedType] = useState('image');
  const [filePreview, setFilePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [gate, setGate] = useState(null);

  const canPost = Boolean(eligibility?.allowed);

  const analytics = useMemo(() => {
    const data = overview?.analytics || {};
    return [
      [data.postsPublished ?? 0, 'Posts published'],
      [data.totalViews ?? 0, 'Views'],
      [data.totalInquiries ?? 0, 'Inquiries'],
      [`${data.profileCompletion ?? eligibility?.profile?.completion ?? 0}%`, 'Profile strength']
    ];
  }, [eligibility?.profile?.completion, overview?.analytics]);

  const loadOverview = async () => {
    if (!token) return;

    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/api/posts/overview', { token });
      setOverview(data);
      setEligibility(data.eligibility);
      setCooldownSeconds(data.eligibility?.cooldown?.secondsRemaining || 0);
    } catch (requestError) {
      setError(requestError.message || 'Could not load PostVerse data.');
    } finally {
      setLoading(false);
    }
  };

  const refreshEligibility = async () => {
    const data = await apiRequest('/api/posts/eligibility', { token });
    setEligibility(data.eligibility);
    setCooldownSeconds(data.eligibility?.cooldown?.secondsRemaining || 0);
    return data.eligibility;
  };

  useEffect(() => {
    loadOverview();
  }, [token]);

  useEffect(() => {
    if (!cooldownSeconds) return undefined;
    const interval = window.setInterval(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [cooldownSeconds > 0]);

  useEffect(() => () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
  }, [filePreview]);

  const closeGate = () => {
    const redirectTo = gate?.redirectTo;
    setGate(null);
    if (redirectTo) navigate(redirectTo);
  };

  const buildGateFromEligibility = (state) => {
    const reason = state?.reasons?.[0];
    if (!reason) return null;

    if (reason.code === 'SUBSCRIPTION_REQUIRED') {
      return {
        title: 'Membership required',
        message: 'Please purchase a plan to access this feature.',
        actionLabel: 'Go to Pricing',
        redirectTo: '/pricing'
      };
    }

    if (reason.code === 'PROFILE_INCOMPLETE') {
      return {
        title: 'Complete your profile first',
        message: `Your profile is ${state.profile.completion}% complete. Reach at least ${state.profile.required}% to publish in PostVerse.`,
        detail: state.profile.missingFields?.length ? `Missing: ${state.profile.missingFields.slice(0, 4).join(', ')}` : '',
        actionLabel: 'Open ProfileVerse',
        redirectTo: '/profile-verse'
      };
    }

    if (reason.code === 'POST_COOLDOWN_ACTIVE') {
      return {
        title: 'Daily post already used',
        message: 'You can publish only one image or video every 24 hours.',
        detail: `Next slot opens in ${formatRemaining(state.cooldown.secondsRemaining)}.`,
        actionLabel: 'Got it'
      };
    }

    return {
      title: 'PostVerse is locked',
      message: reason.message || 'Please complete your account requirements first.',
      actionLabel: 'Got it',
      redirectTo: reason.redirectTo
    };
  };

  const handleUploadClick = async (type) => {
    setSuccess('');
    setError('');
    setSelectedType(type);

    try {
      const state = await refreshEligibility();
      if (!state.allowed) {
        setGate(buildGateFromEligibility(state));
        return;
      }
      fileInputRef.current?.click();
    } catch (requestError) {
      setError(requestError.message || 'Could not verify posting access.');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const expectedPrefix = selectedType === 'video' ? 'video/' : 'image/';
    if (!file.type.startsWith(expectedPrefix)) {
      setError(selectedType === 'video' ? 'Please choose a video file.' : 'Please choose an image file.');
      return;
    }

    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
    setError('');
  };

  const handlePublish = async () => {
    setSuccess('');
    setError('');

    if (!selectedFile) {
      setError('Please upload an image or video before publishing.');
      return;
    }

    if (!caption.trim()) {
      setError('Please add a caption before publishing.');
      return;
    }

    setPublishing(true);
    try {
      const state = await refreshEligibility();
      if (!state.allowed) {
        setGate(buildGateFromEligibility(state));
        return;
      }

      const formData = new FormData();
      formData.append('accountType', accountType);
      formData.append('caption', caption.trim());
      formData.append('file', selectedFile);

      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const payload = await response.json();
      if (!response.ok) {
        if (payload?.code === 'SUBSCRIPTION_REQUIRED') {
          setGate({
            title: 'Membership required',
            message: 'Please purchase a plan to access this feature.',
            actionLabel: 'Go to Pricing',
            redirectTo: '/pricing'
          });
          return;
        }
        if (payload?.eligibility) {
          setGate(buildGateFromEligibility(payload.eligibility));
          return;
        }
        throw new Error(payload.error || 'Post publishing failed.');
      }

      setCaption('');
      setSelectedFile(null);
      if (filePreview) URL.revokeObjectURL(filePreview);
      setFilePreview('');
      setSuccess('Post published successfully. It is now visible in VerseFeed.');
      await loadOverview();
    } catch (requestError) {
      setError(requestError.message || 'Post publishing failed.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="bg-[#f8fbff] text-slate-950">
      <GateModal gate={gate} onClose={closeGate} />
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.05),transparent_34%),radial-gradient(circle_at_top_right,rgba(148,163,184,0.12),transparent_30%)] pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <WorkspaceSidebar cooldownSeconds={cooldownSeconds} canPost={canPost} />

            <div className="grid gap-8">
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className={`text-[11px] font-black uppercase tracking-[0.3em] ${theme.accentText}`}>Analytics first</div>
                    <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-slate-800">Your visibility progress.</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      Track profile readiness, daily posting access, and response history from one connected PostVerse workspace.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    <TrendingUp className="h-4 w-4" />
                    Live backend data
                  </div>
                </div>

                {loading ? (
                  <div className="mt-8 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading PostVerse data...
                  </div>
                ) : (
                  <>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {analytics.map(([value, label]) => (
                        <div key={label} className="rounded-[1.4rem] border border-slate-200 bg-[#f8fafc] p-5">
                          <BarChart3 className={`h-5 w-5 ${theme.accentText}`} />
                          <div className="mt-4 text-3xl font-black tracking-tight text-slate-800">{value}</div>
                          <div className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-3">
                      {[
                        ['Daily post slot', canPost ? 'Ready today' : formatRemaining(cooldownSeconds), canPost ? 100 : 35],
                        ['Profile completion', `${eligibility?.profile?.completion || 0}% complete`, eligibility?.profile?.completion || 0],
                        ['Membership', eligibility?.subscription?.active ? 'Active plan' : 'Plan required', eligibility?.subscription?.active ? 100 : 15]
                      ].map(([title, label, progress]) => (
                        <div key={title} className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-black text-slate-800">{title}</div>
                              <div className="mt-1 text-xs font-semibold text-slate-500">{label}</div>
                            </div>
                            <div className="text-lg font-black text-slate-700">{Math.min(progress, 100)}%</div>
                          </div>
                          <div className="mt-4 h-2 rounded-full bg-slate-100">
                            <div className={`h-full rounded-full ${theme.accentBg}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>

              <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-700">
                    <Zap className="h-3.5 w-3.5" />
                    {theme.title}
                  </div>
                  <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.035em] text-slate-950 sm:text-5xl">
                    The Daily Visibility Network.
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                    Publish one image or one video every 24 hours. PostVerse keeps visibility fair for businesses and creators.
                  </p>
                  <div className={`mt-7 inline-flex rounded-full px-5 py-3 text-sm font-black text-white ${theme.accentBg} ${theme.shadow}`}>
                    {canPost ? 'Post Once. Get Discovered Daily.' : `Next post in ${formatRemaining(cooldownSeconds)}`}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                  <div className={`text-[11px] font-black uppercase tracking-[0.3em] ${theme.accentText}`}>Create Today's Post</div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={selectedType === 'video' ? 'video/*' : 'image/*'}
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleUploadClick('image')}
                      className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm font-black text-slate-700 transition-transform hover:-translate-y-1"
                    >
                      <Image className="h-5 w-5" />
                      <span>Upload Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUploadClick('video')}
                      className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm font-black text-slate-700 transition-transform hover:-translate-y-1"
                    >
                      <Video className="h-5 w-5" />
                      <span>Upload Video</span>
                    </button>
                  </div>

                  {selectedFile && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-black text-slate-700">{selectedFile.name}</div>
                      <div className="mt-1 text-[11px] font-semibold text-slate-400">{Math.round(selectedFile.size / 1024)} KB selected</div>
                      {filePreview && selectedFile.type.startsWith('image/') && (
                        <img src={filePreview} alt="Selected post media" className="mt-3 max-h-52 w-full rounded-xl object-cover" />
                      )}
                    </div>
                  )}

                  <label className="mt-5 grid gap-2">
                    <span className="text-sm font-bold text-slate-800">Caption</span>
                    <textarea
                      rows={4}
                      value={caption}
                      onChange={(event) => setCaption(event.target.value)}
                      placeholder="Share what you are building, selling, creating, or looking for today..."
                      className={`resize-none rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 ${theme.accentRing}`}
                    />
                  </label>

                  {error && <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</div>}
                  {success && (
                    <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={publishing || !selectedFile || !caption.trim() || (!canPost && cooldownSeconds > 0)}
                    className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-black text-white ${theme.accentBg} ${theme.shadow} transition-all hover:-translate-y-0.5 ${theme.accentBgHover} disabled:cursor-not-allowed disabled:opacity-55`}
                  >
                    {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <span>{publishing ? 'Publishing...' : 'Publish Post'}</span>
                  </button>
                </div>
              </div>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className={`text-[11px] font-black uppercase tracking-[0.3em] ${theme.accentText}`}>Past data</div>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-slate-950">Previous posts and response history.</h2>
                <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
                  <div className="grid grid-cols-[1.2fr_0.7fr_0.6fr_0.6fr_0.7fr] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span>Caption</span>
                    <span>Type</span>
                    <span>Views</span>
                    <span>Inquiries</span>
                    <span>Date</span>
                  </div>
                  {(overview?.history || []).length ? overview.history.map((post) => (
                    <div key={post.id} className="grid grid-cols-[1.2fr_0.7fr_0.6fr_0.6fr_0.7fr] gap-3 border-t border-slate-100 px-4 py-4 text-sm font-semibold text-slate-700">
                      <span className="truncate font-black text-slate-950">{post.caption}</span>
                      <span className="capitalize">{post.mediaType}</span>
                      <span>{post.views}</span>
                      <span>{post.inquiries}</span>
                      <span>{shortDate(post.publishedAt)}</span>
                    </div>
                  )) : (
                    <div className="border-t border-slate-100 px-4 py-8 text-center text-sm font-semibold text-slate-500">
                      No published posts yet. Your first approved post will appear here.
                    </div>
                  )}
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-3">
                {[
                  ['1', 'Image OR Video'],
                  ['24h', 'Posting Cycle'],
                  ['85%', 'Profile Required']
                ].map(([value, label]) => (
                  <div key={label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-center shadow-sm">
                    <div className="text-3xl font-black tracking-tight text-slate-950">{value}</div>
                    <div className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{label}</div>
                  </div>
                ))}
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PostVerse;
