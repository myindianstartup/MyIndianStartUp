import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase.js';
import { getIpAddress } from '../middleware/requestMonitoring.js';

const trackSchema = z.object({
  eventName: z.string().trim().min(2).max(80).default('page_view'),
  route: z.string().trim().min(1).max(300),
  referrer: z.string().trim().max(500).optional().nullable(),
  deviceType: z.string().trim().max(80).optional().nullable(),
  browser: z.string().trim().max(80).optional().nullable(),
  sessionId: z.string().trim().max(120).optional().nullable(),
  durationSeconds: z.number().int().nonnegative().optional().nullable(),
  bounce: z.boolean().optional().nullable(),
  metadata: z.record(z.any()).optional().default({})
});

export const analyticsRouter = Router();

analyticsRouter.post('/track', async (req, res, next) => {
  try {
    const payload = trackSchema.parse(req.body || {});
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    let userId = null;

    if (token) {
      const { data } = await supabaseAdmin.auth.getUser(token);
      userId = data?.user?.id || null;
    }

    const { error } = await supabaseAdmin
      .schema('admin')
      .from('traffic_events')
      .insert({
        user_id: userId,
        event_name: payload.eventName,
        route: payload.route,
        referrer: payload.referrer || null,
        device_type: payload.deviceType || null,
        browser: payload.browser || null,
        session_id: payload.sessionId || null,
        duration_seconds: payload.durationSeconds || null,
        bounce: payload.bounce ?? null,
        metadata: payload.metadata,
        user_agent: req.headers['user-agent'] || null,
        ip_address: getIpAddress(req)
      });

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
