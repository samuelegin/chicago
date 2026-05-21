import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserProfileService } from '@/api/services';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// TAB CONFIG
// Illustration files in /public/ — rename to swap:
//   illustration-influence-crown.png
//   illustration-creators-pen.png
//   illustration-stakers-coins.png
//   illustration-rising-rocket.png
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  {
    value:     'influence',
    label:     'Influence',
    sort:      '-cis_score',
    metric:    u => (u.cis_score   || 0).toLocaleString(),
    metricLbl: 'CIS',
    sub:       u => (u.clt_staked  || 0).toLocaleString(),
    subLbl:    'CLT',
    illustration: '/illustration-influence-crown.png',
    accent:    '#a855f7',
  },
  {
    value:     'creators',
    label:     'Creators',
    sort:      '-posts_count',
    metric:    u => (u.posts_count || 0).toLocaleString(),
    metricLbl: 'Posts',
    sub:       u => (u.clt_staked  || 0).toLocaleString(),
    subLbl:    'CLT',
    illustration: '/illustration-creators-pen.png',
    accent:    '#f59e0b',
  },
  {
    value:     'stakers',
    label:     'Stakers',
    sort:      '-clt_staked',
    metric:    u => (u.clt_staked  || 0).toLocaleString(),
    metricLbl: 'CLT',
    sub:       u => (u.cis_score   || 0).toLocaleString(),
    subLbl:    'CIS',
    illustration: '/illustration-stakers-coins.png',
    accent:    '#06b6d4',
  },
  {
    value:     'rising',
    label:     'Rising',
    sort:      '-daily_streak',
    metric:    u => `${(u.daily_streak || 0)}d`,
    metricLbl: 'Streak',
    sub:       u => (u.clt_staked  || 0).toLocaleString(),
    subLbl:    'CLT',
    illustration: '/illustration-rising-rocket.png',
    accent:    '#10b981',
  },
];

// Rank tier label + color from cis_score
function getTier(u) {
  const score = u.cis_score || 0;
  if (score >= 50000) return { label: 'Chicago OG', color: '#c084fc' };
  if (score >= 10000) return { label: 'Diamond',    color: '#22d3ee' };
  if (score >=  5000) return { label: 'Platinum',   color: '#a855f7' };
  if (score >=  1000) return { label: 'Gold',       color: '#fbbf24' };
  if (score >=   500) return { label: 'Silver',     color: '#94a3b8' };
  return                      { label: 'Bronze',    color: '#d97706' };
}

function Avatar({ name, avatar, size = 40, accent = '#f59e0b' }) {
  return (
    <div className="rounded-full overflow-hidden shrink-0 flex items-center justify-center"
         style={{ width: size, height: size, background: '#1e293b' }}>
      {avatar
        ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
        : <span style={{ fontSize: size * 0.38, fontWeight: 800, color: accent }}>
            {(name || '?')[0].toUpperCase()}
          </span>
      }
    </div>
  );
}

// ── Expandable row card (positions 2-10) ──────────────────────────────────────
function LeaderRow({ u, rank, tabConfig, isSecond }) {
  const [open, setOpen] = useState(false);
  const tier = getTier(u);

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-200"
         style={{ background: isSecond ? '#ffffff' : '#1a1a1a' }}>

      {/* Main row — click to expand */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        onClick={() => setOpen(o => !o)}
      >
        {/* Avatar */}
        <Avatar name={u.username} avatar={u.avatar_url} size={42} accent={tabConfig.accent} />

        {/* Name + tier */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold truncate leading-tight ${isSecond ? 'text-gray-900' : 'text-white'}`}>
            {u.username}
          </p>
          {/* Tier badge under username */}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block"
                style={{ background: `${tier.color}22`, color: tier.color, border: `1px solid ${tier.color}44` }}>
            {tier.label}
          </span>
        </div>

        {/* Rank circle on the right */}
        <div className="rounded-full flex items-center justify-center font-black text-xs shrink-0"
             style={{ width: 28, height: 28, background: tabConfig.accent,
                      color: '#000', boxShadow: `0 0 10px ${tabConfig.accent}55` }}>
          {rank}
        </div>
      </button>

      {/* ── Dropdown: CIS + CLT side by side ── */}
      {open && (
        <div className="px-4 pb-3.5 pt-0 flex gap-3"
             style={{ borderTop: isSecond ? '1px solid #e5e7eb' : '1px solid #2a2a2a' }}>
          <div className="flex-1 rounded-xl px-3 py-2.5 text-center"
               style={{ background: isSecond ? '#f3f4f6' : '#111111' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider"
               style={{ color: isSecond ? '#6b7280' : '#475569' }}>CIS Score</p>
            <p className="text-base font-black mt-0.5"
               style={{ color: tabConfig.accent }}>
              {(u.cis_score || 0).toLocaleString()}
            </p>
          </div>
          <div className="flex-1 rounded-xl px-3 py-2.5 text-center"
               style={{ background: isSecond ? '#f3f4f6' : '#111111' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider"
               style={{ color: isSecond ? '#6b7280' : '#475569' }}>CLT Earned</p>
            <p className="text-base font-black mt-0.5"
               style={{ color: tabConfig.accent }}>
              {(u.clt_staked || 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Leaderboard() {
  const [tab, setTab]     = useState('influence');
  const [fade, setFade]   = useState(true);
  const [curTab, setCurTab] = useState('influence');
  const tabConfig = TABS.find(t => t.value === tab);
  const { user }  = useAuth();

  useEffect(() => {
    if (curTab !== tab) {
      setFade(false);
      const t = setTimeout(() => { setFade(true); setCurTab(tab); }, 200);
      return () => clearTimeout(t);
    }
  }, [tab]);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['leaderboard', tab],
    queryFn:  () => UserProfileService.list(tabConfig.sort, 50),
  });

  const winner  = users[0];
  const rest    = users.slice(1, 10);
  const myIndex = user ? users.findIndex(u => u.user_id === user.id) : -1;
  const myEntry = myIndex !== -1 ? users[myIndex] : null;
  const myTier  = myEntry ? getTier(myEntry) : null;

  return (
    <>
      <style>{`
        /* Use the same font as reference — bold geometric sans */
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');

        .lb-wrap * { font-family: 'Nunito', system-ui, sans-serif; }

        /* Page always dark — illustrations need black bg */
        .lb-wrap { background: #000; min-height: 100vh; }

        /* Light mode: deep navy instead of pure white so PNGs still pop */
        :root:not(.dark) .lb-wrap { background: #0a0b14; }
      `}</style>

      <div className="lb-wrap relative overflow-x-hidden">
        <div className="max-w-[480px] mx-auto px-4 pt-6 pb-32 space-y-0">

          {/* ── Title — same font weight/style as reference ── */}
          <h1 className="text-center font-black text-white mb-5"
              style={{ fontSize: 22, letterSpacing: '-0.3px' }}>
            Leaderboard 🏆
          </h1>

          {/* ── Tab switcher ── */}
          <div className="flex gap-1 p-1 rounded-2xl mb-5"
               style={{ background: 'rgba(255,255,255,0.07)' }}>
            {TABS.map(t => (
              <button key={t.value} onClick={() => setTab(t.value)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                      style={tab === t.value
                        ? { background: t.accent, color: '#000', boxShadow: `0 4px 14px ${t.accent}55` }
                        : { color: '#64748b' }}>
                {t.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                   style={{ borderColor: `${tabConfig.accent}40`, borderTopColor: tabConfig.accent }} />
            </div>
          ) : (
            <>
              {/* ── #1 WINNER HERO ────────────────────────────────────────────
                  PNG sits directly on black — no wrapper, no aura, no background.
                  mixBlendMode not used; PNG transparency is preserved naturally.
                  To swap image: update illustration path in TABS config above.
              ──────────────────────────────────────────────────────────────── */}
              {winner && (
                <div className="flex flex-col items-center mb-5"
                     style={{ opacity: fade ? 1 : 0, transform: fade ? 'scale(1)' : 'scale(0.96)',
                              transition: 'opacity 0.2s ease, transform 0.2s ease' }}>

                  {/* Illustration — no container, no effects, just the PNG */}
                  <img src={tabConfig.illustration}
                       alt={tabConfig.label}
                       className="w-44 h-44 object-contain"
                  />

                  {/* Winner username */}
                  <p className="text-white font-black mt-1"
                     style={{ fontSize: 20, letterSpacing: '-0.2px' }}>
                    {winner.username}
                  </p>

                  {/* CIS + CLT side by side — green pill like reference for winner only */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-black px-4 py-1.5 rounded-full"
                          style={{ background: '#22c55e22', color: '#4ade80',
                                   border: '1px solid #22c55e44' }}>
                      {(winner.cis_score || 0).toLocaleString()} CIS
                    </span>
                    <span className="text-sm font-bold text-slate-400">
                      {(winner.clt_staked || 0).toLocaleString()} CLT
                    </span>
                  </div>

                  {/* Tier badge */}
                  {(() => {
                    const t = getTier(winner);
                    return (
                      <span className="text-[11px] font-bold px-3 py-0.5 rounded-full mt-1.5"
                            style={{ background: `${t.color}22`, color: t.color,
                                     border: `1px solid ${t.color}44` }}>
                        {t.label}
                      </span>
                    );
                  })()}
                </div>
              )}

              {/* ── ROWS 2–10 ──────────────────────────────────────────────────
                  Each row is clickable → expands to show CIS + CLT side by side.
                  #2 = white card, #3–10 = dark #1a1a1a card.
                  Tier shown under username. No CIS/CLT visible until expanded.
              ──────────────────────────────────────────────────────────────── */}
              <div className="space-y-2">
                {rest.map((u, i) => (
                  <LeaderRow
                    key={u.id}
                    u={u}
                    rank={i + 2}
                    tabConfig={tabConfig}
                    isSecond={i === 0}
                  />
                ))}
              </div>

              {/* ── Current user position bar ── */}
              {myEntry && myIndex >= 0 && (
                <div className="mt-3 flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                     style={{ background: `${tabConfig.accent}15`,
                              border: `1px solid ${tabConfig.accent}35` }}>
                  <Avatar name={myEntry.username} avatar={myEntry.avatar_url}
                          size={40} accent={tabConfig.accent} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white leading-tight">{myEntry.username}
                      <span className="text-xs font-normal text-slate-500 ml-1">(you)</span>
                    </p>
                    {myTier && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block"
                            style={{ background: `${myTier.color}22`, color: myTier.color,
                                     border: `1px solid ${myTier.color}44` }}>
                        {myTier.label}
                      </span>
                    )}
                  </div>
                  {/* CIS + CLT side by side */}
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black" style={{ color: tabConfig.accent }}>
                      {(myEntry.cis_score || 0).toLocaleString()} CIS
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {(myEntry.clt_staked || 0).toLocaleString()} CLT
                    </p>
                  </div>
                  <div className="rounded-full flex items-center justify-center font-black text-xs shrink-0"
                       style={{ width: 30, height: 30, background: tabConfig.accent, color: '#000' }}>
                    {myIndex + 1}
                  </div>
                </div>
              )}

              {users.length === 0 && (
                <p className="text-center text-slate-500 py-16 text-sm">No data yet</p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
