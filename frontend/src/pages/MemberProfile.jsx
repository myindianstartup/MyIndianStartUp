import React, { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, ExternalLink, Globe2, Instagram, Linkedin, Loader2, Mail, MapPin, Phone, Sparkles, UserCheck, UserPlus, UserRound, Youtube } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

const initialsFrom = (value = 'MI') => String(value)
  .split(/[.\s@_-]+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join('') || 'MI';

const compactLocation = (city, state) => [city, state].filter(Boolean).join(', ');

const normalizeExternalUrl = (value = '') => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const normalizePhoneHref = (value = '') => {
  const digits = String(value || '').replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : '';
};

const InfoCardContent = ({ icon: Icon, label, value, linked = false, external = false }) => (
  <>
    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
      <Icon className="h-4 w-4" />
      {label}
    </div>
    <div className={`mt-3 break-words text-sm font-bold leading-6 ${linked ? 'text-blue-600 underline decoration-blue-200 underline-offset-4 group-hover:text-blue-700 group-hover:decoration-blue-500' : 'text-slate-900'}`}>
      <span>{value || 'Not shared yet'}</span>
      {linked && external ? <ExternalLink className="ml-1.5 inline h-3.5 w-3.5" /> : null}
    </div>
  </>
);

const InfoCard = ({ icon: Icon, label, value, href, external = false }) => {
  const className = "rounded-[1.5rem] border border-slate-200 bg-[#fbfbfd] p-5";
  if (href && value) {
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className={`${className} group block transition hover:border-blue-200 hover:bg-blue-50/40`}>
        <InfoCardContent icon={Icon} label={label} value={value} linked external={external} />
      </a>
    );
  }
  return <div className={className}><InfoCardContent icon={Icon} label={label} value={value} /></div>;
};

const MemberProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token, member: currentMember } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!token || !userId) return;
      setLoading(true);
      setError('');
      try {
        const data = await apiRequest(`/api/profiles/public/${userId}`, { token });
        setProfileData(data);
      } catch (requestError) {
        setError(requestError.message || 'Could not load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token, userId]);

  useEffect(() => {
    const loadConnectionState = async () => {
      if (!token || !userId || currentMember?.id === userId) return;
      try {
        const data = await apiRequest('/api/posts/connections', { token });
        const following = data.following || [];
        setIsConnected(following.some((item) => item.id === userId));
      } catch {
        setIsConnected(false);
      }
    };

    loadConnectionState();
  }, [currentMember?.id, token, userId]);

  const isOwnProfile = currentMember?.id === userId;
  const accountType = profileData?.member?.account_type || 'business';
  const isCreator = accountType === 'creator';
  const profile = isCreator ? profileData?.creatorProfile : profileData?.businessProfile;
  const displayName = isCreator
    ? profile?.full_name || profileData?.member?.full_name || profileData?.member?.email || 'Creator profile'
    : profile?.business_name || profileData?.member?.full_name || profileData?.member?.email || 'Business profile';
  const country = profile?.contact_details?.country || '';
  const location = [compactLocation(profile?.city, profile?.state), country].filter(Boolean).join(', ');
  const website = isCreator ? profile?.portfolio_url : profile?.website;
  const about = isCreator ? profile?.about_me : profile?.about_company;
  const phone = profile?.contact_details?.mobile || profile?.contact_details?.phone || profileData?.member?.mobile_number || '';
  const email = profile?.contact_details?.email || profileData?.member?.email || '';
  const imageUrl = isCreator ? profile?.profile_image_url : profile?.logo_url;
  const isOnline = Boolean(profileData?.online);
  const socialLinks = profile?.social_links || {};
  const websiteUrl = normalizeExternalUrl(website);
  const instagramUrl = normalizeExternalUrl(socialLinks.instagram);
  const linkedinUrl = normalizeExternalUrl(socialLinks.linkedin);
  const youtubeUrl = normalizeExternalUrl(socialLinks.youtube);
  const phoneHref = normalizePhoneHref(phone);
  const emailHref = email ? `mailto:${email}` : '';
  const tags = useMemo(() => (
    isCreator
      ? (Array.isArray(profile?.skills) ? profile.skills : [])
      : [profile?.industry].filter(Boolean)
  ), [isCreator, profile]);

  const handleConnect = async () => {
    if (!token || !userId || isOwnProfile || connecting) return;
    const nextState = !isConnected;
    setConnecting(true);
    setConnectionMessage('');
    try {
      const payload = await apiRequest(`/api/posts/users/${userId}/follow`, {
        method: 'POST',
        token,
        body: { following: nextState }
      });
      setIsConnected(Boolean(payload.following));
      setConnectionMessage(payload.following ? 'You are now connected with this member.' : 'Connection removed.');
    } catch (requestError) {
      setConnectionMessage(requestError.message || 'Could not update connection right now.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] pt-24 text-slate-950 md:pt-28">
      <section className="mx-auto max-w-6xl px-5 pb-12 md:px-10">
        {loading ? (
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm font-bold text-slate-500 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading profile...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-100 bg-rose-50 px-6 py-5 text-sm font-bold text-rose-600 shadow-sm">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-5">
                  <div className="relative shrink-0">
                    <div className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.75rem] text-2xl font-black text-white ${isCreator ? 'bg-blue-600' : 'bg-orange-500'}`}>
                      {imageUrl ? <img src={imageUrl} alt={displayName} className="h-full w-full object-cover" /> : initialsFrom(displayName)}
                    </div>
                    {isOnline ? (
                      <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                    ) : null}
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                      {isCreator ? <UserRound className="h-3.5 w-3.5" /> : <BriefcaseBusiness className="h-3.5 w-3.5" />}
                      {isCreator ? 'CreatorVerse Profile' : 'BusinessVerse Profile'}
                    </div>
                    <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-slate-950">{displayName}</h1>
                    <p className="mt-2 text-base font-bold text-slate-600">
                      {isCreator ? (tags.join(', ') || 'Creator profile') : (profile?.industry || 'Business profile')}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      {location || 'Location not added yet'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tags.slice(0, 6).map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {isOwnProfile ? (
                    <button
                      type="button"
                      onClick={() => navigate('/profile-verse')}
                      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
                    >
                      Edit My Profile
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleConnect}
                        disabled={connecting}
                        className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition ${
                          isConnected
                            ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        } disabled:opacity-60`}
                      >
                        {isConnected ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                        {connecting ? 'Updating...' : isConnected ? 'Connected' : 'Connect'}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/verse-feed')}
                        className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
                      >
                        Back to VerseFeed
                      </button>
                    </>
                  )}
                </div>
              </div>
              {connectionMessage && !isOwnProfile && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
                  {connectionMessage}
                </div>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="space-y-6">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    <Sparkles className="h-4 w-4" />
                    About
                  </div>
                  <p className="mt-4 text-sm font-semibold leading-7 text-slate-700">
                    {about || 'This member has not added a detailed public summary yet.'}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <InfoCard icon={MapPin} label="Location" value={location} />
                  <InfoCard icon={Globe2} label={isCreator ? 'Portfolio' : 'Website'} value={website} href={websiteUrl} external />
                  <InfoCard icon={Mail} label="Contact email" value={email} href={emailHref} />
                  <InfoCard icon={Phone} label="Contact phone" value={phone} href={phoneHref} />
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Social links</div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <InfoCard icon={Instagram} label="Instagram" value={socialLinks.instagram || ''} href={instagramUrl} external />
                    <InfoCard icon={Linkedin} label="LinkedIn" value={socialLinks.linkedin || ''} href={linkedinUrl} external />
                    {isCreator && <InfoCard icon={Youtube} label="YouTube" value={socialLinks.youtube || ''} href={youtubeUrl} external />}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Profile details</div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Profile type</div>
                      <div className="mt-1 text-sm font-bold text-slate-900">{isCreator ? 'CreatorVerse' : 'BusinessVerse'}</div>
                    </div>
                    {!isCreator && (
                      <>
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Business category</div>
                          <div className="mt-1 text-sm font-bold text-slate-900">{profile?.contact_details?.businessCategory || 'Not added'}</div>
                        </div>
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Industry</div>
                          <div className="mt-1 text-sm font-bold text-slate-900">{profile?.industry || 'Not added'}</div>
                        </div>
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Looking for</div>
                          <div className="mt-1 text-sm font-bold text-slate-900">{profile?.contact_details?.lookingFor?.join(', ') || 'Not added'}</div>
                        </div>
                      </>
                    )}
                    {isCreator && (
                      <>
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Professional category</div>
                          <div className="mt-1 text-sm font-bold text-slate-900">{profile?.contact_details?.professionalCategory || 'Not added'}</div>
                        </div>
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Skills</div>
                          <div className="mt-1 text-sm font-bold text-slate-900">{tags.join(', ') || 'Not added'}</div>
                        </div>
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Preferred industries</div>
                          <div className="mt-1 text-sm font-bold text-slate-900">{profile?.contact_details?.industriesWanted?.join(', ') || 'Not added'}</div>
                        </div>
                      </>
                    )}
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Membership</div>
                      <div className="mt-1 text-sm font-bold text-slate-900 capitalize">{profileData?.member?.subscription_status || 'inactive'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default MemberProfile;
