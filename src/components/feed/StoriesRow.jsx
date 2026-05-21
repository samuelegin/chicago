import React from 'react';
import { Link } from 'react-router-dom';

const RANK_RING = {
  bronze:  { gradient: 'from-amber-600 to-amber-400',    glow: 'rgba(217,119,6,0.5)'  },
  silver:  { gradient: 'from-neutral-400 to-neutral-300', glow: 'rgba(163,163,163,0.4)' },
  gold:    { gradient: 'from-yellow-400 to-amber-300',    glow: 'rgba(255,215,0,0.6)'  },
  diamond: { gradient: 'from-cyan-400 to-sky-300',        glow: 'rgba(0,238,252,0.6)'  },
  og:      { gradient: 'from-purple-500 to-violet-400',   glow: 'rgba(139,92,246,0.6)' },
};

export default function WhoToFollow({ users = [] }) {
  if (users.length === 0) return null;

  return (
    <div>
      <p
        className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4 opacity-60"
        style={{ color: '#d0c6ab', fontFamily: 'JetBrains Mono, monospace' }}
      >
        Who to Follow
      </p>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
        {users.slice(0, 8).map((user) => {
          const ring = RANK_RING[user.rank];
          return (
            <div
              key={user.id}
              className="glass-card flex flex-col items-center gap-3 shrink-0 rounded-xl cursor-pointer group transition-all"
              style={{ minWidth: 110, padding: '16px 12px' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,215,0,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              <Link to={`/profile/${user.user_id}`} className="relative">
                <div className="relative w-14 h-14">
                  {ring ? (
                    <div
                      className={`w-full h-full rounded-full bg-gradient-to-br ${ring.gradient} p-[2px] transition-all`}
                      style={{ boxShadow: `0 0 12px ${ring.glow}` }}
                    >
                      <div className="w-full h-full rounded-full p-[1.5px]" style={{ background: '#050505' }}>
                        <div className="w-full h-full rounded-full overflow-hidden" style={{ background: '#0e0e0e' }}>
                          {user.avatar_url
                            ? <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                            : <span
                                className="w-full h-full flex items-center justify-center text-sm font-bold"
                                style={{ color: '#999077', fontFamily: 'Sora, sans-serif' }}
                              >
                                {(user.username || '?')[0].toUpperCase()}
                              </span>
                          }
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="w-full h-full rounded-full overflow-hidden flex items-center justify-center transition-all group-hover:border-[#ffd700]/40"
                      style={{ background: '#0e0e0e', border: '2px solid rgba(255,255,255,0.08)' }}
                    >
                      {user.avatar_url
                        ? <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                        : <span
                            className="text-sm font-bold"
                            style={{ color: '#999077', fontFamily: 'Sora, sans-serif' }}
                          >
                            {(user.username || '?')[0].toUpperCase()}
                          </span>
                      }
                    </div>
                  )}
                  {/* Online dot */}
                  <div
                    className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full"
                    style={{
                      background: '#22c55e',
                      border: '2px solid #050505',
                      boxShadow: '0 0 6px rgba(34,197,94,0.6)',
                    }}
                  />
                </div>
              </Link>

              <p
                className="text-[11px] font-bold text-center leading-tight w-full truncate text-white"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {user.username}
              </p>

              <button
                className="w-full py-1.5 rounded-lg text-[11px] font-bold transition-all"
                style={{
                  border: '1px solid rgba(255,215,0,0.3)',
                  color: '#ffd700',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#ffd700';
                  e.currentTarget.style.color = '#000';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(255,215,0,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#ffd700';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Follow
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
