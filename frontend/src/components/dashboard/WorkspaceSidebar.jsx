import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, MessageCircle, Settings, UserRound, Zap, Clock3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const workspaceItems = [
  { label: 'PostVerse', to: '/post-verse', icon: Zap },
  { label: 'Messages', to: '/messages', icon: MessageCircle },
  { label: 'Profile', to: '/profile-verse', icon: UserRound },
  { label: 'Settings', to: '/settings', icon: Settings }
];

const WorkspaceSidebar = () => {
  const location = useLocation();
  const { member } = useAuth();
  const isCreator = member?.account_type === 'creator';
  const title = isCreator ? 'Creator Dashboard' : 'Business Dashboard';
  const subtitle = isCreator ? 'CreatorVerse activated' : 'BusinessVerse activated';

  return (
    <aside className="sticky top-28 h-fit rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <div>
          <div className="text-sm font-black text-slate-800">{title}</div>
          <div className="text-xs font-semibold text-slate-500">{subtitle}</div>
        </div>
      </div>

      <div className={`mx-2 mt-3 rounded-2xl px-4 py-3 ring-1 ${isCreator ? 'bg-blue-50 text-blue-700 ring-blue-100' : 'bg-orange-50 text-orange-700 ring-orange-100'}`}>
        <div className="text-[10px] font-black uppercase tracking-[0.22em]">
          {isCreator ? 'Creator account' : 'Business account'}
        </div>
        <div className="mt-1 text-xs font-semibold text-slate-500">
          {isCreator ? 'Creator discovery workspace' : 'Business visibility workspace'}
        </div>
      </div>

      <nav className="mt-4 grid gap-2">
        {workspaceItems.map(({ label, to, icon: Icon }) => {
          const active = location.pathname === to || (label === 'PostVerse' && location.pathname === '/dashboard');

          return (
            <Link
              key={label}
              to={to}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                active
                  ? 'border border-slate-200 bg-slate-100 text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-4 mx-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Next reset</div>
        <div className="mt-2 flex items-center gap-2 text-sm font-black text-slate-800">
          <Clock3 className="h-4 w-4 text-slate-500" />
          <span>18h 42m</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">Your next daily post slot opens after the 24-hour cycle.</p>
      </div>
    </aside>
  );
};

export default WorkspaceSidebar;
