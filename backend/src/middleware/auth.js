import { supabaseAdmin } from '../lib/supabase.js';

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : req.query?.access_token || null;

    if (!token) {
      return res.status(401).json({ error: 'Missing bearer token' });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = data.user;

    supabaseAdmin
      .schema('core')
      .from('members')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', data.user.id)
      .then(({ error: touchError }) => {
        if (touchError && process.env.NODE_ENV !== 'production') {
          console.warn('Could not update member activity:', touchError.message);
        }
      });

    next();
  } catch (error) {
    next(error);
  }
};
