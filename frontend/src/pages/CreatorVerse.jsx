import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  Check,
  Code2,
  DollarSign,
  FileText,
  HeartHandshake,
  Image,
  Link as LinkIcon,
  Mail,
  MapPin,
  Megaphone,
  Palette,
  PenTool,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  UserRound,
  Users,
  Video,
  X,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/apiClient';

const joinFeatures = [
  'Creator Listing',
  'Professional Profile',
  'Portfolio Showcase',
  'Daily Visibility',
  'Business Discovery',
  'Direct Collaboration',
  'PAN India Reach',
  'No Commission',
  'No Hidden Charges'
];

const professionals = [
  { title: 'Influencer', icon: <Target className="h-5 w-5 text-blue-600" /> },
  { title: 'Reels Creator', icon: <Play className="h-5 w-5 text-orange-500" /> },
  { title: 'Photographer', icon: <Camera className="h-5 w-5 text-emerald-600" /> },
  { title: 'Videographer', icon: <Video className="h-5 w-5 text-red-500" /> },
  { title: 'Animator', icon: <Zap className="h-5 w-5 text-yellow-600" /> },
  { title: 'Graphic Designer', icon: <Palette className="h-5 w-5 text-pink-600" /> },
  { title: 'Web Developer', icon: <Code2 className="h-5 w-5 text-blue-600" /> },
  { title: 'App Developer', icon: <Code2 className="h-5 w-5 text-indigo-600" /> },
  { title: 'Digital Marketer', icon: <Megaphone className="h-5 w-5 text-orange-500" /> },
  { title: 'Content Writer', icon: <PenTool className="h-5 w-5 text-slate-700" /> },
  { title: 'Business Development Professional', icon: <BriefcaseBusiness className="h-5 w-5 text-emerald-600" /> },
  { title: 'HR Professional', icon: <Users className="h-5 w-5 text-violet-600" /> },
  { title: 'Finance Professional', icon: <DollarSign className="h-5 w-5 text-green-600" /> },
  { title: 'Freelancer', icon: <Sparkles className="h-5 w-5 text-blue-600" /> }
];

const profileIncludes = [
  'Profile Photo',
  'Full Name',
  'Skills',
  'About Me',
  'Portfolio Links',
  'Social Media Links',
  'City & State',
  'Public Inquiry',
  'Daily Posts'
];

const workflowSteps = [
  'Create Creator Profile',
  'Showcase Skills & Portfolio',
  'Publish Daily Updates',
  'Get Discovered By Businesses',
  'Collaborate Directly'
];

const comparisonRows = [
  ['Creator Listing', 'Limited', true],
  ['Daily Visibility', false, true],
  ['Business Discovery', 'Limited', true],
  ['Direct Collaboration', 'Limited', true],
  ['Commission', 'Often Applicable', '0%'],
  ['Hidden Charges', 'May Apply', 'None']
];

const pricingIncludes = [
  'Profile Listing',
  '365 Days Marketing',
  'Daily Posts',
  'Search Business',
  'Direct Collaboration',
  'PAN India Visibility',
  'No Commission'
];

const creatorShowcaseStats = [
  ['4.8/5', 'average creator rating'],
  ['12K+', 'monthly portfolio views'],
  ['55%', 'profile growth lift']
];

const safeText = (value, fallback = 'Not added yet') => {
  const text = typeof value === 'string' ? value.trim() : value;
  return text || fallback;
};

const safeDomain = (value) => {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return '';

  try {
    const parsed = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return raw.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
};

const compactLocation = (...parts) => parts.filter(Boolean).map((item) => String(item).trim()).filter(Boolean).join(', ');

const socialLinkCount = (links) => {
  if (!links || typeof links !== 'object') return 0;
  return Object.values(links).filter(Boolean).length;
};

const compactSkills = (skills) => {
  if (!Array.isArray(skills) || !skills.length) return 'Skills pending';
  return skills.slice(0, 3).join(', ');
};

function CreatorProfileCard({ creatorProfile, loadingProfile, isCreatorMember }) {
  const hasProfile = Boolean(creatorProfile?.full_name);
  const isOwnProfile = isCreatorMember && hasProfile;
  const creatorName = isOwnProfile ? safeText(creatorProfile.full_name, 'Your Creator Profile') : 'Top creator showcase';
  const skillsPending = isOwnProfile && (!Array.isArray(creatorProfile.skills) || creatorProfile.skills.length === 0);
  const locationPending = isOwnProfile && !compactLocation(creatorProfile.city, creatorProfile.state);
  const portfolioPending = isOwnProfile && !creatorProfile.portfolio_url?.trim();
  const skills = isOwnProfile ? compactSkills(creatorProfile.skills) : 'Photography, Reels, Design';
  const location = isOwnProfile ? compactLocation(creatorProfile.city, creatorProfile.state) || 'Location pending' : 'Mumbai, Ahmedabad, Bengaluru';
  const portfolio = isOwnProfile ? safeDomain(creatorProfile.portfolio_url) || 'Add portfolio' : 'verified portfolios';
  const socialCount = isOwnProfile ? socialLinkCount(creatorProfile.social_links) : 6;
  const socialPending = isOwnProfile && socialCount === 0;
  const aboutPending = isOwnProfile && !creatorProfile.about_me?.trim();
  const about = isOwnProfile
    ? safeText(creatorProfile.about_me, 'Add a short public bio so businesses understand your work.')
    : 'Visitors see high-rated creators, portfolio growth, public skills, and collaboration signals before joining CreatorVerse.';

  const profileTiles = isOwnProfile
    ? [
        { label: 'Skills', value: skills, pending: skillsPending },
        { label: 'Location', value: location, pending: locationPending },
        { label: 'Portfolio', value: portfolio, pending: portfolioPending },
        { label: 'Social links', value: socialCount ? `${socialCount} public link${socialCount > 1 ? 's' : ''}` : 'Add public links', pending: socialPending }
      ]
    : [
        { label: 'Top skills', value: skills },
        { label: 'Active cities', value: location },
        { label: 'Portfolio views', value: '+55% growth' },
        { label: 'Public trust', value: '4.8 rated creators' }
      ];

  return (
    <div className="creator-float relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
      <div className="rounded-[26px] bg-[linear-gradient(135deg,rgba(255,247,237,0.94),rgba(239,246,255,0.88))] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl bg-blue-600 text-white shadow-[0_14px_28px_rgba(37,99,235,0.25)]">
              {isOwnProfile && creatorProfile.profile_image_url ? (
                <img src={creatorProfile.profile_image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserRound className="h-8 w-8" />
              )}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-600">
                {isOwnProfile ? 'Your public creator profile' : 'Creator profile'}
              </div>
              <h3 className="mt-1 text-2xl font-black tracking-[-0.03em] text-slate-950">{loadingProfile ? 'Loading profile...' : creatorName}</h3>
              <p className="text-sm font-semibold text-slate-500">{skills}</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
            {isOwnProfile ? 'Public' : 'Verified'}
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {profileTiles.map((field) => (
            <div
              key={field.label}
              className={`rounded-2xl px-4 py-3 shadow-sm ${
                field.pending
                  ? 'border border-dashed border-blue-200 bg-blue-50/80'
                  : 'border border-white bg-white/85'
              }`}
            >
              <div className={`text-[10px] font-black uppercase tracking-[0.18em] ${field.pending ? 'text-blue-600' : 'text-slate-400'}`}>
                {field.label}
              </div>
              <div className={`mt-1 truncate text-sm font-bold ${field.pending ? 'text-blue-700' : 'text-slate-700'}`}>{field.value}</div>
            </div>
          ))}
        </div>

        <p className={`mt-5 line-clamp-2 rounded-2xl px-3 py-2 text-sm font-semibold leading-6 ${
          aboutPending ? 'border border-dashed border-blue-200 bg-blue-50/80 text-blue-700' : 'text-slate-600'
        }`}>
          {about}
        </p>

        {!isOwnProfile && (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {creatorShowcaseStats.map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-white/70 p-3">
                <div className="text-lg font-black text-slate-950">{value}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const CreatorVerse = () => {
  const navigate = useNavigate();
  const { member, token, isAuthenticated } = useAuth();
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const isCreatorMember = member?.account_type === 'creator';

  useEffect(() => {
    let cancelled = false;

    const loadCreatorProfile = async () => {
      if (!token || !isCreatorMember) {
        setCreatorProfile(null);
        return;
      }

      setLoadingProfile(true);
      try {
        const data = await apiRequest('/api/profiles/me', { token });
        if (!cancelled) setCreatorProfile(data?.creatorProfile || null);
      } catch {
        if (!cancelled) setCreatorProfile(null);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };

    loadCreatorProfile();
    return () => {
      cancelled = true;
    };
  }, [token, isCreatorMember]);

  const heroCta = useMemo(() => {
    if (isAuthenticated && isCreatorMember) {
      return creatorProfile?.full_name ? 'Update CreatorVerse Profile' : 'Complete CreatorVerse Profile';
    }
    return 'Create CreatorVerse Profile';
  }, [creatorProfile?.full_name, isAuthenticated, isCreatorMember]);

  const handleHeroCta = () => {
    navigate(isAuthenticated && isCreatorMember ? '/profile-verse' : '/signup');
  };

  return (
    <div className="bg-white text-slate-950">
      <style>{`
        .creator-float {
          animation: creatorFloat 5.2s ease-in-out infinite;
        }

        .creator-card-hover {
          transition: transform 0.26s ease, box-shadow 0.26s ease, border-color 0.26s ease;
        }

        .creator-card-hover:hover {
          transform: translateY(-6px);
          border-color: rgba(37, 99, 235, 0.24);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
        }

        @keyframes creatorFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .creator-float {
            animation: none;
          }
        }
      `}</style>

      <section className="relative overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-x-0 top-0 h-[680px] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.09),transparent_34%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.045),transparent_30%)] pointer-events-none" />
        <div className="absolute left-[-7rem] top-24 h-72 w-72 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute right-[-6rem] top-28 h-72 w-72 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <h1 className="max-w-2xl text-4xl font-black leading-[0.98] tracking-[-0.05em] text-slate-950 sm:text-5xl md:text-6xl">
                Get discovered by businesses across India.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
                Build your creator profile, showcase your skills, publish daily updates, and connect directly with businesses looking for your expertise.
              </p>

              <div className="mt-8">
                <button
                  onClick={handleHeroCta}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.26)] transition-transform hover:scale-[1.02] hover:bg-blue-700"
                >
                  <span>{heroCta}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8 flex items-center gap-3 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-0.5 text-yellow-400">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span>Built for creators, freelancers, designers, developers, marketers, and professionals.</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <CreatorProfileCard creatorProfile={creatorProfile} loadingProfile={loadingProfile} isCreatorMember={isCreatorMember} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">Everything you need to grow your professional presence.</h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {joinFeatures.map((item, index) => (
              <div key={item} className="creator-card-hover rounded-[22px] border border-slate-200 bg-[#f8fafc] p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Check className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-black tracking-[-0.02em] text-slate-900">{item}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfbfd] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">Join CreatorVerse as a professional.</h2>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {professionals.map((item) => (
              <div key={item.title} className="creator-card-hover rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50">{item.icon}</div>
                <div className="mt-4 text-sm font-black text-slate-800">{item.title}</div>
              </div>
            ))}
            <div className="creator-card-hover rounded-[22px] border border-blue-100 bg-blue-50/70 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="mt-4 text-sm font-black text-slate-900">Many more professionals across India</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:px-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">Your professional identity in one place.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Build a profile that shows your work, skills, city, portfolio links, and daily posts without exposing private account data.
            </p>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-[0_14px_28px_rgba(37,99,235,0.25)]">
                  <UserRound className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Sample creator card</div>
                  <h3 className="mt-1 text-2xl font-black tracking-[-0.03em] text-slate-950">Riya Sharma</h3>
                  <p className="text-sm font-semibold text-slate-500">Photographer | Content Creator | Mumbai</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">Available</span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {profileIncludes.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Check className="h-4 w-4 text-blue-600" />
                    <span>{item}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-blue-700">
                <LinkIcon className="h-4 w-4" />
                Portfolio
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-blue-700">
                <Sparkles className="h-4 w-4" />
                Skills
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-700">
                <Mail className="h-4 w-4" />
                Public inquiry
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfbfd] py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:px-12 lg:grid-cols-2 lg:items-center">
          <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="creator-card-hover rounded-[26px] border border-blue-100 bg-blue-50 p-5">
                <Image className="h-7 w-7 text-blue-600" />
                <div className="mt-8 text-4xl font-black text-slate-950">1</div>
                <div className="mt-1 text-sm font-black uppercase tracking-[0.22em] text-blue-600">Image</div>
              </div>
              <div className="creator-card-hover rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                <Video className="h-7 w-7 text-slate-600" />
                <div className="mt-8 text-4xl font-black text-slate-950">1</div>
                <div className="mt-1 text-sm font-black uppercase tracking-[0.22em] text-slate-600">Video</div>
              </div>
            </div>

            <div className="mt-5 rounded-[26px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Every 24 hours</div>
              <div className="mt-2 text-2xl font-black text-slate-950">Fair visibility and equal exposure for all members.</div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">Promote yourself every day.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Post one image or one video every 24 hours so your skills stay visible to businesses across India.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">From profile to direct collaboration.</h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-5">
            {workflowSteps.map((step, index) => (
              <div key={step} className="creator-card-hover rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-3xl font-black tracking-tight text-slate-200">0{index + 1}</div>
                <h3 className="mt-4 text-base font-black tracking-[-0.03em] text-slate-950">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfbfd] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">A cleaner path than traditional platforms.</h2>
          </div>

          <div className="mt-10 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                  <th className="p-5">Feature</th>
                  <th className="p-5 text-center">Traditional Platforms</th>
                  <th className="p-5 text-center text-blue-700">CreatorVerse</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(([feature, traditional, ours]) => (
                  <tr key={feature} className="border-t border-slate-100">
                    <td className="p-5 font-black text-slate-900">{feature}</td>
                    <td className="p-5 text-center font-bold text-slate-500">
                      {traditional === false ? <X className="mx-auto h-5 w-5 text-slate-400" /> : traditional}
                    </td>
                    <td className="p-5 text-center font-bold text-slate-900">
                      {ours === true ? <Check className="mx-auto h-5 w-5 text-blue-600" /> : ours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:px-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">CreatorVerse Membership</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              One annual membership for profile listing, daily visibility, business discovery, and direct collaboration.
            </p>

            <div className="mt-8 grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-5">
                <div>
                  <div className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-[9px] font-black uppercase tracking-[0.24em] text-white">Annual membership</div>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-2xl font-black text-slate-950">Rs</span>
                    <span className="text-6xl font-black tracking-tight text-slate-950">999</span>
                    <span className="pb-2 text-sm font-bold text-slate-400">/ Year</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-blue-50 px-5 py-4 text-right">
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-600">Included</div>
                  <div className="mt-1 text-sm font-bold text-slate-700">profile + business discovery</div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {pricingIncludes.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    <Check className="h-4 w-4 text-blue-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[30px] bg-[linear-gradient(135deg,#0f172a,#11264f)] p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] md:p-9">
            <h3 className="text-3xl font-black tracking-[-0.04em]">Connect with businesses across India.</h3>
            <p className="mt-4 text-sm leading-7 text-blue-50/85">
              Join CreatorVerse and make your professional work easier for businesses to discover.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-4 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700"
            >
              <span>Create CreatorVerse Profile</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreatorVerse;
