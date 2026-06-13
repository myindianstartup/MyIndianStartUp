import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  Globe2,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Palette,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound
} from 'lucide-react';
import { API_URL, apiRequest } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import WorkspaceSidebar from '@/components/dashboard/WorkspaceSidebar';

const emptyBusiness = {
  businessName: '',
  industry: '',
  city: '',
  state: '',
  website: '',
  aboutCompany: '',
  email: '',
  phone: '',
  instagram: '',
  linkedin: '',
  logoAssetId: null,
  logoUrl: ''
};

const emptyCreator = {
  fullName: '',
  skills: '',
  city: '',
  state: '',
  portfolioUrl: '',
  aboutMe: '',
  email: '',
  phone: '',
  instagram: '',
  linkedin: '',
  profileAssetId: null,
  profileImageUrl: ''
};

const normalizeProfile = (profile, member, type) => {
  if (type === 'business') {
    return {
      businessName: profile?.business_name || member?.full_name || '',
      industry: profile?.industry === 'To be updated' ? '' : profile?.industry || '',
      city: profile?.city === 'To be updated' ? '' : profile?.city || '',
      state: profile?.state === 'To be updated' ? '' : profile?.state || '',
      website: profile?.website || '',
      aboutCompany: profile?.about_company || '',
      email: profile?.contact_details?.email || member?.email || '',
      phone: profile?.contact_details?.mobile || profile?.contact_details?.phone || member?.mobile_number || '',
      instagram: profile?.social_links?.instagram || '',
      linkedin: profile?.social_links?.linkedin || '',
      logoAssetId: profile?.logo_asset_id || null,
      logoUrl: profile?.logo_url || ''
    };
  }

  return {
    fullName: profile?.full_name || member?.full_name || '',
    skills: Array.isArray(profile?.skills) ? profile.skills.join(', ') : '',
    city: profile?.city === 'To be updated' ? '' : profile?.city || '',
    state: profile?.state === 'To be updated' ? '' : profile?.state || '',
    portfolioUrl: profile?.portfolio_url || '',
    aboutMe: profile?.about_me || '',
    email: profile?.contact_details?.email || member?.email || '',
    phone: profile?.contact_details?.mobile || profile?.contact_details?.phone || member?.mobile_number || '',
    instagram: profile?.social_links?.instagram || '',
    linkedin: profile?.social_links?.linkedin || '',
    profileAssetId: profile?.profile_asset_id || null,
    profileImageUrl: profile?.profile_image_url || ''
  };
};

const cleanUrl = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const initialsFrom = (value) => (value || 'MI')
  .split(/[.\s@_-]+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join('') || 'MI';

const Field = ({ label, icon: Icon, children }) => (
  <label className="grid gap-2">
    <span className="text-sm font-bold text-slate-800">{label}</span>
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
      {Icon && <Icon className="h-5 w-5 shrink-0 text-slate-400" />}
      {children}
    </div>
  </label>
);

const ProfileVerse = () => {
  const { token, member, loading: authLoading, refreshMember, session } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [businessForm, setBusinessForm] = useState(emptyBusiness);
  const [creatorForm, setCreatorForm] = useState(emptyCreator);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');

  const accountType = member?.account_type || 'business';
  const isBusiness = accountType === 'business';

  const theme = isBusiness
    ? {
        label: 'BusinessVerse',
        accent: 'text-orange-600',
        bg: 'bg-orange-500',
        hover: 'hover:bg-orange-600',
        soft: 'bg-orange-50',
        border: 'border-orange-100',
        shadow: 'shadow-[0_16px_34px_rgba(249,115,22,0.24)]',
        icon: BriefcaseBusiness
      }
    : {
        label: 'CreatorVerse',
        accent: 'text-blue-600',
        bg: 'bg-blue-600',
        hover: 'hover:bg-blue-700',
        soft: 'bg-blue-50',
        border: 'border-blue-100',
        shadow: 'shadow-[0_16px_34px_rgba(37,99,235,0.24)]',
        icon: Palette
      };

  const activeForm = isBusiness ? businessForm : creatorForm;
  const setActiveForm = isBusiness ? setBusinessForm : setCreatorForm;
  const profileName = isBusiness ? activeForm.businessName : activeForm.fullName;
  const profileImage = mediaPreview || (isBusiness ? businessForm.logoUrl : creatorForm.profileImageUrl);
  const ProfileIcon = theme.icon;

  const completeness = useMemo(() => {
    const keys = isBusiness
      ? ['businessName', 'industry', 'city', 'state', 'website', 'aboutCompany', 'email', 'phone']
      : ['fullName', 'skills', 'city', 'state', 'portfolioUrl', 'aboutMe', 'email', 'phone'];
    const filled = keys.filter((key) => String(activeForm[key] || '').trim()).length;
    return Math.round((filled / keys.length) * 100);
  }, [activeForm, isBusiness]);

  useEffect(() => {
    if (!token || authLoading) return;

    const loadProfile = async () => {
      setPageLoading(true);
      setError('');
      try {
        const data = await apiRequest('/api/profiles/me', { token });
        if (data.member?.account_type === 'business') {
          setBusinessForm(normalizeProfile(data.businessProfile, data.member, 'business'));
        } else {
          setCreatorForm(normalizeProfile(data.creatorProfile, data.member, 'creator'));
        }
      } catch (requestError) {
        setError(requestError.message || 'Could not load your profile.');
      } finally {
        setPageLoading(false);
      }
    };

    loadProfile();
  }, [authLoading, token]);

  useEffect(() => () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
  }, [mediaPreview]);

  const updateField = (field, value) => {
    setActiveForm((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image for your profile.');
      return;
    }

    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setError('');
  };

  const uploadSelectedMedia = async () => {
    if (!mediaFile) {
      return isBusiness ? businessForm.logoAssetId : creatorForm.profileAssetId;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('purpose', 'profile');
    formData.append('file', mediaFile);

    const response = await fetch(`${API_URL}/api/media/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const payload = await response.json();
    setUploading(false);

    if (!response.ok) {
      throw new Error(payload.error || 'Profile image upload failed.');
    }

    return payload.asset.id;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const uploadedAssetId = await uploadSelectedMedia();
      const endpoint = isBusiness ? '/api/profiles/business' : '/api/profiles/creator';
      const body = isBusiness
        ? {
            businessName: businessForm.businessName.trim(),
            industry: businessForm.industry.trim(),
            city: businessForm.city.trim(),
            state: businessForm.state.trim(),
            website: cleanUrl(businessForm.website),
            aboutCompany: businessForm.aboutCompany.trim(),
            socialLinks: {
              instagram: businessForm.instagram.trim(),
              linkedin: businessForm.linkedin.trim()
            },
            contactDetails: {
              email: businessForm.email.trim(),
              phone: businessForm.phone.trim(),
              mobile: businessForm.phone.trim()
            },
            logoAssetId: uploadedAssetId
          }
        : {
            fullName: creatorForm.fullName.trim(),
            skills: creatorForm.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
            city: creatorForm.city.trim(),
            state: creatorForm.state.trim(),
            portfolioUrl: cleanUrl(creatorForm.portfolioUrl),
            aboutMe: creatorForm.aboutMe.trim(),
            socialLinks: {
              instagram: creatorForm.instagram.trim(),
              linkedin: creatorForm.linkedin.trim()
            },
            contactDetails: {
              email: creatorForm.email.trim(),
              phone: creatorForm.phone.trim(),
              mobile: creatorForm.phone.trim()
            },
            profileAssetId: uploadedAssetId
          };

      const data = await apiRequest(endpoint, {
        method: 'PUT',
        token,
        body
      });

      if (isBusiness) {
        setBusinessForm((current) => ({
          ...current,
          logoAssetId: data.profile.logo_asset_id,
          logoUrl: mediaPreview || current.logoUrl
        }));
      } else {
        setCreatorForm((current) => ({
          ...current,
          profileAssetId: data.profile.profile_asset_id,
          profileImageUrl: mediaPreview || current.profileImageUrl
        }));
      }

      setMediaFile(null);
      setSuccess('Profile saved successfully. Your details are ready for discovery.');
      if (session) await refreshMember(session);
    } catch (requestError) {
      setError(requestError.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f8fbff] pt-28">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Loading your ProfileVerse workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fbff] pt-28 text-slate-950">
      <section className="relative overflow-hidden pb-16">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.10),transparent_32%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.10),transparent_34%)]" />
        <div className="relative mx-auto max-w-[1500px] px-6 md:px-12">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
            <WorkspaceSidebar />

            <div className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr] xl:items-start">
            <aside className="xl:sticky xl:top-28">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                <div className={`inline-flex items-center gap-2 rounded-full border ${theme.border} ${theme.soft} px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] ${theme.accent}`}>
                  <Sparkles className="h-3.5 w-3.5" />
                  {theme.label}
                </div>

                <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-slate-950">
                  Build your discovery-ready profile.
                </h1>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Keep your identity, contact details, work links, and location accurate so the right people can find and contact you.
                </p>

                <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-black text-slate-800">Profile strength</div>
                      <div className="mt-1 text-xs font-semibold text-slate-500">Complete the important fields first.</div>
                    </div>
                    <div className={`text-2xl font-black ${theme.accent}`}>{completeness}%</div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full ${theme.bg} transition-all`} style={{ width: `${completeness}%` }} />
                  </div>
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl ${theme.soft} ${theme.accent}`}>
                      {profileImage ? (
                        <img src={profileImage} alt="Profile preview" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-lg font-black">{initialsFrom(profileName)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-lg font-black text-slate-800">{profileName || 'Your profile name'}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                        <MapPin className="h-4 w-4" />
                        <span>{activeForm.city || 'City'}, {activeForm.state || 'State'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {(isBusiness
                      ? [
                          ['Industry', activeForm.industry || 'Add your industry'],
                          ['Website', activeForm.website || 'Add your website']
                        ]
                      : [
                          ['Skills', activeForm.skills || 'Add your skills'],
                          ['Portfolio', activeForm.portfolioUrl || 'Add your portfolio']
                        ]
                    ).map(([label, value]) => (
                      <div key={label} className="rounded-2xl bg-slate-50 px-4 py-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</div>
                        <div className="mt-1 truncate text-sm font-bold text-slate-700">{value}</div>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/search-verse"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <span>Preview discovery flow</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </aside>

            <form onSubmit={handleSave} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className={`inline-flex items-center gap-2 rounded-full ${theme.soft} px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] ${theme.accent}`}>
                    <ProfileIcon className="h-3.5 w-3.5" />
                    Edit {theme.label}
                  </div>
                  <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-800">
                    {isBusiness ? 'Business profile details' : 'Creator profile details'}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    These details power ProfileVerse, SearchVerse, and direct collaboration.
                  </p>
                </div>

                <label className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 transition-all hover:-translate-y-0.5 hover:bg-white">
                  <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                  <ImagePlus className={`h-5 w-5 ${theme.accent}`} />
                  <span className="text-sm font-black text-slate-700">{isBusiness ? 'Upload logo' : 'Upload photo'}</span>
                </label>
              </div>

              {error && (
                <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                {isBusiness ? (
                  <>
                    <Field label="Business Name" icon={BriefcaseBusiness}>
                      <input value={businessForm.businessName} onChange={(event) => updateField('businessName', event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="Aurora Foods Pvt Ltd" />
                    </Field>
                    <Field label="Industry" icon={ShieldCheck}>
                      <input value={businessForm.industry} onChange={(event) => updateField('industry', event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="Food & Beverage" />
                    </Field>
                    <Field label="City" icon={MapPin}>
                      <input value={businessForm.city} onChange={(event) => updateField('city', event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="Ahmedabad" />
                    </Field>
                    <Field label="State" icon={MapPin}>
                      <input value={businessForm.state} onChange={(event) => updateField('state', event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="Gujarat" />
                    </Field>
                    <Field label="Website" icon={Globe2}>
                      <input value={businessForm.website} onChange={(event) => updateField('website', event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="https://yourbusiness.com" />
                    </Field>
                  </>
                ) : (
                  <>
                    <Field label="Full Name" icon={UserRound}>
                      <input value={creatorForm.fullName} onChange={(event) => updateField('fullName', event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="Riya Sharma" />
                    </Field>
                    <Field label="Skills" icon={Sparkles}>
                      <input value={creatorForm.skills} onChange={(event) => updateField('skills', event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="Photography, Reels, Editing" />
                    </Field>
                    <Field label="City" icon={MapPin}>
                      <input value={creatorForm.city} onChange={(event) => updateField('city', event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="Mumbai" />
                    </Field>
                    <Field label="State" icon={MapPin}>
                      <input value={creatorForm.state} onChange={(event) => updateField('state', event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="Maharashtra" />
                    </Field>
                    <Field label="Portfolio URL" icon={Globe2}>
                      <input value={creatorForm.portfolioUrl} onChange={(event) => updateField('portfolioUrl', event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="https://yourportfolio.com" />
                    </Field>
                  </>
                )}

                <Field label="Email" icon={Mail}>
                  <input value={activeForm.email} onChange={(event) => updateField('email', event.target.value)} type="email" required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="contact@example.com" />
                </Field>
                <Field label="Phone / WhatsApp" icon={Phone}>
                  <input value={activeForm.phone} onChange={(event) => updateField('phone', event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="+91 98765 43210" />
                </Field>
                <Field label="Instagram" icon={Camera}>
                  <input value={activeForm.instagram} onChange={(event) => updateField('instagram', event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="https://instagram.com/yourprofile" />
                </Field>
                <Field label="LinkedIn" icon={Globe2}>
                  <input value={activeForm.linkedin} onChange={(event) => updateField('linkedin', event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="https://linkedin.com/in/yourprofile" />
                </Field>
              </div>

              <label className="mt-5 grid gap-2">
                <span className="text-sm font-bold text-slate-800">{isBusiness ? 'About Company' : 'About Me'}</span>
                <textarea
                  value={isBusiness ? businessForm.aboutCompany : creatorForm.aboutMe}
                  onChange={(event) => updateField(isBusiness ? 'aboutCompany' : 'aboutMe', event.target.value)}
                  required
                  rows={6}
                  maxLength={1000}
                  className="resize-none rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-semibold leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder={isBusiness ? 'Describe your company, products, services, and collaboration needs.' : 'Describe your skills, experience, services, and collaboration style.'}
                />
              </label>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
                <p className="max-w-lg text-sm leading-6 text-slate-500">
                  Your saved profile is used in SearchVerse and future public profile cards. Keep it accurate and professional.
                </p>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-black text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${theme.bg} ${theme.hover} ${theme.shadow}`}
                >
                  {saving || uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>{uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfileVerse;
