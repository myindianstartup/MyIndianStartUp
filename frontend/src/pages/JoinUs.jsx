import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Globe,
  Handshake,
  Headphones,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wrench
} from 'lucide-react';

const helpTopics = [
  {
    icon: ShieldCheck,
    title: 'Membership support',
    copy: 'BusinessVerse, CreatorVerse, annual membership, and account access.',
    tone: 'orange'
  },
  {
    icon: Wrench,
    title: 'Technical assistance',
    copy: 'Login, registration, profile setup, daily posts, and platform usage.',
    tone: 'blue'
  },
  {
    icon: Handshake,
    title: 'Partnership inquiries',
    copy: 'Strategic partnerships, ecosystem opportunities, and collaborations.',
    tone: 'blue'
  },
  {
    icon: Building2,
    title: 'Business collaborations',
    copy: 'Connect businesses and creators to grow together across India.',
    tone: 'orange'
  },
  {
    icon: HelpCircle,
    title: 'General questions',
    copy: 'Platform operations, ownership, pricing, and how MyIndianStartup works.',
    tone: 'slate'
  },
  {
    icon: MessageSquare,
    title: 'Platform feedback',
    copy: 'Share ideas to help us improve discovery, visibility, and connections.',
    tone: 'slate'
  }
];

const contactChannels = [
  {
    icon: Mail,
    label: 'Platform email',
    value: 'contact@8techburp.com',
    href: 'mailto:contact@8techburp.com',
    tone: 'blue'
  },
  {
    icon: Phone,
    label: 'Phone support',
    value: '+91 90236 15266',
    href: 'tel:+919023615266',
    tone: 'orange'
  },
  {
    icon: Globe,
    label: '8TechBurp — MIS website',
    value: 'Visit platform partner',
    href: 'https://8techburp.com',
    external: true,
    tone: 'slate'
  }
];

const JoinUs = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    const subject = encodeURIComponent(form.subject || 'MyIndianStartup inquiry');
    window.location.href = `mailto:contact@8techburp.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="bg-white text-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-14 md:pt-28 md:pb-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[680px] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.09),transparent_32%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_30%)]" />
        <div className="pointer-events-none absolute left-[-6rem] top-24 h-72 w-72 rounded-full bg-blue-500/5 blur-[100px]" />
        <div className="pointer-events-none absolute right-[-6rem] top-24 h-72 w-72 rounded-full bg-orange-500/5 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6 md:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-blue-600" />
              Contact Us
            </div>

            <h1 className="mt-5 text-4xl font-black leading-[0.98] tracking-[-0.05em] text-slate-950 sm:text-5xl md:text-6xl">
              Let&apos;s Connect
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              MyIndianStartup is proudly developed, designed, maintained, and operated by{' '}
              <span className="font-bold text-slate-900">8TechBurp</span>.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
              For membership support, technical assistance, partnership inquiries, business collaborations,
              or general questions, our team is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact details + form */}
      <section className="border-t border-slate-100 bg-[#fbfbfd] py-14 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:px-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          {/* Partner card */}
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="bg-[linear-gradient(135deg,#0f172a,#11264f)] px-6 py-6 md:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_12px_26px_rgba(37,99,235,0.25)]">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-100">
                      Platform Owner & Technology Partner
                    </div>
                    <h2 className="text-2xl font-black tracking-[-0.03em] text-white">8TechBurp</h2>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-6 md:p-8">
                {contactChannels.map((channel) => {
                  const Icon = channel.icon;
                  const content = (
                    <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 transition-colors hover:border-slate-200 hover:bg-white">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          channel.tone === 'orange'
                            ? 'bg-orange-50 text-orange-500'
                            : channel.tone === 'blue'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                          {channel.label}
                        </div>
                        <div className="mt-1 text-sm font-bold text-slate-900">{channel.value}</div>
                      </div>
                    </div>
                  );

                  if (channel.external) {
                    return (
                      <a
                        key={channel.label}
                        href={channel.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        {content}
                      </a>
                    );
                  }

                  return (
                    <a key={channel.label} href={channel.href} className="block">
                      {content}
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <Rocket className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                <p className="text-sm leading-7 text-slate-600">
                  Building technology that helps businesses and creators connect, collaborate, and grow
                  across India.
                </p>
              </div>
            </div>
          </div>

          {/* Inquiry form */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-8">
            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">Send a message</div>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">We&apos;ll get back to you soon</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Share your question and our team will respond within one business day.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Name</span>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@email.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Subject</span>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Message</span>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell us about your inquiry..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)] transition-transform hover:scale-[1.01] hover:bg-blue-700 sm:w-auto"
              >
                <span>Send message</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Help topics */}
      <section className="bg-white py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="max-w-3xl">
            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-500">How we can help</div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-4xl">
              Reach out for the right support.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {helpTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <div
                  key={topic.title}
                  className="rounded-[20px] border border-slate-200 bg-[#f8fafc] p-5 shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <Icon
                    className={`h-5 w-5 ${
                      topic.tone === 'orange'
                        ? 'text-orange-500'
                        : topic.tone === 'blue'
                          ? 'text-blue-600'
                          : 'text-slate-700'
                    }`}
                  />
                  <h3 className="mt-3 text-base font-black text-slate-950">{topic.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{topic.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Login / Register — short conversion strip */}
      <section className="border-t border-slate-100 bg-[#fbfbfd] py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
                  MyIndianStartup Login / Register
                </div>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950 md:text-3xl">
                  Ready to join? Start in minutes.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">
                  ₹999/year · No commission · Direct connections across India.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 transition-transform hover:scale-[1.02] hover:bg-slate-50"
                >
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.25)] transition-transform hover:scale-[1.02] hover:bg-slate-800"
                >
                  <span>Register</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-orange-700 transition-colors hover:bg-orange-100"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>BusinessVerse</span>
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
              >
                <UserRound className="h-3.5 w-3.5" />
                <span>CreatorVerse</span>
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100"
              >
                <Headphones className="h-3.5 w-3.5" />
                <span>View pricing</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JoinUs;
