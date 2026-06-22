import React, { useEffect, useMemo, useState } from 'react';
import {
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
  UserRound,
  Youtube
} from 'lucide-react';
import { API_URL, apiRequest } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import WorkspaceSidebar from '@/components/dashboard/WorkspaceSidebar';

const emptyBusiness = {
  businessName: '',
  contactPerson: '',
  businessCategory: '',
  industry: '',
  country: 'India',
  city: '',
  state: '',
  website: '',
  aboutCompany: '',
  email: '',
  phone: '',
  instagram: '',
  linkedin: '',
  lookingFor: [],
  consents: {},
  logoAssetId: null,
  logoUrl: ''
};

const emptyCreator = {
  fullName: '',
  professionalCategory: '',
  skills: '',
  country: 'India',
  city: '',
  state: '',
  portfolioUrl: '',
  aboutMe: '',
  email: '',
  phone: '',
  instagram: '',
  linkedin: '',
  youtube: '',
  industriesWanted: [],
  consents: {},
  profileAssetId: null,
  profileImageUrl: ''
};

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

const normalizeProfile = (profile, member, type) => {
  if (type === 'business') {
    return {
      businessName: profile?.business_name || member?.full_name || '',
      contactPerson: profile?.contact_details?.contactPerson || member?.full_name || '',
      businessCategory: profile?.contact_details?.businessCategory || '',
      industry: profile?.industry === 'To be updated' ? '' : profile?.industry || '',
      country: profile?.contact_details?.country || 'India',
      city: profile?.city === 'To be updated' ? '' : profile?.city || '',
      state: profile?.state === 'To be updated' ? '' : profile?.state || '',
      website: profile?.website || '',
      aboutCompany: profile?.about_company || '',
      email: profile?.contact_details?.email || member?.email || '',
      phone: profile?.contact_details?.mobile || profile?.contact_details?.phone || member?.mobile_number || '',
      instagram: profile?.social_links?.instagram || '',
      linkedin: profile?.social_links?.linkedin || '',
      lookingFor: Array.isArray(profile?.contact_details?.lookingFor) ? profile.contact_details.lookingFor : [],
      consents: profile?.contact_details?.consents || {},
      logoAssetId: profile?.logo_asset_id || null,
      logoUrl: profile?.logo_url || ''
    };
  }

  return {
    fullName: profile?.full_name || member?.full_name || '',
    professionalCategory: profile?.contact_details?.professionalCategory || '',
    skills: Array.isArray(profile?.skills) ? profile.skills.join(', ') : '',
    country: profile?.contact_details?.country || 'India',
    city: profile?.city === 'To be updated' ? '' : profile?.city || '',
    state: profile?.state === 'To be updated' ? '' : profile?.state || '',
    portfolioUrl: profile?.portfolio_url || '',
    aboutMe: profile?.about_me || '',
    email: profile?.contact_details?.email || member?.email || '',
    phone: profile?.contact_details?.mobile || profile?.contact_details?.phone || member?.mobile_number || '',
    instagram: profile?.social_links?.instagram || '',
    linkedin: profile?.social_links?.linkedin || '',
    youtube: profile?.social_links?.youtube || '',
    industriesWanted: Array.isArray(profile?.contact_details?.industriesWanted) ? profile.contact_details.industriesWanted : [],
    consents: profile?.contact_details?.consents || {},
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
  <label className="grid min-w-0 gap-2">
    <span className="text-sm font-bold text-slate-800">{label}</span>
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
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
      ? ['businessName', 'contactPerson', 'businessCategory', 'industry', 'country', 'city', 'state', 'website', 'aboutCompany', 'email', 'phone']
      : ['fullName', 'professionalCategory', 'skills', 'country', 'city', 'state', 'portfolioUrl', 'aboutMe', 'email', 'phone'];
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

  const toggleListField = (field, value) => {
    setActiveForm((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value]
    }));
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
    const description = isBusiness ? businessForm.aboutCompany : creatorForm.aboutMe;
    if (description.trim().split(/\s+/).filter(Boolean).length > 300) {
      setError('Description must be 300 words or fewer.');
      return;
    }
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
              mobile: businessForm.phone.trim(),
              contactPerson: businessForm.contactPerson.trim(),
              country: businessForm.country.trim() || 'India',
              businessCategory: businessForm.businessCategory,
              lookingFor: businessForm.lookingFor,
              consents: businessForm.consents
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
              linkedin: creatorForm.linkedin.trim(),
              youtube: creatorForm.youtube.trim()
            },
            contactDetails: {
              email: creatorForm.email.trim(),
              phone: creatorForm.phone.trim(),
              mobile: creatorForm.phone.trim(),
              country: creatorForm.country.trim() || 'India',
              professionalCategory: creatorForm.professionalCategory,
              industriesWanted: creatorForm.industriesWanted,
              consents: creatorForm.consents
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
    <main className="min-h-screen bg-[#f8fbff] pt-28 text-slate-950">
      <section className="relative overflow-hidden py-8 pb-16">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.10),transparent_32%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.10),transparent_34%)]" />
        <div className="relative mx-auto max-w-[1560px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)] xl:items-start">
            <div>
              <WorkspaceSidebar />
            </div>

            <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(300px,400px)_minmax(0,1fr)] lg:items-start">
              <aside className="min-w-0 self-start">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-6">
                <div className={`inline-flex items-center gap-2 rounded-full border ${theme.border} ${theme.soft} px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] ${theme.accent}`}>
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

                </div>
              </div>
            </aside>

              <form onSubmit={handleSave} className="min-w-0 self-start rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:p-7">
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

              <div className="mt-7 grid gap-y-5 md:grid-cols-2 md:gap-x-8">
                {isBusiness ? (
                  <>
                    <Field label="Business Name" icon={BriefcaseBusiness}>
                      <input value={businessForm.businessName} onChange={(event) => updateField('businessName', event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="Aurora Foods Pvt Ltd" />
                    </Field>
                    <Field label="Owner / Contact Person" icon={UserRound}>
                      <input value={businessForm.contactPerson} onChange={(event) => updateField('contactPerson', event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="Contact person name" />
                    </Field>
                    <Field label="Business Category" icon={BriefcaseBusiness}>
                      <select value={businessForm.businessCategory} onChange={(event) => updateField('businessCategory', event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none">
                        <option value="" disabled>Select category</option>
                        {businessCategories.map((category) => <option key={category}>{category}</option>)}
                      </select>
                    </Field>
                    <Field label="Industry" icon={ShieldCheck}>
                      <input value={businessForm.industry} onChange={(event) => updateField('industry', event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="Food & Beverage" />
                    </Field>
                    <Field label="Country" icon={Globe2}>
                      <input value={businessForm.country} readOnly className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none" />
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
                    <Field label="Professional Category" icon={BriefcaseBusiness}>
                      <select value={creatorForm.professionalCategory} onChange={(event) => updateField('professionalCategory', event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none">
                        <option value="" disabled>Select category</option>
                        {creatorCategories.map((category) => <option key={category}>{category}</option>)}
                      </select>
                    </Field>
                    <Field label="Skills" icon={Sparkles}>
                      <input value={creatorForm.skills} onChange={(event) => updateField('skills', event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="Photography, Reels, Editing" />
                    </Field>
                    <Field label="Country" icon={Globe2}>
                      <input value={creatorForm.country} readOnly className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none" />
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
                {!isBusiness && (
                  <Field label="YouTube" icon={Youtube}>
                    <input value={creatorForm.youtube} onChange={(event) => updateField('youtube', event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="https://youtube.com/@yourchannel" />
                  </Field>
                )}
              </div>

              <div className="mt-6">
                <div className="text-sm font-bold text-slate-800">{isBusiness ? 'Looking For' : 'Industries You Want To Work With'}</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {(isBusiness ? businessNeeds : creatorIndustries).map((option) => {
                    const field = isBusiness ? 'lookingFor' : 'industriesWanted';
                    const checked = activeForm[field].includes(option);
                    return (
                      <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-bold ${checked ? `${theme.soft} ${theme.border} ${theme.accent}` : 'border-slate-200 bg-[#f8fafc] text-slate-600'}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleListField(field, option)} className="h-4 w-4 rounded border-slate-300" />
                        {option}
                      </label>
                    );
                  })}
                </div>
              </div>

              <label className="mt-5 grid gap-2">
                <span className="text-sm font-bold text-slate-800">{isBusiness ? 'About Company' : 'About Me'}</span>
                <textarea
                  value={isBusiness ? businessForm.aboutCompany : creatorForm.aboutMe}
                  onChange={(event) => updateField(isBusiness ? 'aboutCompany' : 'aboutMe', event.target.value)}
                  required
                  rows={6}
                  maxLength={2400}
                  className="resize-none rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-semibold leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder={isBusiness ? 'Describe your company, products, services, and collaboration needs. Maximum 300 words.' : 'Describe your skills, experience, services, and collaboration style. Maximum 300 words.'}
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
    </main>
  );
};

export default ProfileVerse;
