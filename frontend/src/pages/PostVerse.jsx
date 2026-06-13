import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Camera,
  Check,
  Clock3,
  Image,
  TrendingUp,
  Upload,
  Video,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import WorkspaceSidebar from '@/components/dashboard/WorkspaceSidebar';

const whyPostVerse = [
  'Equal Visibility',
  'No Algorithm Manipulation',
  'No Paid Promotion Required',
  'Fair Exposure For Every Member',
  'Business & Creator Discovery'
];

const dailyRules = [
  'Maximum 1 Post Every 24 Hours',
  'Image OR Video',
  'No Multiple Posts',
  'No Feed Domination',
  'Equal Opportunity For All Members'
];

const feedItems = [
  {
    author: 'Aurora Foods Pvt Ltd',
    type: 'BusinessVerse',
    city: 'Ahmedabad',
    title: 'New retail-ready packaging launch',
    copy: 'Showcasing our latest product range for distributors and creators across India.',
    tone: 'business'
  },
  {
    author: 'Riya Sharma',
    type: 'CreatorVerse',
    city: 'Mumbai',
    title: 'Product photography portfolio update',
    copy: 'Available for D2C product shoots, reels content, and brand storytelling projects.',
    tone: 'creator'
  },
  {
    author: 'Northstar Digital',
    type: 'BusinessVerse',
    city: 'Bengaluru',
    title: 'Looking for creators for SaaS campaign',
    copy: 'Open collaboration brief for explainer videos and launch content this month.',
    tone: 'business'
  }
];

const accountThemes = {
  business: {
    name: 'Business',
    title: 'Business Dashboard',
    verse: 'BusinessVerse',
    audience: 'Business visibility workspace',
    accentText: 'text-orange-500',
    accentTextStrong: 'text-orange-600',
    accentBg: 'bg-orange-500',
    accentBgHover: 'hover:bg-orange-600',
    accentSoft: 'bg-orange-50',
    accentBorder: 'border-orange-100',
    accentRing: 'focus:border-orange-500 focus:ring-orange-100',
    shadow: 'shadow-[0_14px_32px_rgba(249,115,22,0.26)]',
    analytics: [
      ['42', 'Profile views'],
      ['18', 'Creator searches'],
      ['9', 'Direct inquiries'],
      ['76%', 'Visibility score']
    ],
    history: [
      ['Product launch update', 'Image post', '248 views', '18 inquiries'],
      ['Hiring freelance designer', 'Video post', '192 views', '11 replies'],
      ['New service package', 'Image post', '164 views', '7 saves']
    ]
  },
  creator: {
    name: 'Creator',
    title: 'Creator Dashboard',
    verse: 'CreatorVerse',
    audience: 'Creator discovery workspace',
    accentText: 'text-blue-600',
    accentTextStrong: 'text-blue-700',
    accentBg: 'bg-blue-600',
    accentBgHover: 'hover:bg-blue-700',
    accentSoft: 'bg-blue-50',
    accentBorder: 'border-blue-100',
    accentRing: 'focus:border-blue-600 focus:ring-blue-100',
    shadow: 'shadow-[0_14px_32px_rgba(37,99,235,0.26)]',
    analytics: [
      ['58', 'Profile views'],
      ['24', 'Business searches'],
      ['13', 'Collab requests'],
      ['82%', 'Discovery score']
    ],
    history: [
      ['Portfolio reel update', 'Video post', '312 views', '21 inquiries'],
      ['Product shoot samples', 'Image post', '244 views', '15 saves'],
      ['Brand collaboration pitch', 'Image post', '198 views', '9 replies']
    ]
  }
};

const ecosystem = [
  ['BusinessVerse', 'Business Profiles'],
  ['CreatorVerse', 'Creator Profiles'],
  ['PostVerse', 'Daily Visibility Feed'],
  ['SearchVerse', 'Discovery Engine']
];

const PostVerse = () => {
  const { member } = useAuth();
  const [accountType, setAccountType] = useState('business');

  useEffect(() => {
    if (member?.account_type === 'creator' || member?.account_type === 'business') {
      setAccountType(member.account_type);
      return;
    }

    if (typeof window !== 'undefined') {
      const storedType = window.localStorage.getItem('myindianstartup_account_type');
      setAccountType(storedType === 'creator' ? 'creator' : 'business');
    }
  }, [member?.account_type]);

  const theme = accountThemes[accountType];

  return (
    <div className="bg-[#f8fbff] text-slate-950">
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.05),transparent_34%),radial-gradient(circle_at_top_right,rgba(148,163,184,0.12),transparent_30%)] pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <div>
              <WorkspaceSidebar />
            </div>

            <div className="grid gap-8">
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className={`text-[11px] font-black uppercase tracking-[0.3em] ${theme.accentText}`}>Analytics first</div>
                    <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-800">Your visibility progress.</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      Track profile reach, discovery, direct inquiries, and the daily posting cycle from one simple view.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    <TrendingUp className="h-4 w-4" />
                    Last 30 days
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {theme.analytics.map(([value, label]) => (
                    <div key={label} className="rounded-[1.4rem] border border-slate-200 bg-[#f8fafc] p-5">
                      <BarChart3 className={`h-5 w-5 ${theme.accentText}`} />
                      <div className="mt-4 text-3xl font-black tracking-tight text-slate-800">{value}</div>
                      <div className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  {[
                    ['Daily post slot', 'Ready today', 82],
                    ['Profile completion', `${accountType === 'business' ? 'Business' : 'Creator'} ready`, 76],
                    ['Response health', 'Growing steadily', 64]
                  ].map(([title, label, progress]) => (
                    <div key={title} className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-black text-slate-800">{title}</div>
                          <div className="mt-1 text-xs font-semibold text-slate-500">{label}</div>
                        </div>
                        <div className="text-lg font-black text-slate-700">{progress}%</div>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${theme.accentBg}`} style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-700">
                    <Zap className="h-3.5 w-3.5" />
                    {theme.title}
                  </div>
                  <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.98] tracking-[-0.05em] text-slate-950 sm:text-5xl md:text-6xl">
                    The Daily Visibility Network.
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                    PostVerse is the central feed of MyIndianStartup where every member receives an equal opportunity to showcase their work.
                  </p>
                  <div className={`mt-7 inline-flex rounded-full px-5 py-3 text-sm font-black text-white ${theme.accentBg} ${theme.shadow}`}>
                    Post Once. Get Discovered Daily.
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                  <div className={`text-[11px] font-black uppercase tracking-[0.3em] ${theme.accentText}`}>Create Today&apos;s Post</div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm font-black text-slate-700 transition-transform hover:-translate-y-1">
                      <Image className="h-5 w-5" />
                      <span>Upload Image</span>
                    </button>
                    <button className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm font-black text-slate-700 transition-transform hover:-translate-y-1">
                      <Video className="h-5 w-5" />
                      <span>Upload Video</span>
                    </button>
                  </div>
                  <label className="mt-5 grid gap-2">
                    <span className="text-sm font-bold text-slate-800">Caption</span>
                    <textarea
                      rows={4}
                      placeholder="Share what you are building, selling, creating, or looking for today..."
                      className={`resize-none rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 ${theme.accentRing}`}
                    />
                  </label>
                  <button className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-black text-white ${theme.accentBg} ${theme.shadow} transition-all hover:-translate-y-0.5 ${theme.accentBgHover}`}>
                    <Upload className="h-4 w-4" />
                    <span>Publish Post</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {[
                  ['1', 'Image OR Video'],
                  ['24h', 'Posting Cycle'],
                  ['Equal', 'Visibility Rule']
                ].map(([value, label]) => (
                  <div key={label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-center shadow-sm">
                    <div className="text-3xl font-black tracking-tight text-slate-950">{value}</div>
                    <div className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{label}</div>
                  </div>
                ))}
              </div>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className={`text-[11px] font-black uppercase tracking-[0.3em] ${theme.accentText}`}>Past data</div>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">Previous posts and response history.</h2>
                <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
                  <div className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span>Post</span>
                    <span>Type</span>
                    <span>Views</span>
                    <span>Response</span>
                  </div>
                  {theme.history.map(([title, type, views, response]) => (
                    <div key={title} className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr] gap-3 border-t border-slate-100 px-4 py-4 text-sm font-semibold text-slate-700">
                      <span className="font-black text-slate-950">{title}</span>
                      <span>{type}</span>
                      <span>{views}</span>
                      <span>{response}</span>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PostVerse;

