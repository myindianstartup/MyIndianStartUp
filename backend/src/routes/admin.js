import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdminRole } from '../middleware/adminAuth.js';
import { supabaseAdmin } from '../lib/supabase.js';

export const adminRouter = Router();

const countRows = async (schema, table, filters = []) => {
  let query = supabaseAdmin.schema(schema).from(table).select('*', { count: 'exact', head: true });
  filters.forEach(([column, value]) => {
    query = query.eq(column, value);
  });
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
};

adminRouter.get('/me', requireAuth, requireAdminRole('admin'), async (req, res) => {
  res.json({ role: req.adminRole });
});

adminRouter.get('/overview', requireAuth, requireAdminRole('admin'), async (req, res, next) => {
  try {
    const [
      members,
      activeSubscriptions,
      businessProfiles,
      creatorProfiles,
      publishedPosts,
      mediaAssets
    ] = await Promise.all([
      countRows('core', 'members'),
      countRows('core', 'members', [['subscription_status', 'active']]),
      countRows('businessverse', 'profiles'),
      countRows('creatorverse', 'profiles'),
      countRows('postverse', 'posts', [['status', 'published']]),
      countRows('core', 'media_assets')
    ]);

    const { data: recentMembers, error: memberError } = await supabaseAdmin
      .schema('core')
      .from('members')
      .select('id, email, full_name, account_type, subscription_status, created_at')
      .order('created_at', { ascending: false })
      .limit(8);

    if (memberError) throw memberError;

    const { data: recentPosts, error: postsError } = await supabaseAdmin
      .schema('postverse')
      .from('posts')
      .select('id, caption, account_type, status, created_at, media_type')
      .order('created_at', { ascending: false })
      .limit(8);

    if (postsError) throw postsError;

    res.json({
      stats: {
        members,
        activeSubscriptions,
        businessProfiles,
        creatorProfiles,
        publishedPosts,
        mediaAssets
      },
      recentMembers,
      recentPosts,
      role: req.adminRole
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/members', requireAuth, requireAdminRole('admin'), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .schema('core')
      .from('members')
      .select('id, email, full_name, mobile_number, account_type, subscription_status, subscription_expires_at, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json({ members: data });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/superadmin', requireAuth, requireAdminRole('superadmin'), async (req, res, next) => {
  try {
    const { data: admins, error: adminsError } = await supabaseAdmin
      .schema('admin')
      .from('users')
      .select('user_id, role, created_at')
      .order('created_at', { ascending: false });

    if (adminsError) throw adminsError;

    const stats = {
      estimatedAnnualRevenue: (await countRows('core', 'members', [['subscription_status', 'active']])) * 999,
      admins: admins.length,
      totalMembers: await countRows('core', 'members'),
      totalPosts: await countRows('postverse', 'posts')
    };

    res.json({ stats, admins });
  } catch (error) {
    next(error);
  }
});
