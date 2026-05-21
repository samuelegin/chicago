import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, MessageCircle, Share2, TrendingUp, MoreHorizontal, X, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CommentService, LikeService, PostService } from '@/api/services';
import { toast } from 'sonner';

const RANK_META = {
  bronze:  { gradient: 'from-amber-600 to-amber-400',    label: 'Bronze',  glow: 'rgba(217,119,6,0.5)'  },
  silver:  { gradient: 'from-neutral-400 to-neutral-300', label: 'Silver',  glow: 'rgba(163,163,163,0.5)' },
  gold:    { gradient: 'from-yellow-400 to-amber-300',    label: 'Gold',    glow: 'rgba(255,215,0,0.6)'  },
  diamond: { gradient: 'from-cyan-400 to-sky-300',        label: 'Diamond', glow: 'rgba(0,238,252,0.6)'  },
  og:      { gradient: 'from-purple-500 to-violet-400',   label: 'OG',      glow: 'rgba(139,92,246,0.6)' },
};

function Avatar({ name, avatar, rank, size = 40 }) {
  const meta = rank ? RANK_META[rank] : null;
  const inner = (
    <div
      className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
      style={{ background: '#0e0e0e' }}
    >
      {avatar
        ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
        : <span className="font-bold text-[#999077] select-none" style={{ fontSize: size * 0.38, fontFamily: 'Sora, sans-serif' }}>
            {(name || '?')[0].toUpperCase()}
          </span>
      }
    </div>
  );

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {meta ? (
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br ${meta.gradient} p-[2px]`}
          style={{ boxShadow: `0 0 10px ${meta.glow}` }}
        >
          <div className="w-full h-full rounded-full p-[2px]" style={{ background: '#050505' }}>
            {inner}
          </div>
        </div>
      ) : (
        <div className="w-full h-full rounded-full" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          {inner}
        </div>
      )}
    </div>
  );
}

function CommentInput({ postId, currentUserId, authorProfile }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await CommentService.create({
        post_id: postId,
        user_id: currentUserId,
        author_name: authorProfile?.username || 'Anonymous',
        content: text.trim(),
      });
      setText('');
    } catch (e) {
      // silent fail
    } finally {
      setSending(false);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div
      className="shrink-0 flex items-center gap-3 px-4 py-3"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(5,5,5,0.8)',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      <div
        className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
        style={{ background: 'rgba(255,215,0,0.12)', color: '#ffd700', fontFamily: 'Sora, sans-serif' }}
      >
        {(authorProfile?.username || '?')[0].toUpperCase()}
      </div>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={onKey}
        placeholder="Add a comment…"
        className="flex-1 text-[13px] focus:outline-none bg-transparent"
        style={{
          color: '#e5e2e1',
          fontFamily: 'Geist, sans-serif',
          caretColor: '#00eefc',
        }}
      />
      <button
        onClick={send}
        disabled={!text.trim() || sending}
        className="shrink-0 transition-all disabled:opacity-30"
        style={{ color: text.trim() ? '#ffd700' : 'rgba(208,198,171,0.3)' }}
      >
        <Send className="w-4 h-4" strokeWidth={2.2} />
      </button>
    </div>
  );
}

function RankBadge({ rank }) {
  const meta = RANK_META[rank];
  if (!meta) return null;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-widest text-black bg-gradient-to-r ${meta.gradient}`}
      style={{ fontFamily: 'JetBrains Mono, monospace' }}
    >
      {meta.label}
    </span>
  );
}

function CommentModal({ isOpen, onClose, post, comments, currentUserId, authorProfile }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] flex items-center justify-center px-4 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0, 0, 0, 0.74)', backdropFilter: 'blur(10px)' }}
          onClick={onClose}
        />

        <motion.div
          className="relative z-10 flex w-full max-w-[1180px] max-h-[92vh] overflow-hidden rounded-[32px] bg-slate-950/95 shadow-[0_24px_120px_rgba(0,0,0,0.45)]"
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 20 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={(event) => event.stopPropagation()}
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="hidden w-2/5 border-r border-white/5 md:flex flex-col bg-slate-900">
            <div className="sticky top-0 flex h-full flex-col overflow-hidden">
              <div className="relative flex-1 overflow-hidden bg-black">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.content || post.author_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-800 text-slate-400">
                    <span className="text-sm font-medium">No media available</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-white/5 px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Post</p>
                  <p className="mt-3 text-base font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                    {post.content || 'No caption provided.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    {post.category || 'General'}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    {post.likes_count?.toLocaleString() || 0} likes
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden bg-slate-950">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-amber-400 via-cyan-400 to-violet-500 p-[1px]">
                  <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center text-white text-sm font-bold">
                    {(authorProfile?.username || '?')[0].toUpperCase()}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                    {authorProfile?.username || 'Unknown'}
                  </p>
                  <p className="truncate text-xs text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {formatDistanceToNow(new Date(post.created_date || Date.now()), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-300 transition hover:bg-white/10"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="overflow-y-auto px-5 py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="mb-4 rounded-3xl border border-white/10 bg-slate-900/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                  <p className="text-sm font-medium text-slate-300" style={{ fontFamily: 'Geist, sans-serif' }}>
                    {post.content || 'No caption available.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-[12px] text-slate-500">
                    <span>{post.comments_count || 0} comments</span>
                    <span>{post.likes_count?.toLocaleString() || 0} likes</span>
                    <span>{post.category || 'General'}</span>
                  </div>
                </div>

                {comments.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/90 p-8 text-center text-sm text-slate-500">
                    No comments yet. Start the conversation.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map(comment => (
                      <div
                        key={comment.id}
                        className="rounded-3xl border border-white/10 bg-slate-900/90 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-slate-100">
                            {(comment.author_name || '?')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                                {comment.author_name}
                              </span>
                              <span className="text-xs text-slate-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                {formatDistanceToNow(new Date(comment.created_date || Date.now()), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-300" style={{ fontFamily: 'Geist, sans-serif' }}>
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 bg-slate-950/95 px-5 py-4">
                <CommentInput postId={post.id} currentUserId={currentUserId} authorProfile={authorProfile} />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

export default function PostCard({ post, authorProfile, currentUserId }) {
  const [liked,        setLiked]        = useState(false);
  const [localLikes,   setLocalLikes]   = useState(post.likes_count || 0);
  const [burst,        setBurst]        = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [hovered,      setHovered]      = useState(false);

  useEffect(() => {
    if (showComments) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
    document.body.style.overflow = '';
    return undefined;
  }, [showComments]);

  const { data: comments = [] } = useQuery({
    queryKey: ['postComments', post.id],
    queryFn:  () => CommentService.getByPost(post.id),
    enabled: showComments && !!post.id,
    staleTime: 1000 * 60 * 5,
  });

  const rank = authorProfile?.rank;

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
        await navigator.share({ title: `${post.author_name || 'Chicago'} post`, url: postUrl });
        toast.success('Share dialog opened');
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(postUrl);
        toast.success('Post link copied!');
        return;
      }
      toast.error('Sharing not supported in this browser.');
    } catch { toast.error('Unable to share or copy link'); }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="glass-card rounded-[32px] overflow-hidden transition-transform duration-300"
      style={{
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 28px 90px rgba(0,0,0,0.22)' : '0 1px 14px rgba(0,0,0,0.08)',
        borderColor: hovered ? 'rgba(255,215,0,0.18)' : 'rgba(255,255,255,0.08)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Trending banner */}
      <div className="flex items-center gap-2 px-4 py-3 sm:px-6 border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-transparent">
        <TrendingUp className="w-4 h-4 text-amber-300" strokeWidth={2.5} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Trending TA
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link to={`/profile/${post.author_id}`} className="flex items-center gap-3 min-w-0">
          <Avatar name={post.author_name} avatar={post.author_avatar} rank={rank} size={40} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                {post.author_name || 'Anonymous'}
              </p>
              {rank && <RankBadge rank={rank} />}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              {post.category && (
                <span className="capitalize font-mono-label" style={{ color: '#999077' }}>
                  {post.category}
                </span>
              )}
              <span className="text-slate-500">·</span>
              <span className="font-mono-label" style={{ color: '#999077' }}>
                {formatDistanceToNow(new Date(post.created_date || Date.now()), { addSuffix: true })}
              </span>
            </div>
          </div>
        </Link>
        <button
          className="p-2 rounded-full text-slate-400 transition-colors hover:text-white hover:bg-white/5"
          type="button"
        >
          <MoreHorizontal className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-4 sm:px-6">
          <p className="text-[14px] leading-7 text-slate-200" style={{ fontFamily: 'Geist, sans-serif' }}>
            {post.content}
          </p>
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <div className="relative px-4 pb-4 sm:px-6" onDoubleClick={like}>
          <div className="overflow-hidden rounded-[28px] border border-white/10 aspect-[16/9] bg-slate-950">
            <img
              src={post.image_url}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <AnimatePresence>
            {burst && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="w-24 h-24 fill-white text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.18)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Poll */}
      {post.post_type === 'poll' && post.poll_options && (
        <div className="px-4 pb-3 space-y-1.5">
          {post.poll_options.map((opt, i) => {
            const total = post.poll_options.reduce((s, o) => s + (o.votes || 0), 0);
            const pct   = total > 0 ? Math.round(((opt.votes || 0) / total) * 100) : 0;
            return (
              <div
                key={i}
                className="relative rounded-xl overflow-hidden cursor-pointer transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,215,0,0.35)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              >
                <motion.div
                  className="absolute inset-y-0 left-0"
                  style={{ background: 'linear-gradient(90deg, rgba(255,215,0,0.12) 0%, rgba(255,215,0,0.04) 100%)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
                <div className="relative flex justify-between px-4 py-3 text-sm">
                  <span className="font-medium text-white">{opt.text}</span>
                  <span className="font-bold font-mono-label" style={{ color: '#ffd700' }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Divider */}
      <div className="mx-4 sm:mx-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

      {/* Action bar */}
      <div className="px-4 py-4 sm:px-6 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={like}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 transition duration-200"
          style={{
            color: liked ? '#f87171' : 'rgba(208,198,171,0.72)',
            background: liked ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.02)',
          }}
        >
          <motion.div animate={liked ? { scale: [1, 1.25, 1] } : {}} transition={{ duration: 0.35 }}>
            <Heart
              strokeWidth={liked ? 0 : 1.8}
              className={`w-4 h-4 ${liked ? 'fill-red-400 text-red-400' : 'text-slate-300'}`}
            />
          </motion.div>
          <span className="text-[12px] font-bold font-mono-label">{localLikes.toLocaleString()}</span>
        </motion.button>

        <button
          type="button"
          onClick={() => setShowComments(prev => !prev)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 transition duration-200"
          style={{
            color: showComments ? '#00eeff' : 'rgba(208,198,171,0.72)',
            background: showComments ? 'rgba(0,238,252,0.09)' : 'rgba(255,255,255,0.02)',
          }}
        >
          <MessageCircle strokeWidth={1.8} className="w-4 h-4" />
          <span className="text-[12px] font-bold font-mono-label">{post.comments_count || 0}</span>
        </button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-slate-300 transition duration-200 hover:text-amber-300 hover:bg-amber-400/10"
          type="button"
        >
          <Share2 strokeWidth={1.8} className="w-4 h-4" />
          <span className="text-[12px] font-bold font-mono-label">Share</span>
        </motion.button>
      </div>

      <CommentModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        post={post}
        comments={comments}
        currentUserId={currentUserId}
        authorProfile={authorProfile}
      />
    </motion.article>
  );
}
