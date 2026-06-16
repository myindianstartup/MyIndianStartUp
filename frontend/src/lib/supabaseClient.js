import { createClient } from '@supabase/supabase-js';

const normalizeSupabaseUrl = (value) => {
  const raw = String(value || '').trim().replace(/\/+$/, '');
  if (!raw) return '';
  return raw.replace(/\/rest\/v1$/i, '');
};

const resolveAppOrigin = () => {
  const configured = String(process.env.REACT_APP_SITE_URL || '').trim().replace(/\/+$/, '');
  if (configured) return configured;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
};

const supabaseUrl = normalizeSupabaseUrl(process.env.REACT_APP_SUPABASE_URL);
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY');
}

export const getAuthRedirectUrl = (path = '/') => {
  const origin = resolveAppOrigin();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
