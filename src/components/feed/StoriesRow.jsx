import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const RANK_RING = {
  bronze:  'from-amber-600 to-amber-400',
  silver:  'from-neutral-400 to-neutral-300',
  gold:    'from-yellow-500 to-amber-300',
  diamond: 'from-sky-500 to-cyan-300',
  og:      'from-purple-600 to-violet-400',
};

export default function WhoToFollow({ users = [] }) {
  if (users.length === 0) return null;

  return (
    <div className="bg-white border border-border rounded-xl px-4 py-3.5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <p className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase mb-3">Who to Follow</p>
      <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {users.slice(0, 8).map((user) => {
          const ring = RANK_RING[user.rank];
          return (
            <div key={user.id} className="flex flex-col items-center gap-2 shrink-0 w-[68px]">
              <Link to={`/profile/${user.user_id}`} className="relative">
                {ring ? (
                  <div className={`rounded-full bg-gradient-to-br ${ring} p-[2px] shadow-sm`}>
                    <div className="rounded-full bg-white p-[2px]">
                      <div className="w-11 h-11 rounded-full bg-neutral-100 overflow-hidden flex items-center justify-center">
                        {user.avatar_url
                          ? <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                          : <span className="text-sm font-bold text-neutral-400">{(user.username || '?')[0].toUpperCase()}</span>
                        }
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-full bg-neutral-100 border border-border overflow-hidden flex items-center justify-center">
                    {user.avatar_url
                      ? <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                      : <span className="text-sm font-bold text-neutral-400">{(user.username || '?')[0].toUpperCase()}</span>
                    }
                  </div>
                )}
              </Link>
              <p className="text-[11px] text-foreground font-medium text-center leading-tight w-full truncate">{user.username}</p>
              <button className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 border border-amber-300 rounded-full px-2 py-0.5 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all">
                <UserPlus className="w-2.5 h-2.5" /> Follow
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
