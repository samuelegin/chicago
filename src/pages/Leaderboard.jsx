import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserProfileService } from '@/api/services';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import RankBadge from '@/components/shared/RankBadge';
import { useAuth } from '@/lib/AuthContext';

const TABS = [
  { value: 'influence', label: 'Influence', sort: '-cis_score'     },
  { value: 'creators',  label: 'Creators',  sort: '-posts_count'   },
  { value: 'stakers',   label: 'Stakers',   sort: '-clt_staked'    },
  { value: 'rising',    label: 'Rising',    sort: '-weekly_points' },
];

function Avatar({ name, avatar, size = 40 }) {
  return (
    <div className="rounded-full bg-neutral-200 overflow-hidden shrink-0 flex items-center justify-center"
         style={{ width: size, height: size }}>
      {avatar
        ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
        : <span className="font-semibold text-neutral-400 select-none" style={{ fontSize: size * 0.36 }}>
            {(name || '?')[0].toUpperCase()}
          </span>
      }
    </div>
  );
}

export default function Leaderboard() {
  const [tab, setTab] = useState('influence');
  const current = TABS.find(t => t.value === tab);
  const { user } = useAuth();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['leaderboard', tab],
    queryFn:  () => UserProfileService.list(current.sort, 50),
  });

  return (
    <div className="max-w-[600px] mx-auto px-3 lg:px-4 py-6 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-violet-50 border border-border rounded-3xl px-5 py-5 shadow-sm">
        <h1 className="text-base font-semibold tracking-wide text-foreground">Leaderboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Top members by influence, activity, and staking</p>
      </div>

      {/* Tab bar */}
      <div className="bg-white border border-border rounded-sm overflow-hidden">
        <div className="flex border-b border-border">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                tab === t.value
                  ? 'text-foreground border-b-2 border-foreground -mb-px'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-neutral-300" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-sm text-neutral-400">No data yet</div>
        ) : (
          <div className="space-y-4">
            {/* Top 3 highlighted */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end px-1">
              {[users[1], users[0], users[2]].filter(Boolean).map((u, idx) => {
                const isTop = idx === 1;
                const isSecond = idx === 0;
                const isThird = idx === 2;
                return (
                  <Link
                    key={u.id}
                    to={`/profile/${u.user_id}`}
                    className={`flex flex-col items-center text-center rounded-3xl p-3 sm:p-4 transition-all ${
                      isTop
                        ? 'col-span-1 bg-gradient-to-br from-amber-100 via-white to-amber-50 border-2 border-amber-200 shadow-[0_12px_32px_rgba(251,191,36,0.12)] sm:shadow-[0_24px_60px_rgba(251,191,36,0.18)] scale-100 sm:scale-[1.04]'
                        : 'bg-white border border-border shadow-sm'
                    } ${isSecond ? 'translate-y-2 sm:translate-y-4' : ''} ${isThird ? 'translate-y-4 sm:translate-y-7' : ''}`}
                  >
                    <span className={`text-xs font-semibold tracking-[0.12em] uppercase ${isTop ? 'text-amber-500' : 'text-neutral-400'}`}>
                      #{isTop ? 1 : idx === 0 ? 2 : 3}
                    </span>
                    <Avatar name={u.username} avatar={u.avatar_url} size={isTop ? 72 : 58} />
                    <p className={`text-sm font-semibold truncate mt-3 ${isTop ? 'text-foreground' : 'text-neutral-900'}`}>
                      {u.username}
                    </p>
                    <div className={`text-[12px] mt-2 ${isTop ? 'text-neutral-600' : 'text-neutral-500'}`}>
                      {(u.cis_score || 0).toLocaleString()} influence
                    </div>
                    <div className={`text-[12px] mt-1 ${isTop ? 'text-neutral-600' : 'text-neutral-500'}`}>
                      {(u.clt_staked || 0).toLocaleString()} CLT · {(u.daily_streak || 0)}d
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Positions 4 - 10 */}
            <div className="mt-6 sm:mt-3 bg-white border border-border rounded-sm divide-y divide-border">
              {users.slice(3, 10).map((u, i) => (
                <Link
                  key={u.id}
                  to={`/profile/${u.user_id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                >
                  <span className="text-xs font-semibold text-neutral-400 w-5 text-center shrink-0">{i + 4}</span>
                  <Avatar name={u.username} avatar={u.avatar_url} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate">{u.username}</p>
                      {u.rank && u.rank !== 'bronze' && <RankBadge rank={u.rank} size="xs" />}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {u.cis_score?.toLocaleString()} influence
                      {u.clt_staked > 0 && ` · ${u.clt_staked?.toLocaleString()} CLT`}
                      {u.daily_streak > 0 && ` · ${u.daily_streak}d`}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground shrink-0">
                    {(u.cis_score || 0).toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>

            {/* Current user position */}
            {user && (
              (() => {
                const idx = users.findIndex(x => x.user_id === user.id);
                if (idx === -1) return null;
                const u = users[idx];
                return (
                  <div className="bg-white border border-border rounded-sm px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-neutral-400 w-6 text-center">#{idx + 1}</span>
                      <Avatar name={u.username} avatar={u.avatar_url} size={36} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{u.username} (you)</p>
                        <p className="text-[11px] text-neutral-400">{(u.cis_score || 0).toLocaleString()} influence · {(u.clt_staked || 0).toLocaleString()} CLT</p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-foreground">#{idx + 1}</div>
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>
    </div>
  );
}
