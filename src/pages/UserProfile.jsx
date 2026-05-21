import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Layout'
import { feedPosts, currentUser } from '../data/mockData'
// BACKEND: import api from '../services/api'
// useEffect(() => { api.getUser(userId).then(setUser) }, [userId])

// Simulated user lookup from post authors
function getUserById(id) {
  const allAuthors = feedPosts.map((p) => p.author)
  const found = allAuthors.find((a) => a.id === id)
  if (!found) return null
  // Enrich with fake profile data for demo
  const extras = {
    u_002: { bio: 'Cross-chain architect & DAO engineer. Building the infrastructure for the next wave of decentralised finance.', website: 'devzero.eth', posts: 832, followers: 12400, following: 204, cltHeld: 28000 },
    u_003: { bio: 'Generative NFT artist. Creator of the Chicago Skyline series. Merging brutalist aesthetics with on-chain permanence.', website: 'artblock.sol', posts: 510, followers: 9100, following: 317, cltHeld: 11000 },
  }
  return { ...found, ...(extras[id] || { bio: 'Chicago Web3 community member.', posts: 120, followers: 1800, following: 90, cltHeld: 3000 }) }
}

export default function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const user = getUserById(userId)
  const [following, setFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(user?.followers ?? 0)

  if (!user) {
    return (
      <div className="flex-1 lg:ml-[300px] w-full max-w-3xl flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-on-surface-variant text-lg font-bold uppercase">User not found</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-primary-container text-on-primary-fixed font-bold text-sm uppercase border border-on-background/20 lg:neo-border">
          Back to Feed
        </button>
      </div>
    )
  }

  const userPosts = feedPosts.filter((p) => p.author.id === userId)

  const handleFollow = () => {
    // BACKEND: await api.followUser(userId)
    setFollowing((v) => !v)
    setFollowerCount((c) => following ? c - 1 : c + 1)
  }

  const isOwnProfile = userId === currentUser.id

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
                onClick={handleFollow}
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
