import React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const adminDashboardPath = (role) => (role === 'superadmin' ? '/superadmin' : '/admin');

const isActiveSubscription = (member) => (
  ['active', 'trialing', 'paid'].includes(String(member?.subscription_status || '').toLowerCase())
);

const ProtectedRoute = ({
  children,
  adminOnly = false,
  superAdminOnly = false,
  memberOnly = false,
  requiresActiveSubscription = false
}) => {
  const { isAuthenticated, loading, adminRole, member } = useAuth();
  const location = useLocation();
  const isAdminUser = ['admin', 'superadmin'].includes(adminRole);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fbff] px-5 text-slate-600">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.6rem] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-100">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <h2 className="mt-6 text-2xl font-black tracking-[-0.03em] text-slate-950">
            Preparing your workspace
          </h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
            We are verifying your session and loading the right experience for your account.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            Checking your session...
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 w-3/4 animate-pulse rounded-full bg-blue-500" />
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 w-2/3 animate-pulse rounded-full bg-orange-400" />
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 w-4/5 animate-pulse rounded-full bg-slate-300" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (superAdminOnly && adminRole !== 'superadmin') {
    return <Navigate to={adminRole === 'admin' ? '/admin' : '/post-verse'} replace />;
  }

  if (adminOnly && !['admin', 'superadmin'].includes(adminRole)) {
    return <Navigate to="/post-verse" replace />;
  }

  if (memberOnly && isAdminUser) {
    return <Navigate to={adminDashboardPath(adminRole)} replace />;
  }

  if (requiresActiveSubscription && !isActiveSubscription(member)) {
    return <Navigate to="/pricing" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
