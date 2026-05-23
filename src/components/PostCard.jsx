import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Layout'
import { currentUser } from '../data/mockData'

// Comments are handled by CommentsPage — see src/pages/CommentsPage.jsx

// ── Emoji Data ────────────────────────────────────────────────
const EMOJI_TABS = [
  { label: '😀', emojis: ['😀','😂','🤣','😅','😊','😍','🥰','😎','🤩','🥳','😭','😤','🤔','🤯','😱','🥺','😴','🤑','😈','🫡','🫠','😬','🙃','😏','😒'] },
  { label: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❣️','💕','💞','💓','💗','💖','💝','💘','💟','🫀','♥️','❤️‍🔥','❤️‍🩹','🩷','🩵','🩶'] },
  { label: '🎉', emojis: ['🎉','🎊','🎈','🎁','🏆','🥇','🎯','🎮','🕹️','🎲','🧩','🎭','🎨','🎬','🎤','🎧','🎵','🎶','🎻','🥁','🪗','🎷','🎸','🎺','🪘'] },
  { label: '💰', emojis: ['💰','💵','💴','💶','💷','💸','💳','🤑','💹','📈','📉','🏦','💎','🪙','₿','🔑','🗝️','🏧','💱','🪂','🚀','🌕','📊','🔐','🛡️'] },
  { label: '🔥', emojis: ['🔥','⚡','✨','💥','🌟','⭐','🌈','🌊','🌀','❄️','🌙','☀️','🌍','🚀','💫','🌌','🪐','☄️','🔮','🧲','⚗️','🌋','🌪️','🌩️','🫧'] },
]

// ── Emoji Picker ──────────────────────────────────────────────
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
    const end = ta.selectionEnd ?? ta.value.length
    const newVal = ta.value.slice(0, start) + emoji + ta.value.slice(end)
    // Use native input setter so React state syncs
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
    nativeInputValueSetter.call(ta, newVal)
    ta.dispatchEvent(new Event('input', { bubbles: true }))
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + emoji.length; ta.focus() }, 0)
  }

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full mb-2 left-0 z-50 bg-surface-container border-2 border-on-background neo-shadow-sm w-72 p-3 select-none"
      onMouseDown={e => e.preventDefault()}
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-2 border-b-2 border-on-background/10 pb-2 overflow-x-auto">
        {EMOJI_TABS.map((tab, i) => (
          <button
            key={i}
            onMouseDown={e => { e.preventDefault(); setActiveTab(i) }}
            className={`shrink-0 text-base px-2 py-1 transition-colors ${activeTab === i ? 'bg-primary-container text-on-primary-fixed' : 'hover:bg-surface-container-high'}`}
          >{tab.label}</button>
        ))}
      </div>
      {/* Grid */}
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

// ── Single Comment ─────────────────────────────────────────────
function Comment({ comment, depth = 0 }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(comment.likes ?? 0)
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replies, setReplies] = useState(comment.replies ?? [])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const replyRef = useRef(null)

  const handleLike = () => {
    setLiked((currentLiked) => {
      setLikeCount((currentCount) => currentLiked ? currentCount - 1 : currentCount + 1)
      return !currentLiked
    })
  }

  const submitReply = () => {
    if (!replyText.trim()) return
    setReplies(prev => [...prev, {
      id: `r_${Date.now()}`,
      author: currentUser,
      content: replyText,
      likes: 0,
      replies: [],
      timestamp: 'just now',
    }])
    setReplyText('')
    setShowReply(false)
  }

  return (
    <div className={`flex gap-3 ${depth > 0 ? 'ml-8 pl-3 border-l-2 border-primary-container/40' : ''}`}>
      <img src={comment.author.avatar} alt={comment.author.name} className="w-8 h-8 shrink-0 border border-on-background/20 object-cover" />
      <div className="flex-1 min-w-0">
        <div className="bg-surface-container/60 px-3 py-2 border border-on-background/10">
          <span className="font-bold text-xs text-on-background">{comment.author.name}</span>
          <span className="text-[10px] text-on-surface-variant font-mono ml-2">{comment.author.handle}</span>
          <p className="text-sm text-on-background mt-1 leading-relaxed">{comment.content}</p>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-4 mt-1 px-1">
          <button onClick={handleLike} className={`flex items-center gap-1 text-[11px] font-bold transition-colors ${liked ? 'text-error' : 'text-on-surface-variant hover:text-error'}`}>
            <Icon name="favorite" filled={liked} className="text-[14px]" />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          {depth < 2 && (
            <button onClick={() => setShowReply(v => !v)} className="text-[11px] font-bold text-on-surface-variant hover:text-primary-container transition-colors">
              Reply
            </button>
          )}
          <span className="text-[10px] text-on-surface-variant font-mono ml-auto">{comment.timestamp}</span>
        </div>

        {/* Reply input */}
        {showReply && (
          <div className="mt-2 flex gap-2 items-start relative">
            <img src={currentUser.avatar} alt="me" className="w-6 h-6 shrink-0 border border-on-background/20 object-cover mt-1" />
            <div className="flex-1 relative">
              <textarea
                ref={replyRef}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitReply() } }}
                placeholder={`Reply to ${comment.author.name}…`}
                rows={2}
                className="w-full bg-background border border-on-background/20 focus:border-primary-container focus:outline-none px-3 py-2 text-xs resize-none text-on-surface"
              />
              <div className="flex justify-between items-center mt-1">
                <div className="relative">
                  <button onClick={() => setShowEmojiPicker(v => !v)} className="hover:text-primary-container transition-colors text-on-surface-variant">
                    <Icon name="sentiment_satisfied" className="text-[18px]" />
                  </button>
                  {showEmojiPicker && <EmojiPicker textareaRef={replyRef} onClose={() => setShowEmojiPicker(false)} />}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setShowReply(false); setReplyText('') }} className="text-[11px] text-on-surface-variant hover:underline px-2 py-1">Cancel</button>
                  <button onClick={submitReply} disabled={!replyText.trim()} className="px-3 py-1 text-[11px] font-bold bg-primary-container text-on-primary-fixed border border-on-background/20 disabled:opacity-40 hover:brightness-105 active:scale-95 transition-all">Reply</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {replies.length > 0 && (
          <div className="mt-3 flex flex-col gap-3">
            {replies.map(reply => <Comment key={reply.id} comment={reply} depth={depth + 1} />)}
          </div>
        )}
      </div>
    </div>
  )
}

// ── PostCard ──────────────────────────────────────────────────
export default function PostCard({ post, onLike }) {
  const navigate = useNavigate()
  const [commentCount] = useState(post.comments ?? 0)

  const handleAvatarClick = () => {
    if (post.author.id === currentUser.id) navigate('/profile')
    else navigate(`/profile/${post.author.id}`)
  }

  const openComments = () => {
    navigate('/comments', { state: { post } })
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Chicago Web3',
      text: post.content,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (_) {
        // Share canceled or unavailable
      }
      return
    }

    const url = shareData.url
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url)
        window.alert('Link copied to clipboard')
        return
      } catch (_) {
        // fallback next
      }
    }

    window.prompt('Copy this link to share', url)
  }

  return (
    <article className="bg-surface-container border border-on-background/10 lg:neo-border lg:neo-shadow p-3 lg:p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-3 lg:mb-4">
        <div className="flex gap-2 lg:gap-4">
          <button onClick={handleAvatarClick} className="shrink-0 focus:outline-none group">
            <img
              src={post.author.avatar} alt={post.author.name}
              className="w-9 h-9 lg:w-12 lg:h-12 border border-on-background/20 lg:neo-border object-cover group-hover:brightness-90 group-hover:ring-2 group-hover:ring-primary-container transition-all"
            />
          </button>
          <div>
            <div className="flex items-center gap-1 lg:gap-2">
              <button onClick={handleAvatarClick} className="font-bold text-on-background text-sm lg:text-base hover:text-primary-container transition-colors">
                {post.author.name}
              </button>
              <span className="text-[11px] text-on-surface-variant font-mono">{post.author.handle}</span>
            </div>
            <span className="text-[11px] text-on-surface-variant font-mono">{post.timestamp}</span>
          </div>
        </div>
        {post.trending && (
          <div className="px-2 lg:px-3 py-0.5 lg:py-1 bg-primary-container border border-on-background/20 lg:neo-border flex items-center gap-1">
            <Icon name="bolt" filled className="text-[12px] lg:text-[14px] text-on-primary-fixed" />
            <span className="text-[10px] lg:text-[11px] font-bold text-on-primary-fixed uppercase tracking-wider">Trending</span>
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-sm lg:text-body-lg font-body-lg mb-3 lg:mb-6 leading-relaxed text-on-background">{post.content}</p>

      {/* Images */}
      {post.images?.length === 2 && (
        <div className="grid grid-cols-2 gap-2 mb-3 lg:mb-6">
          {post.images.map((img, i) => <img key={i} src={img} alt="" className="border border-on-background/15 lg:neo-border w-full aspect-video object-cover" />)}
        </div>
      )}
      {post.images?.length === 1 && (
        <img src={post.images[0]} alt="" className="border border-on-background/15 lg:neo-border w-full h-[200px] lg:h-[300px] object-cover mb-3 lg:mb-6" />
      )}

      {/* Poll */}
      {post.poll && (
        <div className="mb-4 border border-primary-container/40 p-3 bg-background">
          <p className="font-bold text-sm text-on-background mb-2">{post.poll.question}</p>
          {post.poll.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2 mb-1.5">
              <div className="w-3 h-3 border-2 border-on-background/40 rounded-full shrink-0" />
              <span className="text-xs text-on-surface-variant">{opt}</span>
            </div>
          ))}
          <p className="text-[10px] text-primary-container mt-1 font-mono">⏱ {post.poll.duration}</p>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-between pt-3 lg:pt-4 border-t border-on-background/10">
        <div className="flex items-center gap-5 lg:gap-8">
          <button className="flex items-center gap-1.5 group transition-all" onClick={() => onLike(post.id)}>
            <Icon name="favorite" filled={post.liked} className={`text-[18px] lg:text-[24px] text-on-surface-variant group-hover:text-error transition-colors ${post.liked ? 'text-error' : ''}`} />
            <span className="text-[11px] lg:text-[12px] text-on-surface-variant">{post.likes >= 1000 ? `${(post.likes/1000).toFixed(1)}k` : post.likes}</span>
          </button>
          <button
            className="flex items-center gap-1.5 group transition-all"
            onClick={openComments}
          >
            <Icon name="chat_bubble" className="text-[18px] lg:text-[24px] text-on-surface-variant group-hover:text-primary-container transition-colors" />
            <span className="text-[11px] lg:text-[12px] text-on-surface-variant">{commentCount}</span>
          </button>
        </div>

        <button
          className="flex items-center gap-1.5 group transition-all"
          onClick={handleShare}
        >
          <Icon name="share" className="text-[18px] lg:text-[24px] text-on-surface-variant group-hover:text-primary transition-colors" />
          <span className="text-[11px] lg:text-[12px] text-on-surface-variant">{post.shares}</span>
        </button>
      </div>
    </article>
  )
}
