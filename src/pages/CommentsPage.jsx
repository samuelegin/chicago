import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Icon } from '../components/Layout'
import { currentUser } from '../data/mockData'

// ── Emoji Data ────────────────────────────────────────────────
const EMOJI_TABS = [
  { label: '😀', emojis: ['😀','😂','🤣','😅','😊','😍','🥰','😎','🤩','🥳','😭','😤','🤔','🤯','😱','🥺','😴','🤑','😈','🫡','🫠','😬','🙃','😏','😒'] },
  { label: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❣️','💕','💞','💓','💗','💖','💝','💘','💟','🫀','♥️','❤️‍🔥','❤️‍🩹','🩷','🩵','🩶'] },
  { label: '🎉', emojis: ['🎉','🎊','🎈','🎁','🏆','🥇','🎯','🎮','🕹️','🎲','🧩','🎭','🎨','🎬','🎤','🎧','🎵','🎶','🎻','🥁','🪗','🎷','🎸','🎺','🪘'] },
  { label: '💰', emojis: ['💰','💵','💴','💶','💷','💸','💳','🤑','💹','📈','📉','🏦','💎','🪙','₿','🔑','🗝️','🏧','💱','🪂','🚀','🌕','📊','🔐','🛡️'] },
  { label: '🔥', emojis: ['🔥','⚡','✨','💥','🌟','⭐','🌈','🌊','🌀','❄️','🌙','☀️','🌍','🚀','💫','🌌','🪐','☄️','🔮','🧲','⚗️','🌋','🌪️','🌩️','🫧'] },
]

function EmojiPicker({ textareaRef, onClose }) {
  const [activeTab, setActiveTab] = useState(0)
  const pickerRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const insertEmoji = (emoji) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart ?? ta.value.length
    const end   = ta.selectionEnd   ?? ta.value.length
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
    nativeSetter.call(ta, ta.value.slice(0, start) + emoji + ta.value.slice(end))
    ta.dispatchEvent(new Event('input', { bubbles: true }))
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + emoji.length; ta.focus() }, 0)
  }

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full mb-2 left-0 z-50 bg-surface-container border-2 border-on-background neo-shadow-sm w-72 p-3 select-none"
      onMouseDown={e => e.preventDefault()}
    >
      <div className="flex gap-1 mb-2 border-b-2 border-on-background/10 pb-2 overflow-x-auto">
        {EMOJI_TABS.map((tab, i) => (
          <button
            key={i}
            onMouseDown={e => { e.preventDefault(); setActiveTab(i) }}
            className={`shrink-0 text-base px-2 py-1 transition-colors ${activeTab === i ? 'bg-primary-container text-on-primary-fixed' : 'hover:bg-surface-container-high'}`}
          >{tab.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-8 gap-0.5 max-h-40 overflow-y-auto">
        {EMOJI_TABS[activeTab].emojis.map((em, i) => (
          <button
            key={i}
            onMouseDown={e => { e.preventDefault(); insertEmoji(em) }}
            className="text-lg p-1 hover:bg-primary-container/30 transition-colors leading-none"
          >{em}</button>
        ))}
      </div>
    </div>
  )
}

// ── Reply input ───────────────────────────────────────────────
function ReplyInput({ parentName, onSubmit, onCancel }) {
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const ref = useRef(null)

  const submit = () => {
    if (!text.trim()) return
    onSubmit(text)
    setText('')
  }

  return (
    <div className="flex gap-2 items-start mt-2">
      <img src={currentUser.avatar} alt="me" className="w-7 h-7 shrink-0 border border-on-background/20 object-cover mt-1" />
      <div className="flex-1 relative">
        <textarea
          ref={ref}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
          placeholder={`Reply to ${parentName}…`}
          rows={2}
          className="w-full bg-background border border-on-background/20 focus:border-primary-container focus:outline-none px-3 py-2 text-sm resize-none text-on-surface placeholder:text-on-surface-variant"
        />
        <div className="flex justify-between items-center mt-1">
          <div className="relative">
            <button onClick={() => setShowEmoji(v => !v)} className="hover:text-primary-container transition-colors text-on-surface-variant">
              <Icon name="sentiment_satisfied" className="text-[18px]" />
            </button>
            {showEmoji && <EmojiPicker textareaRef={ref} onClose={() => setShowEmoji(false)} />}
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel} className="text-[11px] text-on-surface-variant hover:underline px-2 py-1">Cancel</button>
            <button
              onClick={submit}
              disabled={!text.trim()}
              className="px-3 py-1 text-[11px] font-bold bg-primary-container text-on-primary-fixed border border-on-background/20 disabled:opacity-40 hover:brightness-105 active:scale-95 transition-all"
            >Reply</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Single comment row (flat — no recursion) ──────────────────
function CommentRow({ comment, onReply }) {
  const [liked, setLiked]       = useState(false)
  const [likeCount, setLikeCount] = useState(comment.likes ?? 0)
  const [showReply, setShowReply] = useState(false)

  const handleLike = () => {
    setLiked(v => !v)
    setLikeCount(n => liked ? n - 1 : n + 1)
  }

  return (
    <div className="flex gap-3">
      <img
        src={comment.author.avatar}
        alt={comment.author.name}
        className="w-9 h-9 shrink-0 border border-on-background/20 object-cover"
      />
      <div className="flex-1 min-w-0">
        {/* Bubble */}
        <div className="bg-surface-container px-3 py-2.5 border border-on-background/10">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-bold text-sm text-on-background">{comment.author.name}</span>
            <span className="text-[10px] text-on-surface-variant font-mono">{comment.author.handle}</span>
          </div>
          <p className="text-sm text-on-background mt-1 leading-relaxed break-words">{comment.content}</p>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-4 mt-1.5 px-1">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-[11px] font-bold transition-colors ${liked ? 'text-error' : 'text-on-surface-variant hover:text-error'}`}
          >
            <Icon name="favorite" filled={liked} className="text-[14px]" />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <button
            onClick={() => setShowReply(v => !v)}
            className="text-[11px] font-bold text-on-surface-variant hover:text-primary-container transition-colors"
          >Reply</button>
          <span className="text-[10px] text-on-surface-variant font-mono ml-auto">{comment.timestamp}</span>
        </div>

        {/* Inline reply input */}
        {showReply && (
          <ReplyInput
            parentName={comment.author.name}
            onSubmit={(text) => {
              onReply(comment.id, text)
              setShowReply(false)
            }}
            onCancel={() => setShowReply(false)}
          />
        )}
      </div>
    </div>
  )
}

// ── Reply row (indented, no further nesting) ──────────────────
function ReplyRow({ reply }) {
  const [liked, setLiked]       = useState(false)
  const [likeCount, setLikeCount] = useState(reply.likes ?? 0)

  const handleLike = () => {
    setLiked(v => !v)
    setLikeCount(n => liked ? n - 1 : n + 1)
  }

  return (
    <div className="flex gap-3 ml-12 pl-3 border-l-2 border-primary-container/30">
      <img
        src={reply.author.avatar}
        alt={reply.author.name}
        className="w-7 h-7 shrink-0 border border-on-background/20 object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="bg-surface-container/60 px-3 py-2 border border-on-background/10">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-bold text-xs text-on-background">{reply.author.name}</span>
            <span className="text-[10px] text-on-surface-variant font-mono">{reply.author.handle}</span>
          </div>
          <p className="text-sm text-on-background mt-1 leading-relaxed break-words">{reply.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 px-1">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-[11px] font-bold transition-colors ${liked ? 'text-error' : 'text-on-surface-variant hover:text-error'}`}
          >
            <Icon name="favorite" filled={liked} className="text-[14px]" />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <span className="text-[10px] text-on-surface-variant font-mono ml-auto">{reply.timestamp}</span>
        </div>
      </div>
    </div>
  )
}

// ── Comment thread (comment + its flat replies) ───────────────
function CommentThread({ comment, onReply }) {
  return (
    <div className="flex flex-col gap-3">
      <CommentRow comment={comment} onReply={onReply} />
      {comment.replies?.length > 0 && (
        <div className="flex flex-col gap-3">
          {comment.replies.map(reply => (
            <ReplyRow key={reply.id} reply={reply} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function CommentsPage() {
  const navigate  = useNavigate()
  const location  = useLocation()

  // Post data is passed via router state from PostCard
  const post = location.state?.post

  const [comments,     setComments]     = useState(post?.comments_data ?? [])
  const [commentCount, setCommentCount] = useState(post?.comments ?? 0)
  const [newComment,   setNewComment]   = useState('')
  const [showEmoji,    setShowEmoji]    = useState(false)
  const inputRef = useRef(null)

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0) }, [])

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-on-surface-variant">
        <p className="font-bold text-sm uppercase tracking-widest">Post not found</p>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary-container font-bold text-sm hover:underline">
          <Icon name="arrow_back" className="text-[18px]" /> Go back
        </button>
      </div>
    )
  }

  const submitComment = () => {
    if (!newComment.trim()) return
    const comment = {
      id: `c_${Date.now()}`,
      author: currentUser,
      content: newComment,
      likes: 0,
      replies: [],
      timestamp: 'just now',
    }
    setComments(prev => [comment, ...prev])
    setCommentCount(n => n + 1)
    setNewComment('')
  }

  const handleReply = (commentId, text) => {
    setComments(prev => prev.map(c =>
      c.id === commentId
        ? {
            ...c,
            replies: [...(c.replies ?? []), {
              id: `r_${Date.now()}`,
              author: currentUser,
              content: text,
              likes: 0,
              timestamp: 'just now',
            }]
          }
        : c
    ))
  }

  return (
    <div className="min-h-screen bg-background text-on-background">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 bg-background border-b-2 border-on-background/10 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center border-2 border-on-background/20 hover:border-primary-container hover:bg-primary-container/10 transition-all active:scale-95"
          aria-label="Go back"
        >
          <Icon name="arrow_back" className="text-[20px] text-on-background" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-sm uppercase tracking-widest text-on-background truncate">Comments</h1>
          <p className="text-[11px] text-on-surface-variant font-mono">{commentCount} comment{commentCount !== 1 ? 's' : ''}</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-32">

        {/* ── Post preview (compact) ── */}
        <div className="mt-4 mb-6 bg-surface-container border border-on-background/10 neo-border neo-shadow p-4">
          <div className="flex gap-3 items-start">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 shrink-0 border border-on-background/20 object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-bold text-sm text-on-background">{post.author.name}</span>
                <span className="text-[10px] text-on-surface-variant font-mono">{post.author.handle}</span>
                <span className="text-[10px] text-on-surface-variant font-mono ml-auto">{post.timestamp}</span>
              </div>
              <p className="text-sm text-on-background mt-1.5 leading-relaxed line-clamp-3">{post.content}</p>
              {/* Like / comment counts */}
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-on-background/10">
                <span className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                  <Icon name="favorite" className="text-[14px]" />
                  {post.likes >= 1000 ? `${(post.likes/1000).toFixed(1)}k` : post.likes}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-primary-container font-bold">
                  <Icon name="chat_bubble" className="text-[14px]" />
                  {commentCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Write a comment ── */}
        <div className="mb-6 bg-surface-container border border-on-background/10 neo-border p-4">
          <p className="font-bold text-[11px] uppercase tracking-widest text-on-surface-variant mb-3">Write a comment</p>
          <div className="flex gap-3">
            <img src={currentUser.avatar} alt="me" className="w-9 h-9 shrink-0 border border-on-background/20 object-cover" />
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() } }}
                placeholder="Share your thoughts…"
                rows={3}
                className="w-full bg-background border border-on-background/20 focus:border-primary-container focus:outline-none px-3 py-2.5 text-sm resize-none text-on-surface placeholder:text-on-surface-variant"
              />
              <div className="flex justify-between items-center mt-2">
                <div className="relative">
                  <button
                    onClick={() => setShowEmoji(v => !v)}
                    className="hover:text-primary-container transition-colors text-on-surface-variant"
                  >
                    <Icon name="sentiment_satisfied" className="text-[20px]" />
                  </button>
                  {showEmoji && <EmojiPicker textareaRef={inputRef} onClose={() => setShowEmoji(false)} />}
                </div>
                <button
                  onClick={submitComment}
                  disabled={!newComment.trim()}
                  className="px-5 py-2 text-sm font-bold bg-primary-container text-on-primary-fixed border border-on-background/20 neo-border disabled:opacity-40 hover:brightness-105 active:scale-95 transition-all"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Comments list ── */}
        {comments.length > 0 ? (
          <div className="flex flex-col gap-6">
            {comments.map(comment => (
              <CommentThread key={comment.id} comment={comment} onReply={handleReply} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-on-surface-variant">
            <Icon name="chat_bubble_outline" className="text-[40px] opacity-30" />
            <p className="text-sm font-bold uppercase tracking-widest opacity-50">No comments yet</p>
            <p className="text-xs opacity-40">Be the first to share your thoughts</p>
          </div>
        )}

        {/* Bottom spacer for mobile nav */}
        <div className="h-8" />
      </div>
    </div>
  )
}
