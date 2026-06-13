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
  aboutCompany: z.string().trim().max(1000).optional()
});

const creatorProfileSchema = z.object({
  fullName: z.string().trim().min(2),
  skills: z.array(z.string().trim().min(1)).default([]),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  aboutMe: z.string().trim().max(1000).optional()
});

export const profilesRouter = Router();

profilesRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [{ data: member, error: memberError }, { data: business }, { data: creator }] = await Promise.all([
      supabaseAdmin.schema('core').from('members').select('*').eq('id', req.user.id).maybeSingle(),
      supabaseAdmin.schema('businessverse').from('profiles').select('*').eq('owner_id', req.user.id).maybeSingle(),
      supabaseAdmin.schema('creatorverse').from('profiles').select('*').eq('owner_id', req.user.id).maybeSingle()
    ]);

    if (memberError) throw memberError;

    res.json({ member, businessProfile: business, creatorProfile: creator });
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
