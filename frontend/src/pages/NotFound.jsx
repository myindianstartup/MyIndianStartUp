import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Home, Search } from 'lucide-react';
import BrandLogo from '@/components/site/BrandLogo';

const NotFound = () => (
  <main className="min-h-screen overflow-hidden bg-[#fbfcff] text-slate-950">
    <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-500/8 blur-[120px]" />
        <div className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-orange-500/8 blur-[120px]" />
      </div>

      {/* Logo */}
      <Link to="/" className="relative z-10 flex w-fit items-center gap-2.5">
        <BrandLogo />
      </Link>

      {/* 404 */}
      <div className="relative z-10 mt-16">
        <div className="text-[120px] font-black leading-none tracking-[-0.06em] text-slate-100 select-none sm:text-[160px]">
          404
        </div>
        <div className="-mt-8 sm:-mt-12">
          <div className="text-[11px] font-black uppercase tracking-[0.32em] text-slate-400">Page not found</div>
          <h1 className="mt-3 text-3xl font-black leading-tight tracking-[-0.05em] text-slate-950 sm:text-4xl">
            This page doesn't exist.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-500">
            The link you followed may be broken, expired, or the page may have been moved. Let's get you back on track.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_32px_rgba(15,23,42,0.22)] transition-all hover:-translate-y-0.5 hover:bg-slate-800 sm:w-auto"
          >
            <Home className="h-4 w-4" />
            <span>Go to Homepage</span>
          </Link>
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-slate-50 sm:w-auto"
          >
            <span>Login to workspace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm">
          <Search className="h-3.5 w-3.5" />
          Looking for something? Try <Link to="/business-verse" className="font-black text-orange-600 hover:underline">BusinessVerse</Link> or <Link to="/creator-verse" className="font-black text-blue-600 hover:underline">CreatorVerse</Link>
        </div>
      </div>
    </div>
  </main>
);

export default NotFound;
