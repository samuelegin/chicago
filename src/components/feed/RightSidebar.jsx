import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Zap } from 'lucide-react';

const RANK_RING = {
  bronze:  'from-amber-600 to-amber-400',
  silver:  'from-neutral-400 to-neutral-300',
  gold:    'from-yellow-500 to-amber-300',
  diamond: 'from-sky-500 to-cyan-300',
  og:      'from-purple-600 to-violet-400',
};

const RANK_LABEL = {
  bronze: 'Bronze', silver: 'Silver', gold: 'Gold', diamond: 'Diamond', og: 'OG',
};

function Avatar({ name, avatar, size = 32, rank }) {
  const ring = rank ? RANK_RING[rank] : null;
  if (ring) {
    return (
      <div className={`rounded-full bg-gradient-to-br ${ring} p-[2px] shrink-0`} style={{ width: size + 4, height: size + 4 }}>
        <div className="rounded-full bg-card p-[1.5px] w-full h-full">
          <div className="rounded-full bg-muted overflow-hidden flex items-center justify-center w-full h-full">
            {avatar
              ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
              : <span className="font-bold text-muted-foreground select-none" style={{ fontSize: size * 0.38 }}>{(name || '?')[0].toUpperCase()}</span>
            }
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-full bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center"
         style={{ width: size, height: size }}>
      {avatar
        ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
        : <span className="font-bold text-muted-foreground select-none" style={{ fontSize: size * 0.38 }}>{(name || '?')[0].toUpperCase()}</span>
      }
    </div>
  );
}

const MEDAL = ['🥇', '🥈', '🥉'];

export default function RightSidebar({ topUsers = [], currentUser }) {
  return (
    <aside className="hidden xl:flex flex-col w-[260px] shrink-0 h-screen overflow-y-auto py-6 px-4 gap-5 sticky top-0">

      {/* Suggestions */}
      <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">Suggested</p>
          <Link to="/leaderboard" className="text-[11px] font-bold text-amber-600 hover:text-amber-700 transition-colors">
            See All
          </Link>
        </div>
        <div className="space-y-3">
          {topUsers.slice(0, 4).map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-2">
              <Link to={`/profile/${user.user_id}`} className="flex items-center gap-2.5 min-w-0">
                <Avatar name={user.username} avatar={user.avatar_url} size={34} rank={user.rank} />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold leading-tight truncate">{user.username}</p>
                  {user.rank && (
                    <p className="text-[11px] text-muted-foreground leading-tight">{RANK_LABEL[user.rank] || user.rank}</p>
                  )}
                </div>
              </Link>
              <button className="text-[11px] font-bold text-amber-600 border border-amber-300 rounded-full px-2.5 py-0.5 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shrink-0">
                Follow
              </button>
            </div>
          ))}
          {topUsers.length === 0 && (
            <p className="text-xs text-muted-foreground">No suggestions yet</p>
          )}
        </div>
      </div>

      {/* Top Influence leaderboard */}
      {topUsers.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.2} />
              <p className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">Top Influence</p>
            </div>
            <Link to="/leaderboard" className="text-[11px] font-bold text-amber-600 hover:text-amber-700 transition-colors">
              Full list
            </Link>
          </div>
          <div className="space-y-3">
            {topUsers.slice(0, 5).map((user, i) => (
              <Link
                key={user.id}
                to={`/profile/${user.user_id}`}
                className="flex items-center gap-2.5 group"
              >
                <span className="text-base w-5 text-center shrink-0 leading-none">
                  {MEDAL[i] || <span className="text-[11px] font-bold text-muted-foreground">{i + 1}</span>}
                </span>
                <Avatar name={user.username} avatar={user.avatar_url} size={28} rank={user.rank} />
                <p className="text-[12px] font-semibold flex-1 truncate group-hover:text-amber-600 transition-colors">
                  {user.username}
                </p>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Zap className="w-3 h-3 text-amber-400" strokeWidth={2} />
                  <p className="text-[11px] font-bold text-muted-foreground">
                    {(user.cis_score || 0).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground/50 text-center px-2">
        Chicago Social · Influence Network
      </p>
    </aside>
  );
}
