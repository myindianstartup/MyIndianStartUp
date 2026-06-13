import '../src/config/env.js';
import { supabaseAdmin } from '../src/lib/supabase.js';

const now = new Date();
const expiresAt = new Date(now);
expiresAt.setFullYear(expiresAt.getFullYear() + 1);

const accounts = [
  {
    email: 'superadmin@myindianstartup.test',
    password: 'SuperAdmin@123',
    fullName: 'MIS Super Admin',
    accountType: 'business',
    adminRole: 'superadmin'
  },
  {
    email: 'admin@myindianstartup.test',
    password: 'Admin@123',
    fullName: 'MIS Admin Manager',
    accountType: 'business',
    adminRole: 'admin'
  },
  {
    email: 'business@myindianstartup.test',
    password: 'Business@123',
    fullName: 'Aurora Foods Owner',
    accountType: 'business',
    businessProfile: {
      business_name: 'Aurora Foods Pvt Ltd',
      industry: 'Food & Beverage',
      city: 'Ahmedabad',
      state: 'Gujarat',
      website: 'https://example.com',
      about_company: 'A sample BusinessVerse profile for testing daily visibility and direct creator discovery.'
    }
  },
  {
    email: 'creator@myindianstartup.test',
    password: 'Creator@123',
    fullName: 'Riya Sharma',
    accountType: 'creator',
    creatorProfile: {
      full_name: 'Riya Sharma',
      skills: ['Photography', 'Reels', 'Brand Content'],
      city: 'Mumbai',
      state: 'Maharashtra',
      portfolio_url: 'https://example.com',
      about_me: 'A sample CreatorVerse profile for testing creator discovery and collaboration.'
    }
  }
];

const { error: schemaError } = await supabaseAdmin
  .schema('core')
  .from('members')
  .select('id', { count: 'exact', head: true });

if (schemaError) {
  console.error('Supabase schema is not ready. Run backend/database/supabase/schema.sql in Supabase SQL Editor first.');
  process.exitCode = 1;
} else {
  const createOrGetUser = async ({ email, password, fullName }) => {
  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (!error && created?.user) {
    return created.user;
  }

  if (!String(error?.message || '').toLowerCase().includes('already')) {
    throw error;
  }

  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) throw listError;

  const existing = users.users.find((user) => user.email === email);
  if (!existing) {
    throw new Error(`User exists but could not be fetched: ${email}`);
  }

  return existing;
  };

  for (const account of accounts) {
    const user = await createOrGetUser(account);

    const { error: memberError } = await supabaseAdmin
      .schema('core')
      .from('members')
      .upsert({
        id: user.id,
        email: account.email,
        full_name: account.fullName,
        account_type: account.accountType,
        subscription_status: 'active',
        subscription_started_at: now.toISOString(),
        subscription_expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString()
      }, { onConflict: 'id' });

    if (memberError) throw memberError;

    if (account.adminRole) {
      const { error: adminError } = await supabaseAdmin
        .schema('admin')
        .from('users')
        .upsert({
          user_id: user.id,
          role: account.adminRole
        }, { onConflict: 'user_id' });

      if (adminError) throw adminError;
    }

    if (account.businessProfile) {
      const { error: businessError } = await supabaseAdmin
        .schema('businessverse')
        .from('profiles')
        .upsert({
          owner_id: user.id,
          ...account.businessProfile,
          updated_at: now.toISOString()
        }, { onConflict: 'owner_id' });

      if (businessError) throw businessError;
    }

    if (account.creatorProfile) {
      const { error: creatorError } = await supabaseAdmin
        .schema('creatorverse')
        .from('profiles')
        .upsert({
          owner_id: user.id,
          ...account.creatorProfile,
          updated_at: now.toISOString()
        }, { onConflict: 'owner_id' });

      if (creatorError) throw creatorError;
    }

    console.log(`Seeded ${account.email}`);
  }

  console.log('Dummy accounts ready.');
}
