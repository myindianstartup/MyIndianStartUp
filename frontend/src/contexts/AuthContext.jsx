import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { apiRequest } from '@/lib/apiClient';

const AuthContext = createContext(null);

const normalizeAccountType = (value) => {
  const normalized = String(value || '').toLowerCase();
  return ['business', 'creator'].includes(normalized) ? normalized : '';
};

const fallbackMemberFromSession = (activeSession) => {
  const authUser = activeSession?.user;
  if (!authUser) return null;

  const metadata = authUser.user_metadata || {};
  const accountType = normalizeAccountType(
    metadata.account_type
    || window.localStorage.getItem('myindianstartup_account_type')
    || window.localStorage.getItem('myindianstartup_pending_account_type')
  );

  if (!accountType) return null;

  return {
    id: authUser.id,
    email: authUser.email,
    full_name: metadata.full_name || metadata.name || authUser.email?.split('@')[0] || 'Member',
    mobile_number: metadata.mobile_number || null,
    account_type: accountType,
    subscription_status: 'inactive',
    profile_image_url: ''
  };
};

const waitForUrlSessionClockSkew = async () => {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.hash.replace(/^#/, '') || window.location.search.replace(/^\?/, ''));
  const accessToken = params.get('access_token');
  if (!accessToken) return;

  try {
    const [, payload] = accessToken.split('.');
    if (!payload) return;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(window.atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')));
    const issuedAt = Number(decoded.iat || 0);
    const now = Math.floor(Date.now() / 1000);
    if (issuedAt > now && issuedAt - now <= 10) {
      await new Promise((resolve) => setTimeout(resolve, (issuedAt - now + 1) * 1000));
    }
  } catch {
    // Supabase can still parse the URL session normally if this guard cannot.
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [adminRole, setAdminRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = session?.access_token || null;

  const refreshMember = useCallback(async (activeSession) => {
    if (!activeSession?.access_token) {
      setMember(null);
      setAdminRole(null);
      return null;
    }

    try {
      const data = await apiRequest('/api/members/me', { token: activeSession.access_token });
      let currentMember = data.member || null;

      const pendingAccountType = window.localStorage.getItem('myindianstartup_pending_account_type');
      if (!currentMember && ['business', 'creator'].includes(pendingAccountType)) {
        const authUser = activeSession.user;
        const metadata = authUser?.user_metadata || {};
        const fallbackName = authUser?.email ? authUser.email.split('@')[0] : 'MyIndianStartup Member';
        const fullName = metadata.full_name || metadata.name || fallbackName;

        // BUG-05 Fix: also pass mobileNumber from Google metadata if available
        const created = await apiRequest('/api/members/me', {
          method: 'PUT',
          token: activeSession.access_token,
          body: {
            fullName,
            accountType: pendingAccountType,
            mobileNumber: metadata.mobile_number || metadata.phone || null
          }
        });

        currentMember = created.member || null;
        window.localStorage.setItem('myindianstartup_account_type', pendingAccountType);
        window.localStorage.removeItem('myindianstartup_pending_account_type');
      }

      if (currentMember?.account_type) {
        window.localStorage.setItem('myindianstartup_account_type', currentMember.account_type);
        window.localStorage.removeItem('myindianstartup_pending_account_type');
      }

      if (!currentMember) {
        currentMember = fallbackMemberFromSession(activeSession);
      }

      setMember(currentMember);

      try {
        const roleData = await apiRequest('/api/admin/me', { token: activeSession.access_token });
        setAdminRole(roleData.role || null);
      } catch {
        setAdminRole(null);
      }

      return currentMember;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error in refreshMember:', error);
      }
      const fallbackMember = fallbackMemberFromSession(activeSession);
      if (fallbackMember?.account_type) {
        window.localStorage.setItem('myindianstartup_account_type', fallbackMember.account_type);
      }
      setMember(fallbackMember);
      setAdminRole(null);
      return fallbackMember;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      await waitForUrlSessionClockSkew();
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      setSession(data.session);
      setUser(data.session?.user || null);
      await refreshMember(data.session);
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user || null);
      await refreshMember(nextSession);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [refreshMember]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setMember(null);
    setAdminRole(null);
    window.localStorage.removeItem('myindianstartup_auth_mode');
    window.localStorage.removeItem('myindianstartup_auth_provider');
    window.localStorage.removeItem('myindianstartup_account_type');
    window.localStorage.removeItem('myindianstartup_pending_account_type');
    window.localStorage.removeItem('myindianstartup_login_email');
  }, []);

  const value = useMemo(() => ({
    session,
    user,
    member,
    token,
    adminRole,
    loading,
    isAuthenticated: Boolean(user),
    refreshMember,
    signOut
  }), [adminRole, loading, member, refreshMember, session, signOut, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
