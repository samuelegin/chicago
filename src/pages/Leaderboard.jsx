import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserProfileService } from '@/api/services';
import { Link } from 'react-router-dom';
import RankBadge from '@/components/shared/RankBadge';
import { useAuth } from '@/lib/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// TAB CONFIG
// Illustration files live in /public/ — filenames are intentional so you can
// swap them by just replacing the PNG. The variable name below maps 1-to-1:
//
//   illustration-influence-crown.png  →  Influence tab  (crown character)
//   illustration-creators-pen.png     →  Creators  tab  (pen character)
//   illustration-stakers-coins.png    →  Stakers   tab  (coins character)
//   illustration-rising-rocket.png    →  Rising    tab  (rocket character)
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  {
    value:       'influence',
    label:       'Influence',
    sort:        '-cis_score',
    metric:      u => `${(u.cis_score   || 0).toLocaleString()} CIS`,
    subMetric:   u => `${(u.clt_staked  || 0).toLocaleString()} CLT earned`,
    illustration:'/illustration-influence-crown.png',
    accent:      '#a855f7',
    auraColor:   'rgba(168,85,247,',   // used for radial gradient
    badge:       'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    orbs: [
      { color:'rgba(168,85,247,0.18)',  size:160, top:'4%',  left:'-8%',  delay:0    },
      { color:'rgba(139,92,246,0.10)',  size: 96, top:'38%', left:'84%',  delay:0.5  },
      { color:'rgba(217,70,239,0.12)',  size: 64, top:'14%', left:'70%',  delay:1.1  },
      { color:'rgba(168,85,247,0.07)',  size: 48, top:'60%', left:'10%',  delay:0.8  },
    ],
  },
  {
    value:       'creators',
    label:       'Creators',
    sort:        '-posts_count',
    metric:      u => `${(u.posts_count || 0).toLocaleString()} posts`,
    subMetric:   u => `${(u.clt_staked  || 0).toLocaleString()} CLT earned`,
    illustration:'/illustration-creators-pen.png',
    accent:      '#f59e0b',
    auraColor:   'rgba(245,158,11,',
    badge:       'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    orbs: [
      { color:'rgba(245,158,11,0.18)',  size:144, top:'6%',  left:'-6%',  delay:0    },
      { color:'rgba(251,146,60,0.10)',  size: 88, top:'42%', left:'86%',  delay:0.6  },
      { color:'rgba(250,204,21,0.12)',  size: 56, top:'18%', left:'73%',  delay:1.2  },
      { color:'rgba(245,158,11,0.07)',  size: 44, top:'65%', left:'8%',   delay:0.9  },
    ],
  },
  {
    value:       'stakers',
    label:       'Stakers',
    sort:        '-clt_staked',
    metric:      u => `${(u.clt_staked  || 0).toLocaleString()} CLT`,
    subMetric:   u => `${(u.cis_score   || 0).toLocaleString()} CIS score`,
    illustration:'/illustration-stakers-coins.png',
    accent:      '#06b6d4',
    auraColor:   'rgba(6,182,212,',
    badge:       'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    orbs: [
      { color:'rgba(6,182,212,0.18)',   size:176, top:'3%',  left:'-10%', delay:0    },
      { color:'rgba(20,184,166,0.10)',  size: 88, top:'40%', left:'87%',  delay:0.5  },
      { color:'rgba(52,211,153,0.12)',  size: 60, top:'16%', left:'72%',  delay:1.0  },
      { color:'rgba(6,182,212,0.07)',   size: 44, top:'62%', left:'12%',  delay:0.7  },
    ],
  },
  {
    value:       'rising',
    label:       'Rising',
    sort:        '-daily_streak',
    metric:      u => `${(u.daily_streak|| 0)}d streak`,
    subMetric:   u => `${(u.clt_staked  || 0).toLocaleString()} CLT earned`,
    illustration:'/illustration-rising-rocket.png',
    accent:      '#10b981',
    auraColor:   'rgba(16,185,129,',
    badge:       'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    orbs: [
      { color:'rgba(16,185,129,0.18)',  size:160, top:'5%',  left:'-8%',  delay:0    },
      { color:'rgba(52,211,153,0.10)',  size: 88, top:'43%', left:'86%',  delay:0.6  },
      { color:'rgba(163,230,53,0.12)',  size: 58, top:'20%', left:'74%',  delay:1.1  },
      { color:'rgba(16,185,129,0.07)',  size: 44, top:'63%', left:'10%',  delay:0.8  },
    ],
  },
];

// ─── tiny helpers ─────────────────────────────────────────────────────────────
function Avatar({ name, avatar, size = 40, accent = '#f59e0b' }) {
  return (
    <div
      className="rounded-full overflow-hidden shrink-0 flex items-center justify-center"
      style={{ width: size, height: size, background: '#1a1f35' }}
    >
      {avatar
        ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
        : <span style={{ fontSize: size * 0.38, fontWeight: 800, color: accent }}>
            {(name || '?')[0].toUpperCase()}
          </span>
      }
    </div>
  );
}

function RankCircle({ rank, accent, size = 28 }) {
  const isTop = rank <= 3;
  return (
    <div
      className="rounded-full flex items-center justify-center font-black shrink-0"
      style={{
        width: size, height: size,
        background: isTop
          ? `radial-gradient(circle at 40% 40%, ${accent}ff, ${accent}aa)`
          : 'rgba(255,255,255,0.06)',
        color:      isTop ? '#08090f' : '#64748b',
        fontSize:   size * 0.38,
        boxShadow:  isTop ? `0 0 14px ${accent}55` : 'none',
      }}
    >
      {rank}
    </div>
  );
}

// ─── Hero section with illustration ──────────────────────────────────────────
function HeroPodium({ users, tabConfig, isLoading }) {
  const [visible, setVisible] = useState(true);
  const [curTab,  setCurTab]  = useState(tabConfig.value);

  useEffect(() => {
    if (curTab !== tabConfig.value) {
      setVisible(false);
      const t = setTimeout(() => { setVisible(true); setCurTab(tabConfig.value); }, 220);
      return () => clearTimeout(t);
    }
  }, [tabConfig.value]);

  const winner = users[0];

  return (
    // leaderboard-hero keeps background dark even in light mode (see index.css)
    <div className="leaderboard-hero relative rounded-3xl overflow-hidden"
         style={{ minHeight: 320 }}>

      {/* ── Floating decorative orbs ── */}
      {tabConfig.orbs.map((o, i) => (
        <div key={i} className="absolute rounded-full blur-3xl pointer-events-none"
          style={{
            width: o.size, height: o.size,
            top: o.top, left: o.left,
            background: o.color,
            animation: `float-orb ${3.5 + i * 0.6}s ease-in-out infinite alternate`,
            animationDelay: `${o.delay}s`,
          }}
        />
      ))}

      {/* ── Radial aura glow centred behind illustration ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 65% 55% at 50% 28%, ${tabConfig.auraColor}0.28) 0%, transparent 70%)`,
        transition: 'background 0.4s ease',
      }} />

      {/* ── Illustration image ──────────────────────────────────────────────
          SOURCE: /public/illustration-{tab}.png
          To swap: replace the PNG in /public with the same filename.
          mixBlendMode:'lighten' removes the black background automatically.
      ─────────────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
           style={{
             width: 220, height: 260,
             opacity: visible ? 1 : 0,
             transform: `translateX(-50%) scale(${visible ? 1 : 0.94})`,
             transition: 'opacity 0.25s ease, transform 0.25s ease',
             filter: `drop-shadow(0 0 36px ${tabConfig.accent}77)`,
           }}>
        <img src={tabConfig.illustration}
             alt={tabConfig.label}
             className="w-full h-full object-contain"
             style={{ mixBlendMode: 'lighten' }} />
      </div>

      {/* ── Winner details ── */}
      <div className="absolute bottom-0 left-0 right-0 pb-6 flex flex-col items-center gap-2"
           style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.3s ease 0.1s' }}>
        {isLoading
          ? (
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                 style={{ borderColor: `${tabConfig.accent}40`, borderTopColor: tabConfig.accent }} />
          ) : winner ? (
            <>
              <p className="text-white font-black text-xl tracking-tight"
                 style={{ textShadow: `0 0 24px ${tabConfig.accent}88` }}>
                {winner.username}
              </p>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${tabConfig.badge}`}
                      style={{ boxShadow: `0 0 18px ${tabConfig.accent}44` }}>
                  {tabConfig.metric(winner)}
                </span>
                <span className="text-xs text-slate-400">{tabConfig.subMetric(winner)}</span>
              </div>
            </>
          ) : null
        }
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Leaderboard() {
  const [tab, setTab]     = useState('influence');
  const tabConfig         = TABS.find(t => t.value === tab);
  const { user }          = useAuth();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['leaderboard', tab],
    queryFn:  () => UserProfileService.list(tabConfig.sort, 50),
  });

  const top10   = users.slice(0, 10);
  const myIndex = user ? users.findIndex(u => u.user_id === user.id) : -1;
  const myEntry = myIndex !== -1 ? users[myIndex] : null;

  return (
    <div className="max-w-[600px] mx-auto px-3 lg:px-4 py-6 space-y-3">

      {/* ── Header ── */}
      <div className="px-1">
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Leaderboard 🏆
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Top members by influence, activity &amp; staking
        </p>
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex gap-1 p-1 rounded-2xl"
           style={{ background:'rgba(255,255,255,0.04)', backdropFilter:'blur(8px)',
                    border:'1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200"
            style={tab === t.value
              ? { background: t.accent, color: '#08090f',
                  boxShadow: `0 4px 18px ${t.accent}55` }
              : { color: '#64748b' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Illustration hero ── */}
      <HeroPodium users={users} tabConfig={tabConfig} isLoading={isLoading} />

      {/* ── Top 10 rows ── */}
      {!isLoading && top10.length > 0 && (
        // leaderboard-rows class allows light-mode CSS override in index.css
        <div className="leaderboard-rows rounded-3xl overflow-hidden"
             style={{ background:'rgba(255,255,255,0.03)',
                      border:'1px solid rgba(255,255,255,0.06)' }}>

          {/* Column header */}
          <div className="flex items-center gap-3 px-4 py-2 border-b"
               style={{ borderColor:'rgba(255,255,255,0.05)' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 w-7">#</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 flex-1">Member</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 text-right pr-1">Influence</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 w-20 text-right">CLT</span>
          </div>

          {top10.map((u, i) => {
            const rank    = i + 1;
            const isFirst = rank === 1;
            return (
              <Link
                key={u.id}
                to={`/profile/${u.user_id}`}
                className="flex items-center gap-3 px-4 py-3.5 group transition-colors"
                style={{
                  borderBottom: i < top10.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  animationDelay: `${i * 35}ms`,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Rank */}
                <RankCircle rank={rank} accent={tabConfig.accent} size={26} />

                {/* Avatar with glow ring for #1 */}
                <div className="rounded-full shrink-0 p-[2px]"
                     style={isFirst
                       ? { background: `linear-gradient(135deg, ${tabConfig.accent}, ${tabConfig.accent}66)`,
                           boxShadow:   `0 0 18px ${tabConfig.accent}44` }
                       : { background: 'rgba(255,255,255,0.07)' }}>
                  <Avatar name={u.username} avatar={u.avatar_url} size={36} accent={tabConfig.accent} />
                </div>

                {/* Name + rank badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold truncate text-slate-200 group-hover:text-white transition-colors">
                      {u.username}
                    </p>
                    {u.rank && u.rank !== 'bronze' && <RankBadge rank={u.rank} size="xs" />}
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: '#475569' }}>
                    @{u.username}
                  </p>
                </div>

                {/* Influence score */}
                <div className="text-right w-20 shrink-0">
                  <p className="text-sm font-black font-mono"
                     style={{ color: isFirst ? tabConfig.accent : '#94a3b8' }}>
                    {(u.cis_score || 0).toLocaleString()}
                  </p>
                  <p className="text-[10px]" style={{ color: '#334155' }}>
                    {(u.clt_staked || 0).toLocaleString()} CLT
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Current user position ── */}
      {myEntry && (
        <div className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
             style={{
               background:  `linear-gradient(135deg, ${tabConfig.accent}18 0%, ${tabConfig.accent}06 100%)`,
               border:      `1px solid ${tabConfig.accent}35`,
               boxShadow:   `0 4px 28px ${tabConfig.accent}18`,
             }}>
          <RankCircle rank={myIndex + 1} accent={tabConfig.accent} size={30} />
          <div className="rounded-full p-[2px] shrink-0"
               style={{ background: `linear-gradient(135deg, ${tabConfig.accent}, ${tabConfig.accent}77)` }}>
            <Avatar name={myEntry.username} avatar={myEntry.avatar_url} size={38} accent={tabConfig.accent} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">
              {myEntry.username}{' '}
              <span className="text-xs font-normal text-slate-500">(you)</span>
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>
              {(myEntry.cis_score  || 0).toLocaleString()} influence
              {' · '}
              {(myEntry.clt_staked || 0).toLocaleString()} CLT
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-semibold text-slate-500">Your rank</p>
            <p className="text-xl font-black" style={{ color: tabConfig.accent }}>
              #{myIndex + 1}
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && users.length === 0 && (
        <div className="text-center py-16 text-sm text-muted-foreground">
          No data yet for this category
        </div>
      )}

    </div>
  );
}
