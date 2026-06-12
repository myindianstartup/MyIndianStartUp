import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Eye,
  Globe2,
  Handshake,
  IndianRupee,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
  Scale,
  Target,
  Users
} from 'lucide-react';

const sectionAccent = (accent = 'blue') => {
  if (accent === 'orange') {
    return { line: 'to-orange-500', text: 'text-orange-500' };
  }
  if (accent === 'muted') {
    return { line: 'to-slate-400', text: 'text-slate-500' };
  }
  return { line: 'to-blue-600', text: 'text-blue-600' };
};

const SectionEyebrow = ({ children, accent = 'blue', className = '' }) => {
  const { line, text } = sectionAccent(accent);

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <span className={`h-px w-10 bg-gradient-to-r from-transparent ${line}`} />
      <span className={`text-[12px] font-bold uppercase tracking-[0.28em] ${text}`}>
        {children}
      </span>
      <span className={`h-px w-10 bg-gradient-to-l from-transparent ${line}`} />
    </div>
  );
};

const SectionHeader = ({ eyebrow, title, description, accent = 'blue' }) => (
  <div className="mx-auto max-w-4xl text-center">
    <SectionEyebrow accent={accent} className="mx-auto">
      {eyebrow}
    </SectionEyebrow>
    <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-semibold leading-[1.18] tracking-[-0.01em] text-slate-950 sm:text-4xl md:text-[2.65rem]">
      {title}
    </h2>
    {description && (
      <p className="mx-auto mt-4 max-w-2xl text-[15px] font-normal leading-7 text-slate-600 sm:text-base">
        {description}
      </p>
    )}
  </div>
);

const stepCards = [
  {
    number: '01',
    icon: <MessageSquare className="h-5 w-5 text-blue-600" />,
    title: 'Create Your Profile',
    description: 'Register as a Business or Creator and build your professional presence.',
    action: 'Create profile',
    to: '/signup'
  },
  {
    number: '02',
    icon: <Search className="h-5 w-5 text-orange-500" />,
    title: 'Publish Daily Updates',
    description: 'Share one image or one video every day to showcase your work, products, services, or achievements.',
    action: 'Start posting',
    to: '/post-verse'
  },
  {
    number: '03',
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    title: 'Connect & Collaborate',
    description: 'Discover businesses and creators across India and connect directly without any platform commission.',
    action: 'Connect now',
    to: '/search-verse'
  }
];

const valueHighlights = [
  {
    icon: <IndianRupee className="h-5 w-5 text-blue-600" />,
    iconWrap: 'bg-blue-50',
    title: '₹999 Annual Membership',
    description: 'Simple, transparent pricing'
  },
  {
    icon: <BadgeCheck className="h-5 w-5 text-emerald-600" />,
    iconWrap: 'bg-emerald-50',
    title: 'No Commission Charges',
    description: 'Keep 100% of your deals'
  },
  {
    icon: <Target className="h-5 w-5 text-orange-500" />,
    iconWrap: 'bg-orange-50',
    title: 'No Lead Purchase System',
    description: 'Connect without buying leads'
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-blue-600" />,
    iconWrap: 'bg-blue-50',
    title: 'No Success Fees',
    description: 'No revenue sharing ever'
  },
  {
    icon: <Handshake className="h-5 w-5 text-blue-600" />,
    iconWrap: 'bg-blue-50',
    title: 'Direct Connections',
    description: 'Business-to-creator, no middlemen'
  },
  {
    icon: <Globe2 className="h-5 w-5 text-orange-500" />,
    iconWrap: 'bg-orange-50',
    title: 'PAN India Network',
    description: 'Opportunities across every state'
  },
  {
    icon: <Eye className="h-5 w-5 text-blue-600" />,
    iconWrap: 'bg-blue-50',
    title: 'Daily Visibility',
    description: 'Fair exposure for every member'
  },
  {
    icon: <Scale className="h-5 w-5 text-emerald-600" />,
    iconWrap: 'bg-emerald-50',
    title: 'Equal Exposure',
    description: 'No feed domination'
  }
];

const growthTrend = {
  business: [
    [18, 84],
    [60, 68],
    [102, 74],
    [144, 54],
    [186, 61],
    [228, 38],
    [270, 45],
    [312, 26]
  ],
  creator: [
    [18, 96],
    [60, 88],
    [102, 64],
    [144, 72],
    [186, 48],
    [228, 55],
    [270, 32],
    [312, 18]
  ]
};

const chartPath = (points) => points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');

const businessBullets = [
  'Business Listing',
  'Daily Visibility',
  'Creator Discovery',
  'Industry Networking',
  'Direct Collaboration'
];

const creatorBullets = [
  'Professional Profile',
  'Portfolio Visibility',
  'Daily Exposure',
  'Collaboration Opportunities',
  'Personal Branding'
];

const membershipBusinessBenefits = [
  'Business Listing',
  'Search Creators',
  'Daily Marketing',
  'Direct Connections',
  '365 Days Access'
];

const membershipCreatorBenefits = [
  'Professional Listing',
  'Portfolio Showcase',
  'Business Discovery',
  'Daily Visibility',
  '365 Days Access'
];

const noAdditionalCharges = [
  'No Commission Charges',
  'No Lead Purchase Fees',
  'No Success Fees',
  'No Hidden Charges',
  'No Transaction Fees',
  'No Revenue Sharing',
  'No Project-Based Charges',
  'No Monthly Charges'
];

const coverageCards = [
  {
    icon: Globe2,
    tone: 'blue',
    title: 'PAN India network',
    copy: 'MyIndianStartup brings together businesses, creators, freelancers, and professionals from every corner of India.'
  },
  {
    icon: Users,
    tone: 'orange',
    title: 'Opportunities everywhere',
    copy: 'Promote your business, discover opportunities, hire skilled talent, and build valuable industry connections.'
  },
  {
    icon: Handshake,
    tone: 'blue',
    title: 'Collaborate & grow',
    copy: 'From startups and local businesses to creators and industry professionals — succeed together beyond boundaries.'
  }
];

const IndiaCoveragePins = [
  { label: 'Delhi NCR', top: '31%', left: '45%', tone: 'blue' },
  { label: 'Ahmedabad', top: '51%', left: '25%', tone: 'blue' },
  { label: 'Mumbai', top: '64%', left: '30%', tone: 'orange' },
  { label: 'Hyderabad', top: '69%', left: '48%', tone: 'blue' },
  { label: 'Bengaluru', top: '83%', left: '40%', tone: 'blue' },
  { label: 'Chennai', top: '86%', left: '49%', tone: 'orange' },
  { label: 'Kolkata', top: '55%', left: '72%', tone: 'orange' }
];

const coverageStats = [
  { value: 20000, suffix: '+', label: 'Projects', compact: true },
  { value: 180, suffix: '+', label: 'Cities' },
  { value: 12400, label: 'Active members', compact: true, precision: 1 }
];

const AnimatedStat = ({ value, suffix = '', compact = false, precision = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setCount(value);
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCount(value);
      return undefined;
    }

    let frameId;
    const duration = 1200;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  const displayValue = compact
    ? `${(count / 1000).toFixed(precision).replace(/\.0$/, '')}k`
    : count.toLocaleString('en-IN');

  return (
    <>
      {displayValue}
      {suffix}
    </>
  );
};

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white text-slate-950">
      <style>{`
        .perks-orbit-lines {
          transform-origin: center;
        }

        .perks-center {
          animation: perksCenterPulse 3.8s ease-in-out infinite;
        }

        .perks-node {
          --orbit-radius: 166px;
          left: 50%;
          top: 50%;
          animation: perksOrbit 22s linear infinite;
        }

        .visibility-orbit-runner {
          transform-origin: center;
          animation: visibilityOrbit 9s linear infinite;
        }

        .visibility-orbit-dot {
          filter: drop-shadow(0 8px 14px rgba(37,99,235,0.28));
          animation: visibilityDotPulse 1.8s ease-in-out infinite;
        }

        @keyframes perksCenterPulse {
          0%, 100% { box-shadow: 0 14px 40px rgba(15,23,42,0.12), 0 0 0 0 rgba(37,99,235,0.14); }
          50% { box-shadow: 0 18px 48px rgba(15,23,42,0.14), 0 0 0 16px rgba(37,99,235,0); }
        }

        @keyframes perksOrbit {
          from {
            transform: translate(-50%, -50%) rotate(var(--orbit-angle)) translateX(var(--orbit-radius)) rotate(calc(var(--orbit-angle) * -1));
          }
          to {
            transform: translate(-50%, -50%) rotate(calc(var(--orbit-angle) + 360deg)) translateX(var(--orbit-radius)) rotate(calc((var(--orbit-angle) + 360deg) * -1));
          }
        }

        @keyframes visibilityOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes visibilityDotPulse {
          0%, 100% { opacity: 0.78; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.08); }
        }

        @media (max-width: 640px) {
          .perks-node {
            --orbit-radius: 140px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .perks-orbit-lines,
          .perks-center,
          .perks-node,
          .visibility-orbit-runner,
          .visibility-orbit-dot {
            animation: none;
          }
        }

        .value-highlight-icon {
          transition: transform 0.28s ease, background-color 0.28s ease;
        }

        .value-highlight-icon svg {
          width: 1.55rem;
          height: 1.55rem;
        }

        .value-highlight-marquee {
          mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }

        .value-highlight-track {
          width: max-content;
          animation: valueHighlightMarquee 32s linear infinite;
        }

        .value-highlight-marquee:hover .value-highlight-track {
          animation-play-state: paused;
        }

        .value-highlight-item:hover .value-highlight-icon {
          transform: translateY(-3px) scale(1.05);
        }

        @keyframes valueHighlightMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .verse-choice-card {
          transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease, background 0.28s ease;
        }

        .verse-choice-card:hover {
          transform: translateY(-8px);
        }

        .verse-choice-card:hover .verse-pill {
          transform: translateY(-3px);
        }

        .verse-choice-card:hover .verse-card-cta svg {
          transform: translateX(4px);
        }

        .verse-pill,
        .verse-card-cta svg {
          transition: transform 0.24s ease;
        }

        .equal-card {
          display: flex;
          flex-direction: column;
          min-height: 100%;
        }

        .equal-card-body {
          flex: 1 1 auto;
        }

        .verse-choice-card.business:hover {
          border-color: rgba(249, 115, 22, 0.32);
          box-shadow: 0 26px 70px rgba(249, 115, 22, 0.13);
        }

        .verse-choice-card.creator:hover {
          border-color: rgba(37, 99, 235, 0.32);
          box-shadow: 0 26px 70px rgba(37, 99, 235, 0.14);
        }

        .india-map-shape {
          filter: drop-shadow(0 24px 42px rgba(37, 99, 235, 0.08));
          animation: mapFloat 5.5s ease-in-out infinite;
          transform-origin: center;
        }

        .coverage-route {
          stroke-dasharray: 9 12;
          animation: routeFlow 10s linear infinite;
        }

        .coverage-pin {
          animation: pinFloat 3.4s ease-in-out infinite;
        }

        .coverage-pin-dot {
          animation: pinPulse 2.2s ease-in-out infinite;
        }

        .coverage-pin-label {
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
        }

        @keyframes mapFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes routeFlow {
          to { stroke-dashoffset: -84; }
        }

        @keyframes pinFloat {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-5px); }
        }

        @keyframes pinPulse {
          0%, 100% { box-shadow: 0 0 0 7px rgba(37, 99, 235, 0.1); }
          50% { box-shadow: 0 0 0 13px rgba(37, 99, 235, 0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .verse-choice-card,
          .verse-pill,
          .verse-card-cta svg,
          .india-map-shape,
          .coverage-route,
          .coverage-pin,
          .coverage-pin-dot {
            transition: none;
            animation: none;
          }

          .verse-choice-card:hover,
          .verse-choice-card:hover .verse-pill,
          .verse-choice-card:hover .verse-card-cta svg,
          .value-highlight-track {
            transform: none;
            animation: none;
          }
        }
      `}</style>
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-x-0 top-0 h-[760px] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.09),transparent_35%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_28%)] pointer-events-none" />
        <div className="absolute -top-24 right-[-8rem] h-[26rem] w-[26rem] rounded-full bg-blue-500/5 blur-[110px] pointer-events-none" />
        <div className="absolute top-48 left-[-8rem] h-[24rem] w-[24rem] rounded-full bg-orange-500/5 blur-[110px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-16">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                India-first business + creator platform
              </div>

              <h1 className="mt-6 max-w-xl text-4xl font-black leading-[0.98] tracking-[-0.05em] text-slate-950 sm:text-5xl md:text-6xl">
                India&apos;s Biggest <span className="text-orange-500">Business</span> &amp; <span className="text-blue-600">Creator</span> Collaboration Platform
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 md:text-lg">
                Build your presence, showcase your work, publish daily updates, and connect with opportunities across India.
              </p>
              <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500 md:text-base">
                Whether you&apos;re a business looking for creators or a creator looking for opportunities,
                MyIndianStartup helps you connect, collaborate, and grow.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(249,115,22,0.25)] transition-transform hover:scale-[1.02] hover:bg-orange-600"
                  data-testid="hero-cta-business"
                >
                  <span>Create BusinessVerse Profile</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition-transform hover:scale-[1.02] hover:bg-blue-700"
                  data-testid="hero-cta-creator"
                >
                  <span>Create CreatorVerse Profile</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8 flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
                <div className="flex -space-x-2">
                  {[
                    ['A', 'bg-orange-500'],
                    ['B', 'bg-blue-500'],
                    ['C', 'bg-emerald-500'],
                    ['D', 'bg-rose-500'],
                    ['E', 'bg-indigo-500']
                  ].map(([letter, tone]) => (
                    <span key={letter} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-black text-white ${tone}`}>
                      {letter}
                    </span>
                  ))}
                </div>
                <div className="text-sm font-semibold text-slate-600">
                  Trusted by businesses, creators, freelancers, and professionals across India.
                </div>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  [10000, 'Members connected', true],
                  [28, 'States represented', false],
                  [150, 'CA partners', false]
                ].map(([value, label, compact]) => (
                  <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    <div className="text-2xl font-black tracking-tight text-slate-950">
                      <AnimatedStat value={value} suffix="+" compact={compact} />
                    </div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 lg:pt-10">
              <div className="relative mx-auto mb-6 max-w-[620px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(239,246,255,0.95),rgba(255,247,237,0.9))] shadow-[0_22px_70px_rgba(15,23,42,0.11)] lg:ml-auto">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.12),transparent_40%)]" />
                <div className="relative flex min-h-[220px] items-end justify-center px-6 pb-0 pt-8 md:min-h-[260px]">
                  <img
                    src="/assets/auth-characters.png"
                    alt="Business and creator collaboration across India"
                    className="max-h-[220px] w-auto object-contain drop-shadow-[0_24px_38px_rgba(15,23,42,0.16)] md:max-h-[250px]"
                  />
                </div>
                <div className="relative border-t border-white/70 bg-white/80 px-5 py-4 backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-600">Platform preview</div>
                      <div className="mt-1 text-sm font-bold text-slate-900">See how businesses &amp; creators connect daily</div>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mx-auto max-w-[620px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.11)] lg:ml-auto">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-2.5">
                  <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                    <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                    <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-400">dashboard snapshot</span>
                  <span className="w-10" />
                </div>

                <div className="grid gap-0 lg:grid-cols-12">
                  <div className="border-b border-slate-100 bg-slate-50/70 p-3 lg:col-span-4 lg:border-b-0 lg:border-r lg:border-slate-100">
                    <div className="flex gap-1.5 lg:flex-col">
                      {[
                        ['Overview', true],
                        ['Collabs', false],
                        ['Analytics', false],
                        ['Settings', false]
                      ].map(([label, active]) => (
                        <div
                          key={label}
                          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-500'}`}
                        >
                          <Circle className={`h-3 w-3 ${active ? 'fill-blue-600 text-blue-600' : 'text-slate-300'}`} />
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 lg:col-span-8">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div className="rounded-[1.25rem] bg-blue-600 p-4 text-white shadow-lg md:col-span-2">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-blue-100">
                          <span>Active profile</span>
                          <BadgeCheck className="h-3.5 w-3.5" />
                        </div>
                        <div className="mt-4 text-2xl font-black tracking-tight">24</div>
                        <div className="mt-1 text-[11px] font-semibold text-blue-100">projects live</div>
                      </div>

                      <div className="rounded-[1.25rem] bg-gradient-to-br from-orange-100 to-orange-50 p-4 shadow-sm md:col-span-2">
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-600">Team match</div>
                        <div className="mt-4 text-2xl font-black tracking-tight text-slate-950">+48%</div>
                        <div className="mt-1 text-[11px] font-semibold text-slate-500">reach this month</div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-[1.25rem] border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3 text-sm font-bold text-slate-800">
                        <span>Growth overview</span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <span className="h-2 w-2 rounded-full bg-orange-500" /> Business
                          <span className="ml-2 h-2 w-2 rounded-full bg-blue-600" /> Creator
                        </span>
                      </div>
                      <div className="mt-4 h-28 overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 to-white px-2 py-3">
                        <svg viewBox="0 0 330 120" className="h-full w-full" role="img" aria-label="Fake trending chart for Business and Creator growth">
                          <defs>
                            <linearGradient id="businessTrendFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f97316" stopOpacity="0.18" />
                              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="creatorTrendFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.16" />
                              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {[28, 56, 84].map((y) => (
                            <line key={y} x1="12" y1={y} x2="318" y2={y} stroke="#e2e8f0" strokeDasharray="4 7" strokeWidth="1" />
                          ))}
                          <path d={`${chartPath(growthTrend.creator)} L 312 112 L 18 112 Z`} fill="url(#creatorTrendFill)" />
                          <path d={`${chartPath(growthTrend.business)} L 312 112 L 18 112 Z`} fill="url(#businessTrendFill)" />
                          <path d={chartPath(growthTrend.business)} fill="none" stroke="#f97316" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
                          <path d={chartPath(growthTrend.creator)} fill="none" stroke="#2563eb" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
                          {growthTrend.business.map(([x, y], index) => (
                            <g key={`business-${index}`} className="transition-transform duration-300 hover:-translate-y-1">
                              <circle cx={x} cy={y} r="5" fill="#f97316" />
                              <circle cx={x} cy={y} r="9" fill="#f97316" opacity="0.12" />
                            </g>
                          ))}
                          {growthTrend.creator.map(([x, y], index) => (
                            <g key={`creator-${index}`} className="transition-transform duration-300 hover:-translate-y-1">
                              <circle cx={x} cy={y} r="5" fill="#2563eb" />
                              <circle cx={x} cy={y} r="9" fill="#2563eb" opacity="0.12" />
                            </g>
                          ))}
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="value-highlight-marquee overflow-hidden rounded-[1.75rem] border border-blue-100 bg-white shadow-[0_18px_55px_rgba(37,99,235,0.09)]">
            <div className="value-highlight-track flex">
              {[...valueHighlights, ...valueHighlights].map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="value-highlight-item flex min-w-[340px] items-center gap-5 border-r border-slate-100 px-8 py-7 md:min-w-[380px]"
                >
                  <div className={`value-highlight-icon flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] ${item.iconWrap}`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-base font-black tracking-[-0.02em] text-slate-950">{item.title}</div>
                    <div className="mt-1.5 text-sm font-semibold leading-6 text-slate-500">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-16 pt-8 md:pb-20 md:pt-10">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionHeader
            eyebrow="How it works"
            title="How It Works"
            description="Three simple steps to build visibility, publish daily, and connect directly across India."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-3 md:items-stretch">
            {stepCards.map((step) => (
              <div
                key={step.number}
                className="equal-card relative min-h-[320px] rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-1"
              >
                <div className="absolute right-6 top-6 text-2xl font-bold text-slate-300/90">{step.number}</div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">{step.icon}</div>
                <div className="equal-card-body">
                  <h3 className="mt-6 min-h-[3.25rem] text-lg font-bold leading-snug tracking-[-0.01em] text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-3 min-h-[6.5rem] text-[15px] leading-7 text-slate-600">{step.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(step.to)}
                  className="mt-6 inline-flex items-center gap-1 self-start rounded-full px-0 text-sm font-semibold text-slate-900 transition-all hover:gap-2 hover:text-blue-600"
                >
                  <span>{step.action}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8fafc] py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-2 md:px-12">
          <div className="verse-choice-card business rounded-[2rem] border border-orange-100 bg-[linear-gradient(180deg,rgba(255,247,237,0.9),rgba(255,255,255,0.98))] p-8 text-slate-950 shadow-[0_20px_60px_rgba(249,115,22,0.07)] md:p-10">
            <SectionEyebrow accent="orange">For BusinessVerse</SectionEyebrow>
            <h3 className="mt-5 text-2xl font-semibold leading-[1.2] tracking-[-0.01em] sm:text-3xl">
              Find The Right Talent For Your Business. Connect with them.
            </h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              List your business, gain daily visibility, discover creators, and collaborate directly across India.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {businessBullets.map((bullet) => (
                <div key={bullet} className="verse-pill flex items-center gap-3 rounded-2xl border border-orange-100 bg-white/75 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
                  <Check className="h-4 w-4 text-orange-500" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/business-verse')}
              className="verse-card-cta mt-8 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(249,115,22,0.22)] transition-transform hover:scale-[1.02] hover:bg-orange-600"
            >
              <span>Explore BusinessVerse</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="verse-choice-card creator rounded-[2rem] border border-blue-100 bg-[linear-gradient(180deg,rgba(239,246,255,0.92),rgba(255,255,255,0.98))] p-8 shadow-[0_20px_60px_rgba(37,99,235,0.08)] md:p-10">
            <SectionEyebrow accent="blue">For CreatorVerse</SectionEyebrow>
            <h3 className="mt-5 text-2xl font-semibold leading-[1.2] tracking-[-0.01em] text-slate-950 sm:text-3xl">
              Get Discovered By Businesses Across India
            </h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              Build your professional profile, showcase your portfolio, and connect with businesses looking for your talent.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {creatorBullets.map((bullet) => (
                <div key={bullet} className="verse-pill flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                  <Check className="h-4 w-4 text-blue-600" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/creator-verse')}
              className="verse-card-cta mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] hover:bg-blue-700"
            >
              <span>Explore CreatorVerse</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:px-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="mx-auto w-full max-w-[460px]">
            <div className="relative mx-auto flex aspect-square w-full max-w-[430px] items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.08),transparent_62%)]" />
              <svg className="absolute inset-0 h-full w-full text-blue-200/80" viewBox="0 0 400 400" fill="none">
                <circle cx="200" cy="200" r="150" stroke="currentColor" strokeDasharray="4 6" strokeWidth="1.5" />
                <circle cx="200" cy="200" r="118" stroke="rgba(249,115,22,0.35)" strokeDasharray="3 5" strokeWidth="1.2" />
                <g className="visibility-orbit-runner">
                  <circle className="visibility-orbit-dot" cx="200" cy="50" r="7" fill="#2563eb" />
                  <circle cx="200" cy="50" r="15" fill="#2563eb" opacity="0.1" />
                </g>
              </svg>

              <div className="perks-center relative z-10 flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 border-blue-100 bg-white">
                <div className="text-4xl font-black tracking-tight text-slate-950">24</div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Hours</div>
                <div className="mt-1 text-[10px] font-semibold text-slate-400">per slot</div>
              </div>

              {[
                [270, '12:00', 'blue'],
                [0, '18:00', 'pink'],
                [90, '00:00', 'teal'],
                [180, '06:00', 'orange']
              ].map(([angle, label, tone]) => (
                <div
                  key={label}
                  className="perks-node absolute z-20 flex flex-col items-center gap-1.5"
                  style={{ '--orbit-angle': `${angle}deg`, '--orbit-radius': '158px' }}
                >
                  <div
                    className={`h-4 w-4 rounded-full border-4 shadow-md ${
                      tone === 'orange'
                        ? 'border-orange-100 bg-orange-500'
                        : tone === 'pink'
                          ? 'border-rose-100 bg-rose-500'
                          : tone === 'teal'
                            ? 'border-teal-100 bg-teal-500'
                            : 'border-blue-100 bg-blue-600'
                    }`}
                  />
                  <div className="rounded-md border border-slate-100 bg-white/95 px-2 py-0.5 text-[9px] font-black tracking-[0.18em] text-slate-500 shadow-sm">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mx-auto -mt-5 max-w-sm rounded-[1.5rem] border border-slate-200 bg-white/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600">Daily queue</div>
                  <div className="mt-1 text-sm font-semibold text-slate-950">Today&apos;s visibility slots</div>
                </div>
                <div className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">Live</div>
              </div>
              <div className="mt-4 grid gap-2">
                {[
                  ['Business post queued', '06:00', 'bg-orange-500'],
                  ['Creator slot active', '12:00', 'bg-blue-600'],
                  ['Next reset in 18h', '24h cycle', 'bg-emerald-500']
                ].map(([label, time, tone]) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${tone}`} />
                      <span className="text-xs font-semibold text-slate-700">{label}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <SectionEyebrow accent="orange">Daily Visibility System</SectionEyebrow>
            <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.18] tracking-[-0.01em] text-slate-950 sm:text-4xl md:text-[2.65rem]">
              Fair Visibility For Every Member
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] font-normal leading-7 text-slate-600 sm:text-base">
              To ensure equal exposure, every business and creator gets a fair chance to be discovered — no paid boosts, no feed domination.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                [Clock3, '1 post every 24 hours', 'Only 1 image OR 1 video can be posted every 24 hours.'],
                [Scale, 'Equal visibility', 'Every business and creator gets a fair chance to be discovered.'],
                [Eye, 'No feed domination', 'No member can dominate the feed.'],
                [ShieldCheck, 'Fair exposure system', 'Visibility rotates evenly across India.']
              ].map(([Icon, title, text]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-black text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-[#fbfbfd] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionHeader
            eyebrow="Why MyIndianStartup?"
            title="Visibility, discovery, and collaboration — in one platform."
            description="Most platforms focus on either networking, freelancing, or social media. MyIndianStartup combines all three in one place."
          />

          <div className="mx-auto mt-8 max-w-3xl rounded-[1.5rem] border border-orange-100 bg-gradient-to-r from-orange-50/80 via-white to-blue-50/80 px-6 py-5 text-center shadow-sm">
            <p className="text-[15px] font-semibold leading-7 text-slate-800">
              Direct Deals. No Middlemen. — Businesses and creators connect directly and keep 100% of their agreed project value.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 md:items-stretch">
            {valueHighlights.map((item) => (
              <div
                key={item.title}
                className="equal-card min-h-[148px] rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconWrap}`}>
                  {item.icon}
                </div>
                <h3 className="mt-4 text-[15px] font-bold leading-snug text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm font-normal leading-6 text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionHeader
            eyebrow="Membership Benefits"
            title="Built For Businesses & Creators Across India"
            description="Choose BusinessVerse or CreatorVerse — both included in one annual membership."
            accent="orange"
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <div className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50/80 to-white p-7 shadow-sm md:p-8">
              <SectionEyebrow accent="orange">BusinessVerse</SectionEyebrow>
              <div className="mt-5 grid gap-3">
                {membershipBusinessBenefits.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700">
                    <Check className="h-4 w-4 text-orange-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-7 shadow-sm md:p-8">
              <SectionEyebrow accent="blue">CreatorVerse</SectionEyebrow>
              <div className="mt-5 grid gap-3">
                {membershipCreatorBenefits.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700">
                    <Check className="h-4 w-4 text-blue-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfbfd] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionHeader
            eyebrow="India Coverage"
            title="Connect beyond geographical boundaries."
            description="A nationwide platform for businesses, creators, freelancers, and professionals to collaborate, grow, and succeed together."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-3 md:items-stretch">
            {coverageCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="equal-card min-h-[220px] rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-1"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      card.tone === 'orange' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 min-h-[3rem] text-lg font-bold leading-snug tracking-[-0.01em] text-slate-950">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-7 text-slate-600">{card.copy}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
            {coverageStats.map((stat, index) => (
              <div key={stat.label} className={index === 1 ? 'border-x border-slate-100 px-4' : ''}>
                <div className="text-3xl font-semibold tracking-tight text-slate-950">
                  <AnimatedStat value={stat.value} suffix={stat.suffix} compact={stat.compact} precision={stat.precision} />
                </div>
                <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-6 max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>Coverage map — 28 states &amp; growing</span>
            </div>
            <div className="relative mt-5 aspect-square overflow-hidden rounded-[1.6rem] border border-slate-100 bg-white">
              <img
                src="/assets/india-coverage-map.png"
                alt="India coverage map"
                className="india-map-shape absolute inset-0 h-full w-full object-cover"
              />
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                <path
                  className="coverage-route"
                  d="M45 31 C36 39 28 46 25 51 C26 58 28 62 30 64 C35 74 38 80 40 83 C43 85 47 86 49 86 C55 76 64 64 72 55 C66 46 55 37 45 31 Z"
                  stroke="rgba(37,99,235,0.14)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
                <path
                  className="coverage-route"
                  d="M45 31 C52 38 62 47 72 55"
                  stroke="rgba(249,115,22,0.16)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  style={{ animationDelay: '-4s' }}
                />
                <path
                  className="coverage-route"
                  d="M30 64 C36 66 42 68 48 69 C55 66 64 60 72 55"
                  stroke="rgba(37,99,235,0.13)"
                  strokeWidth="0.7"
                  strokeLinecap="round"
                  style={{ animationDelay: '-4s' }}
                />
              </svg>

              {IndiaCoveragePins.map((pin, index) => (
                <div
                  key={pin.label}
                  className="coverage-pin absolute flex items-center gap-2"
                  style={{ top: pin.top, left: pin.left, animationDelay: `${index * 0.18}s` }}
                >
                  <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-[0_8px_18px_rgba(15,23,42,0.12)]">
                    <span
                      className={`coverage-pin-dot h-3 w-3 rounded-full ${pin.tone === 'orange' ? 'bg-orange-500' : 'bg-blue-600'}`}
                      style={{ animationDelay: `${index * 0.2}s` }}
                    />
                  </span>
                  <span className="coverage-pin-label whitespace-nowrap rounded-lg border border-slate-100 bg-white/95 px-2.5 py-1 text-[10px] font-bold leading-none text-slate-700">
                    {pin.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionHeader
            eyebrow="Annual Membership"
            title="Simple. Transparent. Affordable."
            description="At MyIndianStartup, we believe in direct and transparent connections. Your membership includes access to either BusinessVerse or CreatorVerse."
            accent="orange"
          />

          <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-orange-50/70 via-white to-blue-50/70 px-6 py-8 text-center md:px-10">
              <div className="text-[12px] font-bold uppercase tracking-[0.28em] text-slate-500">One annual membership</div>
              <div className="mt-3 flex items-end justify-center gap-2">
                <IndianRupee className="mb-2 h-7 w-7 text-slate-400" />
                <span className="text-5xl font-semibold tracking-tight text-slate-950 md:text-6xl">999</span>
                <span className="mb-2 text-base font-semibold text-slate-400">/ year</span>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="text-[12px] font-bold uppercase tracking-[0.22em] text-slate-400">No Additional Charges</div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {noAdditionalCharges.map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                    <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/pricing')}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition-transform hover:scale-[1.01] hover:bg-blue-700"
              >
                <span>View full pricing</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.07),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.08),transparent_42%)] p-8 md:p-12">
            <SectionHeader
              eyebrow="Get started today"
              title="Ready To Build Connections Across India?"
              description="Join thousands of businesses and creators building visibility and opportunities."
              accent="muted"
            />

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(249,115,22,0.25)] transition-transform hover:scale-[1.02] hover:bg-orange-600"
              >
                <span>Create BusinessVerse Profile</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition-transform hover:scale-[1.02] hover:bg-blue-700"
              >
                <span>Create CreatorVerse Profile</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
