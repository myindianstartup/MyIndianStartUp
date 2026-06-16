import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Eye, EyeOff, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import GoogleLogo from '@/components/auth/GoogleLogo';
import BrandLogo from '@/components/site/BrandLogo';
import { getAuthRedirectUrl, supabase } from '@/lib/supabaseClient';
import { apiRequest } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\-\s0-9]{7,20}$/;

const SignUp = () => {
  const navigate = useNavigate();
  const { refreshMember } = useAuth();
  const [accountType, setAccountType] = useState('business');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const focusTone = accountType === 'business'
    ? 'focus-within:border-orange-500 focus-within:ring-orange-100'
    : 'focus-within:border-blue-600 focus-within:ring-blue-100';
  const leftPanelTheme = accountType === 'business'
    ? {
        label: 'text-orange-600',
        icon: 'bg-orange-500 shadow-[0_12px_26px_rgba(249,115,22,0.24)]',
        stepNumber: 'text-orange-600',
        glowPrimary: 'bg-orange-500/10',
        glowSecondary: 'bg-blue-500/5',
        stat: 'text-orange-600',
        button: 'bg-orange-500 shadow-[0_14px_32px_rgba(249,115,22,0.28)] hover:bg-orange-600',
        checkbox: 'text-orange-500 focus:ring-orange-500'
      }
    : {
        label: 'text-blue-600',
        icon: 'bg-blue-600 shadow-[0_12px_26px_rgba(37,99,235,0.22)]',
        stepNumber: 'text-blue-600',
        glowPrimary: 'bg-blue-500/10',
        glowSecondary: 'bg-orange-500/5',
        stat: 'text-blue-600',
        button: 'bg-blue-600 shadow-[0_14px_32px_rgba(37,99,235,0.28)] hover:bg-blue-700',
        checkbox: 'text-blue-600 focus:ring-blue-600'
      };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get('fullName') || '').trim();
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const mobileNumber = String(formData.get('mobileNumber') || '').trim();
    const password = String(formData.get('password') || '');
    const confirmPassword = String(formData.get('confirmPassword') || '');
    const acceptedTerms = formData.get('terms') === 'on';

    if (fullName.length < 2) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!emailPattern.test(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (mobileNumber && !phonePattern.test(mobileNumber)) {
      setFormError('Please enter a valid mobile number.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setFormError('Password must include at least one letter and one number.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Confirm password does not match.');
      return;
    }

    if (!acceptedTerms) {
      setFormError('Please agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          mobile_number: mobileNumber || null,
          account_type: accountType
        }
      }
    });

    if (error) {
      setLoading(false);
      setFormError(error.message || 'Could not create your account. Please try again.');
      return;
    }

    if (!data.session) {
      setLoading(false);
      setSuccessMessage('Account created. Please confirm your email, then login to open your workspace.');
      return;
    }

    try {
      await apiRequest('/api/members/me', {
        method: 'PUT',
        token: data.session.access_token,
        body: { fullName, mobileNumber, accountType }
      });
      await refreshMember(data.session);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('myindianstartup_auth_mode', 'signup');
        window.localStorage.setItem('myindianstartup_auth_provider', 'gmail');
        window.localStorage.setItem('myindianstartup_account_type', accountType);
        window.localStorage.setItem('myindianstartup_login_email', email);
      }

      navigate('/pricing', { replace: true });
    } catch (requestError) {
      setFormError(requestError.message || 'Account was created, but profile setup failed. Please login and try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setFormError('');
    setSuccessMessage('');
    setGoogleLoading(true);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('myindianstartup_auth_mode', 'signup');
      window.localStorage.setItem('myindianstartup_auth_provider', 'google');
      window.localStorage.setItem('myindianstartup_pending_account_type', accountType);
      window.localStorage.setItem('myindianstartup_account_type', accountType);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthRedirectUrl('/pricing')
      }
    });

    if (error) {
      setGoogleLoading(false);
      setFormError(error.message || 'Google signup could not start. Please try again.');
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfcff] text-slate-950">
      <style>{`
        .signup-fade-in {
          opacity: 0;
          transform: translateY(18px);
          animation: signupFadeIn 0.75s ease-out forwards;
        }

        .signup-panel {
          opacity: 0;
          transform: translateY(22px);
          animation: signupFadeIn 0.75s ease-out 0.12s forwards;
        }

        @keyframes signupFadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-height: 760px) and (min-width: 768px) {
          .signup-short-hide {
            display: none;
          }
        }
      `}</style>

      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-5 py-4 md:grid-cols-[0.95fr_1.05fr] md:items-center md:px-8 lg:gap-10 lg:px-12">
        <section className="relative flex min-h-[calc(100vh-2rem)] flex-col justify-center overflow-hidden p-2 md:min-h-0 md:p-3">
          <div className={`absolute -left-24 top-24 h-80 w-80 rounded-full blur-[120px] transition-colors duration-300 ${leftPanelTheme.glowPrimary}`} />
          <div className={`absolute right-0 bottom-16 h-80 w-80 rounded-full blur-[120px] transition-colors duration-300 ${leftPanelTheme.glowSecondary}`} />

          <Link to="/" className="relative z-10 flex w-fit items-center gap-2.5">
            <BrandLogo />
          </Link>

          <div className="relative z-10 mx-auto mt-5 flex w-full max-w-xl flex-col justify-center">
            <div className="signup-fade-in rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.07)] backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className={`text-[10px] font-black uppercase tracking-[0.26em] transition-colors duration-300 ${leftPanelTheme.label}`}>Ready to get started?</div>
                  <div className="mt-1 text-lg font-black tracking-[-0.03em] text-slate-950">Choose BusinessVerse or CreatorVerse.</div>
                </div>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white transition-colors duration-300 ${leftPanelTheme.icon}`}>
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {[
                  ['01', 'Fill registration form', 'Add your details and select your account type.'],
                  ['02', 'Review details', 'Confirm your BusinessVerse or CreatorVerse setup.'],
                  ['03', 'Membership payment', 'Complete Rs 999 yearly membership securely.'],
                  ['04', 'Dashboard access', 'After activation, PostVerse opens as your main feed.']
                ].map(([number, title, copy]) => (
                  <div key={number} className="flex items-start gap-3 rounded-[1.15rem] border border-slate-100 bg-[#f8fafc] px-4 py-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-xs font-black shadow-sm transition-colors duration-300 ${leftPanelTheme.stepNumber}`}>
                      {number}
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-950">{title}</div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[1.35rem] border border-slate-200 bg-white/75 p-4 shadow-[0_14px_45px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['2 paths', 'Business + creator'],
                  ['Rs 999', 'Annual access'],
                  ['365 days', 'Visibility']
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-slate-100 bg-[#f8fafc] px-4 py-3 text-center">
                    <div className={`text-xl font-black tracking-tight lg:text-2xl ${label === 'Annual access' ? leftPanelTheme.stat : 'text-slate-800'}`}>{value}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-600 lg:text-sm">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="signup-panel rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_90px_rgba(15,23,42,0.12)] md:p-6">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] ${accountType === 'business' ? 'border-orange-100 bg-orange-50 text-orange-600' : 'border-blue-100 bg-blue-50 text-blue-700'}`}>
            <BadgeCheck className="h-3.5 w-3.5" />
            New member
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950">Create Your Account</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Join MyIndianStartup and start building valuable connections across India.
          </p>

          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-800">Full Name</span>
              <div className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 focus-within:ring-2 ${focusTone}`}>
                <UserRound className="h-5 w-5 text-slate-400" />
                <input
                  name="fullName"
                  type="text"
                  placeholder="Your name"
                  required
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-800">Email Address</span>
              <div className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 focus-within:ring-2 ${focusTone}`}>
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
              <span className="text-sm font-bold text-slate-800">Mobile Number</span>
              <div className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 focus-within:ring-2 ${focusTone}`}>
                <Phone className="h-5 w-5 text-slate-400" />
                <input
                  name="mobileNumber"
                  type="tel"
                  placeholder="+91 98765 43210"
                  required
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-bold text-slate-800">Account Type</span>
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-[#f8fafc] p-1.5">
                {[
                  { key: 'business', label: 'BusinessVerse' },
                  { key: 'creator', label: 'CreatorVerse' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setAccountType(item.key)}
                    className={`rounded-lg px-3 py-2 text-sm font-black transition-all ${
                      accountType === item.key
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

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-800">Password</span>
              <div className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 focus-within:ring-2 ${focusTone}`}>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
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

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-800">Confirm Password</span>
              <div className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 focus-within:ring-2 ${focusTone}`}>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  required
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <label className="flex items-start gap-2 text-sm font-semibold text-slate-600">
              <input
                name="terms"
                type="checkbox"
                className={`mt-0.5 h-4 w-4 rounded border-slate-300 ${leftPanelTheme.checkbox}`}
              />
              <span>
                I agree to the Terms &amp; Conditions and Privacy Policy.
              </span>
            </label>

            {formError && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                {formError}
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${leftPanelTheme.button}`}
            >
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="my-5 flex items-center gap-4">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">or</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading}
            aria-label={`Continue with Google as ${accountType === 'business' ? 'BusinessVerse' : 'CreatorVerse'}`}
            className={`inline-flex w-full items-center justify-center gap-3 rounded-full border bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${
              accountType === 'business'
                ? 'border-orange-100 hover:bg-orange-50 hover:text-orange-600'
                : 'border-blue-100 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <GoogleLogo className="h-5 w-5" />
            <span>{googleLoading ? 'Opening Google...' : `Continue with Google as ${accountType === 'business' ? 'BusinessVerse' : 'CreatorVerse'}`}</span>
          </button>

          <Link
            to="/login"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            <span>Already have an account? Login Here</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="signup-short-hide mt-5 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-950">Next step after signup</div>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Your account is created first. Then pricing opens so membership can be activated before PostVerse access.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default SignUp;
