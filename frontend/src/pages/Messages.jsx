import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCheck,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Send,
  UserPlus
} from 'lucide-react';
import { apiRequest } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import WorkspaceSidebar from '@/components/dashboard/WorkspaceSidebar';

const toneClasses = {
  business: {
    badge: 'bg-orange-50 text-orange-600 ring-orange-100',
    avatar: 'bg-orange-500 text-white',
    active: 'border-orange-100 bg-orange-50/50'
  },
  creator: {
    badge: 'bg-blue-50 text-blue-600 ring-blue-100',
    avatar: 'bg-blue-600 text-white',
    active: 'border-blue-100 bg-blue-50/60'
  }
};

const normalizeType = (type) => (type === 'business' ? 'business' : 'creator');

const initialsFrom = (value) => (value || 'MI')
  .split(/[.\s@_-]+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join('') || 'MI';

const formatMessageTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
};

const VerseBadge = ({ type }) => {
  const accountType = normalizeType(type);
  const tone = toneClasses[accountType];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] ring-1 ${tone.badge}`}>
      {accountType === 'business' ? 'BusinessVerse' : 'CreatorVerse'}
    </span>
  );
};

const Avatar = ({ person, size = 'md' }) => {
  const accountType = normalizeType(person?.accountType);
  const tone = toneClasses[accountType];
  const sizeClass = size === 'lg' ? 'h-12 w-12 rounded-2xl text-sm' : 'h-10 w-10 rounded-xl text-xs';

  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden font-black ${sizeClass} ${tone.avatar}`}>
      {person?.avatarUrl ? (
        <img src={person.avatarUrl} alt={person.name || 'Member'} className="h-full w-full object-cover" />
      ) : (
        person?.initials || initialsFrom(person?.name)
      )}
      {person?.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />}
    </div>
  );
};

const EmptyChat = ({ onStart }) => (
  <div className="flex flex-1 items-center justify-center p-8">
    <div className="max-w-sm text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        <MessageCircle className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-2xl font-black tracking-[-0.03em] text-slate-950">Start a real conversation</h2>
      <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
        Search creators or businesses, open a direct chat, and keep collaboration messages in one place.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
      >
        <UserPlus className="h-4 w-4" />
        New chat
      </button>
    </div>
  </div>
);

const Messages = () => {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [people, setPeople] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversationSearch, setConversationSearch] = useState('');
  const [peopleSearch, setPeopleSearch] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showPeople, setShowPeople] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagePaneRef = useRef(null);

  const activeConversation = conversations.find((conversation) => conversation.id === activeId) || null;
  const emailInitial = user?.email?.[0]?.toUpperCase() || 'M';

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const loadConversations = useCallback(async ({ silent = false } = {}) => {
    if (!token) return;
    if (!silent) setLoading(true);
    try {
      const data = await apiRequest('/api/messages/conversations', { token });
      const nextConversations = data.conversations || [];
      setConversations(nextConversations);
      setError('');
      setActiveId((current) => current || nextConversations[0]?.id || '');
    } catch (requestError) {
      setError(requestError.message || 'Could not load conversations');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token]);

  const loadPeople = useCallback(async (query = '') => {
    if (!token) return;
    try {
      const suffix = query ? `?q=${encodeURIComponent(query)}` : '';
      const data = await apiRequest(`/api/messages/people${suffix}`, { token });
      setPeople(data.people || []);
    } catch (requestError) {
      setError(requestError.message || 'Could not load members');
    }
  }, [token]);

  const loadMessages = useCallback(async (conversationId, { silent = false } = {}) => {
    if (!token || !conversationId) {
      setMessages([]);
      return;
    }

    if (!silent) setMessagesLoading(true);
    try {
      const data = await apiRequest(`/api/messages/conversations/${conversationId}/messages`, { token });
      setMessages(data.messages || []);
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Could not load messages');
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadConversations();
    loadPeople();
  }, [loadConversations, loadPeople]);

  useEffect(() => {
    loadMessages(activeId);
  }, [activeId, loadMessages]);

  useEffect(() => {
    if (!activeId) return undefined;
    const timer = window.setInterval(() => {
      loadMessages(activeId, { silent: true });
      loadConversations({ silent: true });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [activeId, loadConversations, loadMessages]);

  useEffect(() => {
    const pane = messagePaneRef.current;
    if (!pane) return;
    pane.scrollTop = pane.scrollHeight;
  }, [messages, activeId]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadPeople(peopleSearch), 250);
    return () => window.clearTimeout(timer);
  }, [loadPeople, peopleSearch]);

  const filteredConversations = useMemo(() => {
    const query = conversationSearch.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) => {
      const participant = conversation.participant || {};
      return [
        participant.name,
        participant.city,
        participant.state,
        participant.category,
        participant.accountType,
        conversation.lastMessage
      ].join(' ').toLowerCase().includes(query);
    });
  }, [conversationSearch, conversations]);

  const startConversation = async (participantId) => {
    if (!token || !participantId) return;
    setError('');
    try {
      const data = await apiRequest('/api/messages/conversations', {
        method: 'POST',
        token,
        body: { participantId }
      });
      const conversation = data.conversation;
      setConversations((current) => {
        const withoutExisting = current.filter((item) => item.id !== conversation.id);
        return [conversation, ...withoutExisting];
      });
      setActiveId(conversation.id);
      setShowPeople(false);
      await loadMessages(conversation.id);
    } catch (requestError) {
      setError(requestError.message || 'Could not start conversation');
    }
  };

  const sendMessage = async () => {
    const body = messageText.trim();
    if (!token || !activeId || !body || sending) return;

    const optimisticMessage = {
      id: `pending-${Date.now()}`,
      conversation_id: activeId,
      sender_id: user?.id,
      body,
      created_at: new Date().toISOString(),
      read_at: null,
      pending: true
    };

    setMessageText('');
    setSending(true);
    setMessages((current) => [...current, optimisticMessage]);

    try {
      const data = await apiRequest(`/api/messages/conversations/${activeId}/messages`, {
        method: 'POST',
        token,
        body: { body }
      });
      setMessages((current) => current.map((message) => (
        message.id === optimisticMessage.id ? data.message : message
      )));
      await loadConversations({ silent: true });
      setError('');
    } catch (requestError) {
      setMessages((current) => current.filter((message) => message.id !== optimisticMessage.id));
      setMessageText(body);
      setError(requestError.message || 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  const onMessageKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fbff] pt-28 text-slate-950">
      <section className="mx-auto max-w-7xl px-5 pb-12 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
          <div>
            <WorkspaceSidebar />
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
            <div className="grid min-h-[720px] lg:grid-cols-[360px_1fr]">
              <section className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
                <div className="border-b border-slate-200 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">Inbox</div>
                      <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">Direct messages</h1>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
                      {emailInitial}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3">
                    <Search className="h-5 w-5 text-slate-400" />
                    <input
                      value={conversationSearch}
                      onChange={(event) => setConversationSearch(event.target.value)}
                      placeholder="Search conversations..."
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPeople((value) => !value)}
                      className="rounded-full bg-slate-950 p-2 text-white transition hover:bg-slate-800"
                      aria-label="Start new chat"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {showPeople && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                          value={peopleSearch}
                          onChange={(event) => setPeopleSearch(event.target.value)}
                          placeholder="Find creators or businesses..."
                          className="min-w-0 flex-1 bg-transparent text-xs font-bold text-slate-800 outline-none placeholder:text-slate-400"
                        />
                      </div>
                      <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                        {people.map((person) => (
                          <button
                            key={person.id}
                            type="button"
                            onClick={() => startConversation(person.id)}
                            className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-slate-50"
                          >
                            <Avatar person={person} />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-black text-slate-900">{person.name}</div>
                              <div className="truncate text-xs font-semibold text-slate-500">{person.city || person.category || 'MyIndianStartup member'}</div>
                            </div>
                            <VerseBadge type={person.accountType} />
                          </button>
                        ))}
                        {!people.length && (
                          <div className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs font-bold text-slate-500">
                            No members found.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="m-3 flex gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="max-h-[604px] overflow-y-auto p-3">
                  {loading ? (
                    <div className="flex items-center justify-center py-16 text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : filteredConversations.length ? (
                    filteredConversations.map((conversation) => {
                      const participant = conversation.participant || {};
                      const accountType = normalizeType(participant.accountType);
                      const active = conversation.id === activeId;
                      return (
                        <button
                          key={conversation.id}
                          type="button"
                          onClick={() => setActiveId(conversation.id)}
                          className={`mb-2 flex w-full gap-3 rounded-2xl border p-3 text-left transition-all ${
                            active ? toneClasses[accountType].active : 'border-transparent hover:bg-slate-50'
                          }`}
                        >
                          <Avatar person={participant} size="lg" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="truncate text-sm font-black">{participant.name || 'Member'}</div>
                              <div className="shrink-0 text-[10px] font-bold text-slate-400">{formatMessageTime(conversation.lastMessageAt)}</div>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <VerseBadge type={participant.accountType} />
                            </div>
                            <div className="mt-2 truncate text-xs font-semibold text-slate-500">
                              {conversation.lastMessage || 'No messages yet'}
                            </div>
                          </div>
                          {conversation.unread > 0 && (
                            <div className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-black text-white">
                              {conversation.unread}
                            </div>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl bg-slate-50 px-4 py-10 text-center">
                      <div className="text-sm font-black text-slate-800">No conversations yet</div>
                      <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">Use New chat to message a creator or business.</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="flex min-h-[640px] flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
                {activeConversation ? (
                  <>
                    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button type="button" className="rounded-full p-2 text-slate-500 hover:bg-slate-50 lg:hidden">
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <Avatar person={activeConversation.participant} size="lg" />
                        <div>
                          <div className="text-base font-black text-slate-950">{activeConversation.participant?.name || 'Member'}</div>
                          <div className="text-xs font-semibold text-slate-500">
                            {activeConversation.participant?.online ? 'Online now' : activeConversation.participant?.city || 'Direct chat'} · {normalizeType(activeConversation.participant?.accountType) === 'business' ? 'BusinessVerse' : 'CreatorVerse'}
                          </div>
                        </div>
                      </div>
                      <VerseBadge type={activeConversation.participant?.accountType} />
                    </header>

                    <div ref={messagePaneRef} className="flex-1 space-y-4 overflow-y-auto p-5">
                      <div className="mx-auto w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">
                        Direct collaboration conversation
                      </div>

                      {messagesLoading ? (
                        <div className="flex justify-center py-16 text-slate-400">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : messages.length ? (
                        messages.map((message) => {
                          const fromMe = message.sender_id === user?.id;
                          return (
                            <div key={message.id} className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[78%] rounded-[1.35rem] px-4 py-3 text-sm font-semibold leading-6 shadow-sm ${
                                fromMe
                                  ? 'rounded-br-md bg-slate-700 text-white'
                                  : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                              } ${message.pending ? 'opacity-70' : ''}`}>
                                <div className="whitespace-pre-wrap break-words">{message.body}</div>
                                <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] font-bold ${fromMe ? 'text-white/60' : 'text-slate-400'}`}>
                                  <span>{formatMessageTime(message.created_at)}</span>
                                  {fromMe && <CheckCheck className="h-3.5 w-3.5" />}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-5 py-10 text-center text-sm font-bold text-slate-500">
                          Say hello and start the collaboration.
                        </div>
                      )}
                    </div>

                    <footer className="border-t border-slate-200 bg-white p-4">
                      <div className="flex items-end gap-3">
                        <textarea
                          rows={1}
                          value={messageText}
                          onChange={(event) => setMessageText(event.target.value)}
                          onKeyDown={onMessageKeyDown}
                          placeholder="Write a message..."
                          className="max-h-28 min-h-[48px] flex-1 resize-none rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        />
                        <button
                          type="button"
                          onClick={sendMessage}
                          disabled={!messageText.trim() || sending}
                          className="rounded-full bg-slate-700 p-3 text-white shadow-[0_12px_24px_rgba(71,85,105,0.16)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Send message"
                        >
                          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        </button>
                      </div>
                    </footer>
                  </>
                ) : (
                  <EmptyChat onStart={() => setShowPeople(true)} />
                )}
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Messages;
