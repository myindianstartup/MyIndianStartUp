import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ExternalLink, Globe2, Loader2, Mail, Phone, Rocket, Send } from 'lucide-react';
import { apiRequest } from '@/lib/apiClient';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!name || name.length < 2) {
      setError('Please enter a valid name (at least 2 characters).');
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!subject || subject.length < 3) {
      setError('Please enter a valid subject (at least 3 characters).');
      return;
    }

    if (!message || message.length < 10) {
      setError('Please enter a message (at least 10 characters).');
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest('/api/contact', {
        method: 'POST',
        body: { name, email, subject, message }
      });
      setSuccess(data.message || 'Your message has been sent successfully. We will get back to you shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (requestError) {
      setError(requestError.message || 'Could not send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="mb-9 max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Contact and support</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.03em] text-slate-950 sm:text-5xl">How can we help?</h1>
          <p className="mt-3 text-base font-medium leading-7 text-slate-600">
            Send your question to the platform team. We normally respond within one business day.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
          <div className="flex min-w-0 flex-col gap-5">
            <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.07)]">
              <div className="flex min-h-28 items-center gap-4 bg-slate-950 px-6 py-5 text-white sm:px-7">
                <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-sm">
                  <img
                    src="/assets/8techburp-logo.jpeg"
                    alt="8TechBurp company logo"
                    className="h-full w-full scale-[1.28] object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.19em] text-slate-300">Platform owner and technology partner</p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.02em]">8TechBurp</h2>
                </div>
              </div>

              <div className="grid gap-3 p-5 sm:p-6">
                {[
                  [Mail, 'Platform email', 'team@myindianstartup.com', 'mailto:team@myindianstartup.com', 'slate'],
                  [Phone, 'Phone support', '+91 90236 15266', 'tel:+919023615266', 'orange'],
                  [Globe2, '8TechBurp website', 'Visit platform partner', 'https://www.8techburp.com/', 'slate']
                ].map(([Icon, label, value, href, accent]) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noreferrer' : undefined}
                    className="group flex min-w-0 items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-white text-slate-700'}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</span>
                      <span className="mt-1 block truncate text-sm font-black text-slate-900">{value}</span>
                    </span>
                    {href.startsWith('http') && <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-slate-700" />}
                  </a>
                ))}
              </div>
            </section>

            <div className="flex items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm font-medium leading-6 text-slate-600 shadow-sm">
              <Rocket className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
              <p>Building technology that helps businesses and creators connect, collaborate, and grow across India.</p>
            </div>
          </div>

          <section className="flex h-full min-w-0 flex-col rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.07)] sm:p-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Send a message</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">We'll get back to you soon</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Share your question and our team will respond within one business day.</p>
            </div>

              <form onSubmit={handleSubmit} className="mt-7 grid flex-1 content-start gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-600">Name *</span>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Your name"
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-600">Email *</span>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="you@email.com"
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-600">Subject *</span>
                  <input
                    required
                    type="text"
                    value={formData.subject}
                    onChange={(e) => updateField('subject', e.target.value)}
                    placeholder="How can we help?"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-600">Message *</span>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    placeholder="Tell us about your inquiry..."
                    className="resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold leading-6 text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </label>

                {error && (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:opacity-60 sm:w-fit"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>{loading ? 'Sending message...' : 'Send Message'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
          </section>
        </div>
      </section>
    </main>
  );
};

export default Contact;
