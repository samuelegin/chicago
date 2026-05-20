import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserProfileService, PostService } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from 'next-themes';
import { Loader2, Copy, Check, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import PostCard from '@/components/feed/PostCard';
import StakingPanel from '@/components/staking/StakingPanel';
import CISDisplay from '@/components/shared/CISDisplay';
import StakingBadge from '@/components/shared/StakingBadge';
import RankBadge from '@/components/shared/RankBadge';
import { truncateWallet, getRankFromScore } from '@/lib/constants';
import { toast } from 'sonner';

function Avatar({ name, avatar, size = 80 }) {
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

function StatCol({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-sm font-semibold text-foreground">{value}</span>
      <span className="text-xs text-neutral-500">{label}</span>
    </div>
  );
}

export default function Profile() {
  const [profile,        setProfile]        = useState(null);
  const [copied,         setCopied]         = useState(false);
  const [activeTab,      setActiveTab]      = useState('posts');
  const [avatarOffset,   setAvatarOffset]   = useState(0);
  const [dragStartX,     setDragStartX]     = useState(null);
  const [dragBaseOffset, setDragBaseOffset] = useState(0);
  const [isMobile,       setIsMobile]       = useState(false);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

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

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 768);
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  const handleAvatarPointerDown = (event) => {
    if (!isMobile) return;
    setDragStartX(event.clientX);
    setDragBaseOffset(avatarOffset);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleAvatarPointerMove = (event) => {
    if (!isMobile || dragStartX === null) return;
    const delta = event.clientX - dragStartX;
    setAvatarOffset(Math.max(-40, Math.min(40, dragBaseOffset + delta)));
  };

  const handleAvatarPointerUp = () => {
    setDragStartX(null);
  };

  const { data: userPosts = [] } = useQuery({
    queryKey: ['userPosts', profile?.user_id],
    queryFn:  () => PostService.filter({ author_id: profile.user_id }, '-created_date', 20),
    enabled:  !!profile?.user_id,
  });

  const handleCopy = () => {
    if (!profile?.wallet_address) return;
    navigator.clipboard.writeText(profile.wallet_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!profile) return (
    <div className="flex justify-center py-24">
      <Loader2 className="w-5 h-5 animate-spin text-neutral-300" />
    </div>
  );

  const rank = profile.rank || getRankFromScore(profile.cis_score || 0);

  const TABS = [
    { value: 'posts',   label: 'Posts'   },
    { value: 'staking', label: 'Staking', show: isOwnProfile },
  ].filter(t => t.show !== false);

  return (
    <div className="max-w-[720px] mx-auto px-4 py-6 space-y-6">

      {/* Profile card */}
      <div className="relative overflow-hidden rounded-[28px] border border-border/70 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute -left-16 bottom-10 h-36 w-36 rounded-full bg-violet-200/20 blur-3xl" />

        {/* Top row: avatar + stats */}
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <div
              className="story-ring overflow-hidden rounded-full border border-border/70 bg-white p-1 shadow-sm touch-pan-y"
              style={{
                transform: `translateX(${avatarOffset}px)`,
                transition: dragStartX === null ? 'transform 0.25s ease-out' : 'none',
                cursor: isMobile ? 'grab' : 'default',
              }}
              onPointerDown={handleAvatarPointerDown}
              onPointerMove={handleAvatarPointerMove}
              onPointerUp={handleAvatarPointerUp}
              onPointerCancel={handleAvatarPointerUp}
            >
              <div className="story-ring-inner">
                <Avatar name={profile.username} avatar={profile.avatar_url} size={80} />
              </div>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500 md:hidden">Drag the avatar left or right</p>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 mb-3">
              <p className="text-base font-semibold truncate text-center sm:text-left">{profile.username}</p>
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                {!isOwnProfile ? (
                  <button className="text-xs font-semibold bg-primary text-white rounded-md px-4 py-1.5 whitespace-nowrap">
                    Follow
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white/80 rounded-3xl border border-border/70 p-4 shadow-inner">
              <StatCol value={(profile.posts_count || 0).toLocaleString()}     label="posts"     />
              <StatCol value={(profile.followers_count || 0).toLocaleString()} label="followers" />
              <StatCol value={(profile.following_count || 0).toLocaleString()} label="following" />
              <StatCol value={(profile.clt_staked || 0).toLocaleString()}     label="CLT staked" />
              <StatCol value={(profile.daily_streak || 0) + 'd'}                 label="streak"   />
            </div>
          </div>
        </div>

        {/* Bio / display area */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {rank !== 'bronze' && <RankBadge rank={rank} size="xs" />}
            <StakingBadge amount={profile.clt_staked || 0} />
          </div>
          {profile.bio && <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>}
          {profile.wallet_address && (
            <button onClick={handleCopy} className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/90 px-4 py-2 text-xs font-medium text-neutral-600 shadow-sm transition hover:bg-slate-100">
              <span className="font-mono">{truncateWallet(profile.wallet_address)}</span>
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* CIS progress */}
        <div className="pt-4 border-t border-border/70">
          <CISDisplay score={profile.cis_score || 0} />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/90 border border-border/70 rounded-[28px] overflow-hidden shadow-sm">
        <div className="flex gap-2 p-3 bg-slate-50">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setActiveTab(t.value)}
              className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === t.value
                  ? 'bg-foreground text-white shadow-sm'
                  : 'text-neutral-500 hover:bg-white hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'posts' && (
          <div>
            {userPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm font-semibold">No posts yet</p>
                <p className="text-xs text-neutral-400 mt-1">Share something with the community</p>
              </div>
            ) : (
              <div className="space-y-4 px-3 py-4">
                {userPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    authorProfile={profile}
                    currentUserId={profile.user_id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'staking' && isOwnProfile && (
          <div className="p-4">
            <StakingPanel profile={profile} onStakeUpdate={() => setProfile(p => ({ ...p }))} />
          </div>
        )}
      </div>
    </div>
  );
}
