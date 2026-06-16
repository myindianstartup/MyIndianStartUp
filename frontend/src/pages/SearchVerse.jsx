import React, { useEffect, useMemo, useState } from 'react';
import {
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

const initialsFrom = (value = 'MI') => String(value)
  .split(/[.\s@_-]+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join('') || 'MI';

const cleanProfileValue = (value = '') => {
  const text = String(value || '').trim();
  if (!text) return '';
  const normalized = text.toLowerCase();
  if (normalized === 'to be updated') return '';
  if (normalized.includes('to be updated, to be updated')) return '';
  return text;
};

const typeStyles = {
  all: {
    pill: 'border-slate-200 bg-white text-slate-700',
    active: 'border-slate-900 bg-slate-900 text-white'
  },
  business: {
    pill: 'border-orange-200 bg-white text-orange-700',
    active: 'border-orange-500 bg-orange-500 text-white'
  },
  creator: {
    pill: 'border-blue-200 bg-white text-blue-700',
    active: 'border-blue-600 bg-blue-600 text-white'
  }
};

const ProfileAvatar = ({ result, size = 'md' }) => {
  const isBusiness = result?.accountType === 'business';
  const sizeClass = size === 'lg' ? 'h-20 w-20 text-2xl rounded-[1.5rem]' : 'h-14 w-14 text-base rounded-2xl';
  const tone = isBusiness ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white';
  const dotClass = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <div className="relative shrink-0">
      <div className={`flex items-center justify-center overflow-hidden font-black ${sizeClass} ${tone}`}>
        {result?.avatarUrl ? (
          <img src={result.avatarUrl} alt={result.displayName || 'Profile'} className="h-full w-full object-cover" />
        ) : (
          result?.initials || initialsFrom(result?.displayName)
        )}
      </div>
      {result?.online ? (
        <span className={`absolute bottom-1 right-1 rounded-full border-2 border-white bg-emerald-500 shadow-sm ${dotClass}`} />
      ) : null}
    </div>
  );
};

const VersePill = ({ type }) => {
  const isBusiness = type === 'business';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${isBusiness ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
      {isBusiness ? 'BusinessVerse' : 'CreatorVerse'}
    </span>
  );
};

const EmptyState = ({ query }) => (
  <div className="flex min-h-[320px] items-center justify-center">
    <div className="max-w-md text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Search className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-2xl font-black tracking-[-0.03em] text-slate-950">No profiles found</h2>
      <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
        {query
          ? `We could not find a profile matching "${query}". Try another name, skill, city, industry, or a simpler spelling.`
          : 'Start typing to search businesses and creators across the platform.'}
      </p>
    </div>
  </div>
);

const SearchVerse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialQuery = params.get('q') || '';
  const initialType = ['all', 'business', 'creator'].includes(params.get('type')) ? params.get('type') : 'all';
  const initialProfile = params.get('profile') || '';

  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [results, setResults] = useState([]);
  const [selectedId, setSelectedId] = useState(initialProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setQuery(initialQuery);
    setType(initialType);
    setSelectedId(initialProfile);
  }, [initialProfile, initialQuery, initialType]);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (query.trim()) nextParams.set('q', query.trim());
    if (type !== 'all') nextParams.set('type', type);
    if (selectedId) nextParams.set('profile', selectedId);
    const nextSearch = nextParams.toString();
    const currentSearch = location.search.replace(/^\?/, '');
    if (nextSearch !== currentSearch) {
      navigate(`/search-verse${nextSearch ? `?${nextSearch}` : ''}`, { replace: true });
    }
  }, [location.search, navigate, query, selectedId, type]);

  useEffect(() => {
    if (!token) return;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const searchParams = new URLSearchParams();
        searchParams.set('type', type);
        searchParams.set('q', query.trim());
        searchParams.set('limit', '18');
        const data = await apiRequest(`/api/search?${searchParams.toString()}`, { token });
        const nextResults = data.results || [];
        setResults(nextResults);
        setSelectedId((current) => {
          if (current && nextResults.some((result) => result.id === current)) return current;
          return nextResults[0]?.id || '';
        });
      } catch (requestError) {
        setError(requestError.message || 'Could not search profiles right now.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [query, token, type]);

  const selectedResult = useMemo(
    () => results.find((result) => result.id === selectedId) || results[0] || null,
    [results, selectedId]
  );

  const profilePreview = useMemo(() => {
    if (!selectedResult) return null;

    const headline = cleanProfileValue(selectedResult.headline) || (selectedResult.accountType === 'creator' ? 'Creator profile' : 'Business profile');
    const location = cleanProfileValue(selectedResult.location);
    const email = cleanProfileValue(selectedResult.email);
    const website = cleanProfileValue(selectedResult.website);
    const about = cleanProfileValue(selectedResult.about);
    const tags = [...new Set((selectedResult.tags || []).map(cleanProfileValue).filter(Boolean))]
      .filter((tag) => tag.toLowerCase() !== headline.toLowerCase())
      .slice(0, 4);

    return {
      ...selectedResult,
      headline,
      location,
      email,
      website,
      about,
      tags
    };
  }, [selectedResult]);

  const resultLabel = query.trim() ? `Results for "${query.trim()}"` : 'Suggested profiles';

  return (
    <div className="bg-[#f8fafc] text-slate-950">
      <section className="pt-24 pb-10 md:pt-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 xl:px-12">
          <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-28 lg:h-[calc(100vh-8.5rem)] lg:overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">SearchVerse</div>
                  <h1 className="text-2xl font-black tracking-[-0.03em] text-slate-950">Find profiles fast</h1>
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search name, city, skill, business, industry..."
                    className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ['all', 'All'],
                  ['business', 'BusinessVerse'],
                  ['creator', 'CreatorVerse']
                ].map(([key, label]) => {
                  const tone = typeStyles[key];
                  const active = type === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setType(key)}
                      className={`rounded-full border px-4 py-2 text-sm font-black transition-colors ${active ? tone.active : tone.pill}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{resultLabel}</div>
                <div className="text-xs font-bold text-slate-500">{results.length} shown</div>
              </div>

              <div className="mt-4 lg:max-h-[calc(100%-13rem)] lg:overflow-y-auto lg:pr-1">
                {loading ? (
                  <div className="flex min-h-[240px] items-center justify-center">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Searching profiles...
                    </div>
                  </div>
                ) : results.length ? (
                  <div className="space-y-2">
                    {results.map((result) => {
                      const active = selectedResult?.id === result.id;
                      return (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => setSelectedId(result.id)}
                          className={`flex w-full items-center gap-3 rounded-[1.4rem] border px-3 py-3 text-left transition-colors ${
                            active ? 'border-slate-900 bg-white shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <ProfileAvatar result={result} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-black text-slate-950">{result.displayName}</div>
                            <div className="mt-0.5 truncate text-xs font-semibold text-slate-500">{result.headline || 'Profile'}</div>
                            <div className="mt-1 truncate text-xs text-slate-400">{result.location || 'Location not added yet'}</div>
                          </div>
                          <VersePill type={result.accountType} />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState query={query.trim()} />
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              {error ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                  {error}
                </div>
              ) : profilePreview ? (
                <div className="flex h-full flex-col">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-start gap-4">
                      <ProfileAvatar result={profilePreview} size="lg" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950">{profilePreview.displayName}</h2>
                          <VersePill type={profilePreview.accountType} />
                        </div>
                        <p className="mt-2 text-base font-bold text-slate-600">{profilePreview.headline}</p>
                        {profilePreview.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {profilePreview.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-slate-600">
                              {tag}
                            </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-[1.6rem] border border-slate-200 bg-[#fbfbfd] p-5">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        <MapPin className="h-4 w-4" />
                        Location
                      </div>
                      <div className="mt-3 text-sm font-bold leading-6 text-slate-900">
                        {profilePreview.location || 'Location not shared yet'}
                      </div>
                    </div>

                    <div className="rounded-[1.6rem] border border-slate-200 bg-[#fbfbfd] p-5">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        <Mail className="h-4 w-4" />
                        Contact
                      </div>
                      <div className="mt-3 break-all text-sm font-bold leading-6 text-slate-900">
                        {profilePreview.email || 'Email not shared'}
                      </div>
                    </div>

                    <div className="rounded-[1.6rem] border border-slate-200 bg-[#fbfbfd] p-5">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        <Globe2 className="h-4 w-4" />
                        Website
                      </div>
                      <div className="mt-3 break-all text-sm font-bold leading-6 text-slate-900">
                        {profilePreview.website || 'Website not shared'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 rounded-[1.8rem] border border-slate-200 bg-[#fbfbfd] p-6">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      <Sparkles className="h-4 w-4" />
                      Profile summary
                    </div>
                    <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-slate-700">
                      {profilePreview.about || 'This profile has not added a detailed public summary yet.'}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => profilePreview?.ownerId && navigate(`/member-profile/${profilePreview.ownerId}`)}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
                    >
                      Open Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/verse-feed')}
                      className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-100"
                    >
                      Back to VerseFeed
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyState query={query.trim()} />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SearchVerse;
