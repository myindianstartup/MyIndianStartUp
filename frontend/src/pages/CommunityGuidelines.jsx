import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Flag,
  FileText,
  Lock,
  Megaphone,
  Scale,
  ShieldCheck,
  Users
} from 'lucide-react';

const conductRules = [
  {
    title: 'Use real and professional information',
    body: 'Members should use accurate names, business details, creator details, portfolio links, work links, and contact information. Fake profiles, fake reviews, misleading claims, and impersonation are not allowed.',
    Icon: Users,
    tone: 'blue'
  },
  {
    title: 'Respect every member',
    body: 'Keep communication respectful. Harassment, abuse, hate speech, threats, discrimination, privacy misuse, and unwanted pressure are not accepted on MyIndianStartup.',
    Icon: ShieldCheck,
    tone: 'orange'
  },
  {
    title: 'Post relevant professional content',
    body: 'Share business updates, creator work, services, skills, achievements, portfolio material, and collaboration opportunities. One image or one video can be posted every 24 hours.',
    Icon: Megaphone,
    tone: 'blue'
  },
  {
    title: 'Protect trust and ownership',
    body: 'Only upload content you own or have permission to use. Do not misuse contact details, send unsolicited advertising, publish malicious links, or attempt financial fraud.',
    Icon: Lock,
    tone: 'orange'
  }
];

const bannedContent = [
  'Adult or sexually explicit content',
  'Illegal activities, scams, fraud, or misleading offers',
  'Gambling, betting, drugs, or weapons promotion',
  'Political, extremist, hateful, or abusive content',
  'Spam, duplicate promotions, fake engagement, or malicious activity',
  'Copyrighted content used without permission'
];

const enforcementSteps = [
  'Review reported posts, profiles, comments, and messages.',
  'Remove content that breaks platform rules.',
  'Restrict, suspend, or terminate accounts when required.',
  'Cancel membership access for serious violations without refund.',
  'Report serious illegal activity to the proper authorities when needed.'
];

const CommunityGuidelines = () => {
  return (
    <main className="bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_42%,#f8fafc_100%)] text-slate-950">
      <section className="mx-auto max-w-7xl px-6 py-14 md:px-12 md:py-18">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-700 shadow-sm">
              <ShieldCheck size={15} />
              Community Guidelines
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.12] tracking-normal text-slate-950 sm:text-5xl md:text-6xl">
              Clear rules for safe, professional collaboration.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-600">
              MyIndianStartup is built for trusted business visibility, creator discovery, and direct collaboration. These guidelines apply to every BusinessVerse and CreatorVerse member.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Join responsibly
                <ArrowRight size={17} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-950 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-400"
              >
                Contact support
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_28px_90px_rgba(15,23,42,0.08)] md:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <FileText className="text-slate-700" size={24} />
                <div className="mt-5 text-3xl font-black text-slate-950">30</div>
                <div className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-slate-500">rule areas</div>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <Flag className="text-slate-700" size={24} />
                <div className="mt-5 text-3xl font-black text-slate-950">24h</div>
                <div className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-slate-500">post cycle</div>
              </div>
            </div>
            <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Final principle</div>
              <p className="mt-3 text-base font-semibold leading-7 text-slate-700">
                Use the platform for genuine business visibility, creator discovery, respectful networking, and professional collaboration.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-12">
        <div className="grid gap-5 md:grid-cols-2">
            {conductRules.map(({ title, body, Icon }) => (
              <article
                key={title}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-700">
                  <Icon size={22} />
                </div>
                <h2 className="mt-5 text-2xl font-black tracking-[-0.035em] text-slate-950">{title}</h2>
                <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{body}</p>
              </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-16 md:px-12 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-700">
              <AlertTriangle size={15} />
              Not allowed
            </div>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.045em] text-slate-950">Content and actions we remove</h2>
          <div className="mt-6 grid gap-3">
            {bannedContent.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-700">
              <Scale size={15} />
              Enforcement
            </div>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.045em] text-slate-950">How reports are handled</h2>
          <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">
            Members can report profiles, posts, videos, comments, or collaboration behavior that appears unsafe, fake, abusive, or against these rules.
          </p>
          <div className="mt-6 grid gap-3">
            {enforcementSteps.map((item, index) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                  {index + 1}
                </span>
                <span className="text-sm font-bold leading-6 text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default CommunityGuidelines;
