import React from 'react';
import {
  BarChart3,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  Eye,
  LockKeyhole,
  ShieldCheck,
  Users
} from 'lucide-react';

const adminStats = [
  ['12.4k', 'Active members', Users, 'text-blue-600', 'bg-blue-50'],
  ['4.8k', 'Business profiles', BriefcaseBusiness, 'text-orange-500', 'bg-orange-50'],
  ['7.6k', 'Creator profiles', Camera, 'text-blue-600', 'bg-blue-50'],
  ['98%', 'Healthy posts', CheckCircle2, 'text-emerald-600', 'bg-emerald-50']
];

const activity = [
  ['Aurora Foods joined BusinessVerse', 'Business account', '2 min ago', 'orange'],
  ['Riya Sharma published a portfolio post', 'Creator post', '12 min ago', 'blue'],
  ['Admin reviewed support request', 'Operations', '28 min ago', 'slate'],
  ['Payment marked active for annual plan', 'Subscription', '41 min ago', 'emerald']
];

const adminControls = [
  ['Member review', 'View accounts, subscriptions, and account type status.'],
  ['Post moderation', 'Review posts, hide unsafe posts, and keep PostVerse clean.'],
  ['Profile checks', 'Validate BusinessVerse and CreatorVerse profile completeness.'],
  ['Support queue', 'Manage support issues without touching ownership settings.']
];

const AdminDashboard = () => {
  return (
    <main className="min-h-screen bg-[#f8fbff] px-6 py-10 text-slate-950 md:px-12">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              Admin workspace
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.015em] md:text-5xl">
              Manage members, posts, and daily platform operations.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Admins can monitor activity, support users, and moderate platform content while ownership-level controls stay protected.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Operational health</div>
                <div className="mt-2 text-3xl font-semibold text-slate-950">Today&apos;s overview</div>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_16px_34px_rgba(37,99,235,0.24)]">
                <BarChart3 className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {adminStats.map(([value, label, Icon, text, bg]) => (
                <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${text}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-2xl font-semibold">{value}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Admin controls</div>
                <h2 className="mt-2 text-2xl font-semibold">Manager-level permissions</h2>
              </div>
              <LockKeyhole className="h-6 w-6 text-slate-400" />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {adminControls.map(([title, copy]) => (
                <div key={title} className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-5 transition-transform hover:-translate-y-1">
                  <h3 className="text-base font-semibold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">Live activity</div>
                <h2 className="mt-2 text-2xl font-semibold">Latest platform events</h2>
              </div>
              <Eye className="h-6 w-6 text-slate-400" />
            </div>
            <div className="mt-6 grid gap-3">
              {activity.map(([title, type, time, tone]) => (
                <div key={title} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${tone === 'orange' ? 'bg-orange-500' : tone === 'blue' ? 'bg-blue-600' : tone === 'emerald' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{title}</div>
                      <div className="text-xs font-medium text-slate-500">{type}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;
