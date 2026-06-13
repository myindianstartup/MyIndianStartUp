import React, { useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  LockKeyhole,
  MonitorSmartphone,
  ShieldCheck,
  SlidersHorizontal,
  UserRound
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import WorkspaceSidebar from '@/components/dashboard/WorkspaceSidebar';

const settingTabs = [
  {
    id: 'account',
    label: 'Account',
    icon: UserRound,
    title: 'Account identity',
    description: 'Manage the core information connected to your MyIndianStartup account.',
    rows: [
      ['Account type', 'Locked after registration to keep BusinessVerse and CreatorVerse data clean.'],
      ['Login email', 'Used for secure sign in, notifications, and account recovery.'],
      ['Profile source', 'Your public details are managed from ProfileVerse.']
    ]
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    title: 'Notification preferences',
    description: 'Choose how the platform should inform you about messages, profile views, and post activity.',
    rows: [
      ['Message alerts', 'Notify when a business or creator sends a direct message.'],
      ['Daily post reminder', 'Remind before the 24-hour posting slot resets.'],
      ['Discovery updates', 'Summarize profile views and search activity.']
    ]
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: ShieldCheck,
    title: 'Visibility and privacy',
    description: 'Control what people see before they contact you for collaboration.',
    rows: [
      ['Public profile', 'Show your verified BusinessVerse or CreatorVerse profile in discovery.'],
      ['Contact visibility', 'Display contact details only to logged-in members.'],
      ['Direct requests', 'Allow members to start a collaboration conversation.']
    ]
  },
  {
    id: 'membership',
    label: 'Membership',
    icon: CreditCard,
    title: 'Membership and billing',
    description: 'Review annual access and subscription status for the platform.',
    rows: [
      ['Annual plan', 'Rs 999/year for one membership path.'],
      ['Commission', 'No commission, no lead charges, and no success fees.'],
      ['Payment owner', 'Membership payments are processed under 8TechBurp.']
    ]
  },
  {
    id: 'security',
    label: 'Security',
    icon: LockKeyhole,
    title: 'Security controls',
    description: 'Keep account access clean and safe across devices.',
    rows: [
      ['Password access', 'Use Supabase authentication for secure email/password login.'],
      ['Google sign in', 'Google login connects to the same locked account type.'],
      ['Session control', 'Logout clears local account mode and session state.']
    ]
  },
  {
    id: 'help',
    label: 'Help',
    icon: HelpCircle,
    title: 'Help and support',
    description: 'Get help for profile setup, posting rules, payments, and collaboration issues.',
    rows: [
      ['Profile setup', 'Use ProfileVerse to complete business or creator details.'],
      ['Posting rule', 'One image or one video every 24 hours.'],
      ['Support contact', 'Use the Contact page for technical or membership help.']
    ]
  }
];

const Settings = () => {
  const { member, user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const activeSetting = settingTabs.find((tab) => tab.id === activeTab) || settingTabs[0];
  const accountType = member?.account_type === 'creator' ? 'creator' : 'business';

  const accountBadge = useMemo(() => (
    accountType === 'business'
      ? {
          label: 'BusinessVerse account',
          className: 'bg-orange-50 text-orange-600 ring-orange-100',
          dot: 'bg-orange-500'
        }
      : {
          label: 'CreatorVerse account',
          className: 'bg-blue-50 text-blue-600 ring-blue-100',
          dot: 'bg-blue-600'
        }
  ), [accountType]);

  return (
    <main className="min-h-screen bg-[#f8fbff] pt-28 text-slate-950">
      <section className="mx-auto max-w-7xl px-5 pb-12 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
          <div>
            <WorkspaceSidebar />
            <div className={`mt-5 rounded-[1.5rem] px-4 py-3 ring-1 ${accountBadge.className}`}>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                <span className={`h-2 w-2 rounded-full ${accountBadge.dot}`} />
                {accountBadge.label}
              </div>
              <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                Account type is fixed after registration to protect profile data.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div className="px-2 py-3">
                <div className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Control center</div>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">Settings</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Manage account access, visibility, notifications, billing, and help.
                </p>
              </div>

              <div className="mt-3 grid gap-2">
                {settingTabs.map(({ id, label, icon: Icon }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left transition-all ${
                        active
                          ? 'bg-slate-700 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-3 text-sm font-black">
                        <Icon className="h-4 w-4" />
                        {label}
                      </span>
                      {active && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-600">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {activeSetting.label}
                  </div>
                  <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-slate-800">{activeSetting.title}</h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{activeSetting.description}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Signed in as</div>
                  <div className="mt-1 max-w-[240px] truncate text-sm font-black text-slate-800">{user?.email || member?.email || 'Member'}</div>
                </div>
              </div>

              <div className="mt-8 grid gap-4">
                {activeSetting.rows.map(([title, copy]) => (
                  <div key={title} className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-black tracking-[-0.03em] text-slate-800">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 ring-1 ring-slate-200">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                  [MonitorSmartphone, 'Device ready', 'Desktop and mobile UI prepared.'],
                  [ShieldCheck, 'Protected access', 'Login required for dashboard pages.'],
                  [CreditCard, 'Membership', 'Annual access tracked in account data.']
                ].map(([Icon, title, copy]) => (
                  <div key={title} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-black text-slate-800">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-700 p-5 text-white">
                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">Production note</div>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/80">
                  These controls are designed as the final settings layout. Backend persistence can be connected section-by-section as notification, privacy, billing, and security rules become active.
                </p>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Settings;
