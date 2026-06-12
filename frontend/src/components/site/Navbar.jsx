import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, Sparkles, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Home', testid: 'nav-link-home' },
    { path: '/business-verse', label: 'BusinessVerse', testid: 'nav-link-business' },
    { path: '/creator-verse', label: 'CreatorVerse', testid: 'nav-link-creator' },
    { path: '/pricing', label: 'Pricing', testid: 'nav-link-pricing' },
    { path: '/contact', label: 'Contact Us', testid: 'nav-link-contact' }
  ];

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

          <Link
            to="/search-verse"
            className="hidden min-w-[300px] max-w-[420px] flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-50/70 px-5 py-3 text-base text-slate-500 shadow-[0_3px_10px_rgba(15,23,42,0.06)] transition-all duration-200 hover:border-blue-200 hover:bg-white hover:text-slate-700 lg:flex"
            data-testid="nav-search"
          >
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <span className="truncate">Search creators, businesses, industries...</span>
          </Link>

          {/* Desktop Nav Items */}
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

          {/* Desktop Actions */}
          <div className="hidden shrink-0 items-center gap-4 md:flex">
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
          </div>

          {/* Mobile Toggle */}
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

      {/* Mobile Nav Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Drawer */}
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

        <Link
          to="/search-verse"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
        >
          <Search className="h-5 w-5 text-slate-400" />
          <span>Search creators, businesses...</span>
        </Link>

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
        </div>
      </div>
    </>
  );
};

export default Navbar;
