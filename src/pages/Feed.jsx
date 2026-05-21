import { useState } from 'react'
import { Icon, RightSidebar } from '../components/Layout'
import PostCard from '../components/PostCard'
import {
  feedPosts,
  feedCategories,
  currentUser,
  suggestedUsers,
  trendingTopics,
} from '../data/mockData'
// BACKEND: replace mock imports above with:
//   import api from '../services/api'
//   useEffect(() => { api.getFeedPosts(activeFilter).then(setPosts) }, [activeFilter])

export default function Feed() {
  const [posts, setPosts] = useState(feedPosts)
  const [activeFilter, setActiveFilter] = useState('general')
  const [suggested, setSuggested] = useState(suggestedUsers)
  const [postContent, setPostContent] = useState('')

  const handleLike = (postId) => {
    // BACKEND: await api.likePost(postId)
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    )
  }

  const handleFollow = (userId) => {
    // BACKEND: await api.followUser(userId)
    setSuggested((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, following: !u.following } : u))
    )
  }

  const handlePost = () => {
    if (!postContent.trim()) return
    // BACKEND: await api.createPost({ content: postContent, category: activeFilter })
    const newPost = {
      id: `p_${Date.now()}`,
      author: currentUser,
      content: postContent,
      images: [],
      likes: 0,
      comments: 0,
      shares: 0,
      trending: false,
      category: 'General',
      timestamp: 'just now',
      liked: false,
    }
    setPosts([newPost, ...posts])
    setPostContent('')
  }

  const filteredPosts =
    activeFilter === 'general'
      ? posts
      : posts.filter((p) => p.category.toLowerCase().replace(' ', '-') === activeFilter)

  return (
    <div className="flex-1 lg:ml-[300px] lg:mr-[340px] max-w-2xl w-full flex flex-col gap-4 lg:gap-8 min-w-0">
      {/* Compose Box */}
      <section className="bg-surface-container border border-on-background/10 lg:neo-border lg:neo-shadow p-3 lg:p-6">
        <div className="flex gap-3">
          <img src={currentUser.avatar} alt="Me" className="w-9 h-9 lg:w-12 lg:h-12 border border-on-background/20 lg:neo-border object-cover" />
          <div className="flex-1">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full bg-background border border-on-background/15 lg:neo-border p-2 lg:p-4 text-sm lg:text-body-md focus:outline-none min-h-[70px] lg:min-h-[100px] resize-none placeholder:text-on-surface-variant text-on-surface"
              placeholder="What's on your mind?"
            />
            <div className="flex justify-between items-center mt-2 lg:mt-4">
              <div className="flex gap-2 lg:gap-4 text-on-surface-variant">
                {['image', 'gif_box', 'poll', 'sentiment_satisfied'].map((icon) => (
                  <Icon key={icon} name={icon} className="cursor-pointer hover:text-primary-container text-[18px] lg:text-[24px]" />
                ))}
              </div>
              <button
                onClick={handlePost}
                className="px-4 lg:px-8 py-1.5 lg:py-2 bg-primary-container text-on-primary-fixed font-bold text-sm lg:text-base border border-on-background/20 lg:neo-border lg:neo-shadow-sm active:scale-95 transition-all"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <div className="flex gap-2 lg:gap-4 overflow-x-auto pb-2 no-scrollbar">
        {feedCategories.map((cat) => (
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
      <div className="flex flex-col gap-6">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} onLike={handleLike} />
        ))}
        {filteredPosts.length === 0 && (
          <p className="text-center text-on-surface-variant py-12">No posts in this category yet.</p>
        )}
      </div>

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
