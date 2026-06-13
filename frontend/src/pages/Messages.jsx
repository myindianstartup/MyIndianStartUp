import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCheck,
  Clock3,
  Image,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import WorkspaceSidebar from '@/components/dashboard/WorkspaceSidebar';

const conversations = [
  {
    id: 'aurora',
    name: 'Aurora Foods Pvt Ltd',
    role: 'BusinessVerse',
    tone: 'business',
    city: 'Ahmedabad',
    online: true,
    time: '10:42 AM',
    unread: 2,
    initials: 'AF',
    messages: [
      ['them', 'Hi, we saw your product photography work on PostVerse and want to discuss a new campaign.', '10:36 AM'],
      ['me', 'Sure. I can handle catalog shots, short reels, and launch creatives. What product category are you planning?', '10:38 AM'],
      ['them', 'Packaged snacks. We need clean images plus 2 short videos for our listing.', '10:42 AM']
    ]
  },
  {
    id: 'riya',
    name: 'Riya Sharma',
    role: 'CreatorVerse',
    tone: 'creator',
    city: 'Mumbai',
    online: false,
    time: 'Yesterday',
    unread: 0,
    initials: 'RS',
    messages: [
      ['them', 'I can send the portfolio link today.', 'Yesterday'],
      ['me', 'Great, please include rates and timeline also.', 'Yesterday']
    ]
  },
  {
    id: 'northstar',
    name: 'Northstar Digital',
    role: 'BusinessVerse',
    tone: 'business',
    city: 'Bengaluru',
    online: true,
    time: 'Mon',
    unread: 0,
    initials: 'ND',
    messages: [
      ['them', 'Let us finalize the brief after your profile update.', 'Mon'],
      ['me', 'Done. I have updated my ProfileVerse details.', 'Mon']
    ]
  },
  {
    id: 'kabir',
    name: 'Kabir Motion Studio',
    role: 'CreatorVerse',
    tone: 'creator',
    city: 'Delhi NCR',
    online: false,
    time: 'Fri',
    unread: 1,
    initials: 'KM',
    messages: [
      ['them', 'Available for animated explainers next week.', 'Fri']
    ]
  }
];

const toneClasses = {
  business: {
    badge: 'bg-orange-50 text-orange-600 ring-orange-100',
    dot: 'bg-orange-500',
    bubble: 'bg-orange-500 text-white'
  },
  creator: {
    badge: 'bg-blue-50 text-blue-600 ring-blue-100',
    dot: 'bg-blue-600',
    bubble: 'bg-blue-600 text-white'
  }
};

const Messages = () => {
  const { member, user } = useAuth();
  const [activeId, setActiveId] = useState(conversations[0].id);
  const activeChat = conversations.find((conversation) => conversation.id === activeId) || conversations[0];
  const activeTone = toneClasses[activeChat.tone];
  const emailInitial = user?.email?.[0]?.toUpperCase() || 'M';

  const filteredConversations = useMemo(() => conversations, []);

  return (
    <main className="min-h-screen bg-[#f8fbff] pt-28 text-slate-950">
      <section className="mx-auto max-w-7xl px-5 pb-12 md:px-10">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div>
            <WorkspaceSidebar title="Messages" subtitle="Direct collaboration" />
            <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                <ShieldCheck className="h-4 w-4" />
                Safe chat
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Keep deals transparent. Share briefs, timelines, and collaboration details directly.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
            <div className="grid min-h-[720px] lg:grid-cols-[360px_1fr]">
              <section className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
                <div className="border-b border-slate-200 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Inbox</div>
                      <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">Direct messages</h1>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
                      {emailInitial}
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3">
                    <Search className="h-5 w-5 text-slate-400" />
                    <input
                      placeholder="Search conversations..."
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="max-h-[604px] overflow-y-auto p-3">
                  {filteredConversations.map((conversation) => {
                    const tone = toneClasses[conversation.tone];
                    const active = conversation.id === activeId;
                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => setActiveId(conversation.id)}
                        className={`mb-2 flex w-full gap-3 rounded-2xl p-3 text-left transition-all ${
                          active ? 'border border-slate-200 bg-slate-100 text-slate-800 shadow-sm' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${active ? 'bg-white text-slate-700 ring-1 ring-slate-200' : `${tone.badge} ring-1`}`}>
                          {conversation.initials}
                          {conversation.online && <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="truncate text-sm font-black">{conversation.name}</div>
                            <div className={`shrink-0 text-[10px] font-bold ${active ? 'text-slate-500' : 'text-slate-400'}`}>{conversation.time}</div>
                          </div>
                          <div className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] ${active ? 'bg-white text-slate-500 ring-1 ring-slate-200' : tone.badge}`}>
                            {conversation.role}
                          </div>
                        </div>
                        {conversation.unread > 0 && (
                          <div className={`mt-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black text-white ${tone.dot}`}>
                            {conversation.unread}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="flex min-h-[640px] flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
                <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
                  <div className="flex items-center gap-3">
                    <button type="button" className="rounded-full p-2 text-slate-500 hover:bg-slate-50 lg:hidden">
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black ${activeTone.badge} ring-1`}>
                      {activeChat.initials}
                      {activeChat.online && <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />}
                    </div>
                    <div>
                      <div className="text-base font-black text-slate-950">{activeChat.name}</div>
                      <div className="text-xs font-semibold text-slate-500">
                        {activeChat.online ? 'Online now' : activeChat.city} · {activeChat.role}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button type="button" className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </header>

                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  <div className="mx-auto w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">
                    Today · Direct deal conversation
                  </div>
                  {activeChat.messages.map(([from, text, time], index) => (
                    <div key={`${time}-${index}`} className={`flex ${from === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[78%] rounded-[1.35rem] px-4 py-3 text-sm font-semibold leading-6 shadow-sm ${
                        from === 'me'
                          ? 'rounded-br-md bg-slate-600 text-white'
                          : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                      }`}>
                        <div>{text}</div>
                        <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] font-bold ${from === 'me' ? 'text-white/60' : 'text-slate-400'}`}>
                          <span>{time}</span>
                          {from === 'me' && <CheckCheck className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-start">
                    <div className="rounded-[1.35rem] rounded-bl-md border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                        <Image className="h-5 w-5 text-slate-400" />
                        <div>
                          <div className="text-sm font-black text-slate-800">Brief-reference.jpg</div>
                          <div className="text-xs font-semibold text-slate-500">Image attachment</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <footer className="border-t border-slate-200 bg-white p-4">
                  <div className="flex items-end gap-3">
                    <button type="button" className="rounded-full border border-slate-200 bg-white p-3 text-slate-500 hover:bg-slate-50">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <textarea
                      rows={1}
                      placeholder="Write a message..."
                      className="max-h-28 min-h-[48px] flex-1 resize-none rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                    <button type="button" className="rounded-full bg-slate-600 p-3 text-white shadow-[0_12px_24px_rgba(71,85,105,0.16)] hover:bg-slate-700">
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2 px-2 text-[11px] font-semibold text-slate-400">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>Messages are shown as UI preview data until realtime chat storage is connected.</span>
                  </div>
                </footer>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Messages;
