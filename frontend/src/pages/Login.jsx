import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react';
import GoogleLogo from '@/components/auth/GoogleLogo';
import BrandLogo from '@/components/site/BrandLogo';
import { getAuthRedirectUrl, supabase } from '@/lib/supabaseClient';
import { apiRequest } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshMember } = useAuth();
  const [googleAccountType, setGoogleAccountType] = useState('business');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const googleTheme = googleAccountType === 'business'
    ? {
        label: 'BusinessVerse',
        text: 'text-orange-600',
        border: 'border-orange-100',
        soft: 'bg-orange-50',
        hover: 'hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600',
        ring: 'ring-orange-100',
        button: 'bg-orange-500 hover:bg-orange-600 shadow-[0_14px_32px_rgba(249,115,22,0.22)]'
      }
    : {
        label: 'CreatorVerse',
        text: 'text-blue-600',
        border: 'border-blue-100',
        soft: 'bg-blue-50',
        hover: 'hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600',
        ring: 'ring-blue-100',
        button: 'bg-blue-600 hover:bg-blue-700 shadow-[0_14px_32px_rgba(37,99,235,0.22)]'
      };

  const handleGoogleLogin = async () => {
    setFormError('');
    setGoogleLoading(true);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('myindianstartup_auth_mode', 'login');
      window.localStorage.setItem('myindianstartup_auth_provider', 'google');
      window.localStorage.setItem('myindianstartup_pending_account_type', googleAccountType);
    }

    // Redirect to root '/' so GoDaddy/any host serves index.html,
    // then React + Supabase detectSessionInUrl handles the token and navigates internally.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthRedirectUrl('/')
      }
    });

    if (error) {
      setGoogleLoading(false);
      setFormError(error.message || 'Google sign in could not start. Please try again.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setFormError('Please enter your password.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters. If you recently reset your password, please use the new one.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      setLoading(false);
      let errorMsg = error?.message || 'Login failed. Please check your details.';
      if (errorMsg.toLowerCase().includes('invalid login credentials') || errorMsg.toLowerCase().includes('invalid credentials')) {
        errorMsg = 'No account found with this email, or the password you entered is incorrect. Please verify your credentials or click "Create account first".';
      }
      setFormError(errorMsg);
      return;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('myindianstartup_auth_mode', 'login');
      window.localStorage.setItem('myindianstartup_auth_provider', 'gmail');
      window.localStorage.setItem('myindianstartup_login_email', email);
    }

    const currentMember = await refreshMember(data.session);

    try {
      const roleData = await apiRequest('/api/admin/me', { token: data.session.access_token });
      if (roleData.role === 'superadmin') {
        navigate('/superadmin', { replace: true });
        return;
      }
      if (roleData.role === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }
    } catch {
      // Non-admin users continue to their dashboard.
    }

    const requestedPath = location.state?.from || '';
    const hasActiveMembership = ['active', 'trialing', 'paid'].includes(String(currentMember?.subscription_status || '').toLowerCase());
    navigate(hasActiveMembership ? requestedPath || '/post-verse' : '/pricing', { replace: true });
    setLoading(false);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfcff] text-slate-950">
      <style>{`
        .auth-fade-in {
          opacity: 0;
          transform: translateY(18px);
          animation: authFadeIn 0.75s ease-out forwards;
        }

        .auth-login-panel {
          opacity: 0;
          transform: translateY(22px);
          animation: authFadeIn 0.75s ease-out 0.12s forwards;
        }

        @keyframes authFadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-height: 760px) and (min-width: 768px) {
          .auth-short-hide {
            display: none;
          }
        }
      `}</style>
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-5 py-4 md:grid-cols-[0.95fr_1.05fr] md:items-center md:px-8 lg:gap-10 lg:px-12">
        <section className="relative flex min-h-[calc(100vh-2.5rem)] flex-col justify-center overflow-hidden p-2 md:min-h-0 md:p-3">
          <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-blue-500/10 blur-[120px]" />
          <div className="absolute right-0 bottom-16 h-80 w-80 rounded-full bg-orange-500/10 blur-[120px]" />

          <Link to="/" className="relative z-10 flex w-fit items-center gap-2.5">
            <BrandLogo />
          </Link>

          <div className="relative z-10 mx-auto mt-5 flex w-full max-w-xl flex-col justify-center">
            <div className="auth-fade-in flex min-h-[210px] items-end justify-center px-3 pt-3 md:min-h-[245px] lg:min-h-[280px]">
              <img
                src="/assets/auth-characters.png"
                alt="Business and creator collaboration"
                className="max-h-[240px] w-auto object-contain drop-shadow-[0_24px_38px_rgba(15,23,42,0.18)] md:max-h-[265px] lg:max-h-[300px]"
              />
            </div>

            <div className="mt-4 md:mt-5">
              <div className="text-[11px] font-black uppercase tracking-[0.32em] text-slate-500">Member workspace access</div>
              <h1 className="mt-2 max-w-2xl text-3xl font-black leading-[1.03] tracking-[-0.05em] text-slate-950 lg:text-[2.35rem]">
                Sign in to build trusted partnerships faster.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 lg:text-base">
                Access PostVerse, SearchVerse, VerseFeed, and your BusinessVerse or CreatorVerse workspace.
              </p>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ['Rs 999/year', 'Flat membership'],
                  ['0%', 'No commission'],
                  ['Direct', 'Business deals']
                ].map(([value, label]) => (
                  <div key={label}>
                    <div className="text-xl font-black tracking-tight text-slate-800 lg:text-2xl">{value}</div>
                    <div className="mt-0.5 text-xs font-semibold text-slate-600 lg:text-sm">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="auth-login-panel rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_90px_rgba(15,23,42,0.12)] md:p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-700">
            <BadgeCheck className="h-3.5 w-3.5" />
            Member login
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950">Welcome Back</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Sign in to access your BusinessVerse or CreatorVerse account.
          </p>

          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-800">Email Address</span>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-100">
                <Mail className="h-5 w-5 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  placeholder="you@gmail.com"
                  required
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-800">Password</span>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-100">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {formError && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                {formError}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold">
              <label className="inline-flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-500" />
                <span>Remember Me</span>
              </label>
              <Link to="/forgot-password" className="text-slate-700 transition-colors hover:text-slate-950">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_32px_rgba(15,23,42,0.22)] transition-all hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <span>{loading ? 'Logging in...' : 'Login'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="my-5 flex items-center gap-4">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">or</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="mb-3 rounded-[1.35rem] border border-slate-200 bg-[#f8fafc] p-2">
            <div className="px-2 pb-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
              Continue with Google as
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'business', label: 'BusinessVerse' },
                { key: 'creator', label: 'CreatorVerse' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setGoogleAccountType(item.key)}
                  className={`rounded-full px-3 py-2.5 text-sm font-black transition-all ${
                    googleAccountType === item.key
                      ? item.key === 'business'
                        ? 'bg-white text-orange-600 shadow-sm ring-1 ring-orange-100'
                        : 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-100'
                      : 'text-slate-500 hover:bg-white/70 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            aria-label={`Sign in with Google as ${googleTheme.label}`}
            className={`inline-flex w-full items-center justify-center gap-3 rounded-full border bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${googleTheme.border} ${googleTheme.hover}`}
          >
            <GoogleLogo className="h-5 w-5" />
            <span>{googleLoading ? 'Opening Google...' : `Sign in with Google as ${googleTheme.label}`}</span>
          </button>

          <Link
            to="/signup"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
          >
            <span>Create account first</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="auth-short-hide mt-5 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-950">Secure account flow</div>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Signup creates your member account. Login then opens your daily visibility feed, profile, and search.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
