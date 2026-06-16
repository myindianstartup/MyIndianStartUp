import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  LockKeyhole,
  MonitorSmartphone,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/apiClient';
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
      ['Workspace access', 'Your account opens the correct BusinessVerse or CreatorVerse experience automatically.']
    ]
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    title: 'Notification preferences',
    description: 'Choose how the platform should inform you about visibility, activity, and membership updates.',
    rows: [
      ['Daily post reminder', 'Remind before the 24-hour posting slot resets.'],
      ['Discovery updates', 'Summarize discovery reach and search activity.'],
      ['Membership notices', 'Send reminders when plan access or billing status changes.']
    ]
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: ShieldCheck,
    title: 'Visibility and privacy',
    description: 'Control what people see before they contact you for collaboration.',
    rows: [
      ['Public visibility', 'Show your verified BusinessVerse or CreatorVerse presence in discovery.'],
      ['Contact visibility', 'Display contact details only to logged-in members.'],
      ['Lead access', 'Allow qualified members to discover and reach your workspace.']
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
    description: 'Get help for account setup, posting rules, payments, and collaboration issues.',
    rows: [
      ['Account setup', 'Complete your business or creator details during onboarding and membership setup.'],
      ['Posting rule', 'One image or one video every 24 hours.'],
      ['Support contact', 'Use the Contact page for technical or membership help.']
    ]
  }
];

const Settings = () => {
  const { member, user, token, refreshMember, session } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [profileData, setProfileData] = useState(null);
  const [formState, setFormState] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');
  const activeSetting = settingTabs.find((tab) => tab.id === activeTab) || settingTabs[0];
  const isCreator = (member?.account_type || profileData?.member?.account_type) === 'creator';
  const liveProfile = isCreator ? profileData?.creatorProfile : profileData?.businessProfile;

  useEffect(() => {
    const loadSettings = async () => {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const data = await apiRequest('/api/profiles/me', { token });
        setProfileData(data);
        const memberData = data.member || {};
        const businessProfile = data.businessProfile || {};
        const creatorProfile = data.creatorProfile || {};
        const creator = memberData.account_type === 'creator';
        const profile = creator ? creatorProfile : businessProfile;

        setFormState({
          fullName: creator ? (profile.full_name || memberData.full_name || '') : (profile.business_name || memberData.full_name || ''),
          email: memberData.email || '',
          mobileNumber: memberData.mobile_number || '',
          city: profile.city || '',
          state: profile.state || '',
          website: creator ? (profile.portfolio_url || '') : (profile.website || ''),
          industry: businessProfile.industry || '',
          about: creator ? (profile.about_me || '') : (profile.about_company || ''),
          skills: Array.isArray(creatorProfile.skills) ? creatorProfile.skills.join(', ') : '',
          contactEmail: profile.contact_details?.email || memberData.email || '',
          contactMobile: profile.contact_details?.mobile || memberData.mobile_number || ''
        });
      } catch (requestError) {
        setError(requestError.message || 'Could not load settings data.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [token]);

  const updateField = (field, value) => {
    setSaveMessage('');
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const saveAccountSettings = async () => {
    if (!token) return;
    setSaving(true);
    setSaveMessage('');
    setError('');
    try {
      await apiRequest('/api/members/me', {
        method: 'PUT',
        token,
        body: {
          fullName: formState.fullName,
          mobileNumber: formState.mobileNumber || '',
          accountType: isCreator ? 'creator' : 'business'
        }
      });

      await apiRequest(isCreator ? '/api/profiles/creator' : '/api/profiles/business', {
        method: 'PUT',
        token,
        body: isCreator ? {
          fullName: formState.fullName,
          skills: formState.skills.split(',').map((item) => item.trim()).filter(Boolean),
          city: formState.city,
          state: formState.state,
          portfolioUrl: formState.website || '',
          aboutMe: formState.about || '',
          contactDetails: {
            email: formState.contactEmail || '',
            mobile: formState.contactMobile || ''
          }
        } : {
          businessName: formState.fullName,
          industry: formState.industry,
          city: formState.city,
          state: formState.state,
          website: formState.website || '',
          aboutCompany: formState.about || '',
          contactDetails: {
            email: formState.contactEmail || '',
            mobile: formState.contactMobile || ''
          }
        }
      });

      const refreshed = await apiRequest('/api/profiles/me', { token });
      setProfileData(refreshed);
      if (session) {
        await refreshMember(session);
      }
      setSaveMessage('Settings saved successfully.');
    } catch (requestError) {
      setError(requestError.message || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fbff] pt-28 text-slate-950">
      <section className="mx-auto max-w-7xl px-5 pb-12 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
          <div>
            <WorkspaceSidebar />
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div className="px-2 py-3">
                <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">Control center</div>
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

              {loading ? (
                <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">
                  Loading live settings...
                </div>
              ) : activeTab === 'account' ? (
                <div className="mt-8 space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-black text-slate-800">{isCreator ? 'Full name' : 'Business name'}</span>
                      <input
                        value={formState.fullName || ''}
                        onChange={(event) => updateField('fullName', event.target.value)}
                        className="rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-300"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-black text-slate-800">Login email</span>
                      <input
                        value={formState.email || ''}
                        disabled
                        className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500 outline-none"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-black text-slate-800">Mobile number</span>
                      <input
                        value={formState.mobileNumber || ''}
                        onChange={(event) => updateField('mobileNumber', event.target.value)}
                        className="rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-300"
                      />
                    </label>
                    {!isCreator && (
                      <label className="grid gap-2">
                        <span className="text-sm font-black text-slate-800">Industry</span>
                        <input
                          value={formState.industry || ''}
                          onChange={(event) => updateField('industry', event.target.value)}
                          className="rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-300"
                        />
                      </label>
                    )}
                    <label className="grid gap-2">
                      <span className="text-sm font-black text-slate-800">City</span>
                      <input
                        value={formState.city || ''}
                        onChange={(event) => updateField('city', event.target.value)}
                        className="rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-300"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-black text-slate-800">State</span>
                      <input
                        value={formState.state || ''}
                        onChange={(event) => updateField('state', event.target.value)}
                        className="rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-300"
                      />
                    </label>
                    <label className="grid gap-2 md:col-span-2">
                      <span className="text-sm font-black text-slate-800">{isCreator ? 'Portfolio URL' : 'Website URL'}</span>
                      <input
                        value={formState.website || ''}
                        onChange={(event) => updateField('website', event.target.value)}
                        className="rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-300"
                      />
                    </label>
                    {isCreator && (
                      <label className="grid gap-2 md:col-span-2">
                        <span className="text-sm font-black text-slate-800">Skills</span>
                        <input
                          value={formState.skills || ''}
                          onChange={(event) => updateField('skills', event.target.value)}
                          placeholder="Video editing, photography, branding"
                          className="rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-300"
                        />
                      </label>
                    )}
                    <label className="grid gap-2 md:col-span-2">
                      <span className="text-sm font-black text-slate-800">{isCreator ? 'About me' : 'About company'}</span>
                      <textarea
                        rows={4}
                        value={formState.about || ''}
                        onChange={(event) => updateField('about', event.target.value)}
                        className="resize-none rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-300"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-black text-slate-800">Contact email</span>
                      <input
                        value={formState.contactEmail || ''}
                        onChange={(event) => updateField('contactEmail', event.target.value)}
                        className="rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-300"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-black text-slate-800">Contact mobile</span>
                      <input
                        value={formState.contactMobile || ''}
                        onChange={(event) => updateField('contactMobile', event.target.value)}
                        className="rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-300"
                      />
                    </label>
                  </div>

                  {error && <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{error}</div>}
                  {saveMessage && <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{saveMessage}</div>}

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Backend connected</div>
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        This section saves directly into your live member and profile records.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={saveAccountSettings}
                      disabled={saving}
                      className="rounded-full bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-700 disabled:opacity-60"
                    >
                      {saving ? 'Saving...' : 'Save settings'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-8 grid gap-4">
                  {activeSetting.rows.map(([title, copy]) => (
                    <div key={title} className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-black tracking-[-0.03em] text-slate-800">{title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 ring-1 ring-slate-200">
                          Live
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
                  Account settings are now connected to the live backend. Additional notification, privacy, billing, and security controls can be connected section-by-section as those rules become active.
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
