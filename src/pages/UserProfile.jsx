import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Layout'
import { getUser, getFeedPosts, followUser as apiFollowUser, unfollowUser as apiUnfollowUser } from '../services/index'

export default function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [following, setFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    setFetchError(null)
    Promise.all([
      getUser(userId),
      getFeedPosts('general'),
    ]).then(([userData, postsData]) => {
      setUser(userData)
      setFollowing(userData.isFollowing ?? false)
      setFollowerCount(userData.followers ?? 0)
      const posts = postsData.posts ?? postsData
      setUserPosts(posts.filter(p => p.author?.id === userId))
    }).catch(err => {
      setFetchError(err.message)
      setUser(null)
    })
      .finally(() => setLoading(false))
  }, [userId])

  const handleFollowToggle = async () => {
    setFollowing(f => !f)
    setFollowerCount(c => following ? c - 1 : c + 1)
    try {
      if (following) await apiUnfollowUser(userId)
      else await apiFollowUser(userId)
    } catch {
      setFollowing(f => !f)
      setFollowerCount(c => following ? c + 1 : c - 1)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 lg:ml-[300px] w-full max-w-3xl flex items-center justify-center py-20">
        <div className="w-8 h-8 border-[3px] border-on-background border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex-1 lg:ml-[300px] w-full max-w-3xl flex flex-col items-center justify-center gap-4 py-20">
        <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-30">person_off</span>
        <p className="text-on-surface-variant font-bold uppercase tracking-widest text-sm">
          {fetchError ? 'Failed to load profile' : 'User not found'}
        </p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-primary-container text-on-primary-fixed font-bold text-sm uppercase border border-on-background/20 lg:neo-border">
          Back to Feed
        </button>
      </div>
    )
  }

  const isOwnProfile = false // always viewing another user's profile from this route

  return (
    <div className="flex-1 lg:ml-[300px] w-full max-w-3xl flex flex-col gap-4 lg:gap-8">
      {/* Cover + Avatar */}
      <section>
        <div className="w-full h-28 lg:h-40 bg-primary-container border border-on-background/10 lg:neo-border lg:neo-shadow" />
        <div className="bg-surface-container border border-on-background/10 border-t-0 lg:neo-border lg:border-t-0 p-3 lg:p-6">
          <div className="flex justify-between items-start mb-3 lg:mb-4">
            <div className="-mt-10 lg:-mt-16 w-16 h-16 lg:w-24 lg:h-24 border-2 border-on-background/20 lg:neo-border overflow-hidden">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>

            {/* Follow / Unfollow button */}
            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                className={`mt-2 flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-2.5 font-bold text-[12px] lg:text-[13px] uppercase tracking-wider transition-all active:scale-95
                  ${following
                    ? 'bg-surface-container text-on-background border border-on-background/30 lg:neo-border hover:bg-error/10 hover:text-error hover:border-error/40'
                    : 'bg-primary-container text-on-primary-fixed border border-on-background/20 lg:neo-border lg:neo-shadow-sm hover:brightness-105'
                  }`}
              >
                <Icon name={following ? 'person_remove' : 'person_add'} className="text-[16px]" />
                {following ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <h1 className="font-extrabold uppercase tracking-tight leading-none text-[20px] lg:text-[28px] mb-1">{user.name}</h1>
          <p className="text-[11px] lg:text-[12px] font-mono text-on-surface-variant mb-2 lg:mb-3">{user.handle}</p>
          <p className="text-sm lg:text-body-md text-on-surface-variant max-w-xl mb-3 lg:mb-4">{user.bio}</p>

          {user.website && (
            <div className="flex items-center gap-2 text-[11px] lg:text-[12px] font-mono text-primary-container mb-3 lg:mb-4">
              <Icon name="link" className="text-[14px] lg:text-[16px]" />
              <span>{user.website}</span>
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-4 lg:gap-6 mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-on-background/10">
            {[
              { label: 'Posts', value: user.posts.toLocaleString() },
              { label: 'Followers', value: followerCount >= 1000 ? `${(followerCount / 1000).toFixed(1)}k` : followerCount },
              { label: 'Following', value: user.following },
              { label: 'CLT Held', value: user.cltHeld.toLocaleString(), accent: true },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-[9px] lg:text-[12px] uppercase text-on-surface-variant font-bold">{stat.label}</span>
                <span className={`text-base lg:text-headline-md font-bold ${stat.accent ? 'text-primary font-black' : ''}`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="bg-surface-container border border-on-background/10 lg:neo-border lg:neo-shadow p-3 lg:p-6">
        <div className="flex justify-between items-center mb-3 lg:mb-6">
          <h2 className="font-headline-md text-sm lg:text-headline-md uppercase font-black">Posts</h2>
          <Icon name="sort" className="cursor-pointer" />
        </div>
        {userPosts.length === 0 ? (
          <p className="text-on-surface-variant py-6 lg:py-8 text-center text-sm">No posts yet.</p>
        ) : (
          <div className="flex flex-col gap-3 lg:gap-6">
            {userPosts.map((post) => (
              <div key={post.id} className="border border-on-background/10 lg:neo-border bg-background p-3 lg:p-4">
                <div className="flex justify-between items-center mb-1 lg:mb-2">
                  <span className="text-[11px] lg:text-[12px] uppercase font-bold">{user.name}</span>
                  <span className="text-[9px] lg:text-[10px] text-on-surface-variant font-mono">{post.timestamp}</span>
                </div>
                <p className="text-sm lg:text-body-lg mb-3 lg:mb-4">{post.content}</p>
                {post.images.length > 0 && (
                  <img src={post.images[0]} alt="" className="border border-on-background/10 lg:neo-border w-full h-32 lg:h-40 object-cover" />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="h-20 md:h-0" />
    </div>
  )
}
