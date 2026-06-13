import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';

const memberSchema = z.object({
  fullName: z.string().trim().min(2),
  mobileNumber: z.string().trim().min(7).max(20).optional(),
  accountType: z.enum(['business', 'creator'])
});

export const membersRouter = Router();

membersRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .schema('core')
      .from('members')
      .select('*')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    res.json({ member: data });
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

    res.json({ member: data });
  } catch (error) {
    next(error);
  }
});
