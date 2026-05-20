import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { UserProfileService, PostService } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from 'next-themes';
import { Loader2, Camera, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import PostCard from '@/components/feed/PostCard';
import StakingPanel from '@/components/staking/StakingPanel';
import CISDisplay from '@/components/shared/CISDisplay';
import StakingBadge from '@/components/shared/StakingBadge';
import RankBadge from '@/components/shared/RankBadge';
import { getRankFromScore } from '@/lib/constants';
import { toast } from 'sonner';

function Avatar({ name, avatar, size = 80, onClick, editable = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-full bg-muted overflow-hidden shrink-0 flex items-center justify-center focus:outline-none"
      style={{ width: size, height: size }}
    >
      {avatar
        ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
        : <span className="font-semibold text-muted-foreground select-none" style={{ fontSize: size * 0.36 }}>
            {(name || '?')[0].toUpperCase()}
          </span>
      }
      {editable && (
        <span className="pointer-events-none absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/90 text-white shadow-lg">
          <Camera className="w-4 h-4" />
        </span>
      )}
    </button>
  );
}

function StatCol({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-sm font-semibold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default function Profile() {
  const [profile,          setProfile]          = useState(null);
  const [editMode,         setEditMode]         = useState(false);
  const [draftUsername,    setDraftUsername]    = useState('');
  const [draftBio,         setDraftBio]         = useState('');
  const [draftAvatarUrl,   setDraftAvatarUrl]   = useState('');
  const [activeTab,        setActiveTab]        = useState('posts');
  const [avatarOffset,     setAvatarOffset]     = useState(0);
  const [dragStartX,       setDragStartX]       = useState(null);
  const [dragBaseOffset,   setDragBaseOffset]   = useState(0);
  const [isMobile,         setIsMobile]         = useState(false);
  const avatarFileInputRef = useRef(null);
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
    if (!profile) return;
    setDraftUsername(profile.username || '');
    setDraftBio(profile.bio || '');
    setDraftAvatarUrl(profile.avatar_url || '');
  }, [profile]);

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

  const profileUpdateMutation = useMutation({
    mutationFn: (data) => UserProfileService.update(profile.id, data),
    onSuccess: (updatedProfile) => {
      setProfile(updatedProfile);
      setEditMode(false);
      toast.success('Profile updated');
    },
    onError: () => toast.error('Unable to save profile'),
  });

  const readAvatarFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleAvatarSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readAvatarFile(file);
      setDraftAvatarUrl(dataUrl);
    } catch {
      toast.error('Unable to load image');
    }
  };

  const handleSaveProfile = () => {
    if (!profile) return;
    profileUpdateMutation.mutate({
      username: draftUsername.trim() || profile.username,
      bio:      draftBio,
      avatar_url: draftAvatarUrl,
    });
  };

  if (!profile) return (
    <div className="flex justify-center py-24">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
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
      <div className="relative overflow-hidden rounded-[28px] border border-border/70 bg-gradient-to-br from-primary/5 via-card to-primary/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute -left-16 bottom-10 h-36 w-36 rounded-full bg-violet-200/20 blur-3xl" />
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="absolute right-4 top-4 z-10 rounded-full border border-border bg-card p-2 text-foreground shadow-sm hover:bg-secondary transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Top row: avatar + stats */}
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <div
              className="story-ring overflow-hidden rounded-full border border-border/70 bg-card p-1 shadow-sm touch-pan-y"
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
                <Avatar
                  name={profile.username}
                  avatar={draftAvatarUrl || profile.avatar_url}
                  size={80}
                  editable={isOwnProfile}
                  onClick={() => isOwnProfile && setEditMode(true)}
                />
              </div>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground md:hidden">Drag the avatar left or right</p>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 mb-3">
              <div className="min-w-0 text-center sm:text-left">
                <p className="text-base font-semibold truncate">{profile.username}</p>
                {isOwnProfile && !editMode && (
                  <p className="text-[11px] text-muted-foreground">Tap avatar to edit profile</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                {!isOwnProfile ? (
                  <button className="text-xs font-semibold bg-primary text-white rounded-md px-4 py-1.5 whitespace-nowrap">
                    Follow
                  </button>
                ) : null}
                {isOwnProfile && !editMode && (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="text-xs font-semibold rounded-md border border-border px-4 py-1.5 text-foreground hover:bg-muted transition"
                  >
                    Edit profile
                  </button>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-card/80 rounded-3xl border border-border/70 p-4 shadow-inner">
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
          {editMode ? (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-muted-foreground uppercase">Display name</label>
              <input
                type="text"
                value={draftUsername}
                onChange={e => setDraftUsername(e.target.value)}
                className="w-full rounded-3xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <label className="block text-xs font-semibold text-muted-foreground uppercase">Bio</label>
              <textarea
                value={draftBio}
                onChange={e => setDraftBio(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-3xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <input
                ref={avatarFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelect}
              />
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Profile photo</span>
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-3xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground hover:bg-muted transition"
                >
                  <Camera className="w-4 h-4" />
                  Change photo
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={profileUpdateMutation.isLoading}
                  className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition disabled:opacity-50"
                >
                  Save profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setDraftUsername(profile.username || '');
                    setDraftBio(profile.bio || '');
                    setDraftAvatarUrl(profile.avatar_url || '');
                  }}
                  className="rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {profile.bio && <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>}
              {profile.wallet_address && (
                <div className="font-mono text-xs text-muted-foreground">{profile.wallet_address}</div>
              )}
            </>
          )}
        </div>

        {/* CIS progress */}
        <div className="pt-4 border-t border-border/70">
          <CISDisplay score={profile.cis_score || 0} />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card/90 border border-border/70 rounded-[28px] overflow-hidden shadow-sm">
        <div className="flex gap-2 p-3 bg-muted/50">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setActiveTab(t.value)}
              className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === t.value
                  ? 'bg-foreground text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
                <p className="text-xs text-muted-foreground mt-1">Share something with the community</p>
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
