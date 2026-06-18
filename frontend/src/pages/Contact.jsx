import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Loader2, Mail, MessageSquare, Phone, Send, ShieldCheck, Sparkles } from 'lucide-react';
import BrandLogo from '@/components/site/BrandLogo';
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
    <main className="min-h-screen bg-[#fbfcff] text-slate-950">
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-32">
        {/* Background glow effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-500/8 blur-[120px]" />
          <div className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-orange-500/8 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 xl:px-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            
            {/* Left Column: Info & Copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-600 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Get in touch</span>
              </div>
              
              <h1 className="mt-5 text-4xl font-black leading-[1.03] tracking-[-0.04em] text-slate-950 sm:text-5xl md:text-6xl">
                We'd love to hear from you.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                Have a question about our memberships, platform visibility rules, or partner collaborations? Send us your message and our team will get back to you.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  [Mail, 'Official support email', 'team@myindianstartup.com', 'mailto:team@myindianstartup.com'],
                  [Phone, 'Phone & WhatsApp support', '+91 98765 43210', 'tel:+919876543210'],
                  [MessageSquare, 'Direct network connections', 'Connect with members directly in SearchVerse', '/search-verse']
                ].map(([Icon, label, value, link]) => (
                  <div key={label} className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</div>
                      {link.startsWith('/') ? (
                        <Link to={link} className="mt-1.5 inline-block text-sm font-black text-blue-600 hover:underline">
                          {value}
                        </Link>
                      ) : (
                        <a href={link} className="mt-1.5 inline-block text-sm font-black text-blue-600 hover:underline">
                          {value}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Premium Contact Form */}
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                    Send a query
                  </div>
                  <h2 className="text-2xl font-black tracking-[-0.03em] text-slate-950">
                    Contact Form
                  </h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-slate-700">Your Name *</span>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Rohan Sharma"
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-slate-700">Email Address *</span>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="rohan@gmail.com"
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-700">Subject *</span>
                  <input
                    required
                    type="text"
                    value={formData.subject}
                    onChange={(e) => updateField('subject', e.target.value)}
                    placeholder="Membership payment issue or Partnership query"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-700">Your Message *</span>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    placeholder="Describe your issue or partnership proposal in detail..."
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
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] hover:bg-slate-800 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>{loading ? 'Sending message...' : 'Send Message'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
