import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import BrandLogo from '@/components/site/BrandLogo';
import { supabase } from '@/lib/supabaseClient';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess(false);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message || 'Failed to send reset email. Please try again.');
    } else {
      setSuccess(true);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfcff] text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-5 py-4 md:grid-cols-[0.95fr_1.05fr] md:items-center md:px-8 lg:gap-10 lg:px-12">
        <section className="relative flex min-h-[calc(100vh-2.5rem)] flex-col justify-center overflow-hidden p-2 md:min-h-0 md:p-3">
          <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-blue-500/10 blur-[120px]" />
          <div className="absolute right-0 bottom-16 h-80 w-80 rounded-full bg-orange-500/10 blur-[120px]" />

          <Link to="/" className="relative z-10 flex w-fit items-center gap-2.5">
            <BrandLogo />
          </Link>

          <div className="relative z-10 mx-auto mt-5 flex w-full max-w-xl flex-col justify-center">
            <div className="mt-4 md:mt-5">
              <div className="text-[11px] font-black uppercase tracking-[0.32em] text-slate-500">Account Recovery</div>
              <h1 className="mt-2 max-w-2xl text-3xl font-black leading-[1.03] tracking-[-0.05em] text-slate-950 lg:text-[2.35rem]">
                Lost your password? No worries.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 lg:text-base">
                Enter the email address associated with your BusinessVerse or CreatorVerse account, and we'll send you a link to reset your password.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_90px_rgba(15,23,42,0.12)] md:p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure Reset
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950">Reset Password</h2>

          {success ? (
            <div className="mt-6">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-5 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-lg font-black text-emerald-800">Check your email</h3>
                <p className="mt-2 text-sm font-semibold text-emerald-700">
                  We've sent a password reset link to <br />
                  <span className="font-bold">{email}</span>
                </p>
              </div>
              <Link
                to="/login"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <span>Back to Login</span>
              </Link>
            </div>
          ) : (
            <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-800">Email Address</span>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-100">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    required
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </label>

              {error && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_32px_rgba(15,23,42,0.22)] transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-70"
              >
                <span>{loading ? 'Sending link...' : 'Send Reset Link'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="my-5 flex items-center gap-4">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">or</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <span>Return to Login</span>
              </Link>
            </form>
          )}
        </section>
      </div>
    </main>
  );
};

export default ForgotPassword;
