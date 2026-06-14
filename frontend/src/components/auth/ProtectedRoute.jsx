import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const adminDashboardPath = (role) => (role === 'superadmin' ? '/superadmin' : '/admin');

const ProtectedRoute = ({ children, adminOnly = false, superAdminOnly = false, memberOnly = false }) => {
  const { isAuthenticated, loading, adminRole } = useAuth();
  const location = useLocation();
  const isAdminUser = ['admin', 'superadmin'].includes(adminRole);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fbff] text-slate-600">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold shadow-sm">
          Checking your session...
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

  return children;
};

export default ProtectedRoute;
