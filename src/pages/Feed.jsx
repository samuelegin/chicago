import React, { useState, useEffect } from 'react';
import { UserProfileService, PostService } from '@/api/services';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CreatePost from '@/components/feed/CreatePost';
import PostCard from '@/components/feed/PostCard';
import FeedFilters from '@/components/feed/FeedFilters';
import WhoToFollow from '@/components/feed/StoriesRow';
import RightSidebar from '@/components/feed/RightSidebar';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-28 rounded bg-muted" />
          <div className="h-2.5 w-20 rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 rounded bg-muted w-full" />
        <div className="h-3 rounded bg-muted w-4/5" />
        <div className="h-3 rounded bg-muted w-3/5" />
      </div>
      <div className="flex gap-4 pt-1">
        <div className="h-3 w-10 rounded bg-muted" />
        <div className="h-3 w-10 rounded bg-muted" />
        <div className="h-3 w-10 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function Feed() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy,         setSortBy]         = useState('recent');
  const [userProfile,    setUserProfile]    = useState(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const profiles = await UserProfileService.getByUserId(user.id);
      if (profiles.length > 0) {
        setUserProfile(profiles[0]);
      } else {
        const p = await UserProfileService.create({
          user_id:  user.id,
          username: user.full_name || user.email?.split('@')[0] || 'User',
        });
        setUserProfile(p);
      }
    })();
  }, [user]);

  const { data: posts   = [], isLoading } = useQuery({
    queryKey: ['posts', activeCategory, sortBy],
    queryFn: () => {
      const filter = activeCategory !== 'all' ? { category: activeCategory } : {};
      const sort   = sortBy === 'trending' ? '-likes_count' : '-created_date';
      return PostService.filter(filter, sort, 30);
    },
  });

  const { data: topUsers = [] } = useQuery({
    queryKey: ['topUsers'],
    queryFn:  () => UserProfileService.list('-cis_score', 10),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn:  () => UserProfileService.list('-cis_score', 100),
  });

  const profileMap = {};
  profiles.forEach(p => { profileMap[p.user_id] = p; });

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Centered feed column ── */}
      <div className="flex-1 flex justify-center px-2 sm:px-3 lg:px-4 py-5 overflow-y-auto overflow-x-hidden">
        <div className="w-full max-w-[1080px] space-y-3">
          <WhoToFollow users={topUsers} />

          <CreatePost
            userProfile={userProfile}
            onPostCreated={() => queryClient.invalidateQueries({ queryKey: ['posts'] })}
          />

          <FeedFilters
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {isLoading ? (
            /* Skeleton grid — 1 col mobile, 2 col desktop */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-card border border-border rounded-xl py-14 text-center">
              <p className="text-sm font-semibold">No posts yet</p>
              <p className="text-xs text-muted-foreground mt-1">Be the first to post</p>
            </div>
          ) : (
            /* Posts grid — 1 col on mobile, 2 col on desktop (md+) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <PostCard
                    post={post}
                    authorProfile={profileMap[post.author_id]}
                    currentUserId={userProfile?.user_id}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right sidebar (desktop only) ── */}
      <div className="hidden lg:block">
        <RightSidebar topUsers={topUsers} currentUser={userProfile} />
      </div>
    </div>
  );
}
