import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';

const searchSchema = z.object({
  type: z.enum(['business', 'creator']),
  q: z.string().trim().max(80).default('')
});

export const searchRouter = Router();

searchRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const { type, q } = searchSchema.parse(req.query);

    const schema = type === 'business' ? 'businessverse' : 'creatorverse';
    const table = 'profiles';
    const nameColumn = type === 'business' ? 'business_name' : 'full_name';

    let query = supabaseAdmin
      .schema(schema)
      .from(table)
      .select('*')
      .eq('is_public', true)
      .limit(30);

    if (q) {
      query = query.or(`${nameColumn}.ilike.%${q}%,city.ilike.%${q}%,state.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ results: data });
  } catch (error) {
    next(error);
  }
});
