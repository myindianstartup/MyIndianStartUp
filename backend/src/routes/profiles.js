import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';

const businessProfileSchema = z.object({
  businessName: z.string().trim().min(2),
  industry: z.string().trim().min(2),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  website: z.string().url().optional().or(z.literal('')),
  aboutCompany: z.string().trim().max(2400).optional(),
  socialLinks: z.record(z.string()).optional().default({}),
  contactDetails: z.record(z.unknown()).optional().default({}),
  logoAssetId: z.string().uuid().optional().nullable()
});

const creatorProfileSchema = z.object({
  fullName: z.string().trim().min(2),
  skills: z.array(z.string().trim().min(1)).default([]),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  aboutMe: z.string().trim().max(2400).optional(),
  socialLinks: z.record(z.string()).optional().default({}),
  contactDetails: z.record(z.unknown()).optional().default({}),
  profileAssetId: z.string().uuid().optional().nullable()
});

export const profilesRouter = Router();

const withoutPrivateRegistrationData = (contactDetails = {}) => {
  const { consents, ...publicDetails } = contactDetails || {};
  return publicDetails;
};

profilesRouter.get('/public/:userId', requireAuth, async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const [
      { data: member, error: memberError },
      { data: business, error: businessError },
      { data: creator, error: creatorError }
    ] = await Promise.all([
      supabaseAdmin.schema('core').from('members').select('id, email, full_name, mobile_number, account_type, subscription_status, created_at, last_active_at').eq('id', userId).maybeSingle(),
      supabaseAdmin.schema('businessverse').from('profiles').select('*').eq('owner_id', userId).maybeSingle(),
      supabaseAdmin.schema('creatorverse').from('profiles').select('*').eq('owner_id', userId).maybeSingle()
    ]);

    if (memberError) throw memberError;
    if (businessError) throw businessError;
    if (creatorError) throw creatorError;
    if (!member) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const assetIds = [
      business?.logo_asset_id,
      creator?.profile_asset_id
    ].filter(Boolean);

    let assetsById = {};
    if (assetIds.length) {
      const { data: assets, error: assetError } = await supabaseAdmin
        .schema('core')
        .from('media_assets')
        .select('id, public_url')
        .in('id', assetIds);

      if (assetError) throw assetError;

      assetsById = Object.fromEntries((assets || []).map((asset) => [asset.id, asset.public_url]));
    }

    const online = member?.last_active_at
      ? Date.now() - new Date(member.last_active_at).getTime() < 5 * 60 * 1000
      : false;

    res.json({
      member,
      online,
      businessProfile: business ? {
        ...business,
        contact_details: withoutPrivateRegistrationData(business.contact_details),
        logo_url: assetsById[business.logo_asset_id] || null
      } : null,
      creatorProfile: creator ? {
        ...creator,
        contact_details: withoutPrivateRegistrationData(creator.contact_details),
        profile_image_url: assetsById[creator.profile_asset_id] || null
      } : null
    });
  } catch (error) {
    next(error);
  }
});

profilesRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [
      { data: member, error: memberError },
      { data: business, error: businessError },
      { data: creator, error: creatorError }
    ] = await Promise.all([
      supabaseAdmin.schema('core').from('members').select('*').eq('id', req.user.id).maybeSingle(),
      supabaseAdmin.schema('businessverse').from('profiles').select('*').eq('owner_id', req.user.id).maybeSingle(),
      supabaseAdmin.schema('creatorverse').from('profiles').select('*').eq('owner_id', req.user.id).maybeSingle()
    ]);

    if (memberError) throw memberError;
    if (businessError) throw businessError;
    if (creatorError) throw creatorError;

    const assetIds = [
      business?.logo_asset_id,
      creator?.profile_asset_id
    ].filter(Boolean);

    let assetsById = {};
    if (assetIds.length) {
      const { data: assets, error: assetError } = await supabaseAdmin
        .schema('core')
        .from('media_assets')
        .select('id, public_url')
        .in('id', assetIds);

      if (assetError) throw assetError;

      assetsById = Object.fromEntries((assets || []).map((asset) => [asset.id, asset.public_url]));
    }

    res.json({
      member,
      businessProfile: business ? {
        ...business,
        logo_url: assetsById[business.logo_asset_id] || null
      } : null,
      creatorProfile: creator ? {
        ...creator,
        profile_image_url: assetsById[creator.profile_asset_id] || null
      } : null
    });
  } catch (error) {
    next(error);
  }
});

profilesRouter.put('/business', requireAuth, async (req, res, next) => {
  try {
    const payload = businessProfileSchema.parse(req.body);
    const { data, error } = await supabaseAdmin
      .schema('businessverse')
      .from('profiles')
      .upsert({
        owner_id: req.user.id,
        business_name: payload.businessName,
        industry: payload.industry,
        city: payload.city,
        state: payload.state,
        website: payload.website || null,
        about_company: payload.aboutCompany || null,
        social_links: payload.socialLinks,
        contact_details: payload.contactDetails,
        logo_asset_id: payload.logoAssetId || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'owner_id' })
      .select('*')
      .single();

    if (error) throw error;

    res.json({ profile: data });
  } catch (error) {
    next(error);
  }
});

profilesRouter.put('/creator', requireAuth, async (req, res, next) => {
  try {
    const payload = creatorProfileSchema.parse(req.body);
    const { data, error } = await supabaseAdmin
      .schema('creatorverse')
      .from('profiles')
      .upsert({
        owner_id: req.user.id,
        full_name: payload.fullName,
        skills: payload.skills,
        city: payload.city,
        state: payload.state,
        portfolio_url: payload.portfolioUrl || null,
        about_me: payload.aboutMe || null,
        social_links: payload.socialLinks,
        contact_details: payload.contactDetails,
        profile_asset_id: payload.profileAssetId || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'owner_id' })
      .select('*')
      .single();

    if (error) throw error;

    res.json({ profile: data });
  } catch (error) {
    next(error);
  }
});
