import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

export const publicRouter = Router();

const isMissingDatabaseFeature = (error) => {
  const message = `${error?.code || ''} ${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return [
    '42p01',
    '42703',
    'pgrst106',
    'does not exist',
    'could not find',
    'schema must be one of',
    'relationship'
  ].some((pattern) => message.includes(pattern));
};

const safeCount = async (schema, table, filters = []) => {
  let query = supabaseAdmin.schema(schema).from(table).select('*', { count: 'exact', head: true });
  filters.forEach(([column, value]) => {
    query = query.eq(column, value);
  });

  const { count, error } = await query;
  if (error) {
    if (isMissingDatabaseFeature(error)) return 0;
    throw error;
  }

  return count || 0;
};

const safeRows = async (schema, table, columns) => {
  const { data, error } = await supabaseAdmin.schema(schema).from(table).select(columns);
  if (error) {
    if (isMissingDatabaseFeature(error)) return [];
    throw error;
  }

  return data || [];
};

const safeProfileRows = async (schema, table, columns, ownerIds) => {
  if (!ownerIds.length) return [];

  const { data, error } = await supabaseAdmin.schema(schema).from(table).select(columns).in('owner_id', ownerIds);
  if (error) {
    if (isMissingDatabaseFeature(error)) return [];
    throw error;
  }

  return data || [];
};

const initialsFrom = (value = 'MI') => String(value)
  .split(/[.\s@_-]+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join('') || 'MI';

publicRouter.get('/stats', async (_req, res, next) => {
  try {
    const [
      totalMembers,
      businessProfileCount,
      creatorProfileCount,
      publishedPosts,
      businessStates,
      creatorStates
    ] = await Promise.all([
      safeCount('core', 'members'),
      safeCount('core', 'members', [['account_type', 'business']]),
      safeCount('core', 'members', [['account_type', 'creator']]),
      safeCount('postverse', 'posts', [['status', 'published']]),
      safeRows('businessverse', 'profiles', 'state'),
      safeRows('creatorverse', 'profiles', 'state')
    ]);

    const recentMembers = await safeRows('core', 'members', 'id, email, full_name, account_type, created_at');
    const previewMembers = recentMembers
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 8);
    const memberIds = previewMembers.map((member) => member.id).filter(Boolean);
    const [businessProfileRows, creatorProfileRows] = await Promise.all([
      safeProfileRows('businessverse', 'profiles', 'owner_id, business_name, logo_asset_id', memberIds),
      safeProfileRows('creatorverse', 'profiles', 'owner_id, full_name, profile_asset_id', memberIds)
    ]);
    const assetIds = [
      ...businessProfileRows.map((profile) => profile.logo_asset_id),
      ...creatorProfileRows.map((profile) => profile.profile_asset_id)
    ].filter(Boolean);
    const assets = assetIds.length
      ? await safeRows('core', 'media_assets', 'id, public_url').then((rows) => rows.filter((asset) => assetIds.includes(asset.id)))
      : [];
    const assetsById = Object.fromEntries(assets.map((asset) => [asset.id, asset.public_url]));
    const businessByOwner = Object.fromEntries(businessProfileRows.map((profile) => [profile.owner_id, profile]));
    const creatorByOwner = Object.fromEntries(creatorProfileRows.map((profile) => [profile.owner_id, profile]));

    const stateSet = new Set(
      [...businessStates, ...creatorStates]
        .map((row) => String(row.state || '').trim().toLowerCase())
        .filter(Boolean)
    );

    res.json({
      stats: {
        totalMembers,
        businessProfiles: businessProfileCount,
        creatorProfiles: creatorProfileCount,
        statesActive: stateSet.size,
        publishedPosts,
        memberPreview: previewMembers.slice(0, 5).map((member) => {
          const isCreator = member.account_type === 'creator';
          const profile = isCreator ? creatorByOwner[member.id] : businessByOwner[member.id];
          const displayName = profile?.full_name || profile?.business_name || member.full_name || member.email || 'Member';
          const imageAssetId = isCreator ? profile?.profile_asset_id : profile?.logo_asset_id;

          return {
            id: member.id,
            name: displayName,
            initials: initialsFrom(displayName),
            avatarUrl: assetsById[imageAssetId] || ''
          };
        })
      }
    });
  } catch (error) {
    next(error);
  }
});
