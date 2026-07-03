import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  CreditCard,
  Crown,
  Database,
  Download,
  Eye,
  Gauge,
  Globe2,
  Loader2,
  Pencil,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
  Wifi
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { API_URL, apiRequest } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import PostReportsPanel from '@/components/admin/PostReportsPanel';

const tabs = ['Overview', 'Traffic', 'Business Users', 'Creator Users', 'Subscriptions', 'Coupons', 'Verse Analytics', 'Reports', 'Audit'];
const chartColors = ['#2563eb', '#f97316', '#10b981', '#8b5cf6', '#64748b'];

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);
const formatCurrency = (value) => `Rs ${new Intl.NumberFormat('en-IN').format(value || 0)}`;

const emptyCouponForm = {
  code: '',
  title: '',
  discountType: 'percentage',
  discountValue: 10,
  usageLimit: '',
  perUserLimit: 1,
  startsAt: '',
  endsAt: '',
  applicablePlanIds: [],
  userIds: '',
  isActive: true
};

const shortDate = (value) => {
  if (!value) return 'Never';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
};

const exportCsv = (rows, fileName) => {
  const safeRows = rows || [];
  if (!safeRows.length) return;
  const headers = Object.keys(safeRows[0]);
  const csv = [
    headers.join(','),
    ...safeRows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? '')).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

const StatusPill = ({ value }) => {
  const active = ['operational', 'active', 'online'].includes(String(value).toLowerCase());
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${
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

const UserTable = ({ title, users, loading, onSelect }) => (
  <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">User Management</div>
        <h2 className="mt-1 text-xl font-black text-slate-900">{title}</h2>
      </div>
      <button
        type="button"
        onClick={() => exportCsv(users, `${title.toLowerCase().replaceAll(' ', '-')}.csv`)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
      >
        <Download className="h-4 w-4" />
        Export
      </button>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left">
        <thead>
          <tr className="border-y border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Registered</th>
            <th className="px-4 py-3">Last Active</th>
            <th className="px-4 py-3">Subscription</th>
            <th className="px-4 py-3">Online</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="9" className="px-4 py-10 text-center text-sm font-bold text-slate-500">Loading users...</td></tr>
          ) : users.length ? users.map((user) => (
            <tr key={user.id} className="border-b border-slate-100 text-sm font-semibold text-slate-600">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl text-xs font-black text-white ${user.accountType === 'creator' ? 'bg-blue-600' : 'bg-orange-500'}`}>
                    {user.profileImage ? <img src={user.profileImage} alt={user.userName} className="h-full w-full object-cover" /> : user.userName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-black text-slate-900">{user.userName}</span>
                </div>
              </td>
              <td className="px-4 py-4">{user.email}</td>
              <td className="px-4 py-4 capitalize">{user.accountType}</td>
              <td className="px-4 py-4">{shortDate(user.registrationDate)}</td>
              <td className="px-4 py-4">{shortDate(user.lastActiveDate)}</td>
              <td className="px-4 py-4"><StatusPill value={user.subscriptionStatus} /></td>
              <td className="px-4 py-4"><StatusPill value={user.onlineStatus} /></td>
              <td className="px-4 py-4"><StatusPill value={user.accountStatus} /></td>
              <td className="px-4 py-4">
                <button
                  type="button"
                  onClick={() => onSelect(user.id)}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-slate-700"
                >
                  <Eye className="h-4 w-4" />
                  Deep access
                </button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="9" className="px-4 py-10 text-center text-sm font-bold text-slate-500">No users found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const UserDetailPanel = ({ detail, onClose, onUpdateUser, onQuickStatusChange }) => {
  if (!detail) return null;
  const analytics = detail.activityAnalytics || {};
  const profile = detail.profile || {};
  
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const [editError, setEditError] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState('');

  const startEditing = () => {
    setFormData({
      fullName: detail.user.userName || '',
      email: detail.user.email || '',
      mobileNumber: detail.user.mobileNumber || '',
      accountStatus: detail.user.accountStatus || 'active',
      businessName: profile.business_name || '',
      industry: profile.industry || '',
      city: profile.city || '',
      state: profile.state || '',
      website: profile.website || '',
      aboutCompany: profile.about_company || '',
      skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
      portfolioUrl: profile.portfolio_url || '',
      aboutMe: profile.about_me || '',
      contactEmail: profile.contact_details?.email || '',
      contactMobile: profile.contact_details?.mobile || ''
    });
    setEditError('');
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditError('');
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber || null,
        accountStatus: formData.accountStatus,
        city: formData.city,
        state: formData.state,
        contactDetails: {
          email: formData.contactEmail || null,
          mobile: formData.contactMobile || null
        }
      };

      if (detail.user.accountType === 'creator') {
        payload.skills = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
        payload.portfolioUrl = formData.portfolioUrl || '';
        payload.aboutMe = formData.aboutMe || '';
      } else {
        payload.businessName = formData.businessName;
        payload.industry = formData.industry;
        payload.website = formData.website || '';
        payload.aboutCompany = formData.aboutCompany || '';
      }

      await onUpdateUser(detail.user.id, payload);
      setIsEditing(false);
    } catch (err) {
      setEditError(err.message || 'Failed to update user details.');
    } finally {
      setSaving(false);
    }
  };

  const runQuickAction = async (status) => {
    setActionLoading(status);
    setEditError('');
    try {
      await onQuickStatusChange(detail.user.id, status);
    } catch (err) {
      setEditError(err.message || 'Failed to update account status.');
    } finally {
      setActionLoading('');
    }
  };

  const profileFields = detail.user.accountType === 'creator'
    ? [
        ['Full name', profile.full_name],
        ['Skills', Array.isArray(profile.skills) && profile.skills.length ? profile.skills.join(', ') : null],
        ['City / State', [profile.city, profile.state].filter(Boolean).join(', ')],
        ['Portfolio', profile.portfolio_url],
        ['About', profile.about_me],
        ['Email', profile.contact_details?.email || detail.user.email],
        ['Mobile', profile.contact_details?.mobile || detail.user.mobileNumber]
      ]
    : [
        ['Business name', profile.business_name],
        ['Industry', profile.industry],
        ['City / State', [profile.city, profile.state].filter(Boolean).join(', ')],
        ['Website', profile.website],
        ['About company', profile.about_company],
        ['Email', profile.contact_details?.email || detail.user.email],
        ['Mobile', profile.contact_details?.mobile || detail.user.mobileNumber]
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_90px_rgba(15,23,42,0.25)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">User Profile Deep Access</div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-900">{detail.user.userName}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{detail.user.email} · {detail.user.accountType}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">Close</button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Posts" value={formatNumber(analytics.totalPosts)} icon={BarChart3} tone="blue" />
          <StatCard label="Likes" value={formatNumber(analytics.totalLikes)} icon={Activity} tone="orange" />
          <StatCard label="Reach" value={formatNumber(analytics.totalReach)} icon={Globe2} tone="emerald" />
          <StatCard label="Engagement" value={`${analytics.engagementRate || 0}%`} icon={TrendingUp} />
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-rose-100 bg-rose-50/60 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Superadmin controls</div>
              <h3 className="mt-2 text-lg font-black text-slate-950">Account access actions</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Use these controls to suspend, deactivate, or restore a member account. Hard delete stays disabled here to protect billing, post, and audit history.
              </p>
            </div>
            <StatusPill value={detail.user.accountStatus} />
          </div>
          {editError && <div className="mt-4 rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm font-bold text-rose-600">{editError}</div>}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => runQuickAction('active')}
              disabled={actionLoading === 'active' || detail.user.accountStatus === 'active'}
              className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
            >
              {actionLoading === 'active' ? 'Saving...' : 'Reactivate account'}
            </button>
            <button
              type="button"
              onClick={() => runQuickAction('suspended')}
              disabled={actionLoading === 'suspended' || detail.user.accountStatus === 'suspended'}
              className="rounded-full border border-amber-200 bg-white px-4 py-2 text-xs font-black text-amber-700 hover:bg-amber-50 disabled:opacity-60"
            >
              {actionLoading === 'suspended' ? 'Saving...' : 'Suspend account'}
            </button>
            <button
              type="button"
              onClick={() => runQuickAction('deactivated')}
              disabled={actionLoading === 'deactivated' || detail.user.accountStatus === 'deactivated'}
              className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-black text-rose-700 hover:bg-rose-50 disabled:opacity-60"
            >
              {actionLoading === 'deactivated' ? 'Saving...' : 'Deactivate account'}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-black text-slate-900">Profile Details</h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-black text-white hover:bg-slate-700"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
                {editError && <div className="sm:col-span-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{editError}</div>}
                
                {detail.user.accountType === 'creator' ? (
                  <>
                    <label className="grid gap-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Full Name</span>
                      <input
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Skills (comma separated)</span>
                      <input
                        value={formData.skills}
                        onChange={e => setFormData({ ...formData, skills: e.target.value })}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="grid gap-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Business Name</span>
                      <input
                        value={formData.businessName}
                        onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                        required
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Industry</span>
                      <input
                        value={formData.industry}
                        onChange={e => setFormData({ ...formData, industry: e.target.value })}
                        required
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                      />
                    </label>
                  </>
                )}

                <label className="grid gap-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">City</span>
                  <input
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">State</span>
                  <input
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    required
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </label>

                {detail.user.accountType === 'creator' ? (
                  <label className="grid gap-1 sm:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Portfolio URL</span>
                    <input
                      value={formData.portfolioUrl}
                      onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </label>
                ) : (
                  <label className="grid gap-1 sm:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Website URL</span>
                    <input
                      value={formData.website}
                      onChange={e => setFormData({ ...formData, website: e.target.value })}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </label>
                )}

                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    {detail.user.accountType === 'creator' ? 'About Me' : 'About Company'}
                  </span>
                  <textarea
                    value={detail.user.accountType === 'creator' ? formData.aboutMe : formData.aboutCompany}
                    onChange={e => setFormData({ ...formData, [detail.user.accountType === 'creator' ? 'aboutMe' : 'aboutCompany']: e.target.value })}
                    rows={3}
                    className="resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </label>

                <h4 className="sm:col-span-2 border-t border-slate-100 pt-3 mt-1 text-xs font-black uppercase tracking-[0.18em] text-slate-400">System & Contact</h4>

                <label className="grid gap-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Core Account Email</span>
                  <input
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Core Mobile Number</span>
                  <input
                    value={formData.mobileNumber || ''}
                    onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Public Contact Email</span>
                  <input
                    value={formData.contactEmail}
                    onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Public Contact Mobile</span>
                  <input
                    value={formData.contactMobile}
                    onChange={e => setFormData({ ...formData, contactMobile: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </label>

                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Account Status</span>
                  <select
                    value={formData.accountStatus}
                    onChange={e => setFormData({ ...formData, accountStatus: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                </label>

                <div className="sm:col-span-2 flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-slate-900 px-5 py-2 text-xs font-black text-white hover:bg-slate-700 disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-3">
                {profileFields.map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</div>
                    <div className="mt-1 text-sm font-bold text-slate-800">{value || 'Not updated'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-slate-900">Subscription Analytics</h3>
              <StatusPill value={detail.user.subscriptionStatus} />
            </div>
            <div className="mt-4 grid gap-3">
              {[
                ['Current plan', detail.subscriptionAnalytics.currentPlan],
                ['Expires', shortDate(detail.user.subscriptionExpiresAt)],
                ['Registered', shortDate(detail.user.registrationDate)],
                ['Last active', shortDate(detail.user.lastActiveDate)]
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-bold text-slate-500">{label}</span>
                  <span className="font-black text-slate-900">{value || 'Never'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-black text-slate-900">Historical Performance</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height={288} minWidth={0}>
              <LineChart data={detail.growthAnalytics.historicalPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [overview, setOverview] = useState(null);
  const [health, setHealth] = useState(null);
  const [traffic, setTraffic] = useState(null);
  const [businessUsers, setBusinessUsers] = useState([]);
  const [creatorUsers, setCreatorUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [plans, setPlans] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [billing, setBilling] = useState({ subscriptions: [], orders: [], invoices: [], transactions: [] });
  const [verseAnalytics, setVerseAnalytics] = useState(null);
  const [report, setReport] = useState(null);
  const [postReports, setPostReports] = useState([]);
  const [postReportUpdatingId, setPostReportUpdatingId] = useState('');
  const [realtime, setRealtime] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCouponRedemptions, setSelectedCouponRedemptions] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [couponForm, setCouponForm] = useState(emptyCouponForm);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');

  const loadData = async () => {
    if (!token) return;
    setError('');
    try {
      const [overviewData, healthData, trafficData, businessData, creatorData, auditData, plansData, couponsData, billingData, verseData, reportData, notificationsData, postReportsData] = await Promise.all([
        apiRequest('/api/admin/superadmin/overview', { token }),
        apiRequest('/api/admin/health', { token }),
        apiRequest('/api/admin/superadmin/traffic?range=month', { token }),
        apiRequest(`/api/admin/superadmin/users?accountType=business&pageSize=50&search=${encodeURIComponent(search)}`, { token }),
        apiRequest(`/api/admin/superadmin/users?accountType=creator&pageSize=50&search=${encodeURIComponent(search)}`, { token }),
        apiRequest('/api/admin/superadmin/audit-logs', { token }),
        apiRequest('/api/admin/superadmin/plans', { token }),
        apiRequest('/api/admin/superadmin/coupons', { token }),
        apiRequest('/api/admin/superadmin/billing', { token }),
        apiRequest('/api/admin/superadmin/versefeed-analytics', { token }),
        apiRequest('/api/admin/superadmin/reports/platform-growth', { token }),
        apiRequest('/api/admin/superadmin/notifications', { token }),
        apiRequest('/api/admin/superadmin/post-reports', { token }).catch(() => ({ reports: [] }))
      ]);

      setOverview(overviewData);
      setHealth(healthData.health);
      setTraffic(trafficData);
      setBusinessUsers(businessData.users || []);
      setCreatorUsers(creatorData.users || []);
      setAuditLogs(auditData.logs || []);
      setPlans(plansData.plans || []);
      setCoupons(couponsData.coupons || []);
      setBilling(billingData || { subscriptions: [], orders: [], invoices: [], transactions: [] });
      setVerseAnalytics(verseData);
      setReport(reportData.report);
      setNotifications(notificationsData.notifications || []);
      setPostReports(postReportsData.reports || []);
    } catch (requestError) {
      setError(requestError.message || 'Could not load superadmin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
    const interval = window.setInterval(loadData, 15000);
    return () => window.clearInterval(interval);
  }, [token, search]);

  useEffect(() => {
    if (!token) return undefined;
    const source = new EventSource(`${API_URL}/api/admin/superadmin/realtime?access_token=${encodeURIComponent(token)}`, { withCredentials: false });
    source.addEventListener('snapshot', (event) => {
      try {
        setRealtime(JSON.parse(event.data));
      } catch {
        setRealtime(null);
      }
    });
    source.onerror = () => source.close();
    return () => source.close();
  }, [token]);

  const openUser = async (id) => {
    setSelectedUser({ loading: true });
    try {
      const detail = await apiRequest(`/api/admin/superadmin/users/${id}`, { token });
      setSelectedUser(detail);
    } catch (requestError) {
      setError(requestError.message || 'Could not load user details.');
      setSelectedUser(null);
    }
  };

  const updateUser = async (id, payload) => {
    try {
      const response = await apiRequest(`/api/admin/superadmin/users/${id}`, {
        method: 'PUT',
        token,
        body: payload
      });
      const detail = await apiRequest(`/api/admin/superadmin/users/${id}`, { token });
      setSelectedUser(detail);
      loadData();
      return response;
    } catch (requestError) {
      throw new Error(requestError.message || 'Could not update user.');
    }
  };

  const updatePostReport = async (id, payload) => {
    setPostReportUpdatingId(id);
    setError('');
    try {
      const response = await apiRequest(`/api/admin/superadmin/post-reports/${id}`, {
        method: 'PATCH',
        token,
        body: payload
      });
      setPostReports(response.reports || []);
    } catch (requestError) {
      setError(requestError.message || 'Could not update post report.');
    } finally {
      setPostReportUpdatingId('');
    }
  };

  const quickStatusChange = async (id, accountStatus) => {
    return updateUser(id, { accountStatus });
  };

  const viewCouponUsage = async (coupon) => {
    setSelectedCouponRedemptions({ coupon, redemptions: [], loading: true });
    try {
      const data = await apiRequest(`/api/admin/superadmin/coupons/${coupon.id}/redemptions`, { token });
      setSelectedCouponRedemptions({ coupon, redemptions: data.redemptions || [], loading: false });
    } catch (requestError) {
      setError(requestError.message || 'Could not load coupon usage logs.');
      setSelectedCouponRedemptions(null);
    }
  };

  const refreshCoupons = async () => {
    const couponsData = await apiRequest('/api/admin/superadmin/coupons', { token });
    setCoupons(couponsData.coupons || []);
  };

  const updateCouponForm = (field, value) => {
    setCouponForm((current) => ({ ...current, [field]: value }));
  };

  const toggleCouponPlan = (planId) => {
    setCouponForm((current) => {
      const exists = current.applicablePlanIds.includes(planId);
      return {
        ...current,
        applicablePlanIds: exists
          ? current.applicablePlanIds.filter((id) => id !== planId)
          : [...current.applicablePlanIds, planId]
      };
    });
  };

  const resetCouponForm = () => {
    setCouponForm(emptyCouponForm);
    setEditingCouponId(null);
    setCouponMessage('');
  };

  const normalizeCouponPayload = () => ({
    code: couponForm.code.trim(),
    title: couponForm.title.trim(),
    discountType: couponForm.discountType,
    discountValue: Number(couponForm.discountValue || 0),
    usageLimit: couponForm.usageLimit === '' ? null : Number(couponForm.usageLimit),
    perUserLimit: 1,
    startsAt: couponForm.startsAt ? new Date(couponForm.startsAt).toISOString() : null,
    endsAt: couponForm.endsAt ? new Date(couponForm.endsAt).toISOString() : null,
    applicablePlanIds: couponForm.applicablePlanIds,
    userIds: couponForm.userIds
      .split(/[\n,]/)
      .map((value) => value.trim())
      .filter(Boolean),
    isActive: couponForm.isActive
  });

  const saveCoupon = async (event) => {
    event.preventDefault();
    setCouponSaving(true);
    setCouponMessage('');
    setError('');
    try {
      const payload = normalizeCouponPayload();
      if (payload.discountType === 'percentage' && payload.discountValue > 100) {
        throw new Error('Percentage discount cannot be more than 100%.');
      }
      await apiRequest(
        editingCouponId ? `/api/admin/superadmin/coupons/${editingCouponId}` : '/api/admin/superadmin/coupons',
        {
          token,
          method: editingCouponId ? 'PUT' : 'POST',
          body: payload
        }
      );
      await refreshCoupons();
      setCouponMessage(editingCouponId ? 'Coupon updated successfully.' : 'Coupon created successfully.');
      setCouponForm(emptyCouponForm);
      setEditingCouponId(null);
    } catch (requestError) {
      setError(requestError.message || 'Could not save coupon.');
    } finally {
      setCouponSaving(false);
    }
  };

  const editCoupon = (coupon) => {
    setActiveTab('Coupons');
    setEditingCouponId(coupon.id);
    setCouponMessage('');
    setCouponForm({
      code: coupon.code || '',
      title: coupon.title || '',
      discountType: coupon.discount_type || 'percentage',
      discountValue: coupon.discount_value || 0,
      usageLimit: coupon.usage_limit ?? '',
      perUserLimit: coupon.per_user_limit || 1,
      startsAt: coupon.starts_at ? coupon.starts_at.slice(0, 10) : '',
      endsAt: coupon.ends_at ? coupon.ends_at.slice(0, 10) : '',
      applicablePlanIds: coupon.applicable_plan_ids || [],
      userIds: (coupon.user_ids || []).join('\n'),
      isActive: Boolean(coupon.is_active)
    });
  };

  const changeCouponStatus = async (coupon) => {
    setError('');
    try {
      await apiRequest(`/api/admin/superadmin/coupons/${coupon.id}/status`, {
        token,
        method: 'PATCH',
        body: { isActive: !coupon.is_active }
      });
      await refreshCoupons();
    } catch (requestError) {
      setError(requestError.message || 'Could not update coupon status.');
    }
  };

  const deleteCoupon = async (coupon) => {
    setError('');
    try {
      await apiRequest(`/api/admin/superadmin/coupons/${coupon.id}`, {
        token,
        method: 'DELETE'
      });
      await refreshCoupons();
      if (editingCouponId === coupon.id) resetCouponForm();
    } catch (requestError) {
      setError(requestError.message || 'Could not delete coupon.');
    }
  };

  const statRows = useMemo(() => {
    const stats = overview?.stats || {};
    return [
      ['Total Users', formatNumber(stats.totalUsers), Users, 'blue'],
      ['BusinessVerse Users', formatNumber(stats.totalBusinessVerseUsers), Users, 'orange'],
      ['CreatorVerse Users', formatNumber(stats.totalCreatorVerseUsers), Users, 'blue'],
      ['Online Users', formatNumber(stats.totalOnlineUsers), Wifi, 'emerald'],
      ['Total Posts', formatNumber(stats.totalPosts), BarChart3, 'slate'],
      ['Total Likes', formatNumber(stats.totalLikes), Activity, 'orange'],
      ['Total Shares', formatNumber(stats.totalShares), TrendingUp, 'blue'],
      ['Revenue', formatCurrency(stats.totalRevenue), Crown, 'emerald']
    ];
  }, [overview]);

  return (
    <>
    <main className="min-h-screen bg-[#f8fbff] px-6 py-8 text-slate-950 md:px-10">
      {selectedUser?.loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40">
          <div className="rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-600"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading user...</div>
        </div>
      ) : <UserDetailPanel detail={selectedUser} onClose={() => setSelectedUser(null)} onUpdateUser={updateUser} onQuickStatusChange={quickStatusChange} />}

      {selectedCouponRedemptions && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 px-4 py-8 backdrop-blur-sm flex items-center justify-center">
          <div className="mx-auto w-full max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_90px_rgba(15,23,42,0.25)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Coupon Usage Logs</div>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-slate-900">
                  Redemptions for <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white ml-2">{selectedCouponRedemptions.coupon.code}</span>
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">{selectedCouponRedemptions.coupon.title}</p>
              </div>
              <button type="button" onClick={() => setSelectedCouponRedemptions(null)} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-200">Close</button>
            </div>

            <div className="mt-6 max-h-[400px] overflow-y-auto rounded-2xl border border-slate-100">
              {selectedCouponRedemptions.loading ? (
                <div className="p-10 text-center text-sm font-bold text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading redemption logs...
                </div>
              ) : selectedCouponRedemptions.redemptions.length ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Mobile</th>
                      <th className="p-3">Plan</th>
                      <th className="p-3 text-right">Discount</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCouponRedemptions.redemptions.map((redemption) => (
                      <tr key={redemption.id} className="border-t border-slate-100 text-slate-700">
                        <td className="p-3 font-semibold">
                          <div className="font-black text-slate-900">{redemption.member?.full_name || 'N/A'}</div>
                          <div className="text-xs text-slate-400">{redemption.member?.email}</div>
                        </td>
                        <td className="p-3 text-xs font-semibold">{redemption.member?.mobile_number || 'N/A'}</td>
                        <td className="p-3 text-xs font-black uppercase tracking-[0.08em] text-blue-700">{redemption.plan?.name}</td>
                        <td className="p-3 text-right font-black text-slate-900">Rs {redemption.discount_amount_inr}</td>
                        <td className="p-3 text-xs font-semibold text-slate-500">{new Date(redemption.created_at).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-10 text-center text-sm font-bold text-slate-500">
                  No redemptions found for this coupon.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1600px]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          {/* Back navigation */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Previous Page
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                <Crown className="h-4 w-4 text-orange-500" />
                Enterprise Super Admin
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-[-0.035em] text-slate-950 md:text-5xl">Platform command center.</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Live users, subscriptions, health, traffic, VerseFeed activity, and owner-level controls connected to the production database.
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-2.5 text-sm font-black transition ${
                  activeTab === tab ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {error && <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{error}</div>}

        {loading ? (
          <div className="mt-8 flex items-center justify-center rounded-[2rem] border border-slate-200 bg-white p-12 text-sm font-black text-slate-500">
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            Loading live superadmin data...
          </div>
        ) : (
          <div>
            {activeTab === 'Overview' && (
              <div className="mt-8 space-y-8">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {statRows.map(([label, value, Icon, tone]) => <StatCard key={label} label={label} value={value} icon={Icon} tone={tone} />)}
                </div>

                <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Website Health</div>
                    <div className="mt-4 grid gap-3">
                      {[
                        ['Application', health?.application, Activity],
                        ['Database', health?.database, Database],
                        ['API', health?.api, Globe2],
                        ['Server', health?.server, Server],
                        ['Response', `${health?.averageResponseTimeMs || 0}ms`, Gauge],
                        ['Errors 15m', health?.errorCount15m || 0, AlertTriangle]
                      ].map(([label, value, Icon]) => (
                        <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-3 text-sm font-black text-slate-700"><Icon className="h-4 w-4 text-slate-400" />{label}</div>
                          <StatusPill value={value} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Live Traffic</div>
                        <h2 className="mt-1 text-xl font-black text-slate-900">Daily traffic and growth</h2>
                      </div>
                      <StatusPill value={`${traffic?.summary?.realTimeVisitors || 0} live`} />
                    </div>
                    <div className="mt-5 h-80">
                      <ResponsiveContainer width="100%" height={320} minWidth={0}>
                        <AreaChart data={traffic?.charts?.dailyTraffic || []}>
                          <defs>
                            <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip />
                          <Area type="monotone" dataKey="value" stroke="#2563eb" fill="url(#trafficFill)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
              </div>
              </div>
            )}

            {activeTab === 'Traffic' && (
              <div className="mt-8 grid gap-6 xl:grid-cols-2">
                <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-black text-slate-900">User growth trends</h2>
                  <div className="mt-5 h-80">
                    <ResponsiveContainer width="100%" height={320} minWidth={0}>
                      <LineChart data={traffic?.charts?.userGrowth || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-black text-slate-900">Device analytics</h2>
                  <div className="mt-5 h-80">
                    <ResponsiveContainer width="100%" height={320} minWidth={0}>
                      <PieChart>
                        <Pie data={traffic?.charts?.deviceAnalytics || []} dataKey="value" nameKey="label" innerRadius={70} outerRadius={110} paddingAngle={4}>
                          {(traffic?.charts?.deviceAnalytics || []).map((entry, index) => <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                  <h2 className="text-xl font-black text-slate-900">Browser analytics</h2>
                  <div className="mt-5 h-80">
                    <ResponsiveContainer width="100%" height={320} minWidth={0}>
                      <BarChart data={traffic?.charts?.browserAnalytics || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="label" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#2563eb" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {['Business Users', 'Creator Users'].includes(activeTab) && (
              <div className="mt-8 space-y-5">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, email, mobile..."
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-bold text-slate-800 outline-none focus:border-slate-400"
                  />
                </div>
                <UserTable
                  title={activeTab}
                  users={activeTab === 'Business Users' ? businessUsers : creatorUsers}
                  loading={loading}
                  onSelect={openUser}
                />
              </div>
            )}

            {activeTab === 'Subscriptions' && (
              <div className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-black text-slate-900">Plans</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Create/edit/delete APIs are connected in backend; this table is live from DB.</p>
                  <div className="mt-5 grid gap-3">
                    {plans.map((plan) => (
                      <div key={plan.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-black text-slate-900">{plan.name}</div>
                            <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{plan.code}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-black text-slate-900">Rs {plan.amount_inr}</div>
                            <StatusPill value={plan.is_active ? 'active' : 'inactive'} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-black text-slate-900">Subscriptions, orders, invoices, transactions</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-4">
                    <StatCard label="Subscriptions" value={formatNumber(billing.subscriptions?.length)} icon={ShieldCheck} tone="emerald" />
                    <StatCard label="Orders" value={formatNumber(billing.orders?.length)} icon={CreditCard || Activity} tone="blue" />
                    <StatCard label="Invoices" value={formatNumber(billing.invoices?.length)} icon={Database} tone="slate" />
                    <StatCard label="Transactions" value={formatNumber(billing.transactions?.length)} icon={Activity} tone="orange" />
                  </div>
                  <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        <tr><th className="p-3">User</th><th className="p-3">Plan</th><th className="p-3">Status</th><th className="p-3">Expires</th><th className="p-3">Source</th></tr>
                      </thead>
                      <tbody>
                        {(billing.subscriptions || []).slice(0, 12).map((item) => (
                          <tr key={item.id} className="border-t border-slate-100">
                            <td className="p-3 font-bold text-slate-700">{item.user_id}</td>
                            <td className="p-3 font-black text-slate-900">{item.plans?.name || 'Plan'}</td>
                            <td className="p-3"><StatusPill value={item.status} /></td>
                            <td className="p-3 font-semibold text-slate-500">{shortDate(item.expires_at)}</td>
                            <td className="p-3 font-semibold text-slate-500">{item.source}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Coupons' && (
              <>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <StatCard label="Total Coupons" value={formatNumber(coupons.length)} icon={Percent} tone="slate" />
                  <StatCard label="Active Coupons" value={formatNumber(coupons.filter((coupon) => coupon.is_active).length)} icon={ShieldCheck} tone="emerald" />
                  <StatCard label="Highest Discount" value={`${Math.max(0, ...coupons.filter((coupon) => coupon.discount_type === 'percentage').map((coupon) => coupon.discount_value || 0))}%`} icon={TrendingUp} tone="orange" />
                </div>

                <form onSubmit={saveCoupon} className="mt-6 rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
                        <Percent className="h-3.5 w-3.5" />
                        Coupon Builder
                      </div>
                      <h2 className="mt-3 text-2xl font-black tracking-[-0.02em] text-slate-900">{editingCouponId ? 'Edit coupon' : 'Create coupon'}</h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">Create the main coupon details first. Advanced plan/user limits stay compact below.</p>
                    </div>
                    <div className="flex gap-2">
                      {editingCouponId && (
                        <button type="button" onClick={resetCouponForm} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">
                          New coupon
                        </button>
                      )}
                      <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-700">
                        <input
                          type="checkbox"
                          checked={couponForm.isActive}
                          onChange={(event) => updateCouponForm('isActive', event.target.checked)}
                          className="accent-slate-900"
                        />
                        Active
                      </label>
                    </div>
                  </div>

                  {couponMessage && (
                    <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
                      {couponMessage}
                    </div>
                  )}

                  <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1.6fr_1fr_0.8fr_0.8fr]">
                    <label className="grid gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Code</span>
                      <input
                        value={couponForm.code}
                        onChange={(event) => updateCouponForm('code', event.target.value.toUpperCase().replace(/\s/g, ''))}
                        placeholder="WELCOME10"
                        required
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-slate-900 outline-none focus:border-blue-300 focus:bg-white"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Title</span>
                      <input
                        value={couponForm.title}
                        onChange={(event) => updateCouponForm('title', event.target.value)}
                        placeholder="Launch offer for new members"
                        required
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-300 focus:bg-white"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Type</span>
                      <select
                        value={couponForm.discountType}
                        onChange={(event) => updateCouponForm('discountType', event.target.value)}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-900 outline-none focus:border-blue-300 focus:bg-white"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Rs</option>
                      </select>
                    </label>
                    <label className="grid gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Value</span>
                      <input
                        type="number"
                        min="1"
                        max={couponForm.discountType === 'percentage' ? '100' : undefined}
                        value={couponForm.discountValue}
                        onChange={(event) => updateCouponForm('discountValue', event.target.value)}
                        required
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-900 outline-none focus:border-blue-300 focus:bg-white"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={couponSaving}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 lg:mt-[1.35rem]"
                    >
                      {couponSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingCouponId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      {editingCouponId ? 'Update' : 'Create'}
                    </button>
                  </div>

                  <div className="mt-4 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Advanced controls</div>
                        <p className="mt-1 text-xs font-bold text-slate-500">Dates, plan targeting, usage limits, and user-specific coupons.</p>
                      </div>
                      <StatusPill value={couponForm.applicablePlanIds.length ? `${couponForm.applicablePlanIds.length} plan filters` : 'all plans'} />
                    </div>
                    <div className="grid gap-3 lg:grid-cols-3">
                      <label className="grid gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Start date</span>
                        <input
                          type="date"
                          value={couponForm.startsAt}
                          onChange={(event) => updateCouponForm('startsAt', event.target.value)}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-300"
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">End date</span>
                        <input
                          type="date"
                          value={couponForm.endsAt}
                          onChange={(event) => updateCouponForm('endsAt', event.target.value)}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-300"
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">User limit</span>
                        <input
                          type="number"
                          min="1"
                          value={couponForm.usageLimit}
                          onChange={(event) => updateCouponForm('usageLimit', event.target.value)}
                          placeholder="Unlimited"
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-300"
                        />
                        <span className="text-[11px] font-semibold text-slate-400">How many users can use this coupon.</span>
                      </label>
                    </div>
                    <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr]">
                      <div className="rounded-2xl border border-slate-200 bg-white p-3">
                        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Applicable plans</div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => updateCouponForm('applicablePlanIds', [])} className={`rounded-full border px-3 py-2 text-xs font-black ${couponForm.applicablePlanIds.length === 0 ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>
                            All plans
                          </button>
                          {plans.map((plan) => (
                            <button
                              key={plan.id}
                              type="button"
                              onClick={() => toggleCouponPlan(plan.id)}
                              className={`rounded-full border px-3 py-2 text-xs font-black ${
                                couponForm.applicablePlanIds.includes(plan.id)
                                  ? plan.account_type === 'business'
                                    ? 'border-orange-200 bg-orange-50 text-orange-700'
                                    : 'border-blue-200 bg-blue-50 text-blue-700'
                                  : 'border-slate-200 text-slate-600'
                              }`}
                            >
                              {plan.account_type || 'Plan'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <label className="grid gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">User-specific UUIDs</span>
                        <textarea
                          value={couponForm.userIds}
                          onChange={(event) => updateCouponForm('userIds', event.target.value)}
                          placeholder="Optional: one user UUID per line"
                          rows={3}
                          className="resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-300"
                        />
                      </label>
                    </div>
                  </div>
                </form>

                <div className="mt-6 rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-black text-slate-900">Coupon Engine</h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          Create offers like WELCOME10, STARTUP20, or user-specific premium discounts.
                        </p>
                      </div>
                      <StatusPill value={`${coupons.length} coupons`} />
                    </div>
                    <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100">
                      <table className="w-full min-w-[1080px] text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          <tr><th className="p-3">Code</th><th className="p-3">Title</th><th className="p-3">Discount</th><th className="p-3">Usage</th><th className="p-3">Plans</th><th className="p-3">Dates</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
                        </thead>
                        <tbody>
                          {coupons.length ? coupons.map((coupon) => (
                            <tr key={coupon.id} className="border-b border-slate-100 align-top">
                              <td className="p-3">
                                <div className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white">{coupon.code}</div>
                              </td>
                              <td className="p-3">
                                <div className="font-black text-slate-900">{coupon.title}</div>
                                <div className="mt-1 text-xs font-bold text-slate-400">{(coupon.user_ids || []).length ? `${coupon.user_ids.length} selected users` : 'All eligible users'}</div>
                              </td>
                              <td className="p-3 font-black text-slate-900">
                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% off` : `Rs ${coupon.discount_value} off`}
                                <div className="mt-1 text-xs font-bold capitalize text-slate-400">{coupon.discount_type}</div>
                              </td>
                              <td className="p-3 font-semibold text-slate-600">
                                <div>{coupon.usage_limit ? `${coupon.usage_limit} users` : 'Unlimited users'}</div>
                              </td>
                              <td className="p-3">
                                <div className="flex max-w-xs flex-wrap gap-2">
                                  {(coupon.applicable_plan_ids || []).length ? coupon.applicable_plan_ids.map((planId) => {
                                    const plan = plans.find((item) => item.id === planId);
                                    return (
                                      <span key={planId} className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-blue-700">
                                        {plan?.account_type || 'plan'}
                                      </span>
                                    );
                                  }) : (
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-slate-600">All plans</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 font-semibold text-slate-600">{shortDate(coupon.starts_at)} - {shortDate(coupon.ends_at)}</td>
                              <td className="p-3"><StatusPill value={coupon.is_active ? 'active' : 'inactive'} /></td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-2">
                                  <button type="button" onClick={() => viewCouponUsage(coupon)} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">
                                    <Eye className="mr-1 inline h-3.5 w-3.5" />Usage
                                  </button>
                                  <button type="button" onClick={() => editCoupon(coupon)} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">
                                    <Pencil className="mr-1 inline h-3.5 w-3.5" />Edit
                                  </button>
                                  <button type="button" onClick={() => changeCouponStatus(coupon)} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">
                                    {coupon.is_active ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <button type="button" onClick={() => deleteCoupon(coupon)} className="rounded-full border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-black text-rose-600 hover:bg-rose-100">
                                    <Trash2 className="mr-1 inline h-3.5 w-3.5" />Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="8" className="p-10 text-center">
                                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-orange-600">
                                  <Percent className="h-5 w-5" />
                                </div>
                                <div className="mt-3 text-sm font-black text-slate-900">No coupons created yet.</div>
                                <div className="mt-1 text-sm font-semibold text-slate-500">Create your first percentage coupon from the form.</div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
              </>
            )}

            {activeTab === 'Verse Analytics' && (
              <div className="mt-8 grid gap-6 xl:grid-cols-2">
                {[
                  ['Most Viewed Posts', verseAnalytics?.posts?.mostViewed || [], 'views'],
                  ['Most Liked Posts', verseAnalytics?.posts?.mostLiked || [], 'likes'],
                  ['Most Shared Posts', verseAnalytics?.posts?.mostShared || [], 'shares'],
                  ['Highest Engagement Posts', verseAnalytics?.posts?.highestEngagement || [], 'engagementScore']
                ].map(([title, rows, key]) => (
                  <div key={title} className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900">{title}</h2>
                    <div className="mt-4 space-y-3">
                      {rows.slice(0, 6).map((post) => (
                        <div key={post.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <div className="line-clamp-1 text-sm font-black text-slate-900">{post.caption}</div>
                          <div className="mt-1 text-xs font-bold text-slate-400">{formatNumber(key === 'engagementScore' ? post.engagementScore : post.metrics?.[key])} {key}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                  <h2 className="text-xl font-black text-slate-900">Hashtag Analytics</h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {(verseAnalytics?.hashtags?.trending || []).map((tag) => (
                      <span key={tag.hashtag} className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">{tag.hashtag} · {formatNumber(tag.engagement)}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Reports' && (
              <>
                <div className="mt-8 rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Reports Engine</h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">Live report data for user, revenue, subscription, creator, business, engagement, and platform growth.</p>
                    </div>
                    <button type="button" onClick={() => exportCsv(report?.data?.userGrowth || [], 'user-growth-report.csv')} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-black text-white">Export CSV</button>
                  </div>
                  <div className="mt-6 h-80">
                    <ResponsiveContainer width="100%" height={320} minWidth={0}>
                      <LineChart data={report?.data?.userGrowth || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <PostReportsPanel
                  reports={postReports}
                  onUpdate={updatePostReport}
                  updatingId={postReportUpdatingId}
                  title="Reported posts and videos"
                />
              </>
            )}

            {activeTab === 'Audit' && (
              <div className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <h2 className="text-xl font-black text-slate-900">Notification Center</h2>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {notifications.length ? notifications.slice(0, 10).map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-black text-slate-900">{item.title}</div>
                          <StatusPill value={item.read_at ? 'read' : 'new'} />
                        </div>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{item.body}</p>
                      </div>
                    )) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm font-bold text-slate-500">
                        No notifications yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-slate-500" />
                    <h2 className="text-xl font-black text-slate-900">Security audit log</h2>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {auditLogs.length ? auditLogs.map((log) => (
                      <div key={log.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="font-black text-slate-900">{log.action}</div>
                          <div className="text-xs font-bold text-slate-400">{shortDate(log.created_at)}</div>
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-500">{log.entity_type || 'system'} · {log.actor_role || 'unknown role'}</div>
                      </div>
                    )) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm font-bold text-slate-500">
                        Audit logs will appear as privileged actions are performed.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
    </>
  );
};

export default SuperAdminDashboard;
