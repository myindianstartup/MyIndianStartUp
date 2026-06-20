import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid } from 'lucide-react';

const modules = [
  ['Homepage', '/', 'Start here with the core collaboration pitch.'],
  ['Contact Us', '/contact', 'Support, partnerships, and platform inquiries.'],
  ['Payment', '/pricing', 'Annual Rs 999 membership and billing info.'],
  ['PostVerse', '/post-verse', 'Daily visibility feed and default dashboard.'],
  ['SearchVerse', '/search-verse', 'Discovery engine for businesses and creators.'],
  ['VerseFeed', '/verse-feed', 'Member feed for daily visibility and discovery.'],
  ['Settings', '/settings', 'Account and platform controls.']
];

const Platform = () => (
  <div className="bg-white text-slate-950">
    <section className="relative overflow-hidden pt-24 pb-14 md:pt-28 md:pb-20">
      <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_32%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.07),transparent_28%)] pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">
            <LayoutGrid className="h-3.5 w-3.5" />
            Platform structure
          </div>
          <h1 className="mt-4 text-4xl font-black leading-[0.98] tracking-[-0.05em] text-slate-950 sm:text-5xl md:text-6xl">
            The docs describe one ecosystem, not separate products.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            Explore how MyIndianStartup connects profile setup, discovery, daily posting, and account controls into one simple member journey.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/join" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)] transition-transform hover:scale-[1.02] hover:bg-blue-700">
              <span>Start joining</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/pricing" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 transition-transform hover:scale-[1.02] hover:bg-slate-50">
              <span>Review pricing</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>

    <section className="border-t border-slate-100 bg-white py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map(([title, to, copy]) => (
            <Link key={title} to={to} className="rounded-[20px] border border-slate-200 bg-[#f8fafc] p-5 shadow-sm transition-transform hover:-translate-y-1">
              <h2 className="text-lg font-black tracking-[-0.03em] text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default Platform;
