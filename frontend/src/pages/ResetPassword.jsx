import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import BrandLogo from '@/components/site/BrandLogo';
import { supabase } from '@/lib/supabaseClient';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Check if we have a valid session to reset the password.
    // Supabase sets the session automatically when the user clicks the recovery link.
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setError('Your password reset link is invalid or has expired. Please request a new one.');
      }
      setSessionChecked(true);
    });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message || 'Failed to update password. Please try again.');
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    }
  };

  if (!sessionChecked) return null; // Avoid flicker

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfcff] text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-5 py-4 md:grid-cols-[0.95fr_1.05fr] md:items-center md:px-8 lg:gap-10 lg:px-12">
        <section className="relative flex min-h-[calc(100vh-2.5rem)] flex-col justify-center overflow-hidden p-2 md:min-h-0 md:p-3">
          <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute right-0 bottom-16 h-80 w-80 rounded-full bg-blue-500/10 blur-[120px]" />

          <Link to="/" className="relative z-10 flex w-fit items-center gap-2.5">
            <BrandLogo />
          </Link>

          <div className="relative z-10 mx-auto mt-5 flex w-full max-w-xl flex-col justify-center">
            <div className="mt-4 md:mt-5">
              <div className="text-[11px] font-black uppercase tracking-[0.32em] text-slate-500">Secure Access</div>
              <h1 className="mt-2 max-w-2xl text-3xl font-black leading-[1.03] tracking-[-0.05em] text-slate-950 lg:text-[2.35rem]">
                Create a new password.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 lg:text-base">
                Make sure it's at least 6 characters long. A strong password helps keep your workspace secure.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_90px_rgba(15,23,42,0.12)] md:p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Update Password
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950">Set New Password</h2>

          {success ? (
            <div className="mt-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-xl font-black text-slate-900">Password Updated!</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Your password has been changed successfully. Redirecting you to login...
              </p>
            </div>
          ) : (
            <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-800">New Password</span>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-100">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <input
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-800">Confirm Password</span>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-100">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <input
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </label>

              {error && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                  {error}
                  {error.includes('expired') && (
                    <Link to="/forgot-password" className="ml-2 underline">Request new link</Link>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || error.includes('expired')}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_32px_rgba(15,23,42,0.22)] transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                <span>{loading ? 'Updating...' : 'Update Password'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
};

export default ResetPassword;
