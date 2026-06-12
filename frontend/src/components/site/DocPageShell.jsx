import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const toneMap = {
  blue: {
    badge: 'border-blue-100 bg-blue-50 text-blue-700',
    button: 'bg-blue-600 text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)] hover:bg-blue-700',
    stat: 'bg-blue-50 text-blue-700',
    panel: 'bg-blue-600 text-white'
  },
  orange: {
    badge: 'border-orange-100 bg-orange-50 text-orange-700',
    button: 'bg-orange-500 text-white shadow-[0_12px_30px_rgba(249,115,22,0.22)] hover:bg-orange-600',
    stat: 'bg-orange-50 text-orange-700',
    panel: 'bg-orange-500 text-white'
  },
  emerald: {
    badge: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    button: 'bg-emerald-600 text-white shadow-[0_12px_30px_rgba(16,185,129,0.18)] hover:bg-emerald-700',
    stat: 'bg-emerald-50 text-emerald-700',
    panel: 'bg-emerald-600 text-white'
  },
  slate: {
    badge: 'border-blue-100 bg-blue-50 text-blue-700',
    button: 'bg-blue-600 text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)] hover:bg-blue-700',
    stat: 'bg-blue-50 text-blue-700',
    panel: 'bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] text-white'
  }
};

const DocPageShell = ({
  accent = 'blue',
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  stats = [],
  featureTitle,
  featureDescription,
  features = [],
  previewTitle,
  previewDescription,
  previewItems = [],
  footerNote
}) => {
  const theme = toneMap[accent] || toneMap.blue;

  return (
    <div className="bg-white text-slate-950">
      <section className="relative overflow-hidden pt-24 pb-14 md:pt-28 md:pb-20">
        <div className="absolute inset-x-0 top-0 h-[680px] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.07),transparent_28%)] pointer-events-none" />
        <div className="absolute left-[-6rem] top-24 h-72 w-72 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute right-[-6rem] top-24 h-72 w-72 rounded-full bg-orange-500/5 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] ${theme.badge}`}>
                <span className={`h-2 w-2 rounded-full ${accent === 'orange' ? 'bg-orange-500' : accent === 'emerald' ? 'bg-emerald-500' : accent === 'slate' ? 'bg-slate-900' : 'bg-blue-500'}`} />
                {eyebrow}
              </div>

              <h1 className="mt-4 max-w-2xl text-4xl font-black leading-[0.98] tracking-[-0.05em] text-slate-950 sm:text-5xl md:text-6xl">
                {title}
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
                {description}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {primaryAction && (
                  <Link
                    to={primaryAction.to}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:scale-[1.02] ${theme.button}`}
                  >
                    <span>{primaryAction.label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                {secondaryAction && (
                  <Link
                    to={secondaryAction.to}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 transition-transform hover:scale-[1.02] hover:bg-slate-50"
                  >
                    <span>{secondaryAction.label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {stats.length > 0 && (
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {stats.map((item) => (
                    <div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                      <div className="text-2xl font-black tracking-tight text-slate-950">{item.value}</div>
                      <div className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${theme.stat}`}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.1)] md:p-7`}>
              <div className={`rounded-[1.5rem] p-5 ${theme.panel}`}>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">{previewTitle}</div>
                {previewDescription && <p className="mt-3 text-sm leading-7 text-white/85">{previewDescription}</p>}
              </div>

              <div className="mt-5 grid gap-3">
                {previewItems.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    <CheckCircle2 className={`h-4 w-4 ${accent === 'orange' ? 'text-orange-500' : accent === 'emerald' ? 'text-emerald-600' : accent === 'slate' ? 'text-slate-900' : 'text-blue-600'}`} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="max-w-3xl">
            <div className={`text-[11px] font-black uppercase tracking-[0.3em] ${accent === 'orange' ? 'text-orange-500' : accent === 'emerald' ? 'text-emerald-600' : accent === 'slate' ? 'text-slate-800' : 'text-blue-600'}`}>
              {featureTitle}
            </div>
            {featureDescription && <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{featureDescription}</p>}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-[20px] border border-slate-200 bg-[#f8fafc] p-5 shadow-sm">
                <h3 className="text-lg font-black tracking-[-0.03em] text-slate-950">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{feature.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {footerNote && (
        <section className="bg-[#fbfbfd] py-14 md:py-16">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Platform note</div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{footerNote}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default DocPageShell;
