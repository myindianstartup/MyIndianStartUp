import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  CircleDollarSign,
  Globe2,
  HeartHandshake,
  Image,
  Landmark,
  Layers,
  Link as LinkIcon,
  Megaphone,
  Phone,
  Sparkles,
  Star,
  Target,
  Users,
  Video,
  Wallet,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/apiClient';

const joinFeatures = [
  'Business Listing',
  'Daily Visibility',
  '365 Days Marketing',
  'Creator Discovery',
  'Industry Networking',
  'Direct Collaboration',
  'PAN India Reach',
  'No Commission',
  'No Hidden Charges'
];

const industries = [
  { title: 'Manufacturing', icon: <Building2 className="h-5 w-5 text-blue-600" /> },
  { title: 'Retail & E-commerce', icon: <Wallet className="h-5 w-5 text-orange-500" /> },
  { title: 'Food & Beverage', icon: <Sparkles className="h-5 w-5 text-emerald-600" /> },
  { title: 'Healthcare', icon: <BadgeCheck className="h-5 w-5 text-red-500" /> },
  { title: 'Education', icon: <Landmark className="h-5 w-5 text-indigo-600" /> },
  { title: 'Real Estate', icon: <Building2 className="h-5 w-5 text-slate-700" /> },
  { title: 'IT & Software', icon: <Globe2 className="h-5 w-5 text-sky-600" /> },
  { title: 'Marketing Agencies', icon: <Megaphone className="h-5 w-5 text-orange-500" /> },
  { title: 'Construction', icon: <Layers className="h-5 w-5 text-yellow-600" /> },
  { title: 'Fashion & Lifestyle', icon: <Sparkles className="h-5 w-5 text-pink-600" /> },
  { title: 'Jewelry', icon: <Star className="h-5 w-5 text-violet-600" /> },
  { title: 'Finance & Consulting', icon: <CircleDollarSign className="h-5 w-5 text-emerald-600" /> },
  { title: 'Automotive', icon: <Target className="h-5 w-5 text-blue-600" /> }
];

const profileFields = [
  ['Business Name', 'Aurora Foods Pvt Ltd'],
  ['Industry', 'Food & Beverage'],
  ['City & State', 'Ahmedabad, Gujarat'],
  ['Website', 'aurorafoods.in'],
  ['Contact Number', '+91 98765 43210'],
  ['Social Media', '@aurorafoods'],
  ['About Company', 'Premium packaged food brand serving retailers across India.'],
  ['Public Rating', '4.5 / 5 from member interactions']
];

const showcaseBusinessStats = [
  ['4.5/5', 'average member rating'],
  ['18K+', 'monthly profile views'],
  ['62%', 'owner profile growth']
];

const connectionTypes = [
  'Creators',
  'Influencers',
  'Agencies',
  'Freelancers',
  'Professionals',
  'Other Businesses'
];

const comparisonRows = [
  ['Business Listing', true, true],
  ['Commission', 'High', false],
  ['Lead Charges', 'Yes', false],
  ['Direct Contact', 'Limited', true],
  ['Annual Membership', 'Expensive', '₹999']
];

const opportunities = [
  'Brand Promotion',
  'Product Launches',
  'Hiring Freelancers',
  'Finding Influencers',
  'Building Partnerships',
  'Expanding Your Network'
];

const pricingIncludes = [
  'Business Listing',
  '365 Days Marketing',
  'Daily Posts',
  'Search Creators',
  'Direct Collaboration',
  'PAN India Visibility',
  'No Commission'
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

function HeroProfileCard({ businessProfile, loadingProfile, isBusinessMember }) {
  const hasProfile = Boolean(businessProfile?.business_name);
  const isOwnProfile = isBusinessMember && hasProfile;
  const businessName = isOwnProfile ? safeText(businessProfile.business_name, 'Your Business') : 'Top rated business showcase';
  const industryPending = isOwnProfile && !businessProfile.industry?.trim();
  const locationPending = isOwnProfile && !compactLocation(businessProfile.city, businessProfile.state);
  const websitePending = isOwnProfile && !businessProfile.website?.trim();
  const industry = isOwnProfile ? safeText(businessProfile.industry, 'Add industry') : 'Food, D2C, Services';
  const location = isOwnProfile ? compactLocation(businessProfile.city, businessProfile.state) || 'Add city and state' : 'Ahmedabad, Surat, Mumbai';
  const website = isOwnProfile ? safeDomain(businessProfile.website) || 'Add website' : 'verified public listings';
  const socialCount = isOwnProfile ? socialLinkCount(businessProfile.social_links) : 8;
  const socialPending = isOwnProfile && socialCount === 0;
  const aboutPending = isOwnProfile && !businessProfile.about_company?.trim();
  const about = isOwnProfile
    ? safeText(businessProfile.about_company, 'Add a short public company intro to attract customers and collaborators.')
    : 'Visitors see trusted business examples, growth signals, ratings, and public profile previews before becoming members.';

  const cardFields = isOwnProfile
    ? [
        { label: 'Industry', value: industry, pending: industryPending },
        { label: 'Location', value: location, pending: locationPending },
        { label: 'Website', value: website, pending: websitePending },
        { label: 'Social links', value: socialCount ? `${socialCount} public link${socialCount > 1 ? 's' : ''}` : 'Add public links', pending: socialPending }
      ]
    : [
        { label: 'Top categories', value: industry },
        { label: 'Active cities', value: location },
        { label: 'Owner growth', value: '+62% profile views' },
        { label: 'Public trust', value: '4.9 rated profiles' }
      ];

  return (
    <div className="business-float relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:p-5">
      <div className="rounded-xl bg-[linear-gradient(135deg,rgba(239,246,255,0.95),rgba(255,247,237,0.82))] p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-orange-500 text-white shadow-[0_12px_26px_rgba(249,115,22,0.25)]">
              {isOwnProfile && businessProfile.logo_url ? (
                <img src={businessProfile.logo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-7 w-7" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">
                {isOwnProfile ? 'Your public business profile' : 'Business profile'}
              </div>
              <div className="mt-1 break-words text-lg font-black leading-tight tracking-[-0.03em] text-slate-950 sm:text-xl">{loadingProfile ? 'Loading profile...' : businessName}</div>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-600 sm:px-3 sm:text-[10px] sm:tracking-[0.18em]">
            {isOwnProfile ? 'Public' : 'Live'}
          </span>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {cardFields.map((field) => (
            <div
              key={field.label}
              className={`rounded-lg px-4 py-3 shadow-sm ${
                field.pending
                  ? 'border border-dashed border-orange-200 bg-orange-50/80'
                  : 'border border-white bg-white/85'
              }`}
            >
              <div className={`text-[10px] font-black uppercase tracking-[0.18em] ${field.pending ? 'text-orange-500' : 'text-slate-400'}`}>
                {field.label}
              </div>
              <div className={`mt-1 truncate text-sm font-bold ${field.pending ? 'text-orange-700' : 'text-slate-700'}`}>{field.value}</div>
            </div>
          ))}
        </div>

        <p className={`mt-5 rounded-lg px-3 py-2 text-sm font-semibold leading-6 sm:line-clamp-2 ${
          aboutPending ? 'border border-dashed border-orange-200 bg-orange-50/80 text-orange-700' : 'text-slate-600'
        }`}>
          {about}
        </p>

        {!isOwnProfile && (
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            {showcaseBusinessStats.map(([value, label]) => (
              <div key={label} className="min-w-0 rounded-lg bg-white/70 p-2.5 sm:p-3">
                <div className="text-base font-black text-slate-950 sm:text-lg">{value}</div>
                <div className="mt-1 break-words text-[8px] font-bold uppercase leading-4 tracking-[0.08em] text-slate-500 sm:text-[10px] sm:tracking-[0.12em]">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const BusinessVerse = () => {
  const navigate = useNavigate();
  const { member, token, isAuthenticated } = useAuth();
  const [businessProfile, setBusinessProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const isBusinessMember = member?.account_type === 'business';

  useEffect(() => {
    let cancelled = false;

    const loadBusinessProfile = async () => {
      if (!token || !isBusinessMember) {
        setBusinessProfile(null);
        return;
      }

      setLoadingProfile(true);
      try {
        const data = await apiRequest('/api/profiles/me', { token });
        if (!cancelled) setBusinessProfile(data?.businessProfile || null);
      } catch {
        if (!cancelled) setBusinessProfile(null);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };

    loadBusinessProfile();
    return () => {
      cancelled = true;
    };
  }, [token, isBusinessMember]);

  const heroCta = useMemo(() => {
    if (isAuthenticated && isBusinessMember) {
      return businessProfile?.business_name ? 'Update BusinessVerse Profile' : 'Complete BusinessVerse Profile';
    }
    return 'Create BusinessVerse Profile';
  }, [businessProfile?.business_name, isAuthenticated, isBusinessMember]);

  const handleHeroCta = () => {
    navigate(isAuthenticated && isBusinessMember ? '/profile-verse' : '/signup');
  };

  return (
    <div className="bg-white text-slate-950">
      <style>{`
        .business-float {
          animation: businessFloat 5.2s ease-in-out infinite;
        }

        .business-card-hover {
          transition: transform 0.26s ease, box-shadow 0.26s ease, border-color 0.26s ease;
        }

        .business-card-hover:hover {
          transform: translateY(-6px);
          border-color: rgba(249, 115, 22, 0.24);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
        }

        @keyframes businessFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .business-float {
            animation: none;
          }
        }
      `}</style>

      <section className="relative overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-x-0 top-0 h-[680px] bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(249,115,22,0.08)_48%,rgba(248,250,252,0)_82%)] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <h1 className="max-w-2xl text-4xl font-black leading-[0.98] tracking-[-0.05em] text-slate-950 sm:text-5xl md:text-6xl">
                Grow Your Business Through <span className="text-orange-500">Visibility</span> &amp; Collaboration
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
                Create your business profile, showcase your products and services, publish daily updates, and connect with skilled professionals across India.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={handleHeroCta}
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(249,115,22,0.26)] transition-transform hover:scale-[1.02] hover:bg-orange-600"
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
                <span>Built for businesses, brands, startups, agencies, and local companies across India.</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <HeroProfileCard businessProfile={businessProfile} loadingProfile={loadingProfile} isBusinessMember={isBusinessMember} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">Everything your business needs in one platform.</h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {joinFeatures.map((item, index) => (
              <div key={item} className="business-card-hover rounded-xl border border-slate-200 bg-[#f8fafc] p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
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
            <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">Built for industries across India.</h2>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {industries.map((item) => (
              <div key={item.title} className="business-card-hover rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-50">{item.icon}</div>
                <div className="mt-4 text-sm font-black text-slate-800">{item.title}</div>
              </div>
            ))}
            <div className="business-card-hover rounded-xl border border-orange-100 bg-orange-50/70 p-5 shadow-sm sm:col-span-2 lg:col-span-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-orange-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="mt-4 text-sm font-black text-slate-900">Many more industries across India</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">If your business needs visibility and direct connections, BusinessVerse is built for you.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:px-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="lg:pt-8">
            <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">Build a profile that builds trust.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Showcase your business, services, and achievements in one professional profile that helps others discover and connect with you.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-orange-500 text-white shadow-[0_14px_28px_rgba(249,115,22,0.25)]">
                  <Building2 className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Logo + identity</div>
                  <h3 className="mt-1 text-2xl font-black tracking-[-0.03em] text-slate-950">Aurora Foods Pvt Ltd</h3>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">Verified</span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {profileFields.map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</div>
                  <div className="mt-1 text-sm font-bold text-slate-800">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
              <a
                href="https://aurorafoods.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
              >
                <Globe2 className="h-4 w-4" />
                aurorafoods.in
              </a>
              <a
                href="https://instagram.com/aurorafoods"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-orange-600 transition-colors hover:bg-orange-100"
              >
                <LinkIcon className="h-4 w-4" />
                @aurorafoods
              </a>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-blue-700 transition-colors hover:bg-blue-100"
              >
                <Phone className="h-4 w-4" />
                +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfbfd] py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:px-12 lg:grid-cols-2 lg:items-center">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="business-card-hover rounded-xl border border-orange-100 bg-orange-50 p-5">
                <Image className="h-7 w-7 text-orange-500" />
                <div className="mt-8 text-4xl font-black text-slate-950">1</div>
                <div className="mt-1 text-sm font-black uppercase tracking-[0.22em] text-orange-500">Image</div>
              </div>
              <div className="business-card-hover rounded-xl border border-orange-100 bg-orange-50 p-5">
                <Video className="h-7 w-7 text-orange-500" />
                <div className="mt-8 text-4xl font-black text-slate-950">1</div>
                <div className="mt-1 text-sm font-black uppercase tracking-[0.22em] text-orange-500">Video</div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Every 24 hours</div>
                  <div className="mt-2 text-2xl font-black text-slate-950">Equal visibility for every member.</div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white text-orange-500 shadow-sm">
                  <Target className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">Promote your business every day.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Share one image or one video every 24 hours. The system is designed for equal visibility, no spam, and no feed domination.
            </p>
            <div className="mt-7 grid gap-3">
              {['One post every 24 hours', 'Equal visibility', 'No spam', 'No feed domination'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                  <Check className="h-4 w-4 text-orange-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:px-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">Connect directly with the people your business needs.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Find creators, influencers, agencies, freelancers, professionals, and other businesses without middlemen.
            </p>
          </div>

          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {connectionTypes.map((item, index) => (
                <div key={item} className="business-card-hover rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                    {index % 2 === 0 ? <Users className="h-5 w-5" /> : <HeartHandshake className="h-5 w-5" />}
                  </div>
                  <div className="mt-4 text-lg font-black text-slate-950">{item}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-orange-200 bg-[linear-gradient(135deg,rgba(255,247,237,0.98),rgba(255,255,255,0.98),rgba(255,237,213,0.92))] px-5 py-4 text-center text-sm font-black text-slate-950 shadow-[0_18px_42px_rgba(249,115,22,0.12)]">
              Direct Contact. No Middlemen.
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfbfd] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">A cleaner way to grow.</h2>
          </div>

          <div className="mt-8 grid gap-3 sm:hidden">
            {comparisonRows.map(([feature, others, ours]) => (
              <article key={`${feature}-mobile`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-base font-black text-slate-950">{feature}</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Other platforms</p>
                    <div className="mt-2 text-sm font-bold text-slate-600">
                      {others === true ? <Check className="h-5 w-5 text-emerald-600" /> : others}
                    </div>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-blue-600">MyIndianStartup</p>
                    <div className="mt-2 text-sm font-black text-slate-950">
                      {ours === true ? <Check className="h-5 w-5 text-blue-600" /> : ours === false ? <X className="h-5 w-5 text-orange-500" /> : ours}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 hidden overflow-x-auto overflow-y-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:block">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                  <th className="p-5">Feature</th>
                  <th className="p-5 text-center">Others</th>
                  <th className="p-5 text-center text-blue-700">MyIndianStartup</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(([feature, others, ours]) => (
                  <tr key={feature} className="border-t border-slate-100">
                    <td className="p-5 font-black text-slate-900">{feature}</td>
                    <td className="p-5 text-center font-bold text-slate-500">
                      {others === true ? <Check className="mx-auto h-5 w-5 text-emerald-600" /> : others}
                    </td>
                    <td className="p-5 text-center font-bold text-slate-900">
                      {ours === true ? <Check className="mx-auto h-5 w-5 text-blue-600" /> : ours === false ? <X className="mx-auto h-5 w-5 text-orange-500" /> : ours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:px-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">Use BusinessVerse for real growth work.</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((item) => (
              <div key={item} className="business-card-hover rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <BriefcaseBusiness className="h-5 w-5 text-orange-500" />
                <div className="mt-4 text-sm font-black text-slate-900">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfbfd] py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:px-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">BusinessVerse Membership</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              One annual membership for profile visibility, daily marketing, discovery, and direct collaboration.
            </p>

            <div className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-5">
                <div>
                  <div className="inline-flex rounded-full bg-orange-500 px-3 py-1 text-[9px] font-black uppercase tracking-[0.24em] text-white">Annual membership</div>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-2xl font-black text-slate-950">Rs</span>
                    <span className="text-6xl font-black tracking-tight text-slate-950">999</span>
                    <span className="pb-2 text-sm font-bold text-slate-400">/ Year</span>
                  </div>
                </div>
                <div className="rounded-xl bg-orange-50 px-5 py-4 text-right">
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">Included</div>
                  <div className="mt-1 text-sm font-bold text-slate-700">visibility + direct deals</div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {pricingIncludes.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    <Check className="h-4 w-4 text-orange-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[linear-gradient(135deg,#0f172a,#11264f)] p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] md:p-9">
            <h3 className="text-3xl font-black tracking-[-0.04em]">Join businesses across India building visibility.</h3>
            <p className="mt-4 text-sm leading-7 text-blue-50/85">
              Create new opportunities, build partnerships, and make your business easier to discover.
            </p>
            <button
              onClick={handleHeroCta}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-4 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-orange-600"
            >
              <span>Create BusinessVerse Profile</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BusinessVerse;
