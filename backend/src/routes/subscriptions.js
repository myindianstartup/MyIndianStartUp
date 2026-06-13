import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';

export const subscriptionsRouter = Router();

subscriptionsRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .schema('core')
      .from('members')
      .select('subscription_status, subscription_started_at, subscription_expires_at')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    res.json({ subscription: data });
  } catch (error) {
    next(error);
  }
});

subscriptionsRouter.post('/activate-demo', requireAuth, async (req, res, next) => {
  try {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const { data, error } = await supabaseAdmin
      .schema('core')
      .from('members')
      .update({
        subscription_status: 'active',
        subscription_started_at: now.toISOString(),
        subscription_expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', req.user.id)
      .select('subscription_status, subscription_started_at, subscription_expires_at')
      .single();

    if (error) throw error;

    res.json({ subscription: data });
  } catch (error) {
    next(error);
  }
});
