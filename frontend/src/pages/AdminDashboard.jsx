import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  Clock3,
  Database,
  Eye,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Users
} from 'lucide-react';
import { apiRequest } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

const shortDate = (value) => {
  if (!value) return 'Never';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
};

const StatusPill = ({ value }) => {
  const active = ['active', 'online', 'trialing'].includes(String(value || '').toLowerCase());
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
      active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
    }`}>
      {value || 'unknown'}
    </span>
  );
};

const StatCard = ({ label, value, icon: Icon, tone = 'slate' }) => {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone] || tones.slate}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-2xl font-black tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</div>
    </div>
  );
};

const AdminMemberDetailModal = ({ detail, onClose }) => {
  if (!detail) return null;

  const profile = detail.profile || {};
  const analytics = detail.activityAnalytics || {};
  const profileFields = detail.user.accountType === 'creator'
    ? [
        ['Full name', profile.full_name || detail.user.userName],
        ['Skills', Array.isArray(profile.skills) && profile.skills.length ? profile.skills.join(', ') : 'Not added'],
        ['Portfolio', profile.portfolio_url || 'Not added'],
        ['City / State', [profile.city, profile.state].filter(Boolean).join(', ') || 'Not added'],
        ['Email', profile.contact_details?.email || detail.user.email],
        ['Mobile', profile.contact_details?.mobile || detail.user.mobileNumber || 'Not added']
      ]
    : [
        ['Business name', profile.business_name || detail.user.userName],
        ['Industry', profile.industry || 'Not added'],
        ['Website', profile.website || 'Not added'],
        ['City / State', [profile.city, profile.state].filter(Boolean).join(', ') || 'Not added'],
        ['Email', profile.contact_details?.email || detail.user.email],
        ['Mobile', profile.contact_details?.mobile || detail.user.mobileNumber || 'Not added']
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_90px_rgba(15,23,42,0.25)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Read-only member data</div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-900">{detail.user.userName}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{detail.user.email} · {detail.user.accountType}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-200">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Posts" value={formatNumber(analytics.totalPosts)} icon={BarChart3} tone="blue" />
          <StatCard label="Likes" value={formatNumber(analytics.totalLikes)} icon={CheckCircle2} tone="orange" />
          <StatCard label="Reach" value={formatNumber(analytics.totalReach)} icon={Users} tone="emerald" />
          <StatCard label="Engagement" value={`${analytics.engagementRate || 0}%`} icon={Eye} tone="slate" />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-black text-slate-900">User profile data</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {profileFields.map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</div>
                  <div className="mt-2 text-sm font-bold leading-6 text-slate-800">{value || 'Not added'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-black text-slate-900">Account summary</h3>
              <div className="mt-4 grid gap-3">
                {[
                  ['Subscription', detail.user.subscriptionStatus],
                  ['Account status', detail.user.accountStatus],
                  ['Online status', detail.user.onlineStatus],
                  ['Joined', shortDate(detail.user.registrationDate)],
                  ['Last active', shortDate(detail.user.lastActiveDate)]
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm font-bold text-slate-600">{label}</span>
                    <span className="text-sm font-black text-slate-900">{value || 'Unknown'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-black text-slate-900">Admin permissions</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                This panel is view-only for admins. Member editing, account removal, deactivation, and billing controls remain restricted to superadmin access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { token, signOut } = useAuth();
  const [overview, setOverview] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!token) return;
    setError('');
    try {
      const [overviewData, membersData] = await Promise.all([
        apiRequest('/api/admin/overview', { token }),
        apiRequest('/api/admin/members', { token })
      ]);
      setOverview(overviewData);
      setMembers(membersData.members || []);
    } catch (requestError) {
      setError(requestError.message || 'Could not load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = window.setInterval(loadData, 30000);
    return () => window.clearInterval(interval);
  }, [token]);

  const openMember = async (id) => {
    setSelectedMember({ loading: true });
    try {
      const detail = await apiRequest(`/api/admin/members/${id}`, { token });
      setSelectedMember(detail);
    } catch (requestError) {
      setError(requestError.message || 'Could not load member details.');
      setSelectedMember(null);
    }
  };

  const stats = overview?.stats || {};
  const recentMembers = useMemo(() => members.slice(0, 12), [members]);

  const statRows = [
    ['Members', formatNumber(stats.members), Users, 'blue'],
    ['Active subscriptions', formatNumber(stats.activeSubscriptions), CheckCircle2, 'emerald'],
    ['Business profiles', formatNumber(stats.businessProfiles), BriefcaseBusiness, 'orange'],
    ['Creator profiles', formatNumber(stats.creatorProfiles), Camera, 'blue'],
    ['Published posts', formatNumber(stats.publishedPosts), BarChart3, 'slate'],
    ['Media assets', formatNumber(stats.mediaAssets), Database, 'slate']
  ];

  return (
    <main className="min-h-screen bg-[#f8fbff] px-6 py-8 text-slate-950 md:px-10">
      {selectedMember?.loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40">
          <div className="rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-600"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading member...</div>
        </div>
      ) : (
        <AdminMemberDetailModal detail={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                <ShieldCheck className="h-4 w-4" />
                Admin workspace
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-[-0.03em] md:text-5xl">
                Limited operations dashboard.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                Admins can monitor members, subscriptions, profiles, posts, and media health. Superadmin-only actions such as user editing, plans, coupons, billing, and audit controls stay locked.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadData}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-700"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
            {[
              [LockKeyhole, 'Read-only role', 'No member edits or billing changes from admin accounts.'],
              [Eye, 'Operations view', 'Monitor user and platform status without ownership controls.'],
              [Clock3, 'Auto refresh', 'Dashboard refreshes every 30 seconds while open.']
            ].map(([Icon, title, copy]) => (
              <div key={title} className="rounded-2xl bg-white p-4 shadow-sm">
                <Icon className="h-5 w-5 text-slate-500" />
                <div className="mt-3 text-sm font-black text-slate-900">{title}</div>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="mt-8 flex items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-6 text-sm font-black text-slate-500 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            Loading live admin data...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-[1.5rem] border border-rose-100 bg-rose-50 p-6 text-sm font-bold text-rose-600">
            {error}
          </div>
        ) : (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {statRows.map(([label, value, Icon, tone]) => (
                <StatCard key={label} label={label} value={value} icon={Icon} tone={tone} />
              ))}
            </section>

            <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Limited user view</div>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-slate-900">Recent members</h2>
                </div>
                <StatusPill value={`${recentMembers.length} shown`} />
              </div>

              <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Subscription</th>
                      <th className="p-3">Account</th>
                      <th className="p-3">Last active</th>
                      <th className="p-3">Joined</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMembers.length ? recentMembers.map((member) => (
                      <tr key={member.id} className="border-b border-slate-100 font-semibold text-slate-600">
                        <td className="p-3 font-black text-slate-900">{member.full_name || member.email}</td>
                        <td className="p-3">{member.email}</td>
                        <td className="p-3 capitalize">{member.account_type}</td>
                        <td className="p-3"><StatusPill value={member.subscription_status} /></td>
                        <td className="p-3"><StatusPill value={member.account_status || 'active'} /></td>
                        <td className="p-3">{shortDate(member.last_active_at)}</td>
                        <td className="p-3">{shortDate(member.created_at)}</td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => openMember(member.id)}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-slate-700"
                          >
                            <Eye className="h-4 w-4" />
                            View data
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="8" className="p-10 text-center text-sm font-bold text-slate-500">No members found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default AdminDashboard;
