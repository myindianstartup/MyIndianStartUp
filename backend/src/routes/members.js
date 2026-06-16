import { Router } from 'express';
import { z } from 'zod';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';

const memberSchema = z.object({
  fullName: z.string().trim().min(2),
  mobileNumber: z.string().trim().min(7).max(20).optional(),
  accountType: z.enum(['business', 'creator'])
});

export const membersRouter = Router();

const fallbackStorageDir = path.resolve(process.cwd(), 'storage');
const memberSettingsFallbackPath = path.join(fallbackStorageDir, 'member-settings.json');

const defaultMemberSettings = () => ({
  notifications: {
    dailyPostReminder: true,
    discoveryUpdates: true,
    membershipNotices: true
  }
});

const isMissingDatabaseFeature = (error) => {
  const message = `${error?.code || ''} ${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return [
    '42p01',
    '42703',
    'pgrst106',
    'does not exist',
    'could not find',
    'schema must be one of'
  ].some((pattern) => message.includes(pattern));
};

const memberSettingsSchema = z.object({
  notifications: z.object({
    dailyPostReminder: z.boolean(),
    discoveryUpdates: z.boolean(),
    membershipNotices: z.boolean()
  })
});

const readMemberSettingsFallback = async () => {
  try {
    const raw = await readFile(memberSettingsFallbackPath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeMemberSettingsFallback = async (settingsByUser) => {
  await mkdir(fallbackStorageDir, { recursive: true });
  await writeFile(memberSettingsFallbackPath, JSON.stringify(settingsByUser, null, 2));
};

const readSettingsFromDb = async (userId) => {
  const { data, error } = await supabaseAdmin
    .schema('core')
    .from('member_settings')
    .select('settings')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    if (isMissingDatabaseFeature(error)) return null;
    throw error;
  }

  return data?.settings || null;
};

const writeSettingsToDb = async (userId, settings) => {
  const { data, error } = await supabaseAdmin
    .schema('core')
    .from('member_settings')
    .upsert({
      user_id: userId,
      settings,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select('settings')
    .maybeSingle();

  if (error) {
    if (isMissingDatabaseFeature(error)) return null;
    throw error;
  }

  return data?.settings || settings;
};

const getMemberSettings = async (userId) => {
  const databaseSettings = await readSettingsFromDb(userId);
  if (databaseSettings) {
    return memberSettingsSchema.parse({
      ...defaultMemberSettings(),
      ...databaseSettings,
      notifications: {
        ...defaultMemberSettings().notifications,
        ...(databaseSettings.notifications || {})
      }
    });
  }

  const fallback = await readMemberSettingsFallback();
  const fallbackSettings = fallback[userId];
  if (!fallbackSettings) return defaultMemberSettings();

  return memberSettingsSchema.parse({
    ...defaultMemberSettings(),
    ...fallbackSettings,
    notifications: {
      ...defaultMemberSettings().notifications,
      ...(fallbackSettings.notifications || {})
    }
  });
};

const saveMemberSettings = async (userId, settings) => {
  const normalized = memberSettingsSchema.parse(settings);
  const databaseSettings = await writeSettingsToDb(userId, normalized);
  if (databaseSettings) return normalized;

  const fallback = await readMemberSettingsFallback();
  fallback[userId] = normalized;
  await writeMemberSettingsFallback(fallback);
  return normalized;
};

const getMediaPublicUrl = async (assetId) => {
  if (!assetId) return '';

  const { data, error } = await supabaseAdmin
    .schema('core')
    .from('media_assets')
    .select('public_url')
    .eq('id', assetId)
    .maybeSingle();

  if (error) throw error;
  return data?.public_url || '';
};

const attachProfileImage = async (member) => {
  if (!member) return null;

  if (member.account_type === 'business') {
    const { data, error } = await supabaseAdmin
      .schema('businessverse')
      .from('profiles')
      .select('logo_asset_id')
      .eq('owner_id', member.id)
      .maybeSingle();

    if (error) throw error;

    return {
      ...member,
      profile_image_url: await getMediaPublicUrl(data?.logo_asset_id)
    };
  }

  if (member.account_type === 'creator') {
    const { data, error } = await supabaseAdmin
      .schema('creatorverse')
      .from('profiles')
      .select('profile_asset_id')
      .eq('owner_id', member.id)
      .maybeSingle();

    if (error) throw error;

    return {
      ...member,
      profile_image_url: await getMediaPublicUrl(data?.profile_asset_id)
    };
  }

  return { ...member, profile_image_url: '' };
};

membersRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .schema('core')
      .from('members')
      .select('*')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    res.json({ member: await attachProfileImage(data) });
  } catch (error) {
    next(error);
  }
});

membersRouter.put('/me', requireAuth, async (req, res, next) => {
  try {
    const payload = memberSchema.parse(req.body);

    const { data, error } = await supabaseAdmin
      .schema('core')
      .from('members')
      .upsert({
        id: req.user.id,
        email: req.user.email,
        full_name: payload.fullName,
        mobile_number: payload.mobileNumber || null,
        account_type: payload.accountType,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) throw error;

    if (payload.accountType === 'business') {
      const { error: profileError } = await supabaseAdmin
        .schema('businessverse')
        .from('profiles')
        .upsert({
          owner_id: req.user.id,
          business_name: payload.fullName,
          industry: 'To be updated',
          city: 'To be updated',
          state: 'To be updated',
          contact_details: {
            email: req.user.email,
            mobile: payload.mobileNumber || null
          },
          updated_at: new Date().toISOString()
        }, { onConflict: 'owner_id' });

      if (profileError) throw profileError;
    }

    if (payload.accountType === 'creator') {
      const { error: profileError } = await supabaseAdmin
        .schema('creatorverse')
        .from('profiles')
        .upsert({
          owner_id: req.user.id,
          full_name: payload.fullName,
          city: 'To be updated',
          state: 'To be updated',
          contact_details: {
            email: req.user.email,
            mobile: payload.mobileNumber || null
          },
          updated_at: new Date().toISOString()
        }, { onConflict: 'owner_id' });

      if (profileError) throw profileError;
    }

    res.json({ member: await attachProfileImage(data) });
  } catch (error) {
    next(error);
  }
});

membersRouter.get('/settings', requireAuth, async (req, res, next) => {
  try {
    const settings = await getMemberSettings(req.user.id);
    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

membersRouter.put('/settings', requireAuth, async (req, res, next) => {
  try {
    const settings = memberSettingsSchema.parse(req.body);
    const saved = await saveMemberSettings(req.user.id, settings);
    res.json({ settings: saved });
  } catch (error) {
    next(error);
  }
});
