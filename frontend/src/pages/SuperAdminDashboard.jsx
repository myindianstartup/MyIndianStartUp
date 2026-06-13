import React from 'react';
import {
  Activity,
  Banknote,
  Crown,
  Database,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  Users
} from 'lucide-react';

const ownerStats = [
  ['Rs 1.23Cr', 'Estimated annual value', Banknote, 'text-orange-500', 'bg-orange-50'],
  ['12.4k', 'Total members', Users, 'text-blue-600', 'bg-blue-50'],
  ['20k+', 'Posts generated', Activity, 'text-emerald-600', 'bg-emerald-50'],
  ['99.9%', 'Platform uptime', Gauge, 'text-indigo-600', 'bg-indigo-50']
];

const ownerRights = [
  ['Admin control', 'Create, review, and remove admin access.'],
  ['Revenue visibility', 'View subscription totals and growth trends.'],
  ['Platform settings', 'Manage system limits, posting policy, and operational rules.'],
  ['Data visibility', 'Review BusinessVerse, CreatorVerse, PostVerse, and SearchVerse activity.'],
  ['Storage oversight', 'Monitor R2 media count, asset size, and public delivery health.'],
  ['Security audit', 'Track privileged actions and sensitive platform changes.']
];

const systemRows = [
  ['Supabase', 'Auth, profiles, posts, subscriptions', 'Connected'],
  ['Cloudflare R2', 'Images, videos, profile media', 'Pending keys'],
  ['PostVerse rule', '1 image or video every 24 hours', 'Active'],
  ['Admin layer', 'Admin and superadmin role separation', 'Ready']
];

const SuperAdminDashboard = () => {
  return (
    <main className="min-h-screen bg-[#f8fbff] px-6 py-10 text-slate-950 md:px-12">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2.25rem] border border-slate-200 bg-slate-950 text-white shadow-[0_26px_90px_rgba(15,23,42,0.2)]">
          <div className="grid gap-8 p-7 md:p-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                <Crown className="h-4 w-4 text-orange-300" />
                Superadmin owner dashboard
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.015em] md:text-5xl">
                Full platform control for the business owner.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                Superadmin can see all platform data, revenue indicators, admin access, system health, and ownership-level settings.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Owner-level access</div>
                  <div className="text-xs font-medium text-slate-300">Admins can manage. Superadmin can govern.</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {systemRows.map(([name, copy, status]) => (
                  <div key={name} className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold">{name}</div>
                      <div className="text-xs text-slate-300">{copy}</div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-900">{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ownerStats.map(([value, label, Icon, text, bg]) => (
            <div key={label} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${bg} ${text}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-5 text-2xl font-semibold text-slate-950">{value}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</div>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Ownership rights</div>
              <h2 className="mt-2 text-2xl font-semibold">Superadmin capabilities</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
              <ShieldCheck className="h-4 w-4" />
              Full access
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ownerRights.map(([title, copy]) => (
              <div key={title} className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-5 transition-transform hover:-translate-y-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Database className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default SuperAdminDashboard;
