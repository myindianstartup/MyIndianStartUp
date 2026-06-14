import { supabaseAdmin } from '../lib/supabase.js';

export const POST_COMPLETION_REQUIRED = 85;
export const POST_COOLDOWN_HOURS = 24;

const isFilled = (value) => {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.filter(Boolean).length > 0;
  if (typeof value === 'object') return Object.values(value).some(isFilled);

  const text = String(value).trim();
  return Boolean(text) && text.toLowerCase() !== 'to be updated';
};

const firstFilled = (...values) => values.find(isFilled);

const hasAnySocialLink = (links = {}) => Object.values(links || {}).some(isFilled);

const scoreFields = (fields) => {
  const total = fields.length;
  const filled = fields.filter((field) => isFilled(field.value)).length;
  const percent = total ? Math.round((filled / total) * 100) : 0;
  const missingFields = fields.filter((field) => !isFilled(field.value)).map((field) => field.label);

  return { percent, missingFields };
};

export const isSubscriptionActive = (member) => {
  if (!member || member.subscription_status !== 'active') return false;
  if (!member.subscription_expires_at) return false;

  return new Date(member.subscription_expires_at) > new Date();
};

export const getMember = async (userId) => {
  const { data, error } = await supabaseAdmin
    .schema('core')
    .from('members')
    .select('id, email, full_name, mobile_number, account_type, subscription_status, subscription_started_at, subscription_expires_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getProfileCompletion = async (userId, accountType) => {
  if (accountType === 'creator') {
    const { data, error } = await supabaseAdmin
      .schema('creatorverse')
      .from('profiles')
      .select('full_name, skills, city, state, portfolio_url, social_links, about_me, contact_details, profile_asset_id')
      .eq('owner_id', userId)
      .maybeSingle();

    if (error) throw error;

    const fields = [
      { label: 'Full name', value: data?.full_name },
      { label: 'Skills', value: data?.skills },
      { label: 'City', value: data?.city },
      { label: 'State', value: data?.state },
      { label: 'Portfolio URL', value: data?.portfolio_url },
      { label: 'About me', value: data?.about_me },
      { label: 'Email', value: data?.contact_details?.email },
      { label: 'Phone', value: firstFilled(data?.contact_details?.phone, data?.contact_details?.mobile) },
      { label: 'Social link', value: hasAnySocialLink(data?.social_links) },
      { label: 'Profile photo', value: data?.profile_asset_id }
    ];

    return { ...scoreFields(fields), exists: Boolean(data) };
  }

  const { data, error } = await supabaseAdmin
    .schema('businessverse')
    .from('profiles')
    .select('business_name, industry, city, state, website, social_links, about_company, contact_details, logo_asset_id')
    .eq('owner_id', userId)
    .maybeSingle();

  if (error) throw error;

  const fields = [
    { label: 'Business name', value: data?.business_name },
    { label: 'Industry', value: data?.industry },
    { label: 'City', value: data?.city },
    { label: 'State', value: data?.state },
    { label: 'Website', value: data?.website },
    { label: 'About company', value: data?.about_company },
    { label: 'Email', value: data?.contact_details?.email },
    { label: 'Phone', value: firstFilled(data?.contact_details?.phone, data?.contact_details?.mobile) },
    { label: 'Social link', value: hasAnySocialLink(data?.social_links) },
    { label: 'Business logo', value: data?.logo_asset_id }
  ];

  return { ...scoreFields(fields), exists: Boolean(data) };
};

export const getPostCooldown = async (userId) => {
  const { data, error } = await supabaseAdmin
    .schema('postverse')
    .from('posts')
    .select('id, published_at, created_at')
    .eq('author_id', userId)
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  const lastPostAt = data?.published_at || data?.created_at || null;
  if (!lastPostAt) {
    return {
      active: false,
      lastPostAt: null,
      nextAllowedAt: null,
      secondsRemaining: 0
    };
  }

  const nextAllowedAt = new Date(new Date(lastPostAt).getTime() + POST_COOLDOWN_HOURS * 60 * 60 * 1000);
  const secondsRemaining = Math.max(0, Math.ceil((nextAllowedAt.getTime() - Date.now()) / 1000));

  return {
    active: secondsRemaining > 0,
    lastPostAt,
    nextAllowedAt: nextAllowedAt.toISOString(),
    secondsRemaining
  };
};

export const getPostEligibility = async (userId) => {
  const member = await getMember(userId);
  const reasons = [];

  if (!member) {
    return {
      allowed: false,
      reasons: [{ code: 'MEMBER_REQUIRED', message: 'Create your account before publishing posts.' }],
      member: null,
      subscription: { active: false, status: null, expiresAt: null },
      profile: { completion: 0, required: POST_COMPLETION_REQUIRED, missingFields: [] },
      cooldown: { active: false, lastPostAt: null, nextAllowedAt: null, secondsRemaining: 0 },
      limits: { postCooldownHours: POST_COOLDOWN_HOURS }
    };
  }

  const [profileCompletion, cooldown] = await Promise.all([
    getProfileCompletion(userId, member.account_type),
    getPostCooldown(userId)
  ]);

  const subscriptionActive = isSubscriptionActive(member);
  if (!subscriptionActive) {
    reasons.push({
      code: 'SUBSCRIPTION_REQUIRED',
      message: 'Please purchase a plan to access this feature.',
      redirectTo: '/pricing'
    });
  }

  if (profileCompletion.percent < POST_COMPLETION_REQUIRED) {
    reasons.push({
      code: 'PROFILE_INCOMPLETE',
      message: `Complete your profile to at least ${POST_COMPLETION_REQUIRED}% before publishing posts.`,
      redirectTo: '/profile-verse'
    });
  }

  if (cooldown.active) {
    reasons.push({
      code: 'POST_COOLDOWN_ACTIVE',
      message: 'You can publish only one post every 24 hours.',
      nextAllowedAt: cooldown.nextAllowedAt
    });
  }

  return {
    allowed: reasons.length === 0,
    reasons,
    member: {
      id: member.id,
      email: member.email,
      accountType: member.account_type
    },
    subscription: {
      active: subscriptionActive,
      status: member.subscription_status,
      startedAt: member.subscription_started_at,
      expiresAt: member.subscription_expires_at
    },
    profile: {
      exists: profileCompletion.exists,
      completion: profileCompletion.percent,
      required: POST_COMPLETION_REQUIRED,
      missingFields: profileCompletion.missingFields
    },
    cooldown,
    limits: { postCooldownHours: POST_COOLDOWN_HOURS }
  };
};

export const assertCanPublishPost = async (userId, accountType) => {
  const eligibility = await getPostEligibility(userId);

  if (!eligibility.member) {
    const error = new Error('Create your account before publishing posts.');
    error.status = 403;
    error.code = 'MEMBER_REQUIRED';
    error.eligibility = eligibility;
    throw error;
  }

  if (eligibility.member.accountType !== accountType) {
    const error = new Error(`This account can publish only as ${eligibility.member.accountType === 'creator' ? 'CreatorVerse' : 'BusinessVerse'}.`);
    error.status = 403;
    error.code = 'ACCOUNT_TYPE_MISMATCH';
    error.eligibility = eligibility;
    throw error;
  }

  if (eligibility.allowed) return eligibility;

  const primary = eligibility.reasons[0];
  const error = new Error(primary.message);
  error.code = primary.code;
  error.redirectTo = primary.redirectTo;
  error.eligibility = eligibility;
  error.status = primary.code === 'SUBSCRIPTION_REQUIRED'
    ? 402
    : primary.code === 'POST_COOLDOWN_ACTIVE'
      ? 429
      : 403;

  throw error;
};
