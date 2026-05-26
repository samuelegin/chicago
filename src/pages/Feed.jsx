import { useState, useRef, useEffect } from 'react'
import { Icon, RightSidebar } from '../components/Layout'
import PostCard from '../components/PostCard'
import { useAuth } from '../context/AuthContext'
import {
  getFeedPosts,
  getFeedCategories,
  getSuggestedUsers,
  getTrendingTopics,
  createPost as apiCreatePost,
  likePost as apiLikePost,
  unlikePost as apiUnlikePost,
  followUser as apiFollowUser,
  unfollowUser as apiUnfollowUser,
} from '../services/index'

// ── GIF Keyboard ─────────────────────────────────────────────
const GIF_CATEGORIES = ['trending', 'reactions', 'memes', 'crypto', 'hype', 'lol']

function GifKeyboard({ onSelect, onClose }) {
  const [activeTab, setActiveTab] = useState('trending')
  const [search, setSearch] = useState('')

  // GIF search is powered by your backend's GIPHY proxy.
  // Endpoint: GET /gifs/search?q=<query>&category=<category>
  // Returns: { gifs: [{ id, url, preview }] }
  // Wire this up when the backend is ready.

  return (
    <div className="absolute bottom-full mb-2 left-0 w-80 bg-surface-container border-2 border-on-background neo-shadow z-50 p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-xs uppercase tracking-widest text-primary-container">GIFs</span>
        <button onClick={onClose} className="text-on-surface-variant hover:text-on-background">
          <Icon name="close" className="text-[18px]" />
        </button>
      </div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search GIFs…"
        className="w-full bg-background border border-on-background/20 px-3 py-1.5 text-xs mb-2 focus:outline-none focus:border-primary-container text-on-surface"
      />
      <div className="flex gap-1 overflow-x-auto pb-1 mb-2 no-scrollbar">
        {GIF_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase border transition-colors ${
              activeTab === cat
                ? 'bg-primary-container text-on-primary-fixed border-on-background'
                : 'border-on-background/20 text-on-surface-variant hover:bg-primary-container/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center h-32 text-on-surface-variant gap-2">
        <Icon name="gif_box" className="text-[32px] opacity-30" />
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">GIF search coming soon</p>
      </div>
    </div>
  )
}

// ── Poll Creator ──────────────────────────────────────────────
function PollCreator({ onAdd, onClose }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [duration, setDuration] = useState('1 day')

  const addOption = () => options.length < 4 && setOptions([...options, ''])
  const removeOption = (i) => options.length > 2 && setOptions(options.filter((_, idx) => idx !== i))
  const updateOption = (i, val) => setOptions(options.map((o, idx) => idx === i ? val : o))

  const handleAdd = () => {
    if (!question.trim() || options.filter(o => o.trim()).length < 2) return
    onAdd({ question, options: options.filter(o => o.trim()), duration })
    onClose()
  }

  return (
    <div className="mt-3 bg-background border-2 border-primary-container p-4 relative">
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-sm uppercase tracking-widest text-primary-container flex items-center gap-2">
          <Icon name="poll" className="text-[18px]" /> Create Poll
        </span>
        <button onClick={onClose} className="text-on-surface-variant hover:text-on-background">
          <Icon name="close" className="text-[16px]" />
        </button>
      </div>
      <input
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Ask a question…"
        className="w-full bg-surface-container border border-on-background/20 px-3 py-2 text-sm mb-3 focus:outline-none focus:border-primary-container text-on-surface"
      />
      <div className="flex flex-col gap-2 mb-3">
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={opt}
              onChange={e => updateOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              className="flex-1 bg-surface-container border border-on-background/20 px-3 py-1.5 text-sm focus:outline-none focus:border-primary-container text-on-surface"
            />
            {options.length > 2 && (
              <button onClick={() => removeOption(i)} className="text-on-surface-variant hover:text-red-500">
                <Icon name="remove_circle" className="text-[18px]" />
              </button>
            )}
          </div>
        ))}
        {options.length < 4 && (
          <button
            onClick={addOption}
            className="flex items-center gap-1 text-primary-container text-xs font-bold hover:underline self-start"
          >
            <Icon name="add_circle" className="text-[16px]" /> Add option
          </button>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant font-bold">Duration:</span>
          <select
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="bg-surface-container border border-on-background/20 text-xs px-2 py-1 text-on-surface focus:outline-none"
          >
            {['1 hour', '6 hours', '12 hours', '1 day', '3 days', '7 days'].map(d => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-1.5 bg-primary-container text-on-primary-fixed font-bold text-xs border border-on-background neo-border neo-shadow-sm active:scale-95 transition-all"
        >
          Add Poll
        </button>
      </div>
    </div>
  )
}

export default function Feed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [activeFilter, setActiveFilter] = useState('general')
  const [suggested, setSuggested] = useState([])
  const [trendingTopics, setTrendingTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [postContent, setPostContent] = useState('')

  useEffect(() => {
    setError(null)
    Promise.all([
      getFeedPosts(activeFilter),
      getFeedCategories(),
      getSuggestedUsers(),
      getTrendingTopics(),
    ]).then(([postsData, catsData, suggestData, trendData]) => {
      setPosts(postsData)
      setCategories(catsData)
      setSuggested(suggestData)
      setTrendingTopics(trendData)
    }).catch(err => setError(err.message || 'Failed to load feed'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    getFeedPosts(activeFilter)
      .then(setPosts)
      .catch(err => setError(err.message || 'Failed to load posts'))
      .finally(() => setLoading(false))
  }, [activeFilter])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [selectedGifs, setSelectedGifs] = useState([])
  const [poll, setPoll] = useState(null)
  const [showGifKeyboard, setShowGifKeyboard] = useState(false)
  const [showPollCreator, setShowPollCreator] = useState(false)
  const fileInputRef = useRef(null)

  const handleLike = async (postId) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    )
    try {
      if (post.liked) await apiUnlikePost(postId)
      else await apiLikePost(postId)
    } catch {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked: post.liked, likes: post.likes }
            : p
        )
      )
    }
  }

  const handleFollow = async (userId) => {
    const su = suggested.find(u => u.id === userId)
    if (!su) return
    setSuggested((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, following: !u.following } : u))
    )
    try {
      if (su.following) await apiUnfollowUser(userId)
      else await apiFollowUser(userId)
    } catch {
      setSuggested((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, following: su.following } : u))
      )
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const previews = files.map(f => ({ name: f.name, url: URL.createObjectURL(f) }))
    setSelectedFiles(prev => [...prev, ...previews])
    e.target.value = ''
  }

  const removeFile = (i) => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))
  const removeGif = (i) => setSelectedGifs(prev => prev.filter((_, idx) => idx !== i))

  const handlePost = async () => {
    if (!postContent.trim() && selectedFiles.length === 0 && selectedGifs.length === 0 && !poll) return
    const payload = {
      content: postContent,
      images: [...selectedGifs, ...selectedFiles.map(f => f.url)],
      poll: poll || null,
      category: 'General',
    }
    try {
      const created = await apiCreatePost(payload)
      setPosts([created, ...posts])
    } catch {
      // Fallback: optimistic local add
      setPosts([{
        id: `p_${Date.now()}`,
        author: user,
        ...payload,
        likes: 0,
        comments: 0,
        shares: 0,
        trending: false,
        timestamp: 'just now',
        liked: false,
      }, ...posts])
    }
    setPostContent('')
    setSelectedFiles([])
    setSelectedGifs([])
    setPoll(null)
    setShowGifKeyboard(false)
    setShowPollCreator(false)
  }

  const filteredPosts = posts

  return (
    <div className="flex-1 lg:ml-[300px] lg:mr-[340px] max-w-2xl w-full flex flex-col gap-4 lg:gap-8 min-w-0">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.gif,.pdf,.doc,.docx"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Compose Box */}
      <section className="bg-surface-container border border-on-background/10 lg:neo-border lg:neo-shadow p-3 lg:p-6">
        <div className="flex gap-3">
          <img src={user?.avatar || '/favicon.jpg'} alt="Me" className="w-9 h-9 lg:w-12 lg:h-12 border border-on-background/20 lg:neo-border object-cover" />
          <div className="flex-1">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full bg-background border border-on-background/15 lg:neo-border p-2 lg:p-4 text-sm lg:text-body-md focus:outline-none min-h-[70px] lg:min-h-[100px] resize-none placeholder:text-on-surface-variant text-on-surface"
              placeholder="What's on your mind?"
            />

            {/* Selected files preview */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="relative group">
                    {f.url.match(/\.(mp4|webm)$/i) ? (
                      <video src={f.url} className="w-20 h-20 object-cover border border-on-background/20" />
                    ) : (
                      <img src={f.url} alt={f.name} className="w-20 h-20 object-cover border border-on-background/20" />
                    )}
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Selected GIFs preview */}
            {selectedGifs.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedGifs.map((g, i) => (
                  <div key={i} className="relative group">
                    <img src={g} alt="gif" className="w-20 h-20 object-cover border border-primary-container/40" />
                    <span className="absolute bottom-0 left-0 bg-primary-container text-on-primary-fixed text-[8px] font-bold px-1">GIF</span>
                    <button
                      onClick={() => removeGif(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Poll preview */}
            {poll && (
              <div className="mt-3 bg-background border border-primary-container/40 p-3">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-sm text-on-background">{poll.question}</p>
                  <button onClick={() => setPoll(null)} className="text-on-surface-variant hover:text-red-500 ml-2">
                    <Icon name="close" className="text-[16px]" />
                  </button>
                </div>
                {poll.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 border-2 border-on-background/40 rounded-full" />
                    <span className="text-xs text-on-surface-variant">{opt}</span>
                  </div>
                ))}
                <p className="text-[10px] text-primary-container mt-1 font-mono">⏱ {poll.duration}</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-2 lg:mt-4 relative">
              <div className="flex gap-2 lg:gap-4 text-on-surface-variant relative">
                {/* Image/File icon */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach image or file"
                  className="hover:text-primary-container transition-colors"
                >
                  <Icon name="image" className="cursor-pointer text-[18px] lg:text-[24px]" />
                </button>

                {/* GIF icon */}
                <div className="relative">
                  <button
                    onClick={() => { setShowGifKeyboard(v => !v); setShowPollCreator(false) }}
                    title="Add GIF"
                    className={`hover:text-primary-container transition-colors ${showGifKeyboard ? 'text-primary-container' : ''}`}
                  >
                    <Icon name="gif_box" className="cursor-pointer text-[18px] lg:text-[24px]" />
                  </button>
                  {showGifKeyboard && (
                    <GifKeyboard
                      onSelect={(gif) => setSelectedGifs(prev => [...prev, gif])}
                      onClose={() => setShowGifKeyboard(false)}
                    />
                  )}
                </div>

                {/* Poll icon */}
                <button
                  onClick={() => { setShowPollCreator(v => !v); setShowGifKeyboard(false) }}
                  title="Create poll"
                  className={`hover:text-primary-container transition-colors ${showPollCreator ? 'text-primary-container' : ''}`}
                >
                  <Icon name="poll" className="cursor-pointer text-[18px] lg:text-[24px]" />
                </button>

                {/* Emoji icon */}
                <button title="Emoji" className="hover:text-primary-container transition-colors">
                  <Icon name="sentiment_satisfied" className="cursor-pointer text-[18px] lg:text-[24px]" />
                </button>
              </div>
              <button
                onClick={handlePost}
                className="px-4 lg:px-8 py-1.5 lg:py-2 bg-primary-container text-on-primary-fixed font-bold text-sm lg:text-base border border-on-background/20 lg:neo-border lg:neo-shadow-sm active:scale-95 transition-all"
              >
                Post
              </button>
            </div>

            {/* Poll creator (inline below toolbar) */}
            {showPollCreator && !poll && (
              <PollCreator
                onAdd={(p) => { setPoll(p); setShowPollCreator(false) }}
                onClose={() => setShowPollCreator(false)}
              />
            )}
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <div className="flex gap-2 lg:gap-4 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`shrink-0 px-3 lg:px-6 py-1 lg:py-2 text-sm lg:text-base font-bold border border-on-background/20 lg:neo-border transition-colors ${
              activeFilter === cat.id
                ? 'bg-primary-container text-on-primary-fixed lg:neo-shadow-sm'
                : 'bg-surface-container hover:bg-primary-container/20 text-on-background'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-[40px] opacity-30">wifi_off</span>
          <p className="font-bold text-sm uppercase tracking-widest opacity-50">Unable to load posts</p>
          <p className="text-xs opacity-40">{error}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))}
          {!loading && filteredPosts.length === 0 && (
            <p className="text-center text-on-surface-variant py-12">No posts in this category yet.</p>
          )}
        </div>
      )}

      <div className="h-20 md:h-0" />

      {/* Right Sidebar is rendered here for layout reasons */}
      <RightSidebar
        suggestedUsers={suggested}
        trendingTopics={trendingTopics}
        onFollow={handleFollow}
      />
    </div>
  )
}
