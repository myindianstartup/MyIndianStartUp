import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { apiRequest } from '@/lib/apiClient';

const AuthContext = createContext(null);

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

        const created = await apiRequest('/api/members/me', {
          method: 'PUT',
          token: activeSession.access_token,
          body: {
            fullName,
            accountType: pendingAccountType
          }
        });

        currentMember = created.member || null;
        window.localStorage.setItem('myindianstartup_account_type', pendingAccountType);
        window.localStorage.removeItem('myindianstartup_pending_account_type');
      }

      if (currentMember && ['business', 'creator'].includes(pendingAccountType) && currentMember.account_type !== pendingAccountType) {
        const fallbackName = activeSession.user?.email ? activeSession.user.email.split('@')[0] : 'MyIndianStartup Member';
        const fullName = currentMember.full_name || fallbackName;
        const updated = await apiRequest('/api/members/me', {
          method: 'PUT',
          token: activeSession.access_token,
          body: {
            fullName,
            mobileNumber: currentMember.mobile_number || undefined,
            accountType: pendingAccountType
          }
        });
        currentMember = updated.member || currentMember;
        window.localStorage.setItem('myindianstartup_account_type', pendingAccountType);
        window.localStorage.removeItem('myindianstartup_pending_account_type');
      } else if (currentMember?.account_type) {
        window.localStorage.setItem('myindianstartup_account_type', currentMember.account_type);
        window.localStorage.removeItem('myindianstartup_pending_account_type');
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
      console.error('Error in refreshMember:', error);
      setMember(null);
      setAdminRole(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
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
