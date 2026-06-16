import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, CircleUserRound, ShieldCheck, Sparkles, Users } from 'lucide-react';

const toneMap = {
  blue: {
    accent: 'text-blue-600',
    badge: 'border-blue-100 bg-blue-50 text-blue-700',
    panel: 'bg-blue-600 text-white',
    button: 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_12px_30px_rgba(37,99,235,0.22)]',
    soft: 'bg-blue-50 text-blue-700',
    ring: 'ring-blue-100'
  },
  orange: {
    accent: 'text-orange-600',
    badge: 'border-orange-100 bg-orange-50 text-orange-700',
    panel: 'bg-orange-500 text-white',
    button: 'bg-orange-500 text-white hover:bg-orange-600 shadow-[0_12px_30px_rgba(249,115,22,0.22)]',
    soft: 'bg-orange-50 text-orange-700',
    ring: 'ring-orange-100'
  },
  emerald: {
    accent: 'text-emerald-600',
    badge: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    panel: 'bg-emerald-600 text-white',
    button: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_12px_30px_rgba(16,185,129,0.18)]',
    soft: 'bg-emerald-50 text-emerald-700',
    ring: 'ring-emerald-100'
  }
};

const AuthShell = ({
  accent = 'blue',
  title,
  description,
  actionLabel,
  altActionLabel,
  altActionTo,
  formFields = [],
  submitLabel = 'Continue with Gmail',
  onSubmit,
  features = [],
  notes = []
}) => {
  const theme = toneMap[accent] || toneMap.blue;

  return (
    <div className="bg-white text-slate-950">
      <section className="relative overflow-hidden pt-24 pb-14 md:pt-28 md:pb-20">
        <div className="absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.09),transparent_34%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_30%)] pointer-events-none" />
        <div className="absolute left-[-6rem] top-20 h-72 w-72 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute right-[-6rem] top-20 h-72 w-72 rounded-full bg-orange-500/5 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <h1 className="max-w-2xl text-4xl font-black leading-[0.98] tracking-[-0.05em] text-slate-950 sm:text-5xl md:text-6xl">
                {title}
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
                {description}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:scale-[1.02] ${theme.button}`}>
                  <span>{actionLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                {altActionTo && (
                  <Link to={altActionTo} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 transition-transform hover:scale-[1.02] hover:bg-slate-50">
                    <span>{altActionLabel}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  ['Gmail login', CircleUserRound],
                  ['Secure access', ShieldCheck],
                  ['Built for teams', Users]
                ].map(([label, Icon]) => (
                  <div key={label} className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.22em] ${theme.soft}`}>
                    <Icon className="h-3.5 w-3.5" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.1)] md:p-7">
              <div className={`rounded-[1.5rem] p-5 ${theme.panel}`}>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Gmail first</div>
                <div className="mt-3 text-3xl font-black tracking-tight">Continue with Google</div>
                <p className="mt-3 text-sm leading-7 text-white/85">
                  Use your Gmail account to sign in, create a profile, and resume your dashboard in one step.
                </p>
              </div>

              <form className="mt-5 rounded-[1.5rem] border border-slate-200 p-4" onSubmit={onSubmit}>
                <div className="grid gap-3">
                  {formFields.map((field) => (
                    <label key={field.label} className="grid gap-1.5">
                      <span className="text-xs font-bold text-slate-700">{field.label}</span>
                      <input
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        className={`rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 ${theme.ring}`}
                      />
                    </label>
                  ))}
                </div>

                <button type="submit" className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:scale-[1.01] ${theme.button}`}>
                  <span>{submitLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="mt-3 text-[11px] leading-6 text-slate-500">
                  By continuing, you agree to use your Gmail account for secure access across the MyIndianStartup ecosystem.
                </p>
              </form>

              <div className="mt-5 grid gap-3">
                {features.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-4">
                    <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${theme.soft}`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-950">{feature.title}</div>
                      <div className="mt-1 text-sm leading-6 text-slate-500">{feature.copy}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-slate-200 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Authentication notes</div>
                <div className="mt-3 grid gap-2">
                  {notes.map((note) => (
                    <div key={note} className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <Sparkles className={`h-4 w-4 ${theme.accent}`} />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuthShell;
