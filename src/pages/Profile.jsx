import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getCurrentUser, getMyLeaderboardStats, getUserPosts } from '../services/api'

// Referral code derived from user id (in production, comes from backend)
// Influence score config
const INFLUENCE_MAX = 100000
const TIER_THRESHOLDS = [
  { label: 'Bronze',   min: 0,      max: 10000,  color: 'bg-amber-700' },
  { label: 'Silver',   min: 10000,  max: 30000,  color: 'bg-slate-400' },
  { label: 'Gold',     min: 30000,  max: 60000,  color: 'bg-primary-container' },
  { label: 'Diamond',  min: 60000,  max: 100000, color: 'bg-cyan-400' },
]

function PostSkeleton() {
  return (
    <div className="border border-on-background/10 lg:neo-border bg-background p-3 lg:p-4 animate-pulse">
      <div className="flex justify-between items-center mb-2">
        <div className="h-2.5 bg-on-background/10 w-28" />
        <div className="h-2 bg-on-background/10 w-16" />
      </div>
      <div className="flex flex-col gap-1.5 mb-3">
        <div className="h-3 bg-on-background/10 w-full" />
        <div className="h-3 bg-on-background/10 w-5/6" />
        <div className="h-3 bg-on-background/10 w-4/6" />
      </div>
    </div>
  )
}

export default function Profile() {
  const [user, setUser] = useState(null)
  const [myStats, setMyStats] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [copied, setCopied] = useState(false)
  const [postsLoading, setPostsLoading] = useState(true)
  const { user: authUser, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [profileError, setProfileError] = useState(null)

  useEffect(() => {
    setProfileError(null)
    getCurrentUser()
      .then(setUser)
      .catch(err => { setProfileError(err.message); setUser(authUser) })
    getMyLeaderboardStats().then(setMyStats).catch(() => {})
    setPostsLoading(true)
    getUserPosts()
      .then(data => setUserPosts(Array.isArray(data) ? data : data.posts ?? []))
      .catch(() => toast.error('Could not load your posts'))
      .finally(() => setPostsLoading(false))
  }, [authUser])

  const influenceScore = myStats?.influence?.score ?? 0
  const influencePct = Math.min((influenceScore / INFLUENCE_MAX) * 100, 100)
  const currentTier = TIER_THRESHOLDS.findLast((t) => influenceScore >= t.min) || TIER_THRESHOLDS[0]
  const nextTier = TIER_THRESHOLDS[TIER_THRESHOLDS.indexOf(currentTier) + 1]

  const referralCode = user?.id ? 'CHI-' + user.id.replace('u_', '').padStart(6, '0') + '-X9K2' : ''
  const referralLink = referralCode ? `https://chicago.web3/join?ref=${referralCode}` : ''

  if (!user) {
    return (
      <div className="flex-1 lg:ml-[300px] w-full max-w-3xl flex items-center justify-center py-20">
        {profileError ? (
          <div className="flex flex-col items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-[40px] opacity-30">wifi_off</span>
            <p className="font-bold text-sm uppercase tracking-widest opacity-50">Failed to load profile</p>
          </div>
        ) : (
          <div className="w-8 h-8 border-[3px] border-on-background border-t-transparent animate-spin" />
        )}
      </div>
    )
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex-1 lg:ml-[300px] w-full max-w-3xl flex flex-col gap-4 lg:gap-8">

      {/* Cover + Avatar */}
      <section>
        <div className="w-full h-28 lg:h-40 bg-primary-container border border-on-background/10 lg:neo-border lg:neo-shadow" />
        <div className="bg-surface-container border border-on-background/10 border-t-0 lg:neo-border lg:border-t-0 p-3 lg:p-6">
          <div className="flex justify-between items-start mb-3 lg:mb-4">
            <div className="-mt-10 lg:-mt-16 w-16 h-16 lg:w-24 lg:h-24 border-2 border-on-background/20 lg:neo-border overflow-hidden bg-surface-container flex items-center justify-center">
              {user.avatar
                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                : null}
              <div style={{ display: user.avatar ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">
                <Icon name="person" className="text-[32px] lg:text-[48px] text-on-surface-variant/40" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <NavLink
                to="/profile/edit"
                className="flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-1.5 lg:py-2 border border-on-background/15 lg:neo-border bg-background font-bold text-[11px] lg:text-[12px] uppercase hover:bg-primary-container/10 transition-colors"
              >
                <Icon name="edit" className="text-[14px] lg:text-[16px]" />
                Edit Profile
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-1.5 lg:py-2 border border-on-background/15 lg:neo-border bg-background font-bold text-[11px] lg:text-[12px] uppercase hover:bg-error/10 hover:border-error hover:text-error transition-colors"
              >
                <Icon name="logout" className="text-[14px] lg:text-[16px]" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
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

          {/* Stats row */}
          <div className="flex gap-4 lg:gap-6 mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-on-background/10">
            {[
              { label: 'Posts',     value: (user.posts ?? 0).toLocaleString() },
              { label: 'Followers', value: (user.followers ?? 0) >= 1000 ? `${((user.followers ?? 0) / 1000).toFixed(1)}k` : (user.followers ?? 0) },
              { label: 'Following', value: user.following ?? 0 },
              { label: 'CLT Held',  value: (user.cltHeld ?? 0).toLocaleString(), accent: true },
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

      {/* Influence Score */}
      <section className="bg-surface-container border border-on-background/10 lg:neo-border lg:neo-shadow p-3 lg:p-6">
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <h2 className="font-headline-md text-sm lg:text-headline-md uppercase font-black flex items-center gap-2">
            <Icon name="bolt" filled className="text-primary-container text-[18px] lg:text-[22px]" />
            Influence Score
          </h2>
          <div className="flex items-baseline gap-1">
            <span className="text-[22px] lg:text-[32px] font-extrabold text-primary-container leading-none">
              {influenceScore.toLocaleString()}
            </span>
            <span className="text-[10px] lg:text-[12px] text-on-surface-variant font-mono uppercase">
              / {(INFLUENCE_MAX / 1000).toFixed(0)}k
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-3 lg:h-4 bg-background border border-on-background/15 lg:neo-border overflow-hidden mb-2">
          <div
            className="h-full bg-primary-container transition-all duration-700"
            style={{ width: `${influencePct}%` }}
          />
          {/* Tier tick marks */}
          {TIER_THRESHOLDS.slice(1).map((t) => (
            <div
              key={t.label}
              className="absolute top-0 h-full w-px bg-on-background/20"
              style={{ left: `${(t.min / INFLUENCE_MAX) * 100}%` }}
            />
          ))}
        </div>

        {/* Tier labels */}
        <div className="flex justify-between text-[9px] lg:text-[10px] uppercase font-bold text-on-surface-variant mb-3 lg:mb-4">
          {TIER_THRESHOLDS.map((t) => (
            <span
              key={t.label}
              className={t.label === currentTier.label ? 'text-primary-container' : ''}
            >
              {t.label}
            </span>
          ))}
        </div>

        {/* Current tier + next milestone */}
        <div className="flex items-center justify-between bg-background border border-on-background/10 lg:neo-border p-2 lg:p-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] lg:text-[12px] uppercase font-bold text-on-surface-variant">Current Tier</span>
            <span className="px-2 py-0.5 bg-primary-container text-on-primary-fixed text-[10px] lg:text-[11px] font-bold uppercase tracking-wider">
              {currentTier.label}
            </span>
          </div>
          {nextTier && (
            <div className="text-right">
              <span className="text-[10px] lg:text-[11px] text-on-surface-variant font-mono">
                +{(nextTier.min - influenceScore).toLocaleString()} pts → <strong>{nextTier.label}</strong>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Referral Link */}
      <section className="bg-surface-container border border-on-background/10 lg:neo-border lg:neo-shadow p-3 lg:p-6">
        <h2 className="font-headline-md text-sm lg:text-headline-md uppercase font-black mb-1 lg:mb-2 flex items-center gap-2">
          <Icon name="group_add" className="text-primary-container text-[18px] lg:text-[22px]" />
          Referral Link
        </h2>
        <p className="text-[11px] lg:text-[12px] text-on-surface-variant mb-3 lg:mb-4">
          Invite friends to Chicago and earn <span className="text-primary-container font-bold">+500 CLT</span> for each sign-up.
        </p>

        {/* Link box */}
        <div className="flex items-stretch gap-0 border border-on-background/15 lg:neo-border overflow-hidden">
          <div className="flex-1 bg-background px-3 py-2 lg:py-3 font-mono text-[11px] lg:text-[13px] text-on-surface-variant truncate select-all">
            {referralLink}
          </div>
          <button
            onClick={handleCopy}
            className={`shrink-0 flex items-center gap-1.5 px-3 lg:px-4 py-2 lg:py-3 font-bold text-[11px] lg:text-[12px] uppercase tracking-wider transition-all
              ${copied
                ? 'bg-green-600 text-white'
                : 'bg-primary-container text-on-primary-fixed hover:brightness-105 active:scale-95'
              }`}
          >
            <Icon name={copied ? 'check' : 'content_copy'} className="text-[14px] lg:text-[16px]" />
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Referral code */}
        <div className="flex items-center gap-2 mt-2 lg:mt-3">
          <span className="text-[10px] lg:text-[11px] text-on-surface-variant uppercase font-bold">Code:</span>
          <span className="font-mono text-[11px] lg:text-[13px] text-primary-container tracking-widest">{referralCode}</span>
        </div>
      </section>

      {/* Posts */}
      <section className="bg-surface-container border border-on-background/10 lg:neo-border lg:neo-shadow p-3 lg:p-6">
        <div className="flex justify-between items-center mb-3 lg:mb-6">
          <h2 className="font-headline-md text-sm lg:text-headline-md uppercase font-black">All Posts</h2>
          <Icon name="sort" className="cursor-pointer" />
        </div>
        {postsLoading ? (
          <div className="flex flex-col gap-3 lg:gap-4">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : userPosts.length === 0 ? (
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
                {post.images?.length > 0 && (
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
