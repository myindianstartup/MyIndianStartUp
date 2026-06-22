import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/apiClient';
import {
  ArrowRight,
  BarChart3,
  BadgeCheck,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Eye,
  Globe2,
  Handshake,
  IndianRupee,
  Link2,
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
      <span className={`text-[13px] font-black uppercase tracking-[0.3em] ${text}`}>
        {children}
      </span>
      <span className={`h-px w-10 bg-gradient-to-l from-transparent ${line}`} />
    </div>
  );
};

const SectionHeader = ({ title, description }) => (
  <div className="mx-auto max-w-4xl text-center">
    <h2 className="mx-auto max-w-3xl text-3xl font-semibold leading-[1.38] tracking-[-0.01em] text-slate-950 sm:text-4xl md:text-[2.65rem]">
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
    title: 'Rs 999 Annual Membership',
    description: 'Simple, transparent pricing'
  },
  {
    icon: <BadgeCheck className="h-5 w-5 text-orange-500" />,
    iconWrap: 'bg-orange-50',
    title: 'No Commission Charges',
    description: 'Keep 100% of your deals'
  },
  {
    icon: <Target className="h-5 w-5 text-blue-600" />,
    iconWrap: 'bg-blue-50',
    title: 'No Lead Purchase System',
    description: 'Connect without buying leads'
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-orange-500" />,
    iconWrap: 'bg-orange-50',
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
    icon: <Scale className="h-5 w-5 text-orange-500" />,
    iconWrap: 'bg-orange-50',
    title: 'Equal Exposure',
    description: 'No feed domination'
  }
];

const connectionPreviewCards = [
  {
    role: 'Chef Consultant',
    business: 'Hospitality Founder',
    action: 'Plan a food venture',
    detail: 'Menu, operations and brand experience',
    image: '/assets/collaboration/chef-partnership.webp',
    imagePosition: 'center 42%'
  },
  {
    role: 'Business Consultant',
    business: 'Startup Founder',
    action: 'Shape the next move',
    detail: 'Strategy, planning and market direction',
    image: '/assets/collaboration/business-consulting.webp',
    imagePosition: 'center 44%'
  },
  {
    role: 'Civil Engineer',
    business: 'Construction Owner',
    action: 'Build with confidence',
    detail: 'Project planning and technical support',
    image: '/assets/collaboration/construction-partnership.webp',
    imagePosition: 'center 40%'
  },
  {
    role: 'Business Advisor',
    business: 'Local Business Owner',
    action: 'Grow the business',
    detail: 'Practical guidance for local expansion',
    image: '/assets/collaboration/local-business-growth.webp',
    imagePosition: 'center 42%'
  },
  {
    role: 'Product Photographer',
    business: 'Jewellery Brand',
    action: 'Create a campaign',
    detail: 'Product stories and premium visuals',
    image: '/assets/collaboration/jewellery-photography.webp',
    imagePosition: 'center 44%'
  },
  {
    role: 'Fashion Photographer',
    business: 'Lifestyle Brand',
    action: 'Plan the next shoot',
    detail: 'Fashion content and campaign production',
    image: '/assets/collaboration/fashion-campaign.webp',
    imagePosition: 'center 40%'
  },
  {
    role: 'Architect',
    business: 'Real Estate Business',
    action: 'Design the opportunity',
    detail: 'Architecture, spaces and project vision',
    image: '/assets/collaboration/architecture-partnership.webp',
    imagePosition: 'center 42%'
  },
  {
    role: 'Software Developer',
    business: 'Tech Business Owner',
    action: 'Build the product',
    detail: 'Web products, automation and workflows',
    image: '/assets/collaboration/technology-partnership.webp',
    imagePosition: 'center 40%'
  },
  {
    role: 'Growth Consultant',
    business: 'SME Founder',
    action: 'Scale with clarity',
    detail: 'Growth planning and performance insights',
    image: '/assets/collaboration/growth-advisory.webp',
    imagePosition: 'center 42%'
  },
  {
    role: 'Brand Strategist',
    business: 'Creative Professional',
    action: 'Launch together',
    detail: 'Brand positioning and creative direction',
    image: '/assets/collaboration/creative-business.webp',
    imagePosition: 'center 42%'
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

const snapshotTabs = [
  { id: 'overview', label: 'Overview', icon: Circle },
  { id: 'collabs', label: 'Collabs', icon: Link2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 }
];

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
    title: 'Collaborate and grow',
    copy: 'From startups and local businesses to creators and industry professionals, succeed together beyond boundaries.'
  }
];

const coverageStats = [
  { value: 20000, suffix: '+', label: 'Projects', compact: true },
  { value: 180, suffix: '+', label: 'Cities' },
  { value: 12400, label: 'Active members', compact: true, precision: 1 }
];

const coverageRegions = [
  {
    title: 'North and West',
    tone: 'blue',
    cities: ['Delhi NCR', 'Ahmedabad', 'Jaipur', 'Mumbai']
  },
  {
    title: 'South growth corridor',
    tone: 'orange',
    cities: ['Bengaluru', 'Hyderabad', 'Chennai', 'Kochi']
  },
  {
    title: 'East and remote-ready',
    tone: 'blue',
    cities: ['Kolkata', 'Bhubaneswar', 'Guwahati', 'Remote collaboration']
  }
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

const HeroTrustStats = ({ stats, className = '' }) => (
  <div className={className}>
    <div className="flex flex-col items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:rounded-full">
      <div className="flex -space-x-2">
        {(stats.memberPreview?.length ? stats.memberPreview : []).map((person, index) => (
          <span
            key={person.id || `${person.initials}-${index}`}
            className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-white text-[10px] font-black text-white shadow-sm ${
              ['bg-orange-500', 'bg-blue-600', 'bg-orange-400', 'bg-blue-500', 'bg-orange-600'][index % 5]
            }`}
            title={person.name}
          >
            {person.avatarUrl ? (
              <img src={person.avatarUrl} alt={person.name} className="h-full w-full object-cover" />
            ) : (
              person.initials
            )}
          </span>
        ))}
      </div>
      <div className="text-sm font-semibold text-slate-600">
        Trusted by businesses, creators, freelancers, and professionals across India.
      </div>
    </div>

    <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-3">
      {[
        [stats.totalMembers, 'Members'],
        [stats.statesActive, 'States active'],
        [stats.publishedPosts, 'Published posts']
      ].map(([value, label, compact]) => (
        <div key={label} className="min-w-0 rounded-2xl border border-slate-200 bg-white px-3 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:rounded-3xl sm:p-5">
          <div className="text-xl font-black tabular-nums tracking-tight text-slate-950 sm:text-2xl">
            <AnimatedStat value={Number(value) || 0} compact={compact} />
          </div>
          <div className="mt-1 text-[9px] font-bold uppercase leading-4 tracking-[0.16em] text-slate-400 sm:text-[11px] sm:tracking-[0.22em]">{label}</div>
        </div>
      ))}
    </div>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, member, adminRole, token } = useAuth();
  const [activeConnectionIndex, setActiveConnectionIndex] = useState(0);
  const [connectionCarouselPaused, setConnectionCarouselPaused] = useState(false);
  const connectionTouchStartX = useRef(null);
  const [activeSnapshotTab, setActiveSnapshotTab] = useState('overview');
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotData, setSnapshotData] = useState({
    analytics: null,
    history: [],
    connections: null,
    settings: null
  });
  const [homepageStats, setHomepageStats] = useState({
    totalMembers: 0,
    businessProfiles: 0,
    creatorProfiles: 0,
    statesActive: 0,
    publishedPosts: 0,
    memberPreview: []
  });

  useEffect(() => {
    let cancelled = false;

    const loadHomepageStats = async () => {
      try {
        const payload = await apiRequest('/api/public/stats');
        if (!cancelled) {
          setHomepageStats((current) => ({ ...current, ...(payload.stats || {}) }));
        }
      } catch {
        if (!cancelled) {
          setHomepageStats({
            totalMembers: 0,
            businessProfiles: 0,
            creatorProfiles: 0,
            statesActive: 0,
            publishedPosts: 0
          });
        }
      }
    };

    loadHomepageStats();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    let cancelled = false;

    const loadSnapshotData = async () => {
      setSnapshotLoading(true);
      try {
        const [overviewResult, connectionResult, settingsResult] = await Promise.allSettled([
          apiRequest('/api/posts/overview', { token }),
          apiRequest('/api/posts/connections', { token }),
          apiRequest('/api/members/settings', { token })
        ]);

        if (cancelled) return;

        setSnapshotData({
          analytics: overviewResult.status === 'fulfilled' ? overviewResult.value.analytics || null : null,
          history: overviewResult.status === 'fulfilled' ? overviewResult.value.history || [] : [],
          connections: connectionResult.status === 'fulfilled' ? connectionResult.value : null,
          settings: settingsResult.status === 'fulfilled' ? settingsResult.value.settings || null : null
        });
      } finally {
        if (!cancelled) setSnapshotLoading(false);
      }
    };

    loadSnapshotData();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (connectionCarouselPaused || typeof window === 'undefined') return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const timer = window.setInterval(() => {
      setActiveConnectionIndex((current) => (current + 1) % connectionPreviewCards.length);
    }, 4800);

    return () => window.clearInterval(timer);
  }, [connectionCarouselPaused]);

  const publishedHistory = snapshotData.history || [];
  const nextConnectionCard = () => setActiveConnectionIndex((current) => (current + 1) % connectionPreviewCards.length);
  const previousConnectionCard = () => setActiveConnectionIndex((current) => (current - 1 + connectionPreviewCards.length) % connectionPreviewCards.length);
  const getConnectionCardOffset = (index) => {
    const total = connectionPreviewCards.length;
    let offset = (index - activeConnectionIndex + total) % total;
    if (offset > total / 2) offset -= total;
    return offset;
  };
  const handleConnectionTouchStart = (event) => {
    connectionTouchStartX.current = event.touches[0]?.clientX ?? null;
  };
  const handleConnectionTouchEnd = (event) => {
    if (connectionTouchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? connectionTouchStartX.current;
    const delta = endX - connectionTouchStartX.current;
    connectionTouchStartX.current = null;

    if (Math.abs(delta) < 48) return;
    if (delta > 0) previousConnectionCard();
    else nextConnectionCard();
  };
  const connectionStats = snapshotData.connections?.stats || { following: 0, followers: 0 };
  const totalConnections = connectionStats.following + connectionStats.followers;
  const settingsNotifications = snapshotData.settings?.notifications || {};
  const enabledNotificationCount = Object.values(settingsNotifications).filter(Boolean).length;
  const profileStrength = snapshotData.analytics?.profileCompletion || 82;
  const chartSeries = publishedHistory.length
    ? {
        primary: publishedHistory.slice(0, 6).reverse().map((entry, index, items) => {
          const maxViews = Math.max(...items.map((item) => item.views || 0), 1);
          const x = 18 + (index * (294 / Math.max(items.length - 1, 1)));
          const y = 104 - Math.round(((entry.views || 0) / maxViews) * 74);
          return [Math.round(x), y];
        }),
        secondary: publishedHistory.slice(0, 6).reverse().map((entry, index, items) => {
          const maxInquiries = Math.max(...items.map((item) => item.inquiries || 0), 1);
          const x = 18 + (index * (294 / Math.max(items.length - 1, 1)));
          const y = 104 - Math.round(((entry.inquiries || 0) / maxInquiries) * 74);
          return [Math.round(x), y];
        }),
        primaryLabel: 'Views',
        secondaryLabel: 'Inquiries'
      }
    : {
        primary: growthTrend.business,
        secondary: growthTrend.creator,
        primaryLabel: 'Business',
        secondaryLabel: 'Creator'
      };

  const snapshotCardsByTab = {
    overview: [
      {
        eyebrow: 'Active profile',
        value: `${profileStrength}%`,
        detail: 'profile complete',
        tone: 'bg-blue-600 text-white shadow-lg md:col-span-2',
        eyebrowTone: 'text-blue-100',
        detailTone: 'text-blue-100',
        icon: <BadgeCheck className="h-3.5 w-3.5" />
      },
      {
        eyebrow: 'Workspace',
        value: isAuthenticated ? `${snapshotData.analytics?.postsPublished || 0}` : '24',
        detail: isAuthenticated ? 'posts published' : 'projects live',
        tone: 'bg-gradient-to-br from-orange-100 to-orange-50 md:col-span-2',
        eyebrowTone: 'text-orange-600',
        detailTone: 'text-slate-500'
      }
    ],
    collabs: [
      {
        eyebrow: 'Connections',
        value: `${isAuthenticated ? totalConnections : 18}`,
        detail: isAuthenticated ? 'people in your network' : 'collabs ready',
        tone: 'bg-blue-600 text-white shadow-lg md:col-span-2',
        eyebrowTone: 'text-blue-100',
        detailTone: 'text-blue-100',
        icon: <Users className="h-3.5 w-3.5" />
      },
      {
        eyebrow: 'Following',
        value: `${isAuthenticated ? connectionStats.following : 9}`,
        detail: isAuthenticated ? 'profiles you connected' : 'brands and creators',
        tone: 'bg-gradient-to-br from-orange-100 to-orange-50 md:col-span-2',
        eyebrowTone: 'text-orange-600',
        detailTone: 'text-slate-500'
      }
    ],
    analytics: [
      {
        eyebrow: 'Total views',
        value: `${isAuthenticated ? snapshotData.analytics?.totalViews || 0 : 12480}`,
        detail: isAuthenticated ? 'across your published posts' : 'monthly reach preview',
        tone: 'bg-blue-600 text-white shadow-lg md:col-span-2',
        eyebrowTone: 'text-blue-100',
        detailTone: 'text-blue-100',
        icon: <BarChart3 className="h-3.5 w-3.5" />
      },
      {
        eyebrow: 'Inquiries',
        value: `${isAuthenticated ? snapshotData.analytics?.totalInquiries || 0 : 42}`,
        detail: isAuthenticated ? 'direct responses recorded' : 'collaboration responses',
        tone: 'bg-gradient-to-br from-orange-100 to-orange-50 md:col-span-2',
        eyebrowTone: 'text-orange-600',
        detailTone: 'text-slate-500'
      }
    ]
  };

  const snapshotMetaByTab = {
    overview: {
      title: 'Growth overview',
      primaryLabel: chartSeries.primaryLabel,
      secondaryLabel: chartSeries.secondaryLabel
    },
    collabs: {
      title: 'Recent collaboration signals',
      primaryLabel: 'Followers',
      secondaryLabel: 'Following'
    },
    analytics: {
      title: 'Performance analytics',
      primaryLabel: chartSeries.primaryLabel,
      secondaryLabel: chartSeries.secondaryLabel
    }
  };

  const collabHighlights = isAuthenticated
    ? [
        `${connectionStats.followers} members connected with you`,
        `${connectionStats.following} profiles you already follow`,
        totalConnections ? 'Open VerseFeed to continue conversations' : 'Start connecting to build your network'
      ]
    : [
        'Connect with businesses and creators',
        'Build your visible collaboration network',
        'Keep every opportunity in one place'
      ];

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

        .hero-word-swap {
          display: inline-flex;
          flex-direction: column;
          height: 2.05em;
          overflow: hidden;
          vertical-align: top;
        }

        .hero-word-swap-track {
          animation: heroWordSwap 5.6s ease-in-out infinite;
        }

        .hero-word-swap-frame {
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 2.05em;
          line-height: 0.92;
        }

        .fair-cycle-ring {
          animation: fairCycleRing 3.6s ease-in-out infinite;
        }

        .connection-stack-card {
          will-change: transform, opacity;
        }

        .connection-stack-card.is-active .connection-card-photo {
          animation: connectionPhotoDrift 6.5s ease-in-out infinite alternate;
        }

        .connection-card-sheen {
          animation: connectionSheen 5.8s ease-in-out infinite;
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

        @keyframes heroWordSwap {
          0%, 42% { transform: translateY(0); }
          50%, 92% { transform: translateY(-2.05em); }
          100% { transform: translateY(0); }
        }

        @keyframes fairCycleRing {
          0%, 100% {
            transform: scale(1);
            opacity: 0.55;
            box-shadow: 0 0 0 0 rgba(37,99,235,0.12);
          }
          50% {
            transform: scale(1.08);
            opacity: 0.9;
            box-shadow: 0 0 0 12px rgba(249,115,22,0.04);
          }
        }

        @keyframes connectionPhotoDrift {
          from { transform: scale(1.01) translate3d(0, 0, 0); }
          to { transform: scale(1.055) translate3d(0, -0.8%, 0); }
        }

        @keyframes connectionSheen {
          0%, 68% { transform: translateX(-135%) skewX(-18deg); opacity: 0; }
          76% { opacity: 0.22; }
          94%, 100% { transform: translateX(170%) skewX(-18deg); opacity: 0; }
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
          .visibility-orbit-dot,
          .fair-cycle-ring,
          .hero-word-swap-track,
          .connection-stack-card.is-active .connection-card-photo,
          .connection-card-sheen {
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

        @media (min-width: 640px) {
          .value-grid-row-left {
            animation: valueGridRowLeft 5.5s ease-in-out infinite alternate;
          }

          .value-grid-row-right {
            animation: valueGridRowRight 5.5s ease-in-out infinite alternate;
          }
        }

        @keyframes valueGridRowLeft {
          from { transform: translateX(10px); }
          to { transform: translateX(-10px); }
        }

        @keyframes valueGridRowRight {
          from { transform: translateX(-10px); }
          to { transform: translateX(10px); }
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

        @media (prefers-reduced-motion: reduce) {
          .verse-choice-card,
          .verse-pill,
          .verse-card-cta svg {
            transition: none;
            animation: none;
          }

          .verse-choice-card:hover,
          .verse-choice-card:hover .verse-pill,
          .verse-choice-card:hover .verse-card-cta svg,
          .value-highlight-track,
          .value-grid-row-left,
          .value-grid-row-right {
            transform: none;
            animation: none;
          }
        }
      `}</style>
      <section className="relative overflow-hidden pb-12 pt-[7.75rem] sm:pt-24 md:pb-20 md:pt-28">
        <div className="absolute inset-x-0 top-0 h-[760px] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.09),transparent_35%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_28%)] pointer-events-none" />
        <div className="absolute -top-24 right-[-8rem] h-[26rem] w-[26rem] rounded-full bg-blue-500/5 blur-[110px] pointer-events-none" />
        <div className="absolute top-48 left-[-8rem] h-[24rem] w-[24rem] rounded-full bg-orange-500/5 blur-[110px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-16">
            <div className="lg:col-span-6">
              <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 rounded-2xl border border-orange-100 bg-orange-50/80 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-slate-800 sm:rounded-full sm:px-3 sm:py-1 sm:text-[10px] sm:tracking-[0.28em]">
                <span className="h-2 w-2 rounded-full bg-slate-700" />
                <span>
                  India-first <span className="text-orange-600">Business</span>
                </span>
                <img
                  src="/assets/handshake-brand.png"
                  alt=""
                  aria-hidden="true"
                  className="h-4 w-5 object-contain"
                />
                <span>
                  <span className="text-blue-600">Creator</span> Platform
                </span>
              </div>

              <h1 className="mt-5 max-w-xl text-[2.7rem] font-black leading-[0.94] tracking-[-0.05em] text-slate-950 sm:text-5xl md:text-6xl">
                India&apos;s Biggest{' '}
                <span className="hero-word-swap">
                  <span className="hero-word-swap-track">
                    <span className="hero-word-swap-frame">
                      <span className="text-blue-600">Creator</span>
                      <span><span className="text-slate-950">&amp;</span> <span className="text-orange-500">Business</span></span>
                    </span>
                    <span className="hero-word-swap-frame">
                      <span className="text-orange-500">Business</span>
                      <span><span className="text-slate-950">&amp;</span> <span className="text-blue-600">Creator</span></span>
                    </span>
                  </span>
                </span>{' '}
                Collaboration Platform
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-700 md:text-lg">
                Build your presence, showcase your work, publish daily updates, and connect with opportunities across India whether you&apos;re a business looking for creators or a creator looking for opportunities.
              </p>

              <div className="mt-7 flex flex-wrap gap-4">
                {!isAuthenticated ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        if (adminRole === 'superadmin') navigate('/superadmin');
                        else if (adminRole === 'admin') navigate('/admin');
                        else if (member?.account_type === 'business') navigate('/business-verse');
                        else if (member?.account_type === 'creator') navigate('/creator-verse');
                        else navigate('/profile-verse');
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(249,115,22,0.25)] transition-transform hover:scale-[1.02] hover:bg-orange-600"
                      data-testid="hero-cta-business"
                    >
                      <span>
                        {adminRole === 'superadmin'
                          ? 'SuperAdmin Dashboard'
                          : adminRole === 'admin'
                          ? 'Admin Dashboard'
                          : member?.account_type
                          ? `Go to ${member.account_type === 'business' ? 'BusinessVerse' : 'CreatorVerse'}`
                          : 'Complete Your Profile'}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    {!adminRole && (
                      <button
                        onClick={() => navigate('/post-verse')}
                        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition-transform hover:scale-[1.02] hover:bg-blue-700"
                      >
                        <span>Go to PostVerse Feed</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
              </div>

              <HeroTrustStats stats={homepageStats} className="mt-6 hidden lg:block" />
            </div>

            <div className="lg:col-span-6 lg:-mt-1 xl:-mt-1">
              <div className="relative z-0 mx-auto mb-8 max-w-[590px] lg:ml-auto">
                <div
                  className="connection-stage relative min-h-[350px] touch-pan-y overflow-visible px-3 py-1 sm:min-h-[420px] sm:px-7"
                  onMouseEnter={() => setConnectionCarouselPaused(true)}
                  onMouseLeave={() => setConnectionCarouselPaused(false)}
                  onFocusCapture={() => setConnectionCarouselPaused(true)}
                  onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setConnectionCarouselPaused(false);
                  }}
                  onTouchStart={handleConnectionTouchStart}
                  onTouchEnd={handleConnectionTouchEnd}
                  aria-label="Business and creator collaboration stories"
                >
                  <button
                    type="button"
                    onClick={previousConnectionCard}
                    aria-label="Previous collaboration story"
                    className="absolute left-5 top-[46%] z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-slate-950/70 text-white shadow-xl backdrop-blur transition-colors hover:bg-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-200"
                  >
                    <ArrowRight className="h-5 w-5 rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={nextConnectionCard}
                    aria-label="Next collaboration story"
                    className="absolute right-5 top-[46%] z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-slate-950/70 text-white shadow-xl backdrop-blur transition-colors hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  <div className="relative mx-auto h-[330px] max-w-[500px] sm:h-[400px]">
                    {connectionPreviewCards.map((card, index) => {
                      const offset = getConnectionCardOffset(index);
                      const distance = Math.abs(offset);
                      const visible = distance <= 2;
                      const translateX = offset * 66;
                      const scale = 1 - distance * 0.065;
                      const isActive = offset === 0;

                      return (
                        <div
                          key={card.role}
                          onClick={() => setActiveConnectionIndex(index)}
                          onKeyDown={(event) => {
                            if (!isActive && (event.key === 'Enter' || event.key === ' ')) {
                              event.preventDefault();
                              setActiveConnectionIndex(index);
                            }
                          }}
                          role={!isActive ? 'button' : undefined}
                          tabIndex={!isActive ? 0 : -1}
                          aria-label={`${card.role} with ${card.business}`}
                          aria-current={isActive ? 'true' : undefined}
                          className={`connection-stack-card ${isActive ? 'is-active cursor-default' : 'cursor-pointer'} absolute left-1/2 top-[47%] h-[315px] w-[68%] max-w-[294px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.4rem] border-[3px] border-white bg-white text-left shadow-[0_24px_62px_rgba(15,23,42,0.24)] transition-all duration-700 ease-out sm:h-[380px] sm:w-[62%] sm:max-w-[310px]`}
                          style={{
                            transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
                            zIndex: 30 - distance,
                            opacity: visible ? 1 : 0,
                            pointerEvents: visible ? 'auto' : 'none',
                            boxShadow: isActive
                              ? '0 24px 62px rgba(15, 23, 42, 0.24)'
                              : '0 10px 26px rgba(15, 23, 42, 0.12)'
                          }}
                        >
                          <img
                            src={card.image}
                            alt={`${card.role} connecting with ${card.business}`}
                            className="connection-card-photo absolute inset-0 h-full w-full object-cover"
                            style={{ objectPosition: card.imagePosition }}
                            loading={isActive ? 'eager' : 'lazy'}
                            fetchPriority={isActive ? 'high' : 'auto'}
                            draggable={false}
                          />
                          <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-slate-950 via-slate-950/72 to-transparent" />
                          <div className="connection-card-sheen pointer-events-none absolute inset-y-0 left-[-35%] w-24 bg-white/35 blur-xl" />

                          <div className="absolute inset-x-0 bottom-0 p-4 text-center text-white sm:p-5">
                            <h2 className="text-xl font-black leading-tight tracking-[-0.02em] drop-shadow sm:text-2xl">{card.role}</h2>
                            <div className="mt-1 text-sm font-bold text-orange-200 sm:text-base">with {card.business}</div>
                            <p className="mx-auto mt-2 max-w-[16rem] text-[11px] font-medium leading-4 text-white/75 sm:text-xs">{card.detail}</p>
                            {!isAuthenticated && (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  navigate('/signup');
                                }}
                                className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black text-slate-950 shadow-xl transition-transform hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-white/40 sm:text-xs"
                              >
                                Start collaborating
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>

              <HeroTrustStats stats={homepageStats} className="mx-auto mt-8 max-w-[590px] lg:hidden" />

              <div className="mx-auto mt-8 max-w-[620px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.11)] lg:ml-auto">
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
                    <div className="flex flex-wrap gap-1.5 lg:flex-col">
                      {snapshotTabs.map(({ id, label, icon: Icon }) => {
                        const active = activeSnapshotTab === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setActiveSnapshotTab(id)}
                            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold transition-colors ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-white hover:text-slate-700'}`}
                          >
                            <Icon className={`h-3.5 w-3.5 ${active ? 'fill-current text-blue-600' : 'text-slate-300'}`} />
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 lg:col-span-8">
                    {snapshotLoading ? (
                      <div className="flex min-h-[220px] items-center justify-center rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 text-center text-sm font-bold text-slate-500 sm:min-h-[280px]">
                        Loading workspace snapshot...
                      </div>
                    ) : (
                      <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {snapshotCardsByTab[activeSnapshotTab].map((card) => (
                        <div key={card.eyebrow} className={`rounded-[1.25rem] p-4 shadow-sm ${card.tone}`}>
                          <div className={`flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] ${card.eyebrowTone}`}>
                            <span>{card.eyebrow}</span>
                            {card.icon || null}
                          </div>
                          <div className="mt-4 text-2xl font-black tracking-tight text-current">{card.value}</div>
                          <div className={`mt-1 text-[11px] font-semibold ${card.detailTone}`}>{card.detail}</div>
                        </div>
                      ))}
                    </div>

                      <div className="mt-3 rounded-[1.25rem] border border-slate-200 p-4">
                      <div className="flex flex-col gap-2 text-sm font-bold text-slate-800 sm:flex-row sm:items-center sm:justify-between">
                        <span>{snapshotMetaByTab[activeSnapshotTab].title}</span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <span className="h-2 w-2 rounded-full bg-orange-500" /> {snapshotMetaByTab[activeSnapshotTab].secondaryLabel}
                          <span className="ml-2 h-2 w-2 rounded-full bg-blue-600" /> {snapshotMetaByTab[activeSnapshotTab].primaryLabel}
                        </span>
                      </div>
                      {activeSnapshotTab === 'collabs' ? (
                        <div className="mt-4 space-y-3 rounded-2xl bg-gradient-to-b from-slate-50 to-white p-4">
                          {collabHighlights.map((item) => (
                            <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                              <Users className="mt-0.5 h-4 w-4 text-orange-500" />
                              <span className="text-sm font-semibold leading-6 text-slate-600">{item}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                      <div className="mt-4 h-28 overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 to-white px-2 py-3">
                        <svg viewBox="0 0 330 120" className="h-full w-full" role="img" aria-label="Dashboard trend chart">
                          <defs>
                            <linearGradient id="secondaryTrendFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f97316" stopOpacity="0.18" />
                              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="primaryTrendFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.16" />
                              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {[28, 56, 84].map((y) => (
                            <line key={y} x1="12" y1={y} x2="318" y2={y} stroke="#e2e8f0" strokeDasharray="4 7" strokeWidth="1" />
                          ))}
                          <path d={`${chartPath(chartSeries.primary)} L 312 112 L 18 112 Z`} fill="url(#primaryTrendFill)" />
                          <path d={`${chartPath(chartSeries.secondary)} L 312 112 L 18 112 Z`} fill="url(#secondaryTrendFill)" />
                          <path d={chartPath(chartSeries.secondary)} fill="none" stroke="#f97316" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
                          <path d={chartPath(chartSeries.primary)} fill="none" stroke="#2563eb" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
                          {chartSeries.secondary.map(([x, y], index) => (
                            <g key={`secondary-${index}`} className="transition-transform duration-300 hover:-translate-y-1">
                              <circle cx={x} cy={y} r="5" fill="#f97316" />
                              <circle cx={x} cy={y} r="9" fill="#f97316" opacity="0.12" />
                            </g>
                          ))}
                          {chartSeries.primary.map(([x, y], index) => (
                            <g key={`primary-${index}`} className="transition-transform duration-300 hover:-translate-y-1">
                              <circle cx={x} cy={y} r="5" fill="#2563eb" />
                              <circle cx={x} cy={y} r="9" fill="#2563eb" opacity="0.12" />
                            </g>
                          ))}
                        </svg>
                      </div>
                      )}
                    </div>
                    </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
          <div className="value-highlight-marquee overflow-hidden rounded-[1.75rem] border border-blue-100 bg-white shadow-[0_18px_55px_rgba(37,99,235,0.09)]">
            <div className="value-highlight-track flex">
              {[...valueHighlights, ...valueHighlights].map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="value-highlight-item flex min-w-[280px] items-center gap-4 border-r border-slate-100 px-5 py-6 sm:min-w-[340px] sm:gap-5 sm:px-8 sm:py-7 md:min-w-[380px]"
                >
                  <div className={`value-highlight-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] sm:h-16 sm:w-16 sm:rounded-[1.35rem] ${item.iconWrap}`}>
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
            title="How It Works"
            description="Three simple steps to build visibility, publish daily, and connect directly across India."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-3 md:items-stretch">
            {stepCards.map((step) => {
              const to = (step.number === '01' && isAuthenticated) ? '/profile-verse' : step.to;
              const action = (step.number === '01' && isAuthenticated) ? 'Continue setup' : step.action;
              return (
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
                    onClick={() => navigate(to)}
                    className="mt-6 inline-flex items-center gap-1 self-start rounded-full px-0 text-sm font-semibold text-slate-900 transition-all hover:gap-2 hover:text-blue-600"
                  >
                    <span>{action}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f8fafc] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionHeader
            title="Choose The Right Verse For Your Growth"
            description="One platform, two focused spaces for businesses and creators to build visibility and direct connections."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="verse-choice-card business rounded-[2rem] border border-orange-100 bg-[linear-gradient(180deg,rgba(255,247,237,0.9),rgba(255,255,255,0.98))] p-8 text-slate-950 shadow-[0_20px_60px_rgba(249,115,22,0.07)] md:p-10">
            <SectionEyebrow accent="orange">For BusinessVerse</SectionEyebrow>
            <h3 className="mt-4 text-xl font-semibold leading-[1.22] tracking-[-0.01em] sm:text-2xl">
              Find The Right Talent For Your Business. Connect with them.
            </h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              List your business, gain daily visibility, discover creators, and collaborate directly across India.
            </p>

            <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
              {businessBullets.map((bullet) => (
                <div key={bullet} className="verse-pill flex items-center gap-2.5 rounded-xl border border-orange-100 bg-white/75 px-3.5 py-2.5 text-[13px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
                  <Check className="h-3.5 w-3.5 text-orange-500" />
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
            <h3 className="mt-4 text-xl font-semibold leading-[1.22] tracking-[-0.01em] text-slate-950 sm:text-2xl">
              Get Discovered By Businesses Across India
            </h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              Build your professional profile, showcase your portfolio, and connect with businesses looking for your talent.
            </p>

            <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
              {creatorBullets.map((bullet) => (
                <div key={bullet} className="verse-pill flex items-center gap-2.5 rounded-xl border border-blue-100 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-slate-700 shadow-sm">
                  <Check className="h-3.5 w-3.5 text-blue-600" />
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
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:px-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-orange-50/50 via-white to-blue-50/70 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.08)] sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[12px] font-black uppercase tracking-[0.24em] text-orange-500">24-hour rule</div>
                <h3 className="mt-2 text-[1.7rem] font-black leading-tight text-slate-950">One fair posting cycle</h3>
              </div>
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                <span className="fair-cycle-ring absolute inset-1 rounded-full border border-orange-100 bg-orange-50/40" />
                <div className="relative flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-blue-100 bg-white text-blue-600 shadow-[0_14px_35px_rgba(37,99,235,0.12)]">
                  <span className="text-3xl font-black leading-none">24</span>
                  <span className="mt-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">hours</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {[
                ['01', 'Create one post', 'Upload one image or video from your BusinessVerse or CreatorVerse profile.', 'border-orange-100 bg-orange-50 text-orange-600'],
                ['02', 'Get discovered in VerseFeed', 'Members can see your update, open your profile, and connect with you.', 'border-blue-100 bg-blue-50 text-blue-600'],
                ['03', 'Post again after reset', 'Your next post slot opens after 24 hours, keeping visibility equal for everyone.', 'border-slate-200 bg-slate-50 text-slate-700']
              ].map(([step, title, text, tone], index) => (
                <div key={title} className="relative rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
                  {index < 2 && <div className="absolute left-[2.35rem] top-[4.9rem] h-5 w-px bg-slate-200" />}
                  <div className="flex gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${tone} text-sm font-black shadow-sm`}>
                      {step}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-950">{title}</h4>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                ['1', 'post/day'],
                ['24h', 'reset'],
                ['0', 'paid boosts']
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center">
                  <div className="text-xl font-black text-slate-950">{value}</div>
                  <div className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="max-w-2xl text-3xl font-semibold leading-[1.38] tracking-[-0.01em] text-slate-950 sm:text-4xl md:text-[2.65rem]">
              How Fair Visibility Works
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] font-normal leading-7 text-slate-600 sm:text-base">
              Every member gets one post slot every 24 hours. This keeps VerseFeed balanced, so businesses and creators can be discovered without paid boosts or feed domination.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                [Clock3, 'One daily post slot', 'Each account can publish one image or video during each 24-hour cycle.', 'orange'],
                [Scale, 'Equal discovery chance', 'BusinessVerse and CreatorVerse members follow the same visibility rule.', 'blue'],
                [Eye, 'Cleaner VerseFeed', 'The feed stays easy to browse because no account can flood it with posts.', 'blue'],
                [ShieldCheck, 'Membership-first access', 'Only active members can use posting and discovery features fully.', 'orange']
              ].map(([Icon, title, text, tone]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tone === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
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
            title="Visibility, discovery, and collaboration in one platform."
            description={(
              <>
                Most platforms focus on either networking, freelancing, or social media.{' '}
                <span className="font-bold text-orange-500">MyIndian</span><span className="font-bold text-blue-600">Startup</span>{' '}
                combines all three in one place.
              </>
            )}
          />

          <div className="mx-auto mt-8 max-w-3xl rounded-[1.5rem] border border-orange-100 bg-gradient-to-r from-orange-50/80 via-white to-blue-50/80 px-6 py-5 text-center shadow-sm">
            <p className="text-[15px] font-semibold leading-7 text-slate-800">
              Direct deals, no middlemen - businesses and creators connect directly and keep 100% of their agreed project value.
            </p>
          </div>

          <div className="mt-10 overflow-hidden px-3 py-1">
            {[valueHighlights.slice(0, 4), valueHighlights.slice(4)].map((row, rowIndex) => (
              <div
                key={rowIndex === 0 ? 'value-row-one' : 'value-row-two'}
                className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${rowIndex === 0 ? 'value-grid-row-left' : 'value-grid-row-right mt-4'}`}
              >
                {row.map((item) => (
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
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionHeader
            title="Built For Businesses And Creators Across India"
            description="Choose your path: BusinessVerse or CreatorVerse."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <div className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50/80 to-white p-7 shadow-sm md:p-8">
              <SectionEyebrow accent="orange" className="[&>span:nth-child(2)]:text-[15px]">BusinessVerse</SectionEyebrow>
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
              <SectionEyebrow accent="blue" className="[&>span:nth-child(2)]:text-[15px]">CreatorVerse</SectionEyebrow>
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
            title="Built for collaboration across cities, industries, and remote teams."
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

        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionHeader
            title="Simple. Transparent. Affordable."
            description="At MyIndianStartup, we believe in direct and transparent connections. Your membership includes access to either BusinessVerse or CreatorVerse."
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
              <div className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-[12px] font-black uppercase tracking-[0.22em] text-slate-950 shadow-[0_12px_30px_rgba(15,23,42,0.10)] ring-4 ring-blue-50">
                No Additional Charges
              </div>
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
              title="Ready To Build Connections Across India?"
              description="Join thousands of businesses and creators building visibility and opportunities."
            />

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {!isAuthenticated ? (
                <>
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
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      if (adminRole === 'superadmin') navigate('/superadmin');
                      else if (adminRole === 'admin') navigate('/admin');
                      else if (member?.account_type === 'business') navigate('/business-verse');
                      else if (member?.account_type === 'creator') navigate('/creator-verse');
                      else navigate('/profile-verse');
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(249,115,22,0.25)] transition-transform hover:scale-[1.02] hover:bg-orange-600"
                  >
                    <span>
                      {adminRole === 'superadmin'
                        ? 'SuperAdmin Dashboard'
                        : adminRole === 'admin'
                        ? 'Admin Dashboard'
                        : member?.account_type
                        ? `Go to ${member.account_type === 'business' ? 'BusinessVerse' : 'CreatorVerse'}`
                        : 'Complete Your Profile'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  {!adminRole && (
                    <button
                      onClick={() => navigate('/post-verse')}
                      className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition-transform hover:scale-[1.02] hover:bg-blue-700"
                    >
                      <span>Go to PostVerse Feed</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
