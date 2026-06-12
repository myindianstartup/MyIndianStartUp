import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Check,
  IndianRupee,
  ShieldCheck,
  Sparkles,
  UserRound,
  X
} from 'lucide-react';

const zeroFees = [
  { label: 'Commission charges', value: '₹0' },
  { label: 'Lead purchase fees', value: '₹0' },
  { label: 'Success fees', value: '₹0' },
  { label: 'Hidden costs', value: 'None' }
];

const businessIncludes = [
  'Business Listing',
  '365 Days Marketing',
  'Daily Posts',
  'Search Creators',
  'Direct Collaboration',
  'PAN India Visibility',
  'No Commission'
];

const creatorIncludes = [
  'Profile Listing',
  '365 Days Marketing',
  'Daily Posts',
  'Search Business',
  'Direct Collaboration',
  'PAN India Visibility',
  'No Commission'
];

const comparisonRows = [
  ['Annual membership at ₹999', true, false, false],
  ['No commission on deals', true, false, false],
  ['No lead purchase fees', true, false, false],
  ['Direct collaboration', true, false, true],
  ['Daily visibility posting', true, false, false],
  ['PAN India discovery', true, false, false],
  ['No hidden platform costs', true, false, false]
];

const Payment = () => (
  <div className="bg-white text-slate-950">
    {/* Hero */}
    <section className="relative overflow-hidden pt-24 pb-14 md:pt-28 md:pb-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.09),transparent_32%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_30%)]" />
      <div className="pointer-events-none absolute left-[-6rem] top-24 h-72 w-72 rounded-full bg-blue-500/5 blur-[100px]" />
      <div className="pointer-events-none absolute right-[-6rem] top-24 h-72 w-72 rounded-full bg-orange-500/5 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-blue-600" />
            Pricing
          </div>

          <h1 className="mt-5 text-4xl font-black leading-[0.98] tracking-[-0.05em] text-slate-950 sm:text-5xl md:text-6xl">
            Simple Pricing. Trusted Platform.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            MyIndianStartup is a SaaS platform owned, operated, and managed by{' '}
            <span className="font-bold text-slate-900">8TechBurp</span>. All platform development, design,
            maintenance, operations, and intellectual property rights are managed by 8TechBurp.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)] transition-transform hover:scale-[1.02] hover:bg-blue-700"
            >
              <span>Join Now — ₹999/year</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 transition-transform hover:scale-[1.02] hover:bg-slate-50"
            >
              <span>Need help?</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Main price card */}
        <div className="mx-auto mt-14 max-w-3xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.1)] md:p-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-slate-200 to-blue-600" />

            <div className="text-center">
              <div className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
                One Membership. One Price.
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-slate-950 md:text-3xl">
                Direct Connections Across India.
              </h2>

              <div className="mt-8 flex items-end justify-center gap-2">
                <IndianRupee className="mb-3 h-7 w-7 text-slate-400" />
                <span className="text-7xl font-black tracking-tight text-slate-950 md:text-8xl">999</span>
                <span className="mb-3 text-base font-bold text-slate-400">/ year</span>
              </div>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
                The annual membership fee is ₹999 per year. There are no commission charges, no lead purchase
                fees, no success fees, and no hidden costs.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {zeroFees.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* BusinessVerse + CreatorVerse */}
    <section className="border-t border-slate-100 bg-[#fbfbfd] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Choose your verse</div>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">
            Same price. Two paths to grow.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Pick BusinessVerse or CreatorVerse at signup — one annual membership unlocks your chosen experience.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* BusinessVerse */}
          <div className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-[0_20px_60px_rgba(249,115,22,0.08)]">
            <div className="bg-gradient-to-br from-orange-50 to-white px-6 py-5 md:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-[0_12px_26px_rgba(249,115,22,0.25)]">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">BusinessVerse</div>
                  <h3 className="text-xl font-black tracking-[-0.03em] text-slate-950">For businesses</h3>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 md:px-8 md:pb-8">
              <div className="flex items-end gap-2">
                <span className="text-lg font-black text-slate-950">₹</span>
                <span className="text-5xl font-black tracking-tight text-slate-950">999</span>
                <span className="pb-1 text-sm font-bold text-slate-400">/ year</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Profile visibility, daily marketing, creator discovery, and direct collaboration across India.
              </p>

              <div className="mt-6 grid gap-2.5">
                {businessIncludes.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl bg-orange-50/60 px-4 py-2.5 text-sm font-semibold text-slate-700">
                    <Check className="h-4 w-4 shrink-0 text-orange-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/business-verse"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-orange-600 transition-colors hover:text-orange-700"
              >
                <span>Explore BusinessVerse</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* CreatorVerse */}
          <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-[0_20px_60px_rgba(37,99,235,0.08)]">
            <div className="bg-gradient-to-br from-blue-50 to-white px-6 py-5 md:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_12px_26px_rgba(37,99,235,0.25)]">
                  <UserRound className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-600">CreatorVerse</div>
                  <h3 className="text-xl font-black tracking-[-0.03em] text-slate-950">For creators</h3>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 md:px-8 md:pb-8">
              <div className="flex items-end gap-2">
                <span className="text-lg font-black text-slate-950">₹</span>
                <span className="text-5xl font-black tracking-tight text-slate-950">999</span>
                <span className="pb-1 text-sm font-bold text-slate-400">/ year</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Profile listing, daily visibility, business discovery, and direct collaboration across India.
              </p>

              <div className="mt-6 grid gap-2.5">
                {creatorIncludes.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl bg-blue-50/60 px-4 py-2.5 text-sm font-semibold text-slate-700">
                    <Check className="h-4 w-4 shrink-0 text-blue-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/creator-verse"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
              >
                <span>Explore CreatorVerse</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Platform trust */}
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">Platform ownership</div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-4xl">
              Operated by 8TechBurp. Built for trust.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              All membership payments are securely processed under the 8TechBurp business account. By purchasing
              a membership, you are making payment to 8TechBurp, the legal owner and operator of MyIndianStartup.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, title: 'Secure payments', copy: 'Processed under the 8TechBurp business account.' },
                { icon: Sparkles, title: 'Full IP ownership', copy: 'Platform design, development, and operations by 8TechBurp.' }
              ].map(({ icon: Icon, title, copy }) => (
                <div key={title} className="rounded-[20px] border border-slate-200 bg-[#f8fafc] p-5">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <h3 className="mt-3 text-sm font-black text-slate-950">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-500">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#11264f)] p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] md:p-9">
            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-100">What you get</div>
            <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] md:text-3xl">
              Everything included in one membership.
            </h3>

            <div className="mt-6 grid gap-3">
              {[
                'BusinessVerse or CreatorVerse access',
                'Daily image or video posting',
                'Direct connections across India',
                '365 days of platform access',
                'No middlemen or surprise charges'
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-blue-50">
                  <Check className="h-4 w-4 shrink-0 text-orange-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <Link
              to="/signup"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-4 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-orange-600 sm:w-auto"
            >
              <span>Get annual membership</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Comparison */}
    <section className="border-t border-slate-100 bg-[#fbfbfd] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="max-w-3xl">
          <div className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-500">Comparison</div>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">
            Built different. Priced honestly.
          </h2>
        </div>

        <div className="mt-12 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="w-2/5 p-5 font-black text-slate-900 md:p-6">Key features</th>
                <th className="w-1/5 border-x border-blue-100 bg-blue-50/70 p-5 text-center font-black text-blue-700 md:p-6">
                  MyIndianStartup
                </th>
                <th className="w-1/5 p-5 text-center font-bold text-slate-400 md:p-6">Agencies</th>
                <th className="w-1/5 p-5 text-center font-bold text-slate-400 md:p-6">Freelance portals</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map(([feature, ours, agencies, portals]) => (
                <tr key={feature} className="border-b border-slate-100 last:border-b-0">
                  <td className="p-5 font-semibold text-slate-800 md:p-6">{feature}</td>
                  {[ours, agencies, portals].map((enabled, colIndex) => (
                    <td
                      key={colIndex}
                      className={`p-5 text-center md:p-6 ${colIndex === 0 ? 'border-x border-blue-100 bg-blue-50/30' : ''}`}
                    >
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                          enabled ? 'bg-blue-100 text-blue-700' : 'bg-red-50 text-red-500'
                        }`}
                      >
                        {enabled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              tone: 'orange',
              stat: '₹999',
              label: 'One annual fee',
              copy: 'No tiers, no upsells, no surprise renewals.'
            },
            {
              tone: 'blue',
              stat: '0%',
              label: 'Platform commission',
              copy: 'Keep every rupee from your direct deals.'
            },
            {
              tone: 'slate',
              stat: '28',
              label: 'States covered',
              copy: 'PAN India visibility for businesses and creators.'
            }
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-[1.5rem] border p-5 shadow-sm ${
                item.tone === 'orange'
                  ? 'border-orange-100 bg-gradient-to-br from-orange-50 to-white'
                  : item.tone === 'blue'
                    ? 'border-blue-100 bg-gradient-to-br from-blue-50 to-white'
                    : 'border-slate-200 bg-white'
              }`}
            >
              <div
                className={`text-3xl font-black tracking-tight ${
                  item.tone === 'orange' ? 'text-orange-500' : item.tone === 'blue' ? 'text-blue-600' : 'text-slate-950'
                }`}
              >
                {item.stat}
              </div>
              <div className="mt-1 text-sm font-black text-slate-900">{item.label}</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
            <Building2 className="h-3.5 w-3.5" />
            BusinessVerse
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">+</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            <UserRound className="h-3.5 w-3.5" />
            CreatorVerse
          </span>
          <span className="text-sm font-semibold text-slate-500">— same price, same trust, zero middlemen.</span>
        </div>
      </div>
    </section>

    {/* Final CTA */}
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.06),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.07),transparent_40%)] p-8 text-center md:p-12">
          <div className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Ready to join?</div>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-4xl">
            One Membership. One Price. Direct Connections Across India.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Start with ₹999 per year. No commission. No lead fees. No hidden costs. Secure payment to 8TechBurp.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.25)] transition-transform hover:scale-[1.02] hover:bg-slate-800"
            >
              <span>Create your profile</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/business-verse"
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(249,115,22,0.22)] transition-transform hover:scale-[1.02] hover:bg-orange-600"
            >
              <span>BusinessVerse</span>
            </Link>
            <Link
              to="/creator-verse"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)] transition-transform hover:scale-[1.02] hover:bg-blue-700"
            >
              <span>CreatorVerse</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default Payment;
