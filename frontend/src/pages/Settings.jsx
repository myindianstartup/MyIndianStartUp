import React, { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  Bell,
  Camera,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  Loader2,
  LockKeyhole,
  MonitorSmartphone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Video,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/apiClient';
import WorkspaceSidebar from '@/components/dashboard/WorkspaceSidebar';

const settingTabs = [
  {
    id: 'account',
    label: 'Account',
    icon: UserRound,
    title: 'Account identity',
    description: 'Manage the core information connected to your MyIndianStartup account.',
    rows: [
      ['Account type', 'Locked after registration to keep BusinessVerse and CreatorVerse data clean.'],
      ['Login email', 'Used for secure sign in, notifications, and account recovery.'],
      ['Profile source', 'Your public details are managed from ProfileVerse.']
    ]
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    title: 'Notification preferences',
    description: 'Choose how the platform should inform you about messages, profile views, and post activity.',
    rows: [
      ['Message alerts', 'Notify when a business or creator sends a direct message.'],
      ['Daily post reminder', 'Remind before the 24-hour posting slot resets.'],
      ['Discovery updates', 'Summarize profile views and search activity.']
    ]
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: ShieldCheck,
    title: 'Visibility and privacy',
    description: 'Control what people see before they contact you for collaboration.',
    rows: [
      ['Public profile', 'Show your verified BusinessVerse or CreatorVerse profile in discovery.'],
      ['Contact visibility', 'Display contact details only to logged-in members.'],
      ['Direct requests', 'Allow members to start a collaboration conversation.']
    ]
  },
  {
    id: 'membership',
    label: 'Membership',
    icon: CreditCard,
    title: 'Membership and billing',
    description: 'Review annual access and subscription status for the platform.',
    rows: [
      ['Annual plan', 'Rs 999/year for one membership path.'],
      ['Commission', 'No commission, no lead charges, and no success fees.'],
      ['Payment owner', 'Membership payments are processed under 8TechBurp.']
    ]
  },
  {
    id: 'security',
    label: 'Security',
    icon: LockKeyhole,
    title: 'Security controls',
    description: 'Keep account access clean and safe across devices.',
    rows: [
      ['Password access', 'Use Supabase authentication for secure email/password login.'],
      ['Google sign in', 'Google login connects to the same locked account type.'],
      ['Session control', 'Logout clears local account mode and session state.']
    ]
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: Archive,
    title: 'Story archive',
    description: 'Review your uploaded stories after their 24-hour public window ends.',
    rows: []
  },
  {
    id: 'help',
    label: 'Help',
    icon: HelpCircle,
    title: 'Help and support',
    description: 'Get help for profile setup, posting rules, payments, and collaboration issues.',
    rows: [
      ['Profile setup', 'Use ProfileVerse to complete business or creator details.'],
      ['Posting rule', 'One image or one video every 24 hours.'],
      ['Support contact', 'Use the Contact page for technical or membership help.']
    ]
  }
];

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

const Settings = () => {
  const { member, user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [archiveStories, setArchiveStories] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveError, setArchiveError] = useState('');
  const [archiveQuery, setArchiveQuery] = useState('');
  const [archiveStatus, setArchiveStatus] = useState('all');
  const [archiveMedia, setArchiveMedia] = useState('all');
  const [selectedStory, setSelectedStory] = useState(null);
  const activeSetting = settingTabs.find((tab) => tab.id === activeTab) || settingTabs[0];

  useEffect(() => {
    if (activeTab !== 'archive' || !token) return;

    const loadArchive = async () => {
      setArchiveLoading(true);
      setArchiveError('');
      try {
        const data = await apiRequest('/api/posts/stories/archive', { token });
        setArchiveStories(data.stories || []);
      } catch (error) {
        setArchiveError(error.message || 'Could not load story archive.');
      } finally {
        setArchiveLoading(false);
      }
    };

    loadArchive();
  }, [activeTab, token]);

  const filteredArchiveStories = useMemo(() => {
    const query = archiveQuery.trim().toLowerCase();
    return archiveStories.filter((story) => {
      const statusMatch = archiveStatus === 'all'
        || (archiveStatus === 'active' ? story.active : !story.active);
      const mediaMatch = archiveMedia === 'all' || story.mediaType === archiveMedia;
      const queryMatch = !query || [
        story.caption,
        story.mediaType,
        story.status,
        story.createdAt
      ].some((value) => String(value || '').toLowerCase().includes(query));
      return statusMatch && mediaMatch && queryMatch;
    });
  }, [archiveMedia, archiveQuery, archiveStatus, archiveStories]);

  return (
    <main className="min-h-screen bg-[#f8fbff] pt-28 text-slate-950">
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm">
          <div className="relative grid max-h-[86vh] w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)] lg:grid-cols-[minmax(0,1fr)_320px]">
            <button
              type="button"
              onClick={() => setSelectedStory(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
              aria-label="Close story preview"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="grid min-h-[420px] place-items-center bg-slate-950">
              {selectedStory.mediaType === 'video' ? (
                <video src={selectedStory.mediaUrl} controls className="max-h-[86vh] w-full object-contain" />
              ) : (
                <img src={selectedStory.mediaUrl || selectedStory.image} alt="Archived story" className="max-h-[86vh] w-full object-contain" />
              )}
            </div>
            <div className="overflow-y-auto p-6">
              <div className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-600">Archived story</div>
              <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-slate-950">{selectedStory.caption || 'Story upload'}</h3>
              <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</div>
                  <div className="mt-1 font-black text-slate-900">{selectedStory.active ? storyTimeLeft(selectedStory.expiresAt) : 'Expired'}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Uploaded</div>
                  <div className="mt-1 font-black text-slate-900">{timeAgo(selectedStory.createdAt)}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</div>
                  <div className="mt-1 font-black capitalize text-slate-900">{selectedStory.mediaType}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <section className="mx-auto max-w-7xl px-5 pb-12 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
          <div>
            <WorkspaceSidebar />
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div className="px-2 py-3">
                <div className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Control center</div>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">Settings</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Manage account access, visibility, notifications, billing, and help.
                </p>
              </div>

              <div className="mt-3 grid gap-2">
                {settingTabs.map(({ id, label, icon: Icon }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left transition-all ${
                        active
                          ? 'bg-slate-700 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-3 text-sm font-black">
                        <Icon className="h-4 w-4" />
                        {label}
                      </span>
                      {active && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-600">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {activeSetting.label}
                  </div>
                  <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-slate-800">{activeSetting.title}</h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{activeSetting.description}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Signed in as</div>
                  <div className="mt-1 max-w-[240px] truncate text-sm font-black text-slate-800">{user?.email || member?.email || 'Member'}</div>
                </div>
              </div>

              {activeTab === 'archive' ? (
                <div className="mt-8">
                  <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={archiveQuery}
                        onChange={(event) => setArchiveQuery(event.target.value)}
                        placeholder="Search story caption, status, or type..."
                        className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <select
                      value={archiveStatus}
                      onChange={(event) => setArchiveStatus(event.target.value)}
                      className="rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-black text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="all">All status</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                    </select>
                    <select
                      value={archiveMedia}
                      onChange={(event) => setArchiveMedia(event.target.value)}
                      className="rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-black text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="all">All media</option>
                      <option value="image">Images</option>
                      <option value="video">Videos</option>
                    </select>
                  </div>

                  <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm font-black text-slate-800">{filteredArchiveStories.length} archived item{filteredArchiveStories.length === 1 ? '' : 's'}</div>
                      <div className="text-xs font-bold text-slate-500">Stories disappear publicly after 24 hours but stay here for your account.</div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {archiveLoading ? (
                      <div className="col-span-full flex items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading archive...
                      </div>
                    ) : archiveError ? (
                      <div className="col-span-full rounded-[1.5rem] border border-rose-100 bg-rose-50 p-6 text-sm font-bold text-rose-600">{archiveError}</div>
                    ) : filteredArchiveStories.length ? filteredArchiveStories.map((story) => (
                      <button
                        key={`${story.source || 'story'}-${story.id}`}
                        type="button"
                        onClick={() => setSelectedStory(story)}
                        className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <div className="relative h-44 bg-slate-100">
                          {story.mediaType === 'video' ? (
                            <>
                              <video src={story.mediaUrl} className="h-full w-full object-cover" muted />
                              <div className="absolute inset-0 grid place-items-center bg-black/20">
                                <Video className="h-8 w-8 text-white" />
                              </div>
                            </>
                          ) : (
                            <img src={story.mediaUrl || story.image} alt="Story archive" className="h-full w-full object-cover" />
                          )}
                          <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                            story.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-950/70 text-white'
                          }`}>
                            {story.active ? 'Active' : 'Expired'}
                          </span>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {story.mediaType === 'video' ? <Video className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
                            {story.mediaType}
                          </div>
                          <div className="mt-2 line-clamp-2 text-sm font-black text-slate-900">{story.caption || 'Story upload'}</div>
                          <div className="mt-2 text-xs font-bold text-slate-500">
                            {story.active ? storyTimeLeft(story.expiresAt) : `Expired ${timeAgo(story.expiresAt || story.createdAt)}`}
                          </div>
                        </div>
                      </button>
                    )) : (
                      <div className="col-span-full rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-10 text-center">
                        <Archive className="mx-auto h-8 w-8 text-slate-300" />
                        <div className="mt-3 text-sm font-black text-slate-700">No story archive found</div>
                        <p className="mt-1 text-xs font-semibold text-slate-400">Upload stories from VerseFeed and they will appear here.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-8 grid gap-4">
                  {activeSetting.rows.map(([title, copy]) => (
                  <div key={title} className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-black tracking-[-0.03em] text-slate-800">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 ring-1 ring-slate-200">
                        Active
                      </span>
                    </div>
                  </div>
                  ))}
                </div>
              )}

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                  [MonitorSmartphone, 'Device ready', 'Desktop and mobile UI prepared.'],
                  [ShieldCheck, 'Protected access', 'Login required for dashboard pages.'],
                  [CreditCard, 'Membership', 'Annual access tracked in account data.']
                ].map(([Icon, title, copy]) => (
                  <div key={title} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-black text-slate-800">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-700 p-5 text-white">
                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">Production note</div>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/80">
                  These controls are designed as the final settings layout. Backend persistence can be connected section-by-section as notification, privacy, billing, and security rules become active.
                </p>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Settings;
