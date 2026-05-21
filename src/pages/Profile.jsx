import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserProfileService, PostService } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from 'next-themes';
import { Loader2, Sun, Moon } from 'lucide-react';
import PostCard from '@/components/feed/PostCard';
import StakingPanel from '@/components/staking/StakingPanel';
import { getRankFromScore, RANKS } from '@/lib/constants';

// ─── Design tokens from stitch ────────────────────────────────────────────────
// Fonts: Sora (headlines), Geist (body), JetBrains Mono (labels/meta)
// Colors: Electric Gold (#e9c400 / #ffe16d), Cyber Cyan (#00dbe9 / #7df4ff)
// Surfaces: glass-panel = backdrop-blur-12px + rgba(255,255,255,0.03) + 1px border
// ─────────────────────────────────────────────────────────────────────────────

const TIER_CONFIG = {
  og:      { label: 'CHICAGO OG', color: '#c084fc', glow: 'rgba(192,132,252,0.3)' },
  diamond: { label: 'DIAMOND',    color: '#22d3ee', glow: 'rgba(34,211,238,0.3)'  },
  gold:    { label: 'PLATINUM',   color: '#e9c400', glow: 'rgba(233,196,0,0.3)'   },
  silver:  { label: 'GOLD',       color: '#fbbf24', glow: 'rgba(251,191,36,0.3)'  },
  bronze:  { label: 'BRONZE',     color: '#d97706', glow: 'rgba(217,119,6,0.3)'   },
};

function getStakingBoostLabel(clt) {
  if (clt >= 1000) return '+50% BOOST';
  if (clt >= 500)  return '+25% BOOST';
  if (clt >= 100)  return '+10% BOOST';
  return null;
}

function formatK(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

// ── Avatar with gold gradient ring ───────────────────────────────────────────
function Avatar({ name, avatar, size = 128 }) {
  return (
    <div
      className="rounded-full p-[3px] shrink-0"
      style={{
        background:  'linear-gradient(135deg, #e9c400, #7df4ff, #ffe16d)',
        boxShadow:   '0 0 30px rgba(233,196,0,0.25)',
        width: size + 6, height: size + 6,
      }}
    >
      <div className="rounded-full overflow-hidden flex items-center justify-center bg-[#050505]"
           style={{ width: size, height: size }}>
        {avatar
          ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
          : <span style={{ fontSize: size * 0.36, fontWeight: 800, color: '#e9c400',
                           fontFamily: 'Sora, sans-serif' }}>
              {(name || '?')[0].toUpperCase()}
            </span>
        }
      </div>
    </div>
  );
}

// ── CIS liquid progress bar ───────────────────────────────────────────────────
function CISCard({ score, rank }) {
  const safeRank = RANKS[rank] ? rank : 'bronze';          // guard undefined rank
  const cfg      = RANKS[safeRank];
  const rankKeys = Object.keys(RANKS);
  const idx      = rankKeys.indexOf(safeRank);
  const next     = idx < rankKeys.length - 1 ? RANKS[rankKeys[idx + 1]] : null;
  const pct      = next && next.minScore > cfg.minScore
    ? Math.min(((score - cfg.minScore) / (next.minScore - cfg.minScore)) * 100, 100)
    : 100;

  return (
    <section
      className="rounded-2xl p-6 mb-8 relative overflow-hidden group"
      style={{
        background:    'rgba(255,255,255,0.03)',
        backdropFilter:'blur(12px)',
        border:        '1px solid rgba(255,255,255,0.08)',
        borderTop:     '1px solid rgba(233,196,0,0.15)',
      }}
    >
      {/* Hover shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e9c400]/5 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex justify-between items-end mb-4">
        <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                     fontWeight: 500, letterSpacing: '0.1em', color: '#d0c6ab',
                     textTransform: 'uppercase' }}>
          Influence Score
        </h2>
        <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 24,
                       fontWeight: 700, color: '#ffe16d' }}>
          {score.toLocaleString()}
        </span>
      </div>

      {/* Liquid progress bar */}
      <div className="h-3 rounded-full overflow-hidden mb-3 relative"
           style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full relative overflow-hidden"
             style={{
               width: `${pct}%`,
               background: 'linear-gradient(90deg, #e9c400, #ffe16d)',
               boxShadow:  '0 0 15px rgba(255,225,109,0.4)',
               transition: 'width 0.8s ease',
             }}>
          {/* Liquid shimmer wave */}
          <div className="absolute inset-0"
               style={{
                 background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                 animation:  'wave 2s infinite linear',
               }} />
        </div>
      </div>

      <div className="flex justify-between items-center"
           style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                    fontWeight: 500, color: '#999077' }}>
        <span style={{ color: '#e9c400', fontWeight: 700 }}>
          {TIER_CONFIG[safeRank]?.label || safeRank.toUpperCase()}
        </span>
        {next && <span>{next.label.toUpperCase()} — {next.minScore.toLocaleString()}</span>}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Profile() {
  const [profile,   setProfile]   = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const { user }                  = useAuth();
  const { theme, setTheme }       = useTheme();

  const pathParts    = window.location.pathname.split('/');
  const viewUserId   = pathParts[2] || null;
  const isOwnProfile = !viewUserId;

  useEffect(() => {
    const load = async () => {
      const uid = viewUserId || user?.id;
      if (!uid) return;
      const profiles = await UserProfileService.getByUserId(uid);
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      } else if (!viewUserId && user) {
        const p = await UserProfileService.create({
          user_id:  user.id,
          username: user.full_name || user.email?.split('@')[0] || 'User',
        });
        setProfile(p);
      }
    };
    load();
  }, [viewUserId, user]);

  const { data: userPosts = [] } = useQuery({
    queryKey: ['userPosts', profile?.user_id],
    queryFn:  () => PostService.filter({ author_id: profile.user_id }, '-created_date', 20),
    enabled:  !!profile?.user_id,
  });

  if (!profile) return (
    <div className="flex justify-center py-24">
      <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#e9c400' }} />
    </div>
  );

  const rank      = profile.rank || getRankFromScore(profile.cis_score || 0);
  const tierCfg   = TIER_CONFIG[rank] || TIER_CONFIG.bronze;
  const boostLbl  = getStakingBoostLabel(profile.clt_staked || 0);

  const TABS = [
    { value: 'posts',   label: `Posts (${userPosts.length})` },
    { value: 'staking', label: 'Staking', ownOnly: true },
  ].filter(t => !t.ownOnly || isOwnProfile);

  return (
    <>
      {/* ── Stitch design system fonts + wave animation ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes wave {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%);  }
        }
        .profile-glass {
          background:     rgba(255,255,255,0.03);
          backdrop-filter: blur(12px);
          border:         1px solid rgba(255,255,255,0.08);
        }
        .active-tab-glow {
          box-shadow: 0 0 15px rgba(233,196,0,0.4);
        }
      `}</style>

      {/* ── Page background — void black + mesh gradient (from stitch) ── */}
      <div className="min-h-screen"
           style={{
             background: `
               radial-gradient(at 0% 0%, rgba(87,0,201,0.12) 0px, transparent 50%),
               radial-gradient(at 100% 100%, rgba(0,222,233,0.08) 0px, transparent 50%),
               #050505
             `,
           }}>

        <div className="max-w-[480px] mx-auto px-4 pt-6 pb-32">

          {/* ── Dark mode toggle — top right ─────────────────────────────── */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg transition-all"
              style={{
                background:  'rgba(255,255,255,0.05)',
                border:      '1px solid rgba(255,255,255,0.1)',
                color:       '#d0c6ab',
              }}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* ── Profile section ────────────────────────────────────────────
              Matches stitch layout exactly:
              - Centered avatar with gold/cyan gradient ring
              - Display name (Sora bold)
              - @username (JetBrains Mono)
              - Tier chip + Boost chip (glass pills)
              - Edit Profile / Follow button (glass)
          ─────────────────────────────────────────────────────────────── */}
          <section className="flex flex-col items-center mb-8">

            {/* Avatar ring */}
            <div className="relative mb-6">
              <Avatar name={profile.username} avatar={profile.avatar_url} size={112} />
              {/* Verified dot */}
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full border-2"
                   style={{ background: '#00dbe9', borderColor: '#050505',
                            boxShadow: '0 0 12px rgba(0,222,233,0.5)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            {/* Name */}
            <h1 className="mb-1"
                style={{ fontFamily: 'Sora, sans-serif', fontSize: 28,
                         fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {profile.display_name || profile.username}
            </h1>

            {/* @handle */}
            <p className="mb-4"
               style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
                        fontWeight: 500, color: '#d0c6ab' }}>
              @{profile.username}
            </p>

            {/* Tier + Boost chips */}
            <div className="flex gap-2 mb-6">
              <span className="px-3 py-1 rounded-full profile-glass"
                    style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                             fontWeight: 500, letterSpacing: '0.08em',
                             color: tierCfg.color,
                             border: `1px solid ${tierCfg.color}33`,
                             boxShadow: `0 0 12px ${tierCfg.glow}` }}>
                {tierCfg.label}
              </span>
              {boostLbl && (
                <span className="px-3 py-1 rounded-full profile-glass"
                      style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                               fontWeight: 500, letterSpacing: '0.08em',
                               color: '#00dbe9', border: '1px solid rgba(0,222,233,0.2)' }}>
                  {boostLbl}
                </span>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-center mb-5 max-w-xs"
                 style={{ fontFamily: 'Geist, system-ui, sans-serif', fontSize: 14,
                          color: '#d0c6ab', lineHeight: 1.6 }}>
                {profile.bio}
              </p>
            )}

            {/* CTA button */}
            {isOwnProfile ? (
              <button className="w-full py-3 rounded-xl transition-all active:scale-95 profile-glass"
                      style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
                               fontWeight: 700, color: '#ffffff', letterSpacing: '0.05em',
                               boxShadow: '0 0 20px rgba(255,225,109,0.05)' }}>
                Edit Profile
              </button>
            ) : (
              <button className="w-full py-3 rounded-xl transition-all active:scale-95"
                      style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
                               fontWeight: 700, color: '#000',
                               background:  'linear-gradient(135deg, #e9c400, #ffe16d)',
                               boxShadow:   '0 0 20px rgba(233,196,0,0.35)' }}>
                Follow
              </button>
            )}
          </section>

          {/* ── Stats row — matches stitch border-y layout ── */}
          <section className="flex items-center justify-between mb-8 py-6"
                   style={{ borderTop: '1px solid rgba(255,255,255,0.06)',
                            borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { value: formatK(profile.posts_count     || 0), label: 'POSTS'     },
              { value: formatK(profile.followers_count || 0), label: 'FOLLOWERS' },
              { value: formatK(profile.following_count || 0), label: 'FOLLOWING' },
              { value: formatK(profile.clt_staked      || 0), label: 'CLT',
                color: '#00dbe9' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <div className="text-center flex-1">
                  <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22,
                                fontWeight: 700, color: s.color || '#ffffff' }}>
                    {s.value}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                                fontWeight: 500, letterSpacing: '0.1em', color: '#999077',
                                marginTop: 2 }}>
                    {s.label}
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.08)' }} />
                )}
              </React.Fragment>
            ))}
          </section>

          {/* ── CIS Influence Score card ── */}
          <CISCard score={profile.cis_score || 0} rank={rank} />

          {/* ── Tab bar — stitch underline + glow style ── */}
          <nav className="flex mb-6"
               style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {TABS.map(t => (
              <button
                key={t.value}
                onClick={() => setActiveTab(t.value)}
                className="flex-1 py-4 text-center relative transition-all"
                style={{
                  fontFamily:    'JetBrains Mono, monospace',
                  fontSize:       13,
                  fontWeight:     500,
                  letterSpacing: '0.04em',
                  color:   activeTab === t.value ? '#e9c400' : 'rgba(208,198,171,0.5)',
                  borderBottom: activeTab === t.value
                    ? '2px solid #e9c400' : '2px solid transparent',
                }}
              >
                {t.label}
                {/* Glow blur under active tab */}
                {activeTab === t.value && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1"
                       style={{ background: '#e9c400', filter: 'blur(3px)', opacity: 0.7 }} />
                )}
              </button>
            ))}
          </nav>

          {/* ── Posts tab ── */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {userPosts.length === 0 ? (
                <div className="text-center py-16 profile-glass rounded-2xl">
                  <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600,
                              color: '#e5e2e1' }}>
                    No posts yet
                  </p>
                  <p style={{ fontFamily: 'Geist, system-ui, sans-serif', fontSize: 13,
                              color: '#999077', marginTop: 6 }}>
                    Share something with the community
                  </p>
                </div>
              ) : (
                userPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    authorProfile={profile}
                    currentUserId={profile.user_id}
                  />
                ))
              )}
            </div>
          )}

          {/* ── Staking tab ── */}
          {activeTab === 'staking' && isOwnProfile && (
            <StakingPanel
              profile={profile}
              onStakeUpdate={() => setProfile(p => ({ ...p }))}
            />
          )}

        </div>
      </div>
    </>
  );
}
