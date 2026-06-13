import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, Search, Sparkles, UserRound, X } from 'lucide-react';
import LoginPromptModal from '@/components/site/LoginPromptModal';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, member, adminRole, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchPromptOpen, setSearchPromptOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const dashboardPath = adminRole === 'superadmin'
    ? '/superadmin'
    : adminRole === 'admin'
      ? '/admin'
      : '/post-verse';

  const initials = useMemo(() => {
    return user?.email?.trim()?.[0]?.toUpperCase() || 'M';
  }, [user?.email]);

  const avatarUrl = member?.profile_image_url || '';

  const handleSearchClick = (event) => {
    event.preventDefault();
    setMobileMenuOpen(false);
    if (isAuthenticated) {
      navigate('/search-verse');
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
  }, [location.pathname]);

  const accountType = member?.account_type?.toLowerCase();

  const navItems = [
    { path: '/', label: 'Home', testid: 'nav-link-home' },
    // Not logged in → show both. Business user → only BusinessVerse. Creator user → only CreatorVerse.
    ...(!isAuthenticated
      ? [
          { path: '/business-verse', label: 'BusinessVerse', testid: 'nav-link-business' },
          { path: '/creator-verse', label: 'CreatorVerse', testid: 'nav-link-creator' },
        ]
      : accountType === 'business'
        ? [{ path: '/business-verse', label: 'BusinessVerse', testid: 'nav-link-business' }]
        : accountType === 'creator'
          ? [{ path: '/creator-verse', label: 'CreatorVerse', testid: 'nav-link-creator' }]
          : [
              { path: '/business-verse', label: 'BusinessVerse', testid: 'nav-link-business' },
              { path: '/creator-verse', label: 'CreatorVerse', testid: 'nav-link-creator' },
            ]),
    ...(isAuthenticated ? [{ path: '/verse-feed', label: 'VerseFeed', testid: 'nav-link-verse-feed' }] : []),
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
            onClick={() => navigate(dashboardPath)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
          >
            <LayoutDashboard className="h-4 w-4" />
            Open Dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate('/profile-verse')}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
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
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/70 shadow-sm py-3'
            : 'bg-white/95 backdrop-blur-md border-b border-transparent py-4'
        }`}
      >
        <div className="mx-auto flex max-w-[1540px] items-center justify-between gap-5 px-5 sm:px-6 lg:px-10 xl:px-12">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5"
            data-testid="nav-logo"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="relative flex h-11 w-11 items-center justify-center rounded-[14px] bg-blue-600 text-white shadow-[0_10px_22px_rgba(37,99,235,0.35)]">
              <Sparkles className="h-6 w-6" strokeWidth={2.6} />
              <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-orange-500" />
            </span>
            <span className="text-xl font-black tracking-[-0.045em] text-slate-950">
              MyIndian<span className="text-blue-600">Startup</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={handleSearchClick}
            className="hidden min-w-[300px] max-w-[420px] flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-50/70 px-5 py-3 text-base text-slate-500 shadow-[0_3px_10px_rgba(15,23,42,0.06)] transition-all duration-200 hover:border-blue-200 hover:bg-white hover:text-slate-700 lg:flex"
            data-testid="nav-search"
          >
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <span className="truncate">Search creators, businesses, industries...</span>
          </button>

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
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 w-[300px] h-full bg-white z-50 p-8 flex flex-col gap-8 shadow-2xl transition-all duration-300 ease-in-out transform md:hidden ${
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
            <span className="relative flex h-10 w-10 items-center justify-center rounded-[13px] bg-blue-600 text-white shadow-[0_10px_22px_rgba(37,99,235,0.35)]">
              <Sparkles className="h-5 w-5" strokeWidth={2.6} />
              <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-orange-500" />
            </span>
            <span className="text-lg font-black tracking-[-0.045em] text-slate-950">
              MyIndian<span className="text-blue-600">Startup</span>
            </span>
          </Link>
          <button
            className="text-slate-900 hover:text-blue-600 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
            data-testid="mobile-menu-close"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleSearchClick}
          className="flex w-full items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
        >
          <Search className="h-5 w-5 text-slate-400" />
          <span>Search creators, businesses...</span>
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
              onClick={() => navigate(dashboardPath)}
              className="mt-3 w-full rounded-full bg-blue-600 px-4 py-2.5 text-sm font-bold text-white"
            >
              Open Dashboard
            </button>
          </div>
        )}

        <div className="flex flex-col gap-6 mt-8">
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
              className="border-2 border-rose-100 bg-rose-50 text-rose-600 font-semibold rounded-full px-6 py-3 text-center transition-colors text-sm"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="border-2 border-slate-200 text-slate-900 font-semibold rounded-full px-6 py-3 hover:border-slate-900 text-center transition-colors text-sm"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-blue-600 text-white font-semibold rounded-full px-6 py-3 hover:bg-blue-700 text-center transition-colors text-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.25)]"
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
