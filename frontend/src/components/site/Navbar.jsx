import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Loader2, LogOut, Menu, Search, UserRound, X } from 'lucide-react';
import BrandLogo from '@/components/site/BrandLogo';
import LoginPromptModal from '@/components/site/LoginPromptModal';
import { apiRequest } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

const initialsFrom = (value = 'MI') => String(value)
  .split(/[.\s@_-]+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join('') || 'MI';

const VersePill = ({ type }) => (
  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] ${
    type === 'business' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
  }`}>
    {type === 'business' ? 'BusinessVerse' : 'CreatorVerse'}
  </span>
);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, member, adminRole, signOut, token } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchPromptOpen, setSearchPromptOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const searchRef = useRef(null);

  const dashboardPath = adminRole === 'superadmin'
    ? '/superadmin'
    : adminRole === 'admin'
      ? '/admin'
      : '/post-verse';
  const isAdminUser = ['admin', 'superadmin'].includes(adminRole);

  const initials = useMemo(() => {
    return user?.email?.trim()?.[0]?.toUpperCase() || 'M';
  }, [user?.email]);

  const avatarUrl = member?.profile_image_url || '';
  const activeSubscription = ['active', 'trialing', 'paid'].includes(String(member?.subscription_status || '').toLowerCase());
  const canUseLiveSearch = isAuthenticated && !isAdminUser && activeSubscription;

  const runSearchNavigation = (value = searchValue) => {
    const trimmed = value.trim();
    const searchParams = new URLSearchParams();
    if (trimmed) searchParams.set('q', trimmed);
    navigate(`/search-verse${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    setSearchOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSearchClick = (event) => {
    event.preventDefault();
    setMobileMenuOpen(false);
    if (isAdminUser) {
      navigate(dashboardPath);
      return;
    }
    if (canUseLiveSearch) {
      runSearchNavigation();
      return;
    }
    if (isAuthenticated) {
      navigate('/pricing');
      return;
    }
    setSearchPromptOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleProfile = () => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/profile-verse');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setProfileMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!canUseLiveSearch) {
      setSearchOpen(false);
      setSearchResults([]);
      setSearchError('');
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError('');
      try {
        const params = new URLSearchParams({
          type: 'all',
          q: searchValue.trim(),
          limit: '6'
        });
        const data = await apiRequest(`/api/search?${params.toString()}`, { token });
        setSearchResults(data.results || []);
      } catch (requestError) {
        setSearchResults([]);
        setSearchError(requestError.message || 'Could not search right now.');
      } finally {
        setSearchLoading(false);
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [canUseLiveSearch, searchValue, token]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!searchRef.current?.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const storedAccountType = typeof window !== 'undefined'
    ? window.localStorage.getItem('myindianstartup_account_type')
    : '';
  const accountType = String(
    member?.account_type
    || user?.user_metadata?.account_type
    || storedAccountType
    || ''
  ).toLowerCase();

  const navItems = [
    { path: '/', label: 'Home', testid: 'nav-link-home' },
    ...(isAdminUser
      ? [{ path: dashboardPath, label: 'Dashboard', testid: 'nav-link-dashboard' }]
      : !isAuthenticated
        ? [
            { path: '/business-verse', label: 'BusinessVerse', testid: 'nav-link-business' },
            { path: '/creator-verse', label: 'CreatorVerse', testid: 'nav-link-creator' }
          ]
        : accountType === 'business'
          ? [{ path: '/business-verse', label: 'BusinessVerse', testid: 'nav-link-business' }]
          : accountType === 'creator'
            ? [{ path: '/creator-verse', label: 'CreatorVerse', testid: 'nav-link-creator' }]
            : []),
    ...(isAuthenticated && !isAdminUser && activeSubscription ? [{ path: '/verse-feed', label: 'VerseFeed', testid: 'nav-link-verse-feed' }] : []),
    { path: '/pricing', label: 'Pricing', testid: 'nav-link-pricing' },
    { path: '/contact', label: 'Contact Us', testid: 'nav-link-contact' }
  ];

  const profileButton = (
    <div className="relative">
      <button
        type="button"
        onClick={() => setProfileMenuOpen((open) => !open)}
        className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-blue-600 text-sm font-black text-white shadow-[0_10px_24px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
        data-testid="nav-profile-avatar"
        aria-label="Open profile menu"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {profileMenuOpen && (
        <div className="absolute right-0 top-14 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
          <div className="px-3 py-3">
            <div className="text-sm font-black text-slate-950">{member?.full_name || user?.email}</div>
            <div className="mt-0.5 truncate text-xs font-semibold text-slate-500">{user?.email}</div>
          </div>
          <button
            type="button"
            onClick={handleProfile}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
          >
            <UserRound className="h-4 w-4" />
            Profile
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'border-b border-slate-200/70 bg-white/95 py-3 shadow-sm backdrop-blur-xl'
            : 'border-b border-transparent bg-white/95 py-4 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex max-w-[1540px] items-center justify-between gap-3 px-4 sm:gap-5 sm:px-6 lg:px-10 xl:px-12">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5"
            data-testid="nav-logo"
            onClick={() => setMobileMenuOpen(false)}
          >
            <BrandLogo
              markClassName="h-9 w-9 sm:h-11 sm:w-11"
              textClassName="text-lg text-slate-950 sm:text-xl"
            />
          </Link>

          {isAdminUser ? (
            <button
              type="button"
              onClick={handleSearchClick}
              className="hidden min-w-[300px] max-w-[420px] flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-50/70 px-5 py-3 text-base text-slate-500 shadow-[0_3px_10px_rgba(15,23,42,0.06)] transition-all duration-200 hover:border-blue-200 hover:bg-white hover:text-slate-700 lg:flex"
              data-testid="nav-search"
            >
              <LayoutDashboard className="h-5 w-5 shrink-0 text-slate-400" />
              <span className="truncate">Open admin dashboard</span>
            </button>
          ) : canUseLiveSearch ? (
            <div ref={searchRef} className="relative hidden min-w-[320px] max-w-[460px] flex-1 lg:block">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  runSearchNavigation();
                }}
                className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50/80 px-5 py-3 text-base text-slate-700 shadow-[0_3px_10px_rgba(15,23,42,0.06)] transition-all duration-200 focus-within:border-blue-300 focus-within:bg-white"
              >
                <Search className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search creators, businesses, industries..."
                  className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                  data-testid="nav-search"
                />
                {searchLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
              </form>

              {searchOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-50 overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
                  <div className="border-b border-slate-100 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    {searchValue.trim() ? 'Matching profiles' : 'Suggested profiles'}
                  </div>
                  {searchError ? (
                    <div className="px-4 py-4 text-sm font-bold text-rose-600">{searchError}</div>
                  ) : searchResults.length ? (
                    <div className="max-h-[420px] overflow-y-auto py-2">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            const params = new URLSearchParams();
                            if (searchValue.trim()) params.set('q', searchValue.trim());
                            params.set('profile', result.id);
                            if (result.accountType) params.set('type', 'all');
                            navigate(`/search-verse?${params.toString()}`);
                            setSearchOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                        >
                          <div className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl font-black ${result.accountType === 'business' ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'}`}>
                            {result.avatarUrl ? (
                              <img src={result.avatarUrl} alt={result.displayName || 'Profile'} className="h-full w-full object-cover" />
                            ) : (
                              result.initials || initialsFrom(result.displayName)
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-black text-slate-950">{result.displayName}</div>
                            <div className="mt-0.5 truncate text-xs font-semibold text-slate-500">{result.headline || 'Profile'}</div>
                            <div className="mt-1 truncate text-xs text-slate-400">{result.location || 'Location not shared'}</div>
                          </div>
                          <VersePill type={result.accountType} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-sm font-bold text-slate-500">
                      {searchValue.trim() ? 'No matching profile found.' : 'Start typing to search profiles.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSearchClick}
              className="hidden min-w-[300px] max-w-[420px] flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-50/70 px-5 py-3 text-base text-slate-500 shadow-[0_3px_10px_rgba(15,23,42,0.06)] transition-all duration-200 hover:border-blue-200 hover:bg-white hover:text-slate-700 lg:flex"
              data-testid="nav-search"
            >
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <span className="truncate">{isAuthenticated ? 'Activate membership to use search' : 'Search creators, businesses, industries...'}</span>
            </button>
          )}

          <div className="hidden items-center gap-1 xl:flex">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                data-testid={item.testid}
                className={`rounded-full px-4 py-2.5 text-base font-semibold tracking-tight transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden shrink-0 items-center gap-4 md:flex">
            {isAuthenticated ? (
              profileButton
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-base font-bold text-slate-800 transition-colors hover:text-blue-600"
                  data-testid="nav-signin"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-blue-600 px-8 py-3 text-base font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                  data-testid="nav-getstarted"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-full p-2 text-slate-900 transition-colors hover:bg-slate-100 hover:text-blue-600 xl:hidden"
            onClick={() => setMobileMenuOpen(true)}
            data-testid="mobile-menu-open"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-[360px] transform flex-col gap-6 bg-white p-6 shadow-2xl transition-all duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5"
            data-testid="mobile-nav-logo"
            onClick={() => setMobileMenuOpen(false)}
          >
            <BrandLogo markClassName="h-10 w-10" textClassName="text-lg text-slate-950" />
          </Link>
          <button
            className="text-slate-900 transition-colors hover:text-blue-600"
            onClick={() => setMobileMenuOpen(false)}
            data-testid="mobile-menu-close"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleSearchClick}
          className="flex w-full items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
        >
          {isAdminUser ? <LayoutDashboard className="h-5 w-5 text-slate-400" /> : <Search className="h-5 w-5 text-slate-400" />}
          <span>{isAdminUser ? 'Open admin dashboard' : canUseLiveSearch ? 'Open SearchVerse' : 'Search creators, businesses...'}</span>
        </button>

        {isAuthenticated && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-black text-white">
                {avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-black text-slate-950">{member?.full_name || user?.email}</div>
                <div className="truncate text-xs font-semibold text-slate-500">{member?.account_type || 'member'}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleProfile}
              className="mt-3 w-full rounded-full bg-blue-600 px-4 py-2.5 text-sm font-bold text-white"
            >
              Profile
            </button>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`mobile-${item.testid}`}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-lg font-bold transition-colors duration-200 hover:text-blue-600 ${
                location.pathname === item.path ? 'text-blue-600' : 'text-slate-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-4">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border-2 border-rose-100 bg-rose-50 px-6 py-3 text-center text-sm font-semibold text-rose-600 transition-colors"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full border-2 border-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-900 transition-colors hover:border-slate-900"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.25)] transition-colors hover:bg-blue-700"
              >
                Join Now
              </Link>
            </>
          )}
        </div>
      </div>

      <LoginPromptModal open={searchPromptOpen} onClose={() => setSearchPromptOpen(false)} />
    </>
  );
};

export default Navbar;
