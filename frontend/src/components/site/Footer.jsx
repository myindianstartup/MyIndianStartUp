import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import BrandLogo from '@/components/site/BrandLogo';

const platformLinks = [
  { label: 'BusinessVerse', to: '/business-verse' },
  { label: 'CreatorVerse', to: '/creator-verse' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Login', to: '/login' },
  { label: 'Sign Up', to: '/signup' },
  { label: 'Platform Map', to: '/platform' }
];

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Pricing Policy', to: '/pricing-policy' },
  { label: 'Terms and Condition', to: '/terms-and-conditions' },
  { label: 'Community Guidelines', to: '/community-guidelines' },
  { label: 'Cookie Policy', to: '/cookie-policy' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact Us', to: '/contact' }
];

const socialLinks = [
  { label: 'Instagram', Icon: Instagram, href: 'https://www.instagram.com/myindianstartup/' }
];

const Footer = () => {
  const { pathname } = useLocation();
  const showContactCta = !['/business-verse', '/creator-verse', '/pricing', '/payment', '/contact', '/join'].includes(pathname);

  return (
    <footer className="relative overflow-hidden border-t border-slate-800 bg-[linear-gradient(180deg,#0b1220,#050816)] text-slate-300">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-600/25 blur-[110px]" />
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-orange-500/18 blur-[120px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.12),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-14 md:px-12 md:py-16">
        {showContactCta && (
          <div className="mb-8 grid gap-7 overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.32),rgba(15,23,42,0.74)_58%,rgba(249,115,22,0.22))] p-7 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-9 lg:grid-cols-[1fr_0.9fr] lg:items-end">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-100">Need help deciding?</div>
              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-0.045em] text-white md:text-5xl">
                Ready to build connections online?
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-blue-50/85">
                Tell us what you are building and we will route you to the right business or creator path.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/10 p-3 shadow-sm backdrop-blur sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="min-w-0 flex-1 rounded-full border border-white/10 bg-white px-5 py-4 text-sm font-semibold text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-200"
                />
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-7 py-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(249,115,22,0.22)] transition-all hover:-translate-y-0.5 hover:bg-orange-600"
                >
                  Contact us
                </Link>
              </div>
              <div className="text-xs font-bold text-blue-100/80">We typically respond within one business day.</div>
            </div>
          </div>
        )}

        <div className="grid gap-10 rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 shadow-[0_26px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl md:grid-cols-12 md:p-10">
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center gap-4" data-testid="footer-logo">
              <BrandLogo
                logoSrc="/assets/footer-client-logo.svg"
                markClassName="h-14 w-14"
                textClassName="text-2xl text-white"
                dark
              />
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              India&apos;s business and creator collaboration platform for profiles, daily visibility, discovery, and direct deals without middlemen.
            </p>

            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300/50 hover:bg-blue-600 hover:text-white hover:shadow-[0_12px_22px_rgba(37,99,235,0.24)]"
                  aria-label={label}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-300">Platform</h3>
            <div className="mt-5 flex flex-col gap-3 text-sm font-bold">
              {platformLinks.map((item) => (
              <Link key={item.label} to={item.to} className="whitespace-nowrap text-slate-300 transition-colors hover:text-white">
                {item.label}
              </Link>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-orange-300">Legal</h3>
            <div className="mt-5 flex flex-col gap-3 text-sm font-bold">
              {legalLinks.map((item) => (
                <Link key={item.label} to={item.to} className="text-slate-300 transition-colors hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-300">Office</h3>
            <div className="mt-5 flex flex-col gap-4 text-sm font-semibold text-slate-300">
              <div className="flex gap-3">
                <MapPin size={17} className="mt-0.5 shrink-0 text-blue-300" />
                <span>Ahmedabad, Gujarat, India.</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={17} className="shrink-0 text-blue-300" />
                <span>+91 90236 15266</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={17} className="shrink-0 text-blue-300" />
                <span>team@myindianstartup.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.06] px-5 py-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur">
          <div className="text-lg font-black tracking-[-0.03em] text-white">One Membership. One Price. Direct Connections.</div>
          <div className="mt-2 text-sm font-bold text-blue-100">Rs 999/Year - No Commission - No Lead Charges - No Success Fees</div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs font-semibold text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 MyIndianStartup. All rights reserved. Designed, developed, maintained, managed and operated by{' '}
            <a
              href="https://www.8techburp.com/"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-blue-200 transition-colors hover:text-white"
            >
              8TechBurp
            </a>.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link to="/privacy-policy" className="whitespace-nowrap transition-colors hover:text-white">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="whitespace-nowrap transition-colors hover:text-white">Terms and Condition</Link>
            <Link to="/pricing-policy" className="whitespace-nowrap transition-colors hover:text-white">Pricing Policy</Link>
            <Link to="/community-guidelines" className="whitespace-nowrap transition-colors hover:text-white">Community Guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
