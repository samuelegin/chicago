import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Share2, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CommentService, LikeService, PostService } from '@/api/services';
import { toast } from 'sonner';

const RANK_META = {
  bronze:  { gradient: 'from-amber-600 to-amber-400',    glow: 'shadow-amber-200',   label: 'Bronze'  },
  silver:  { gradient: 'from-neutral-400 to-neutral-300', glow: 'shadow-neutral-200', label: 'Silver'  },
  gold:    { gradient: 'from-yellow-500 to-amber-300',    glow: 'shadow-yellow-200',  label: 'Gold'    },
  diamond: { gradient: 'from-sky-500 to-cyan-300',        glow: 'shadow-sky-200',     label: 'Diamond' },
  og:      { gradient: 'from-purple-600 to-violet-400',   glow: 'shadow-purple-200',  label: 'OG'      },
};

function Avatar({ name, avatar, rank, size = 40 }) {
  const meta = rank ? RANK_META[rank] : null;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {meta ? (
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${meta.gradient} shadow-md p-[2px]`}>
          <div className="w-full h-full rounded-full bg-white p-[2px]">
            <div className="w-full h-full rounded-full bg-neutral-100 overflow-hidden flex items-center justify-center">
              {avatar
                ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
                : <span className="font-bold text-neutral-500 select-none" style={{ fontSize: size * 0.38 }}>
                    {(name || '?')[0].toUpperCase()}
                  </span>
              }
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full rounded-full bg-neutral-100 overflow-hidden flex items-center justify-center border border-border">
          {avatar
            ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
            : <span className="font-bold text-neutral-400 select-none" style={{ fontSize: size * 0.38 }}>
                {(name || '?')[0].toUpperCase()}
              </span>
          }
        </div>
      )}
    </div>
  );
}

function RankPill({ rank }) {
  const meta = RANK_META[rank];
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide text-white bg-gradient-to-r ${meta.gradient}`}>
      {meta.label}
    </span>
  );
}

export default function PostCard({ post, authorProfile, currentUserId }) {
  const [liked,        setLiked]        = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [localLikes,   setLocalLikes]   = useState(post.likes_count || 0);
  const [burst,        setBurst]        = useState(false);
  const [showComments, setShowComments] = useState(false);

  const { data: comments = [] } = useQuery({
    queryKey: ['postComments', post.id],
    queryFn:  () => CommentService.getByPost(post.id),
    enabled: showComments && !!post.id,
    staleTime: 1000 * 60 * 5,
  });

  const rank = authorProfile?.rank;
  // make trending banner show on all posts (intentionally unprofessional)
  const isTrending = true;

  const like = async () => {
    if (liked) return;
    setLiked(true);
    setLocalLikes(n => n + 1);
    setBurst(true);
    setTimeout(() => setBurst(false), 700);
    await LikeService.create({ post_id: post.id, user_id: currentUserId });
    await PostService.update(post.id, { likes_count: localLikes + 1 });
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${post.author_name || 'Chicago'} post`,
          text: post.content ? post.content.slice(0, 120) : 'Check out this post on Chicago.',
          url: postUrl,
        });
        toast.success('Share dialog opened');
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(postUrl);
        toast.success('Post link copied to clipboard!');
        return;
      }

      toast.error('Sharing not supported in this browser.');
    } catch (err) {
      toast.error('Unable to share or copy link');
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative bg-white border border-border rounded-xl overflow-visible"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s ease' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
    >
      {/* Trending banner */}
      {isTrending && (
        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100">
          <TrendingUp className="w-3 h-3 text-amber-500" strokeWidth={2.5} />
          <span className="text-[11px] font-bold text-amber-600 tracking-wide uppercase">TRENDIN TA</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5">
        <Link to={`/profile/${post.author_id}`} className="flex items-center gap-3 min-w-0">
          <Avatar name={post.author_name} avatar={post.author_avatar} rank={rank} size={40} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-[14px] font-bold leading-tight text-foreground">
                {post.author_name || 'Anonymous'}
              </p>
              {rank && <RankPill rank={rank} />}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {post.category && (
                <span className="text-[11px] text-neutral-400 capitalize">{post.category}</span>
              )}
              <span className="text-[11px] text-neutral-300">·</span>
              <span className="text-[11px] text-neutral-400">
                {formatDistanceToNow(new Date(post.created_date || Date.now()), { addSuffix: true })}
              </span>
            </div>
          </div>
        </Link>
        <button className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors ml-2 shrink-0">
          <MoreHorizontal className="w-4 h-4 text-neutral-400" strokeWidth={2} />
        </button>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-[14px] leading-relaxed text-foreground">{post.content}</p>
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <div className="relative" onDoubleClick={like}>
          <img src={post.image_url} alt="" className="w-full object-cover" style={{ maxHeight: 480 }} />
          <AnimatePresence>
            {burst && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="w-24 h-24 fill-white text-white drop-shadow-lg" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Poll */}
      {post.post_type === 'poll' && post.poll_options && (
        <div className="px-4 pb-3 space-y-2">
          {post.poll_options.map((opt, i) => {
            const total = post.poll_options.reduce((s, o) => s + (o.votes || 0), 0);
            const pct   = total > 0 ? Math.round(((opt.votes || 0) / total) * 100) : 0;
            return (
              <div key={i} className="relative border border-border rounded-lg overflow-hidden cursor-pointer hover:border-amber-300 transition-colors">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-50 to-yellow-50"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
                <div className="relative flex justify-between px-3 py-2.5 text-sm">
                  <span className="font-medium">{opt.text}</span>
                  <span className="text-amber-600 font-bold">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Divider */}
      <div className="mx-4 border-t border-neutral-50" />

      {/* Action bar */}
      <div className="px-3 py-2 flex items-center gap-1">
        {/* Like */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={like}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors group"
        >
          <motion.div animate={liked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart
              strokeWidth={liked ? 0 : 1.8}
              className={`w-5 h-5 transition-all ${liked ? 'fill-red-500 text-red-500' : 'text-neutral-400 group-hover:text-red-400'}`}
            />
          </motion.div>
          {localLikes > 0 && (
            <span className={`text-[12px] font-semibold ${liked ? 'text-red-500' : 'text-neutral-400'}`}>
              {localLikes.toLocaleString()}
            </span>
          )}
        </motion.button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(prev => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
            showComments ? 'bg-blue-50 text-blue-600' : 'hover:bg-blue-50 text-neutral-600'
          }`}
        >
          <MessageCircle strokeWidth={1.8} className="w-5 h-5" />
          {post.comments_count > 0 && (
            <span className="text-[12px] font-semibold">{post.comments_count}</span>
          )}
        </button>

        {/* Share — pushed right */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleShare}
          aria-label="Share post"
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-green-50 transition-colors group"
        >
          <Share2 strokeWidth={1.8} className="w-5 h-5 text-neutral-400 group-hover:text-green-400" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div className="fixed inset-0 z-40">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => setShowComments(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 29 }}
              className="absolute inset-x-0 bottom-0 top-16 rounded-t-3xl border border-border bg-white shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-white">
                <button
                  onClick={() => setShowComments(false)}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-semibold text-neutral-700 hover:bg-neutral-200"
                >
                  Back
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">Comments</p>
                  <p className="text-[11px] text-neutral-500 truncate">{post.comments_count} total</p>
                </div>
              </div>
              <div className="h-[calc(100vh-6.5rem)] overflow-y-auto divide-y divide-border bg-white">
                {comments.length === 0 ? (
                  <div className="px-4 py-5 text-sm text-neutral-500">No comments yet.</div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="px-4 py-4">
                      <p className="text-[13px] leading-snug">
                        <span className="font-semibold text-foreground">{comment.author_name}</span>{' '}
                        <span className="text-neutral-600">{comment.content}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
