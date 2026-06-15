import crypto from 'crypto';
import { Router } from 'express';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';

export const messagesRouter = Router();

const fallbackStorageDir = path.resolve(process.cwd(), 'storage');
const fallbackPath = path.join(fallbackStorageDir, 'message-fallback.json');
const publicMemberSelect = 'id, email, full_name, account_type, last_active_at';

const conversationSchema = z.object({
  participantId: z.string().uuid()
});

const messageSchema = z.object({
  body: z.string().trim().min(1).max(1000)
});

const isMissingDatabaseFeature = (error) => {
  const message = `${error?.code || ''} ${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return [
    '42p01',
    '42703',
    'pgrst106',
    'does not exist',
    'could not find',
    'schema must be one of',
    'relationship'
  ].some((pattern) => message.includes(pattern));
};

const safeProfileQuery = async (query, fallback) => {
  const result = await query;
  if (result.error) {
    if (isMissingDatabaseFeature(result.error)) return fallback;
    throw result.error;
  }
  return result;
};

const readFallback = async () => {
  try {
    const raw = await readFile(fallbackPath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      conversations: Array.isArray(parsed.conversations) ? parsed.conversations : [],
      participants: Array.isArray(parsed.participants) ? parsed.participants : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : []
    };
  } catch {
    return { conversations: [], participants: [], messages: [] };
  }
};

const writeFallback = async (store) => {
  await mkdir(fallbackStorageDir, { recursive: true });
  await writeFile(fallbackPath, JSON.stringify(store, null, 2));
};

const initialsFrom = (value = 'MI') => String(value)
  .split(/[.\s@_-]+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join('') || 'MI';

const getMemberProfiles = async (memberIds = []) => {
  const ids = [...new Set(memberIds)].filter(Boolean);
  if (!ids.length) return {};

  const [
    { data: members },
    { data: businessProfiles },
    { data: creatorProfiles }
  ] = await Promise.all([
    safeProfileQuery(supabaseAdmin.schema('core').from('members').select(publicMemberSelect).in('id', ids), { data: [] }),
    safeProfileQuery(supabaseAdmin.schema('businessverse').from('profiles').select('owner_id, business_name, industry, city, state, logo_asset_id').in('owner_id', ids), { data: [] }),
    safeProfileQuery(supabaseAdmin.schema('creatorverse').from('profiles').select('owner_id, full_name, skills, city, state, profile_asset_id').in('owner_id', ids), { data: [] })
  ]);

  const assetIds = [
    ...(businessProfiles || []).map((profile) => profile.logo_asset_id),
    ...(creatorProfiles || []).map((profile) => profile.profile_asset_id)
  ].filter(Boolean);

  let assetsById = {};
  if (assetIds.length) {
    const { data: assets } = await safeProfileQuery(
      supabaseAdmin.schema('core').from('media_assets').select('id, public_url').in('id', assetIds),
      { data: [] }
    );
    assetsById = Object.fromEntries((assets || []).map((asset) => [asset.id, asset.public_url]));
  }

  const membersById = Object.fromEntries((members || []).map((member) => [member.id, member]));
  const businessById = Object.fromEntries((businessProfiles || []).map((profile) => [profile.owner_id, profile]));
  const creatorById = Object.fromEntries((creatorProfiles || []).map((profile) => [profile.owner_id, profile]));

  return Object.fromEntries(ids.map((id) => {
    const member = membersById[id];
    const business = businessById[id];
    const creator = creatorById[id];
    const accountType = member?.account_type || (creator ? 'creator' : 'business');
    const name = accountType === 'creator'
      ? creator?.full_name || member?.full_name || member?.email || 'CreatorVerse Member'
      : business?.business_name || member?.full_name || member?.email || 'BusinessVerse Member';
    const city = accountType === 'creator' ? creator?.city : business?.city;
    const state = accountType === 'creator' ? creator?.state : business?.state;
    const category = accountType === 'creator'
      ? (Array.isArray(creator?.skills) ? creator.skills.slice(0, 2).join(', ') : '')
      : business?.industry || '';
    const avatarUrl = accountType === 'creator'
      ? assetsById[creator?.profile_asset_id] || ''
      : assetsById[business?.logo_asset_id] || '';

    return [id, {
      id,
      name,
      accountType,
      city: city || '',
      state: state || '',
      category,
      avatarUrl,
      initials: initialsFrom(name),
      online: member?.last_active_at ? Date.now() - new Date(member.last_active_at).getTime() < 5 * 60 * 1000 : false
    }];
  }));
};

const assertMemberExists = async (memberId) => {
  const { data, error } = await supabaseAdmin
    .schema('core')
    .from('members')
    .select('id')
    .eq('id', memberId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const notFound = new Error('Member not found');
    notFound.status = 404;
    throw notFound;
  }
};

const shapeConversation = async ({ conversation, participants, messages, viewerId }) => {
  const participantIds = participants.map((row) => row.user_id);
  const otherId = participantIds.find((id) => id !== viewerId) || participantIds[0] || viewerId;
  const profiles = await getMemberProfiles([otherId]);
  const sortedMessages = [...messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const lastMessage = sortedMessages[0] || null;

  return {
    id: conversation.id,
    participant: profiles[otherId] || { id: otherId, name: 'Member', accountType: 'creator', initials: 'MI' },
    lastMessage: lastMessage?.body || '',
    lastMessageAt: lastMessage?.created_at || conversation.last_message_at || conversation.updated_at || conversation.created_at,
    unread: messages.filter((message) => message.sender_id !== viewerId && !message.read_at).length
  };
};

const getFallbackConversationBetween = (store, firstUserId, secondUserId) => {
  return store.conversations.find((conversation) => {
    const ids = store.participants
      .filter((participant) => participant.conversation_id === conversation.id)
      .map((participant) => participant.user_id);
    return ids.length === 2 && ids.includes(firstUserId) && ids.includes(secondUserId);
  });
};

const listFallbackConversations = async (viewerId) => {
  const store = await readFallback();
  const conversationIds = store.participants
    .filter((participant) => participant.user_id === viewerId)
    .map((participant) => participant.conversation_id);

  const conversations = await Promise.all(conversationIds.map((conversationId) => {
    const conversation = store.conversations.find((row) => row.id === conversationId);
    if (!conversation) return null;
    return shapeConversation({
      conversation,
      participants: store.participants.filter((participant) => participant.conversation_id === conversationId),
      messages: store.messages.filter((message) => message.conversation_id === conversationId),
      viewerId
    });
  }));

  return conversations
    .filter(Boolean)
    .sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
};

const ensureFallbackConversation = async (viewerId, participantId) => {
  const store = await readFallback();
  const existing = getFallbackConversationBetween(store, viewerId, participantId);
  if (existing) {
    return shapeConversation({
      conversation: existing,
      participants: store.participants.filter((participant) => participant.conversation_id === existing.id),
      messages: store.messages.filter((message) => message.conversation_id === existing.id),
      viewerId
    });
  }

  const now = new Date().toISOString();
  const conversation = {
    id: crypto.randomUUID(),
    created_by: viewerId,
    created_at: now,
    updated_at: now,
    last_message_at: now
  };
  store.conversations.push(conversation);
  store.participants.push(
    { conversation_id: conversation.id, user_id: viewerId, created_at: now },
    { conversation_id: conversation.id, user_id: participantId, created_at: now }
  );
  await writeFallback(store);

  return shapeConversation({
    conversation,
    participants: store.participants.filter((participant) => participant.conversation_id === conversation.id),
    messages: [],
    viewerId
  });
};

const assertFallbackParticipant = async (conversationId, viewerId) => {
  const store = await readFallback();
  const participant = store.participants.find((row) => row.conversation_id === conversationId && row.user_id === viewerId);
  if (!participant) {
    const notFound = new Error('Conversation not found');
    notFound.status = 404;
    throw notFound;
  }
  return store;
};

const listDbConversations = async (viewerId) => {
  const { data: viewerParticipants, error: participantError } = await supabaseAdmin
    .schema('messaging')
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', viewerId);

  if (participantError) {
    if (isMissingDatabaseFeature(participantError)) return listFallbackConversations(viewerId);
    throw participantError;
  }

  const conversationIds = (viewerParticipants || []).map((row) => row.conversation_id);
  if (!conversationIds.length) return [];

  const [
    { data: conversations, error: conversationsError },
    { data: participants, error: allParticipantsError },
    { data: messages, error: messagesError }
  ] = await Promise.all([
    supabaseAdmin.schema('messaging').from('conversations').select('*').in('id', conversationIds),
    supabaseAdmin.schema('messaging').from('conversation_participants').select('*').in('conversation_id', conversationIds),
    supabaseAdmin.schema('messaging').from('messages').select('*').in('conversation_id', conversationIds).order('created_at', { ascending: false }).limit(500)
  ]);

  if ([conversationsError, allParticipantsError, messagesError].some(isMissingDatabaseFeature)) {
    return listFallbackConversations(viewerId);
  }
  if (conversationsError) throw conversationsError;
  if (allParticipantsError) throw allParticipantsError;
  if (messagesError) throw messagesError;

  const shaped = await Promise.all((conversations || []).map((conversation) => shapeConversation({
    conversation,
    participants: (participants || []).filter((participant) => participant.conversation_id === conversation.id),
    messages: (messages || []).filter((message) => message.conversation_id === conversation.id),
    viewerId
  })));

  return shaped.sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
};

const ensureDbConversation = async (viewerId, participantId) => {
  const conversations = await listDbConversations(viewerId);
  const existing = conversations.find((conversation) => conversation.participant?.id === participantId);
  if (existing) return existing;

  const now = new Date().toISOString();
  const { data: conversation, error: conversationError } = await supabaseAdmin
    .schema('messaging')
    .from('conversations')
    .insert({ created_by: viewerId, created_at: now, updated_at: now, last_message_at: now })
    .select('*')
    .single();

  if (conversationError) {
    if (isMissingDatabaseFeature(conversationError)) return ensureFallbackConversation(viewerId, participantId);
    throw conversationError;
  }

  const { error: participantError } = await supabaseAdmin
    .schema('messaging')
    .from('conversation_participants')
    .insert([
      { conversation_id: conversation.id, user_id: viewerId, created_at: now },
      { conversation_id: conversation.id, user_id: participantId, created_at: now }
    ]);

  if (participantError) throw participantError;

  return shapeConversation({
    conversation,
    participants: [
      { conversation_id: conversation.id, user_id: viewerId },
      { conversation_id: conversation.id, user_id: participantId }
    ],
    messages: [],
    viewerId
  });
};

messagesRouter.get('/people', requireAuth, async (req, res, next) => {
  try {
    const query = String(req.query.q || '').trim().toLowerCase();
    const { data, error } = await supabaseAdmin
      .schema('core')
      .from('members')
      .select(publicMemberSelect)
      .neq('id', req.user.id)
      .order('last_active_at', { ascending: false, nullsFirst: false })
      .limit(60);

    if (error) throw error;

    const profiles = await getMemberProfiles((data || []).map((member) => member.id));
    const people = Object.values(profiles)
      .filter((person) => !query || [person.name, person.city, person.state, person.category, person.accountType].join(' ').toLowerCase().includes(query))
      .slice(0, 20);

    res.json({ people });
  } catch (error) {
    next(error);
  }
});

messagesRouter.get('/conversations', requireAuth, async (req, res, next) => {
  try {
    res.json({ conversations: await listDbConversations(req.user.id) });
  } catch (error) {
    next(error);
  }
});

messagesRouter.post('/conversations', requireAuth, async (req, res, next) => {
  try {
    const payload = conversationSchema.parse(req.body);
    if (payload.participantId === req.user.id) {
      const badRequest = new Error('You cannot message yourself');
      badRequest.status = 400;
      throw badRequest;
    }

    await assertMemberExists(payload.participantId);
    res.status(201).json({ conversation: await ensureDbConversation(req.user.id, payload.participantId) });
  } catch (error) {
    next(error);
  }
});

messagesRouter.get('/conversations/:conversationId/messages', requireAuth, async (req, res, next) => {
  try {
    const conversationId = req.params.conversationId;
    const { data: participant, error: participantError } = await supabaseAdmin
      .schema('messaging')
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (participantError) {
      if (isMissingDatabaseFeature(participantError)) {
        const store = await assertFallbackParticipant(conversationId, req.user.id);
        const now = new Date().toISOString();
        store.messages = store.messages.map((message) => (
          message.conversation_id === conversationId && message.sender_id !== req.user.id && !message.read_at
            ? { ...message, read_at: now }
            : message
        ));
        await writeFallback(store);
        return res.json({ messages: store.messages.filter((message) => message.conversation_id === conversationId) });
      }
      throw participantError;
    }

    if (!participant) {
      const notFound = new Error('Conversation not found');
      notFound.status = 404;
      throw notFound;
    }

    const { data: messages, error: messagesError } = await supabaseAdmin
      .schema('messaging')
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    await supabaseAdmin
      .schema('messaging')
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', req.user.id)
      .is('read_at', null);

    res.json({ messages: messages || [] });
  } catch (error) {
    next(error);
  }
});

messagesRouter.post('/conversations/:conversationId/messages', requireAuth, async (req, res, next) => {
  try {
    const payload = messageSchema.parse(req.body);
    const conversationId = req.params.conversationId;
    const now = new Date().toISOString();

    const { data: participant, error: participantError } = await supabaseAdmin
      .schema('messaging')
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (participantError) {
      if (isMissingDatabaseFeature(participantError)) {
        const store = await assertFallbackParticipant(conversationId, req.user.id);
        const message = {
          id: crypto.randomUUID(),
          conversation_id: conversationId,
          sender_id: req.user.id,
          body: payload.body,
          created_at: now,
          read_at: null
        };
        store.messages.push(message);
        store.conversations = store.conversations.map((conversation) => (
          conversation.id === conversationId
            ? { ...conversation, updated_at: now, last_message_at: now }
            : conversation
        ));
        await writeFallback(store);
        return res.status(201).json({ message });
      }
      throw participantError;
    }

    if (!participant) {
      const notFound = new Error('Conversation not found');
      notFound.status = 404;
      throw notFound;
    }

    const { data: message, error: messageError } = await supabaseAdmin
      .schema('messaging')
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: req.user.id,
        body: payload.body,
        created_at: now
      })
      .select('*')
      .single();

    if (messageError) throw messageError;

    await supabaseAdmin
      .schema('messaging')
      .from('conversations')
      .update({ updated_at: now, last_message_at: now })
      .eq('id', conversationId);

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});
