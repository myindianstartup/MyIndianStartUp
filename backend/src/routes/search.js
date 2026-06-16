import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';

const searchSchema = z.object({
  type: z.enum(['all', 'business', 'creator']).default('all'),
  q: z.string().trim().max(120).default(''),
  limit: z.coerce.number().int().min(1).max(30).default(18)
});

export const searchRouter = Router();

const BUSINESS_SELECT = 'owner_id, business_name, industry, city, state, about_company, website, social_links, contact_details, logo_asset_id, updated_at';
const CREATOR_SELECT = 'owner_id, full_name, skills, city, state, about_me, portfolio_url, social_links, contact_details, profile_asset_id, updated_at';
const MEMBER_SELECT = 'id, email, full_name, account_type, last_active_at';

const initialsFrom = (value = 'MI') => String(value)
  .split(/[.\s@_-]+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join('') || 'MI';

const normalizeSearchText = (value = '') => String(value)
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const safeArray = (value) => Array.isArray(value) ? value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean) : [];

const buildLocation = (city, state) => [city, state].filter(Boolean).join(', ');

const buildSearchTokens = (query) => normalizeSearchText(query).split(' ').filter(Boolean);

const scoreValue = (value, query, tokens, weight) => {
  const normalized = normalizeSearchText(value);
  if (!normalized) return 0;
  if (!query) return 1;
  let score = 0;

  if (normalized === query) score += weight + 80;
  else if (normalized.startsWith(query)) score += weight + 50;
  else if (normalized.includes(query)) score += weight + 25;

  score += tokens.reduce((total, token) => (
    normalized.includes(token) ? total + Math.max(8, Math.round(weight / 8)) : total
  ), 0);

  return score;
};

const shapeBusinessResult = ({ profile, member, assetsById }) => {
  const displayName = profile.business_name || member?.full_name || member?.email || 'BusinessVerse Member';
  const industry = profile.industry || '';
  const location = buildLocation(profile.city, profile.state);

  return {
    id: `business-${profile.owner_id}`,
    ownerId: profile.owner_id,
    accountType: 'business',
    displayName,
    headline: industry || 'Business profile',
    location,
    about: profile.about_company || '',
    avatarUrl: assetsById[profile.logo_asset_id] || '',
    initials: initialsFrom(displayName),
    email: profile.contact_details?.email || member?.email || '',
    phone: profile.contact_details?.mobile || profile.contact_details?.phone || '',
    website: profile.website || '',
    socialLinks: profile.social_links || {},
    tags: [industry, profile.city, profile.state].filter(Boolean),
    updatedAt: profile.updated_at || null,
    online: member?.last_active_at ? Date.now() - new Date(member.last_active_at).getTime() < 5 * 60 * 1000 : false,
    searchableText: [
      displayName,
      industry,
      profile.city,
      profile.state,
      profile.about_company,
      member?.email
    ].filter(Boolean).join(' ')
  };
};

const shapeCreatorResult = ({ profile, member, assetsById }) => {
  const displayName = profile.full_name || member?.full_name || member?.email || 'CreatorVerse Member';
  const skills = safeArray(profile.skills);
  const location = buildLocation(profile.city, profile.state);

  return {
    id: `creator-${profile.owner_id}`,
    ownerId: profile.owner_id,
    accountType: 'creator',
    displayName,
    headline: skills.slice(0, 3).join(', ') || 'Creator profile',
    location,
    about: profile.about_me || '',
    avatarUrl: assetsById[profile.profile_asset_id] || '',
    initials: initialsFrom(displayName),
    email: profile.contact_details?.email || member?.email || '',
    phone: profile.contact_details?.mobile || profile.contact_details?.phone || '',
    website: profile.portfolio_url || '',
    socialLinks: profile.social_links || {},
    tags: [...skills.slice(0, 5), profile.city, profile.state].filter(Boolean),
    updatedAt: profile.updated_at || null,
    online: member?.last_active_at ? Date.now() - new Date(member.last_active_at).getTime() < 5 * 60 * 1000 : false,
    searchableText: [
      displayName,
      skills.join(' '),
      profile.city,
      profile.state,
      profile.about_me,
      member?.email
    ].filter(Boolean).join(' ')
  };
};

const rankResults = (results, query) => {
  const normalizedQuery = normalizeSearchText(query);
  const tokens = buildSearchTokens(query);

  return results
    .map((result) => {
      const score = [
        scoreValue(result.displayName, normalizedQuery, tokens, 120),
        scoreValue(result.headline, normalizedQuery, tokens, 80),
        scoreValue(result.location, normalizedQuery, tokens, 50),
        scoreValue(result.about, normalizedQuery, tokens, 30),
        scoreValue(result.searchableText, normalizedQuery, tokens, 20)
      ].reduce((total, value) => total + value, 0);

      return { ...result, score };
    })
    .filter((result) => !normalizedQuery || result.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime();
    });
};

searchRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const { type, q, limit } = searchSchema.parse(req.query);
    const normalizedQuery = normalizeSearchText(q);

    if (q.trim() && !normalizedQuery) {
      res.json({
        query: q,
        type,
        total: 0,
        results: []
      });
      return;
    }

    const fetchLimit = Math.max(limit * 4, 48);

    const businessPromise = type === 'creator'
      ? Promise.resolve({ data: [] })
      : supabaseAdmin
        .schema('businessverse')
        .from('profiles')
        .select(BUSINESS_SELECT)
        .order('updated_at', { ascending: false, nullsFirst: false })
        .limit(fetchLimit);

    const creatorPromise = type === 'business'
      ? Promise.resolve({ data: [] })
      : supabaseAdmin
        .schema('creatorverse')
        .from('profiles')
        .select(CREATOR_SELECT)
        .order('updated_at', { ascending: false, nullsFirst: false })
        .limit(fetchLimit);

    const [
      { data: businessProfiles, error: businessError },
      { data: creatorProfiles, error: creatorError }
    ] = await Promise.all([businessPromise, creatorPromise]);

    if (businessError) throw businessError;
    if (creatorError) throw creatorError;

    const ownerIds = [
      ...(businessProfiles || []).map((profile) => profile.owner_id),
      ...(creatorProfiles || []).map((profile) => profile.owner_id)
    ].filter(Boolean);

    const assetIds = [
      ...(businessProfiles || []).map((profile) => profile.logo_asset_id),
      ...(creatorProfiles || []).map((profile) => profile.profile_asset_id)
    ].filter(Boolean);

    const [
      { data: members, error: membersError },
      { data: assets, error: assetsError }
    ] = await Promise.all([
      ownerIds.length
        ? supabaseAdmin.schema('core').from('members').select(MEMBER_SELECT).in('id', ownerIds)
        : Promise.resolve({ data: [] }),
      assetIds.length
        ? supabaseAdmin.schema('core').from('media_assets').select('id, public_url').in('id', assetIds)
        : Promise.resolve({ data: [] })
    ]);

    if (membersError) throw membersError;
    if (assetsError) throw assetsError;

    const membersById = Object.fromEntries((members || []).map((member) => [member.id, member]));
    const assetsById = Object.fromEntries((assets || []).map((asset) => [asset.id, asset.public_url]));

    const rawResults = [
      ...(businessProfiles || []).map((profile) => shapeBusinessResult({
        profile,
        member: membersById[profile.owner_id],
        assetsById
      })),
      ...(creatorProfiles || []).map((profile) => shapeCreatorResult({
        profile,
        member: membersById[profile.owner_id],
        assetsById
      }))
    ];

    const ranked = rankResults(rawResults, q);
    const results = ranked.slice(0, limit).map(({ searchableText, score, ...result }) => result);

    res.json({
      query: q,
      type,
      total: results.length,
      results
    });
  } catch (error) {
    next(error);
  }
});
