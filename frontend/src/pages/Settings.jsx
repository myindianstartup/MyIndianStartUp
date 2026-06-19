import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/apiClient';
import WorkspaceSidebar from '@/components/dashboard/WorkspaceSidebar';

const settingTabs = [
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    title: 'Notification preferences',
    description: 'Choose which email notifications you want to receive from the platform.'
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: ShieldCheck,
    title: 'Visibility and privacy',
    description: 'Control what people see before they contact you for collaboration.',
    rows: [
      ['Public visibility', 'Your profile can appear in discovery for logged-in members.'],
      ['Contact visibility', 'Keep direct contact details limited to platform contexts.']
    ]
  },
  {
    id: 'membership',
    label: 'Membership',
    icon: CreditCard,
    title: 'Membership and billing',
    description: 'Review plan information and billing rules.',
    rows: [
      ['Annual plan', 'Rs 999 per year for your active membership path.'],
      ['Billing model', 'No commission, no lead charges, and no success fees.']
    ]
  },
  {
    id: 'security',
    label: 'Security',
    icon: LockKeyhole,
    title: 'Security controls',
    description: 'Keep account access clean and safe across devices.',
    rows: [
      ['Sign-in method', 'Secure access through Supabase email/password or Google sign-in.'],
      ['Session control', 'Logout clears the local session and account mode.']
    ]
  },
  {
    id: 'help',
    label: 'Help',
    icon: HelpCircle,
    title: 'Help and support',
    description: 'Find the right place for profile, posting, or membership help.',
    rows: [
      ['Profile editing', 'Use the Profile section to change photo, details, and contact data.'],
      ['Support contact', 'Use the Contact page for technical or membership help.']
    ]
  }
];

const defaultSettings = {
  notifications: {
    dailyPostReminder: true,
    discoveryUpdates: true,
    membershipNotices: true
  }
};

const notificationItems = [
  {
    key: 'dailyPostReminder',
    title: 'Daily post reminder',
    copy: 'Email me before the 24-hour posting slot resets.'
  },
  {
    key: 'discoveryUpdates',
    title: 'Discovery updates',
    copy: 'Email me when profile reach and search activity matters.'
  },
  {
    key: 'membershipNotices',
    title: 'Membership notices',
    copy: 'Email me about plan status, billing, and renewal updates.'
  }
];

const Toggle = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
      checked ? 'bg-blue-600' : 'bg-slate-300'
    } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const Settings = () => {
  const { member, user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');
  const activeSetting = useMemo(
    () => settingTabs.find((tab) => tab.id === activeTab) || settingTabs[0],
    [activeTab]
  );

  useEffect(() => {
    const loadSettings = async () => {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const data = await apiRequest('/api/members/settings', { token });
        setSettings({
          notifications: {
            ...defaultSettings.notifications,
            ...(data.settings?.notifications || {})
          }
        });
      } catch (requestError) {
        setError(requestError.message || 'Could not load settings.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [token]);

  const updateNotification = (key, value) => {
    setSaveMessage('');
    setSettings((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [key]: value
      }
    }));
  };

  const saveNotifications = async () => {
    if (!token) return;
    setSaving(true);
    setSaveMessage('');
    setError('');
    try {
      const payload = {
        notifications: {
          ...defaultSettings.notifications,
          ...(settings.notifications || {})
        }
      };
      const data = await apiRequest('/api/members/settings', {
        method: 'PUT',
        token,
        body: payload
      });
      setSettings({
        notifications: {
          ...defaultSettings.notifications,
          ...(data.settings?.notifications || {})
        }
      });
      setSaveMessage('Notification settings saved successfully.');
    } catch (requestError) {
      setError(requestError.message || 'Could not save notification settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fbff] pt-28 text-slate-950">
      <section className="mx-auto max-w-[1380px] px-4 py-8 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)] xl:items-start">
          <div>
            <WorkspaceSidebar />
          </div>

          <div className="grid min-w-0 gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div className="px-2 py-3">
                <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">Control center</div>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">Settings</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Manage email notifications, privacy, membership, security, and support.
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

            <section className="min-w-0 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-600">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {activeSetting.label}
                  </div>
                  <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-800 sm:text-4xl">{activeSetting.title}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{activeSetting.description}</p>
                </div>
                <div className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 sm:w-auto">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Signed in as</div>
                  <div className="mt-1 truncate text-sm font-black text-slate-800 sm:max-w-[240px]">{user?.email || member?.email || 'Member'}</div>
                </div>
              </div>

              {loading ? (
                <div className="mt-8 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading settings...
                </div>
              ) : activeTab === 'notifications' ? (
                <div className="mt-8 space-y-4">
                  {notificationItems.map((item) => (
                    <div key={item.key} className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-black tracking-[-0.03em] text-slate-800">{item.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{item.copy}</p>
                          <div className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Email</div>
                        </div>
                        <Toggle
                          checked={Boolean(settings.notifications?.[item.key])}
                          onChange={(value) => updateNotification(item.key, value)}
                          disabled={saving}
                        />
                      </div>
                    </div>
                  ))}

                  {error && <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{error}</div>}
                  {saveMessage && <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{saveMessage}</div>}

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Backend connected</div>
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        These notification preferences are now loaded and saved through your member settings API.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={saveNotifications}
                      disabled={saving}
                      className="rounded-full bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-700 disabled:opacity-60"
                    >
                      {saving ? 'Saving...' : 'Save preferences'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-8 grid gap-4">
                  {activeSetting.rows.map(([title, copy]) => (
                    <div key={title} className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                      <h3 className="text-lg font-black tracking-[-0.03em] text-slate-800">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-sm font-semibold leading-6 text-slate-600">
                  Use these settings to control email alerts, privacy, membership, and account security from one place.
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
