import { supabaseAdmin } from '../lib/supabase.js';

const roleRank = {
  admin: 1,
  superadmin: 2
};

export const requireAdminRole = (minimumRole = 'admin') => async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .schema('admin')
      .from('users')
      .select('role')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    if (!data || roleRank[data.role] < roleRank[minimumRole]) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.adminRole = data.role;
    next();
  } catch (error) {
    next(error);
  }
};
