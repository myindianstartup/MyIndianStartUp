import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  Eye,
  EyeOff,
  Globe2,
  ImagePlus,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  UserRound
} from 'lucide-react';
import GoogleLogo from '@/components/auth/GoogleLogo';
import BrandLogo from '@/components/site/BrandLogo';
import { getAuthRedirectUrl, supabase } from '@/lib/supabaseClient';
import { API_URL, apiRequest } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const businessCategories = [
  'IT & Software', 'Marketing Agency', 'Manufacturing', 'Retail', 'E-Commerce',
  'Education', 'Healthcare', 'Real Estate', 'Finance', 'Food & Beverage',
  'Fashion', 'Jewelry', 'Other'
];

const creatorCategories = [
  'Influencer', 'Reels Creator', 'Photographer', 'Videographer', 'Animator',
  'Graphic Designer', 'UI/UX Designer', 'Web Developer', 'App Developer',
  'Digital Marketer', 'HR Professional', 'Finance Professional', 'Freelancer',
  'Consultant', 'Other'
];

const businessNeeds = [
  'Influencers', 'Reels Creators', 'Photographers', 'Videographers', 'Animators',
  'Designers', 'Developers', 'Digital Marketers', 'HR Professionals',
  'Finance Professionals', 'Freelancers', 'Other'
];

const creatorIndustries = [
  'IT', 'Manufacturing', 'Fashion', 'Jewelry', 'Food', 'Healthcare',
  'Education', 'Real Estate', 'Finance', 'Marketing', 'Other'
];

const inputClass = 'min-w-0 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400';

const cleanUrl = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const getEmailCooldownSeconds = (message = '') => {
  const secondsMatch = String(message).match(/(\d+)\s*seconds?/i);
  if (secondsMatch) return Math.max(Number(secondsMatch[1]), 1);
  return /rate limit|security purposes|too many|over_email_send_rate_limit/i.test(message) ? 60 : 0;
};

const getSignupErrorMessage = (error) => {
  const message = error?.message || '';
  const cooldownSeconds = getEmailCooldownSeconds(message);
  if (cooldownSeconds) {
    return {
      cooldownSeconds,
      message: `Confirmation email limit reached. Please wait ${cooldownSeconds} seconds, then tap Create account only once.`
    };
  }
  return {
    cooldownSeconds: 0,
    message: message || 'Could not create your account. Please try again.'
  };
};

const Field = ({ label, icon: Icon, required = false, children }) => (
  <label className="grid min-w-0 gap-2">
    <span className="text-sm font-bold text-slate-800">
      {label} {required && <span className="text-rose-500">*</span>}
    </span>
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
      {Icon && <Icon className="h-5 w-5 shrink-0 text-slate-400" />}
      {children}
    </div>
  </label>
);

const Section = ({ number, title, copy, children }) => (
  <section className="border-t border-slate-200 pt-6 first:border-t-0 first:pt-0">
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white">{number}</div>
      <div>
        <h3 className="text-lg font-black text-slate-950">{title}</h3>
        {copy && <p className="mt-1 text-sm leading-6 text-slate-500">{copy}</p>}
      </div>
    </div>
    {children}
  </section>
);

const ChoiceGrid = ({ name, options, tone }) => (
  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
    {options.map((option) => (
      <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-[#f8fafc] px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-white">
        <input name={name} value={option} type="checkbox" className={`h-4 w-4 rounded border-slate-300 ${tone}`} />
        <span>{option}</span>
      </label>
    ))}
  </div>
);

const getValues = (form, accountType, requireCredentials = true) => {
  const data = new FormData(form);
  const fullName = String(data.get('fullName') || '').trim();
  const email = String(data.get('email') || '').trim().toLowerCase();
  const mobileNumber = String(data.get('mobileNumber') || '').trim();
  const password = String(data.get('password') || '');
  const confirmPassword = String(data.get('confirmPassword') || '');
  const description = String(data.get('description') || '').trim();
  const state = String(data.get('state') || '').trim();
  const city = String(data.get('city') || '').trim();
  const businessName = String(data.get('businessName') || '').trim();
  const businessCategory = String(data.get('businessCategory') || '').trim();
  const industry = String(data.get('industry') || '').trim();
  const professionalCategory = String(data.get('professionalCategory') || '').trim();
  const skills = String(data.get('skills') || '').split(',').map((item) => item.trim()).filter(Boolean);
  const logoEntry = data.get('businessLogo');
  const logoFile = typeof File !== 'undefined' && logoEntry instanceof File && logoEntry.size ? logoEntry : null;
  const consents = {
    privacy: data.get('privacy') === 'on',
    terms: data.get('terms') === 'on',
    refund: data.get('refund') === 'on',
    age: data.get('age') === 'on'
  };

  if (fullName.length < 2) throw new Error(accountType === 'business' ? 'Enter the business owner or contact person name.' : 'Enter your full name.');
  if (requireCredentials && !emailPattern.test(email)) throw new Error('Enter a valid email address.');
  if (mobileNumber.replace(/\D/g, '').length < 10) throw new Error('Enter a valid 10-digit mobile number.');
  if (accountType === 'business' && businessName.length < 2) throw new Error('Enter your business name.');
  if (accountType === 'business' && !logoFile) throw new Error('Upload your business logo.');
  if (accountType === 'business' && !businessCategory) throw new Error('Select a business category.');
  if (accountType === 'business' && industry.length < 2) throw new Error('Enter your industry.');
  if (accountType === 'creator' && !professionalCategory) throw new Error('Select your professional category.');
  if (accountType === 'creator' && !skills.length) throw new Error('Add at least one professional skill.');
  if (state.length < 2 || city.length < 2) throw new Error('Enter your state and city.');
  if (!description) throw new Error(accountType === 'business' ? 'Add a business description.' : 'Add your professional bio.');
  if (description.split(/\s+/).filter(Boolean).length > 300) throw new Error('Description must be 300 words or fewer.');
  if (requireCredentials && (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password))) {
    throw new Error('Password must be at least 8 characters and include a letter and number.');
  }
  if (requireCredentials && password !== confirmPassword) throw new Error('Passwords do not match.');
  if (!Object.values(consents).every(Boolean)) throw new Error('Accept all four agreements to create your account.');

  return {
    fullName,
    email,
    mobileNumber,
    password,
    registrationDetails: {
      businessName,
      businessCategory,
      professionalCategory,
      industry,
      skills,
      description,
      country: 'India',
      state,
      city,
      website: cleanUrl(data.get('website')),
      instagram: cleanUrl(data.get('instagram')),
      linkedin: cleanUrl(data.get('linkedin')),
      youtube: cleanUrl(data.get('youtube')),
      portfolioUrl: cleanUrl(data.get('portfolioUrl')),
      lookingFor: data.getAll('lookingFor'),
      industriesWanted: data.getAll('industriesWanted'),
      consents
    },
    logoFile
  };
};

const uploadLogo = async (file, token) => {
  if (!file) return null;
  const body = new FormData();
  body.append('purpose', 'profile');
  body.append('file', file);
  const response = await fetch(`${API_URL}/api/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Business logo upload failed.');
  return payload.asset.id;
};

const SignUp = () => {
  const navigate = useNavigate();
  const { refreshMember } = useAuth();
  const formRef = useRef(null);
  const [accountType, setAccountType] = useState('business');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const submitLockRef = useRef(false);

  const isBusiness = accountType === 'business';
  const accent = isBusiness ? 'text-orange-600' : 'text-blue-600';
  const button = isBusiness ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700';
  const checkbox = isBusiness ? 'text-orange-500 focus:ring-orange-500' : 'text-blue-600 focus:ring-blue-600';

  useEffect(() => {
    if (!emailCooldown) return undefined;
    const timer = window.setInterval(() => {
      setEmailCooldown((seconds) => Math.max(seconds - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [emailCooldown]);

  const saveMember = async (session, values) => {
    const logoAssetId = isBusiness ? await uploadLogo(values.logoFile, session.access_token) : null;
    const registrationDetails = { ...values.registrationDetails, logoAssetId };
    await apiRequest('/api/members/me', {
      method: 'PUT',
      token: session.access_token,
      body: { fullName: values.fullName, mobileNumber: values.mobileNumber, accountType, registrationDetails }
    });
    await refreshMember(session);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitLockRef.current || loading || googleLoading) return;
    if (emailCooldown > 0) {
      setFormError(`Please wait ${emailCooldown} seconds before requesting another confirmation email.`);
      return;
    }
    submitLockRef.current = true;
    setFormError('');
    setSuccessMessage('');
    setConfirmationEmail('');
    setResendMessage('');

    let values;
    try {
      values = getValues(event.currentTarget, accountType);
    } catch (error) {
      setFormError(error.message);
      submitLockRef.current = false;
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: getAuthRedirectUrl('/login?confirmed=1'),
        data: {
          full_name: values.fullName,
          mobile_number: values.mobileNumber,
          account_type: accountType,
          registration_details: values.registrationDetails
        }
      }
    });

    if (error) {
      const friendlyError = getSignupErrorMessage(error);
      if (friendlyError.cooldownSeconds) setEmailCooldown(friendlyError.cooldownSeconds);
      setLoading(false);
      submitLockRef.current = false;
      setFormError(friendlyError.message);
      return;
    }

    if (!data.session) {
      window.localStorage.setItem('myindianstartup_account_type', accountType);
      const existingIdentity = Array.isArray(data.user?.identities) && data.user.identities.length === 0;
      setConfirmationEmail(values.email);
      setLoading(false);
      submitLockRef.current = false;
      setSuccessMessage(existingIdentity
        ? 'This email is already registered or waiting for confirmation. Sign in if you have confirmed it, or request another confirmation email below.'
        : `We sent a confirmation link to ${values.email}. Check Inbox, Spam, and Promotions before requesting another email.`);
      return;
    }

    try {
      await saveMember(data.session, values);
      window.localStorage.setItem('myindianstartup_auth_mode', 'signup');
      window.localStorage.setItem('myindianstartup_auth_provider', 'email');
      window.localStorage.setItem('myindianstartup_account_type', accountType);
      navigate('/pricing', { replace: true });
    } catch (error) {
      setFormError(error.message || 'Account created, but profile setup could not finish. Sign in to retry.');
      setLoading(false);
      submitLockRef.current = false;
    }
  };

  const handleResendConfirmation = async () => {
    if (!confirmationEmail || resendLoading) return;
    if (emailCooldown > 0) {
      setFormError(`Please wait ${emailCooldown} seconds before requesting another confirmation email.`);
      return;
    }
    setResendLoading(true);
    setResendMessage('');
    setFormError('');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: confirmationEmail,
      options: { emailRedirectTo: getAuthRedirectUrl('/login?confirmed=1') }
    });
    setResendLoading(false);
    if (error) {
      const friendlyError = getSignupErrorMessage(error);
      if (friendlyError.cooldownSeconds) setEmailCooldown(friendlyError.cooldownSeconds);
      setFormError(friendlyError.cooldownSeconds
        ? `Please wait ${friendlyError.cooldownSeconds} seconds before requesting another confirmation email.`
        : friendlyError.message || 'Could not resend the confirmation email. Please try again.');
      return;
    }
    setEmailCooldown(60);
    setResendMessage(`Confirmation email requested for ${confirmationEmail}. Check Inbox, Spam, and Promotions.`);
  };

  const handleGoogleSignUp = async () => {
    setFormError('');
    setSuccessMessage('');
    let values;
    try {
      values = getValues(formRef.current, accountType, false);
    } catch (error) {
      setFormError(error.message);
      return;
    }

    setGoogleLoading(true);
    window.localStorage.setItem('myindianstartup_auth_mode', 'signup');
    window.localStorage.setItem('myindianstartup_auth_provider', 'google');
    window.localStorage.setItem('myindianstartup_pending_account_type', accountType);
    window.localStorage.setItem('myindianstartup_account_type', accountType);
    window.localStorage.setItem('myindianstartup_pending_registration_details', JSON.stringify({
      fullName: values.fullName,
      mobileNumber: values.mobileNumber,
      registrationDetails: values.registrationDetails
    }));

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getAuthRedirectUrl('/') }
    });
    if (error) {
      setGoogleLoading(false);
      setFormError(error.message || 'Google signup could not start. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fbff] text-slate-950">
      <div className="mx-auto max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Link to="/" aria-label="MyIndianStartup home"><BrandLogo /></Link>
          <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
            <span>Already a member?</span>
            <Link to="/login" className="rounded-xl border border-slate-200 px-4 py-2 text-slate-900 hover:bg-slate-50">Sign in</Link>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`text-xs font-black uppercase ${accent}`}>Create your account</div>
              <h1 className="mt-3 text-3xl font-black leading-tight">Join {isBusiness ? 'BusinessVerse' : 'CreatorVerse'}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">Complete your professional profile once. You can edit every public detail later from ProfileVerse.</p>
              <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
                {[
                  ['business', 'BusinessVerse', Building2],
                  ['creator', 'CreatorVerse', Sparkles]
                ].map(([key, label, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAccountType(key)}
                    className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg px-2 text-xs font-black ${accountType === key ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200' : 'text-slate-500'}`}
                  >
                    <Icon className={`h-5 w-5 ${accountType === key ? (key === 'business' ? 'text-orange-500' : 'text-blue-600') : ''}`} />
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-black uppercase text-slate-500">Annual membership</div>
                <div className="mt-2 text-3xl font-black">Rs 999 <span className="text-sm text-slate-500">/ year</span></div>
                <div className="mt-3 flex items-center gap-2 text-sm font-bold text-emerald-700"><Check className="h-4 w-4" /> {isBusiness ? 'BusinessVerse' : 'CreatorVerse'} access</div>
              </div>
            </div>
          </aside>

          <form ref={formRef} onSubmit={handleSubmit} className="grid gap-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className={`inline-flex items-center gap-2 text-xs font-black uppercase ${accent}`}><BadgeCheck className="h-4 w-4" /> Registration details</div>
                <h2 className="mt-2 text-2xl font-black sm:text-3xl">{isBusiness ? 'Business account details' : 'Creator account details'}</h2>
              </div>
              <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-600">India</div>
            </div>

            <Section number="01" title={isBusiness ? 'Basic information' : 'Personal information'}>
              <div className="grid gap-4 md:grid-cols-2">
                {isBusiness && (
                  <Field label="Business Name" icon={BriefcaseBusiness} required>
                    <input name="businessName" className={inputClass} placeholder="Your registered or trading name" />
                  </Field>
                )}
                <Field label={isBusiness ? 'Business Owner / Contact Person' : 'Full Name'} icon={UserRound} required>
                  <input name="fullName" className={inputClass} placeholder="Full name" />
                </Field>
                <Field label="Email Address" icon={Mail} required>
                  <input name="email" type="email" className={inputClass} placeholder="you@example.com" />
                </Field>
                <Field label="Mobile Number" icon={Phone} required>
                  <input name="mobileNumber" type="tel" className={inputClass} placeholder="+91 98765 43210" />
                </Field>
                {isBusiness && (
                  <Field label="Business Logo" icon={ImagePlus} required>
                    <input name="businessLogo" type="file" accept="image/*" required className="min-w-0 w-full text-sm font-semibold text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:font-bold" />
                  </Field>
                )}
              </div>
            </Section>

            <Section number="02" title={isBusiness ? 'Business information' : 'Professional information'}>
              <div className="grid gap-4 md:grid-cols-2">
                {isBusiness ? (
                  <>
                    <Field label="Business Category" icon={Building2} required>
                      <select name="businessCategory" className={inputClass} defaultValue=""><option value="" disabled>Select category</option>{businessCategories.map((item) => <option key={item}>{item}</option>)}</select>
                    </Field>
                    <Field label="Industry" icon={Sparkles} required>
                      <input name="industry" className={inputClass} placeholder="Describe your industry" />
                    </Field>
                  </>
                ) : (
                  <>
                    <Field label="Professional Category" icon={BriefcaseBusiness} required>
                      <select name="professionalCategory" className={inputClass} defaultValue=""><option value="" disabled>Select category</option>{creatorCategories.map((item) => <option key={item}>{item}</option>)}</select>
                    </Field>
                    <Field label="Skills" icon={Sparkles} required>
                      <input name="skills" className={inputClass} placeholder="Photoshop, Reels Editing, Marketing" />
                    </Field>
                  </>
                )}
              </div>
              <label className="mt-4 grid gap-2">
                <span className="text-sm font-bold text-slate-800">{isBusiness ? 'Business Description' : 'Professional Bio'} <span className="text-rose-500">*</span></span>
                <textarea name="description" rows={5} maxLength={2400} className="resize-none rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder={isBusiness ? 'Describe your business, products, services, and goals. Maximum 300 words.' : 'Describe your experience, services, and professional strengths. Maximum 300 words.'} />
              </label>
            </Section>

            <Section number="03" title="Location">
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Country" icon={Globe2} required><input value="India" readOnly className={inputClass} /></Field>
                <Field label="State" icon={MapPin} required><input name="state" className={inputClass} placeholder="Gujarat" /></Field>
                <Field label="City" icon={MapPin} required><input name="city" className={inputClass} placeholder="Ahmedabad" /></Field>
              </div>
            </Section>

            <Section number="04" title={isBusiness ? 'Online presence' : 'Portfolio and social media'} copy="These links are displayed as clickable links on your member profile.">
              <div className="grid gap-4 md:grid-cols-2">
                {isBusiness ? (
                  <Field label="Website" icon={Globe2}><input name="website" className={inputClass} placeholder="yourbusiness.com" /></Field>
                ) : (
                  <Field label="Portfolio Website" icon={Globe2}><input name="portfolioUrl" className={inputClass} placeholder="yourportfolio.com" /></Field>
                )}
                <Field label="Instagram" icon={Globe2}><input name="instagram" className={inputClass} placeholder="instagram.com/yourprofile" /></Field>
                <Field label="LinkedIn" icon={Globe2}><input name="linkedin" className={inputClass} placeholder="linkedin.com/in/yourprofile" /></Field>
                {!isBusiness && <Field label="YouTube" icon={Globe2}><input name="youtube" className={inputClass} placeholder="youtube.com/@yourchannel" /></Field>}
              </div>
            </Section>

            <Section number="05" title={isBusiness ? 'What are you looking for?' : 'Industries you want to work with'} copy="Optional. Select all that apply.">
              <ChoiceGrid name={isBusiness ? 'lookingFor' : 'industriesWanted'} options={isBusiness ? businessNeeds : creatorIndustries} tone={checkbox} />
            </Section>

            <Section number="06" title="Membership">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <div><div className="text-sm font-black text-emerald-900">{isBusiness ? 'BusinessVerse' : 'CreatorVerse'} annual plan</div><div className="mt-1 text-sm text-emerald-700">Payment is completed securely after registration.</div></div>
                <div className="text-2xl font-black text-emerald-900">Rs 999 / Year</div>
              </div>
            </Section>

            <Section number="07" title="Account security and agreement">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Password" icon={LockKeyhole} required>
                  <input name="password" type={showPassword ? 'text' : 'password'} className={inputClass} placeholder="At least 8 characters" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </Field>
                <Field label="Confirm Password" icon={LockKeyhole} required>
                  <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} className={inputClass} placeholder="Repeat password" />
                  <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} className="text-slate-400 hover:text-slate-700">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </Field>
              </div>
              <div className="mt-5 grid gap-3">
                {[
                  ['privacy', <>I agree to the <Link to="/privacy-policy" target="_blank" className="font-black underline">Privacy Policy</Link>.</>],
                  ['terms', <>I agree to the <Link to="/terms-and-conditions" target="_blank" className="font-black underline">Terms of Service</Link>.</>],
                  ['refund', <>I agree to the <Link to="/payment-refund-policy" target="_blank" className="font-black underline">Payment &amp; Refund Policy</Link>.</>],
                  ['age', <>I confirm that I am 18 years or older.</>]
                ].map(([name, label]) => (
                  <label key={name} className="flex items-start gap-3 text-sm font-semibold leading-6 text-slate-600">
                    <input name={name} type="checkbox" className={`mt-1 h-4 w-4 rounded border-slate-300 ${checkbox}`} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </Section>

            {formError && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{formError}</div>}
            {successMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                <div className="font-bold">{successMessage}</div>
                {confirmationEmail && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={handleResendConfirmation} disabled={resendLoading || emailCooldown > 0} className="rounded-lg bg-emerald-700 px-4 py-2 font-black text-white hover:bg-emerald-800 disabled:opacity-60">
                      {resendLoading ? 'Sending...' : emailCooldown > 0 ? `Resend in ${emailCooldown}s` : 'Resend confirmation'}
                    </button>
                    <Link to="/login" className="rounded-lg border border-emerald-300 bg-white px-4 py-2 font-black text-emerald-800 hover:bg-emerald-100">Go to sign in</Link>
                    <Link to="/forgot-password" className="rounded-lg border border-emerald-300 bg-white px-4 py-2 font-black text-emerald-800 hover:bg-emerald-100">Reset password</Link>
                  </div>
                )}
                {resendMessage && <div className="mt-3 font-semibold">{resendMessage}</div>}
              </div>
            )}

            <div className="grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2">
              <button type="submit" disabled={loading || googleLoading || emailCooldown > 0} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black text-white disabled:opacity-60 ${button}`}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {loading ? 'Creating account...' : emailCooldown > 0 ? `Try again in ${emailCooldown}s` : 'Create account'}
              </button>
              <button type="button" onClick={handleGoogleSignUp} disabled={loading || googleLoading} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleLogo className="h-5 w-5" />}
                Continue with Google
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default SignUp;
