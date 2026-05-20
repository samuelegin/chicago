import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Share2, TrendingUp, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CommentService, LikeService, PostService } from '@/api/services';
import { Sheet, SheetContent } from '@/components/ui/sheet';
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
          <div className="w-full h-full rounded-full bg-card p-[2px]">
            <div className="w-full h-full rounded-full bg-muted overflow-hidden flex items-center justify-center">
              {avatar
                ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
                : <span className="font-bold text-muted-foreground select-none" style={{ fontSize: size * 0.38 }}>
                    {(name || '?')[0].toUpperCase()}
                  </span>
              }
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full rounded-full bg-muted overflow-hidden flex items-center justify-center border border-border">
          {avatar
            ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
            : <span className="font-bold text-muted-foreground select-none" style={{ fontSize: size * 0.38 }}>
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
  const [liked,         setLiked]         = useState(false);
  const [currentLikeId, setCurrentLikeId] = useState(null);
  const [saved,         setSaved]         = useState(false);
  const [localLikes,    setLocalLikes]    = useState(post.likes_count || 0);
  const [burst,         setBurst]         = useState(false);
  const [showComments,  setShowComments]  = useState(false);
  const [commentText,   setCommentText]   = useState('');
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['postComments', post.id],
    queryFn:  () => CommentService.getByPost(post.id),
    enabled: showComments && !!post.id,
    staleTime: 1000 * 60 * 5,
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['postLikes', post.id],
    queryFn:  () => LikeService.getByPost(post.id),
    enabled: !!post.id,
    staleTime: 1000 * 60 * 2,
    onSuccess: (likes) => {
      const currentLike = likes.find(like => like.user_id === currentUserId);
      setLiked(Boolean(currentLike));
      setCurrentLikeId(currentLike?.id || null);
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (content) =>
      CommentService.create({
        post_id:     post.id,
        author_id:   currentUserId,
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postComments', post.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setCommentText('');
      toast.success('Comment posted');
    },
    onError: () => toast.error('Failed to post comment'),
  });

  const handleAddComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    if (!currentUserId) { toast.error('Log in to comment'); return; }
    addCommentMutation.mutate(trimmed);
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const rank = authorProfile?.rank;
  // make trending banner show on all posts (intentionally unprofessional)
  const isTrending = true;

  const like = async () => {
    if (!currentUserId) {
      toast.error('Log in to like');
      return;
    }

    const currentCount = localLikes;
    const nextCount = liked ? Math.max(0, currentCount - 1) : currentCount + 1;

    setLiked(prev => !prev);
    setLocalLikes(nextCount);

    if (!liked) {
      setBurst(true);
      setTimeout(() => setBurst(false), 700);
    }

    try {
      if (liked) {
        if (!currentLikeId) throw new Error('No like record');
        await LikeService.delete(currentLikeId);
        await PostService.update(post.id, { likes_count: nextCount });
        setCurrentLikeId(null);
      } else {
        const response = await LikeService.create({ post_id: post.id, user_id: currentUserId });
        await PostService.update(post.id, { likes_count: nextCount });
        setCurrentLikeId(response?.id || null);
      }

      queryClient.invalidateQueries({ queryKey: ['postLikes', post.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (err) {
      setLiked(liked);
      setLocalLikes(currentCount);
      toast.error('Unable to update like');
    }
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
      className="relative bg-card border border-border rounded-xl overflow-visible"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s ease' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
    >
      {/* Trending banner */}
      {isTrending && (
        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500/10 to-yellow-400/10 border-b border-amber-500/20">
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
                <span className="text-[11px] text-muted-foreground capitalize">{post.category}</span>
              )}
              <span className="text-[11px] text-border">·</span>
              <span className="text-[11px] text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_date || Date.now()), { addSuffix: true })}
              </span>
            </div>
          </div>
        </Link>
        <button className="p-1.5 rounded-full hover:bg-muted transition-colors ml-2 shrink-0">
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
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
      <div className="mx-4 border-t border-border" />

      {/* Action bar */}
      <div className="px-3 py-2 flex items-center gap-1">
        {/* Like */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={like}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors group"
        >
          <motion.div animate={liked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart
              strokeWidth={liked ? 0 : 1.8}
              className={`w-5 h-5 transition-all ${liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground group-hover:text-red-400'}`}
            />
          </motion.div>
          {localLikes > 0 && (
            <span className={`text-[12px] font-semibold ${liked ? 'text-red-500' : 'text-muted-foreground'}`}>
              {localLikes.toLocaleString()}
            </span>
          )}
        </motion.button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(prev => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
            showComments ? 'bg-blue-500/10 text-blue-500' : 'hover:bg-blue-500/10 text-muted-foreground'
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
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-green-500/10 transition-colors group"
        >
          <Share2 strokeWidth={1.8} className="w-5 h-5 text-muted-foreground group-hover:text-green-400" />
        </motion.button>
      </div>

      <Sheet open={showComments} onOpenChange={setShowComments}>
        <SheetContent side="bottom" className="h-[min(85vh,calc(100vh-3.5rem))] rounded-t-3xl p-0 overflow-hidden bg-card shadow-2xl">
          <div className="flex h-full flex-col">
            <div className="flex flex-col gap-3 border-b border-border px-4 py-3 bg-card">
              <div className="mx-auto h-1.5 w-14 rounded-full bg-border/30" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Comments</p>
                  <p className="text-xs text-muted-foreground">{comments.length} comment{comments.length === 1 ? '' : 's'}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-muted/40 px-4 py-3 divide-y divide-border">
              {comments.length === 0 ? (
                <div className="py-6 text-center text-[13px] text-muted-foreground">No comments yet — be first!</div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="py-3">
                    <p className="text-[13px] leading-snug">
                      <span className="font-semibold text-foreground">{comment.author_name} </span>
                      <span className="text-muted-foreground">{comment.content}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {comment.created_date
                        ? formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })
                        : 'just now'}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border bg-card px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={handleCommentKeyDown}
                  placeholder="Write a comment…"
                  maxLength={500}
                  className="flex-1 bg-muted rounded-full px-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                />
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                  aria-label="Post comment"
                  className="p-2 rounded-full bg-blue-500 text-white disabled:opacity-40 hover:bg-blue-600 transition-colors"
                >
                  <Send className="w-4 h-4" strokeWidth={2} />
                </motion.button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </motion.article>
  );
}
