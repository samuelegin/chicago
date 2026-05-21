import React, { useState } from 'react';
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

export default function PostCard({ post, authorProfile, currentUserId }) {
  const [liked,        setLiked]        = useState(false);
  const [localLikes,   setLocalLikes]   = useState(post.likes_count || 0);
  const [burst,        setBurst]        = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [hovered,      setHovered]      = useState(false);

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
      className="glass-card rounded-2xl overflow-hidden"
      style={{
        transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
        boxShadow: hovered ? '0 0 40px rgba(255,255,255,0.03)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Trending banner */}
      <div
        className="flex items-center gap-1.5 px-4 py-1.5 border-b"
        style={{
          background: 'linear-gradient(90deg, rgba(255,215,0,0.08) 0%, rgba(255,215,0,0.02) 100%)',
          borderBottomColor: 'rgba(255,215,0,0.15)',
        }}
      >
        <TrendingUp className="w-3 h-3" style={{ color: '#ffd700' }} strokeWidth={2.5} />
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#ffd700', fontFamily: 'JetBrains Mono, monospace' }}>
          Trending TA
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={`/profile/${post.author_id}`} className="flex items-center gap-2.5 min-w-0">
          <Avatar name={post.author_name} avatar={post.author_avatar} rank={rank} size={36} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-[13px] font-bold leading-tight text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                {post.author_name || 'Anonymous'}
              </p>
              {rank && <RankPill rank={rank} />}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {post.category && (
                <span className="text-[11px] capitalize font-mono-label" style={{ color: '#999077' }}>
                  {post.category}
                </span>
              )}
              <span className="text-[11px]" style={{ color: '#4d4732' }}>·</span>
              <span className="text-[11px] font-mono-label" style={{ color: '#999077' }}>
                {formatDistanceToNow(new Date(post.created_date || Date.now()), { addSuffix: true })}
              </span>
            </div>
          </div>
        </Link>
        <button
          className="p-1 rounded-full transition-colors ml-2 shrink-0"
          style={{ color: 'rgba(208,198,171,0.4)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#e5e2e1'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(208,198,171,0.4)'}
        >
          <MoreHorizontal className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-[13px] leading-relaxed" style={{ color: '#e5e2e1', fontFamily: 'Geist, sans-serif' }}>
            {post.content}
          </p>
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <div className="relative" onDoubleClick={like}>
          <div
            className="overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.06)', borderLeft: 'none', borderRight: 'none' }}
          >
            <img
              src={post.image_url}
              alt=""
              className="w-full object-cover transition-transform duration-700"
              style={{ maxHeight: 220 }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
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
                <Heart className="w-24 h-24 fill-white text-white drop-shadow-lg" />
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
      <div className="mx-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

      {/* Action bar */}
      <div className="px-3 py-2 flex items-center gap-0.5">
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={like}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-colors group"
          style={{ color: liked ? '#f87171' : 'rgba(208,198,171,0.6)' }}
          onMouseEnter={e => !liked && (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
          onMouseLeave={e => !liked && (e.currentTarget.style.background = 'transparent')}
        >
          <motion.div animate={liked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart
              strokeWidth={liked ? 0 : 1.8}
              className={`w-[18px] h-[18px] transition-all ${liked ? 'fill-red-400 text-red-400' : ''}`}
            />
          </motion.div>
          {localLikes > 0 && (
            <span className="text-[12px] font-bold font-mono-label">{localLikes.toLocaleString()}</span>
          )}
        </motion.button>

        <button
          onClick={() => setShowComments(prev => !prev)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all"
          style={{
            color: showComments ? 'rgba(0,238,252,0.9)' : 'rgba(208,198,171,0.6)',
            background: showComments ? 'rgba(0,238,252,0.08)' : 'transparent',
          }}
          onMouseEnter={e => !showComments && (e.currentTarget.style.background = 'rgba(0,238,252,0.06)')}
          onMouseLeave={e => !showComments && (e.currentTarget.style.background = 'transparent')}
        >
          <MessageCircle strokeWidth={1.8} className="w-[18px] h-[18px]" />
          {post.comments_count > 0 && (
            <span className="text-[12px] font-bold font-mono-label">{post.comments_count}</span>
          )}
        </button>

        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleShare}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all group"
          style={{ color: 'rgba(208,198,171,0.6)' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#ffd700';
            e.currentTarget.style.background = 'rgba(255,215,0,0.06)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(208,198,171,0.6)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Share2 strokeWidth={1.8} className="w-[18px] h-[18px]" />
          <span className="text-[12px] font-bold font-mono-label">Share</span>
        </motion.button>
      </div>

      {/* Comments bottom sheet — portal-style, slides up from very bottom */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            className="fixed inset-0 z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
              onClick={() => setShowComments(false)}
            />

            {/* Sheet — slides from absolute bottom */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-3xl overflow-hidden"
              style={{
                height: '75vh',
                background: 'rgba(14,14,14,0.97)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 -16px 60px rgba(0,238,252,0.08)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
              </div>

              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-3 shrink-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div>
                  <p className="text-[15px] font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                    Comments
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#999077', fontFamily: 'JetBrains Mono, monospace' }}>
                    {post.comments_count || comments.length} total
                  </p>
                </div>
                <button
                  onClick={() => setShowComments(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(208,198,171,0.7)' }}
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              {/* Comments list — scrollable middle */}
              <div className="flex-1 overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <MessageCircle className="w-8 h-8 mx-auto mb-3 opacity-20" style={{ color: '#999077' }} />
                    <p className="text-sm" style={{ color: '#999077', fontFamily: 'Geist, sans-serif' }}>
                      No comments yet. Be first!
                    </p>
                  </div>
                ) : (
                  comments.map(comment => (
                    <div
                      key={comment.id}
                      className="flex gap-3 px-5 py-3.5"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <div
                        className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                        style={{ background: 'rgba(255,215,0,0.12)', color: '#ffd700', fontFamily: 'Sora, sans-serif' }}
                      >
                        {(comment.author_name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="text-[13px] font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                          {comment.author_name}
                        </span>
                        <p className="text-[13px] mt-0.5 leading-snug" style={{ color: '#d0c6ab', fontFamily: 'Geist, sans-serif' }}>
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment input — pinned at bottom */}
              <CommentInput postId={post.id} currentUserId={currentUserId} authorProfile={authorProfile} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
