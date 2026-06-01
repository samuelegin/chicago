/**
 * ============================================================
 *  CHICAGO WEB3 — API SERVICE
 * ============================================================
 *  Routes match the live backend Swagger at:
 *  https://chicago-backend-production.up.railway.app/docs
 * ============================================================
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// Global 401 handler — pages/components subscribe to this
const unauthorizedCallbacks = new Set()
export function onUnauthorized(cb) {
  unauthorizedCallbacks.add(cb)
  return () => unauthorizedCallbacks.delete(cb)
}
function notifyUnauthorized() {
  unauthorizedCallbacks.forEach(cb => cb())
}

async function request(path, options = {}) {
  if (!BASE_URL) {
    throw new Error('API not configured: set VITE_API_BASE_URL in your .env file')
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  if (res.status === 401) {
    notifyUnauthorized()
    throw new Error('Session expired. Please sign in again.')
  }
  if (!res.ok) {
    let message = `API error ${res.status}`
    try {
      const body = await res.json()
      message = body.error || body.message || message
    } catch { /* ignore */ }
    const err = new Error(message); err.status = res.status; throw err
  }
  return res.json()
}

async function adminRequest(path, options = {}) {
  if (!BASE_URL) {
    throw new Error('API not configured: set VITE_API_BASE_URL in your .env file')
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  if (!res.ok) {
    let message = `API error ${res.status}`
    try {
      const body = await res.json()
      message = body.error || body.message || message
    } catch { /* ignore */ }
    throw new Error(message)
  }
  return res.json()
}

// ─── AUTH ─────────────────────────────────────────────────────
// POST /auth/magic-link
export const requestMagicLink = (email) =>
  request('/auth/magic-link', { method: 'POST', body: JSON.stringify({ email }) })

// POST /auth/magic-link/verify
export const verifyMagicLink = (token) =>
  request('/auth/magic-link/verify', { method: 'POST', body: JSON.stringify({ token }) })

// GET /auth/me  — Swagger confirms this exists
export const getCurrentUser = () =>
  request('/auth/me')

export const getMe = getCurrentUser

// POST /auth/wallet/connect (may not be implemented yet)
export const connectWallet = (address) =>
  request('/auth/wallet/connect', { method: 'POST', body: JSON.stringify({ address }) })

// ─── FEED / POSTS ─────────────────────────────────────────────
// Normalize a raw backend post → shape expected by PostCard
// Confirmed response: { success, data: [...posts], meta: { hasNextPage, nextCursor } }
// Each post has: id, content, userId, categoryId, isPublished, createdAt
// Author is nested as p.user, p.profile, p.author, or p.authorProfile
function normalizePost(p) {
  if (!p) return p

  // Author: try every possible nesting the backend might use
  const src = p.author ?? p.user ?? p.profile ?? p.authorProfile ?? {}
  const prof = src.profile ?? src ?? {}
  const author = {
    id:     src.id      ?? p.userId   ?? p.authorId ?? '',
    name:   prof.fullName ?? src.fullName ?? src.name ?? src.displayName ?? 'Anonymous',
    handle: prof.username  ? `@${prof.username}`
          : src.username   ? `@${src.username}`
          : (src.handle    ?? ''),
    avatar: prof.avatarUrl ?? src.avatarUrl ?? src.avatar ?? '',
  }

  // Likes: backend may use _count.likes, likeCount, likesCount, or likes (number)
  const likes = p._count?.likes ?? p.likeCount ?? p.likesCount
                ?? (typeof p.likes === 'number' ? p.likes : 0)

  // Comments: same pattern
  const comments = p._count?.comments ?? p.commentCount ?? p.commentsCount
                   ?? (typeof p.comments === 'number' ? p.comments : 0)

  // Timestamp
  const timestamp = p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }) : ''

  return { ...p, author, likes, comments, timestamp }
}

// GET /api/posts — confirmed shape: { success, data, meta: { hasNextPage, nextCursor } }
export const getFeedPosts = (cursor = null) =>
  request(`/posts?limit=30${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`)
    .then(data => {
      const raw = Array.isArray(data) ? data
                : Array.isArray(data.data) ? data.data
                : (data.posts ?? [])
      return {
        posts:      raw.map(normalizePost),
        hasMore:    data.meta?.hasNextPage ?? data.hasMore ?? data.meta?.hasMore ?? false,
        nextCursor: data.meta?.nextCursor  ?? data.nextCursor ?? data.cursor ?? null,
      }
    })

// GET /categories — same { success, data } envelope
export const getFeedCategories = () =>
  request('/categories')
    .then(data => Array.isArray(data) ? data : (data.data ?? data.categories ?? []))
    .catch(() => [])

// POST /categories
export const createCategory = (name, description = '') =>
  request('/categories', { method: 'POST', body: JSON.stringify({ name, description }) })

// POST /posts  (Swagger: POST /api/posts)
export const createPost = (payload) =>
  request('/posts', { method: 'POST', body: JSON.stringify(payload) })

// POST/DELETE /posts/:postId/like  — may not exist yet, catch silently
export const likePost = (postId) =>
  request(`/posts/${postId}/like`, { method: 'POST' }).catch(() => {})

export const unlikePost = (postId) =>
  request(`/posts/${postId}/like`, { method: 'DELETE' }).catch(() => {})

// Trending — not in Swagger, return empty
export const getTrendingTopics = () => Promise.resolve([])

// ─── COMMENTS ─────────────────────────────────────────────────
// Normalize comment author shape
function normalizeComment(c) {
  if (!c) return c
  const src = c.author ?? c.user ?? c.profile ?? {}
  const prof = src.profile ?? src ?? {}
  const author = {
    id:     src.id ?? c.userId ?? '',
    name:   prof.fullName ?? src.fullName ?? src.name ?? src.displayName ?? 'Anonymous',
    handle: prof.username ? `@${prof.username}` : (src.username ? `@${src.username}` : (src.handle ?? '')),
    avatar: prof.avatarUrl ?? src.avatarUrl ?? src.avatar ?? '',
  }
  const timestamp = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  }) : ''
  return { ...c, author, timestamp }
}

// GET /comment?postId=  (Swagger: GET /api/comment)
export const getComments = (postId) =>
  request(`/comment?postId=${postId}`)
    .then(data => {
      const raw = Array.isArray(data) ? data
                : Array.isArray(data.data) ? data.data
                : (data.comments ?? [])
      return raw.map(normalizeComment)
    })

// POST /comment  (Swagger: POST /api/comment)
export const createComment = (postId, content) =>
  request('/comment', { method: 'POST', body: JSON.stringify({ postId, content }) })

// Replies via /comment with parentCommentId (Swagger field name)
export const createReply = (postId, commentId, content) =>
  request('/comment', { method: 'POST', body: JSON.stringify({ postId, parentCommentId: commentId, content }) })

// ─── USERS ────────────────────────────────────────────────────
export const getUser = (userId) =>
  request(`/users/${userId}`)

// Not in Swagger — return empty gracefully
export const getSuggestedUsers = () => Promise.resolve([])

export const followUser = (userId) =>
  request(`/users/${userId}/follow`, { method: 'POST' })

export const unfollowUser = (userId) =>
  request(`/users/${userId}/follow`, { method: 'DELETE' })

// POST /profiles (create profile - first time)
// GET /profiles/:userId
export const getProfile = (userId) =>
  request(`/profiles/${userId}`)

// POST /profiles — backend identifies user from session cookie, do NOT send userId in body
export const createProfile = (_userId, payload) =>
  request('/profiles', { method: 'POST', body: JSON.stringify(payload) })

// PATCH /profiles/:userId
export const updateProfile = (userId, payload) =>
  request(`/profiles/${userId}`, { method: 'PATCH', body: JSON.stringify(payload) })// ─── LEADERBOARD ──────────────────────────────────────────────
export const getLeaderboard = (type = 'creators') =>
  request(`/leaderboard?type=${type}`)

export const getMyLeaderboardStats = () =>
  request('/leaderboard/me')

export const getUserPosts = (page = 1) =>
  request(`/users/me/posts?page=${page}`)

// ─── STAKING ──────────────────────────────────────────────────
export const getStakingInfo = () =>
  request('/staking/info')

export const stakeTokens = (amount, durationDays) =>
  request('/staking/stake', { method: 'POST', body: JSON.stringify({ amount, durationDays }) })

export const unstakeTokens = (amount) =>
  request('/staking/unstake', { method: 'POST', body: JSON.stringify({ amount }) })

export const claimRewards = () =>
  request('/staking/claim-rewards', { method: 'POST' })

// ─── MARKETPLACE ──────────────────────────────────────────────
export const getMarketplaceCampaigns = (period = '3d') =>
  request(`/marketplace/campaigns?period=${period}`)

export const getMarketplaceAds = (period = '3d') =>
  getMarketplaceCampaigns(period)

export const getMarketplacePricing = (duration = '3d') =>
  request(`/marketplace/pricing?duration=${duration}`)

export const createCampaign = (payload) =>
  request('/marketplace/campaigns', { method: 'POST', body: JSON.stringify(payload) })

// ─── NETWORK ──────────────────────────────────────────────────
export const getNetworkStats = () =>
  request('/network/stats')

// ─── ADMIN AUTH ───────────────────────────────────────────────
// Swagger: POST /auth/admin/login
export const adminLogin = (email, password) =>
  adminRequest('/auth/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) })

// Swagger: POST /auth/admin/login/verify-otp
export const adminVerify2FA = (code) =>
  adminRequest('/auth/admin/login/verify-otp', { method: 'POST', body: JSON.stringify({ code }) })

export const adminResend2FA = () =>
  adminRequest('/auth/admin/login/verify-otp', { method: 'POST' })

export const adminValidateSetupToken = (token) =>
  adminRequest(`/auth/admin/validate-setup-token?token=${token}`)

export const adminSetup = (payload) =>
  adminRequest('/auth/admin/setup', { method: 'POST', body: JSON.stringify(payload) })

// Swagger: GET /auth/admin/validate-invite (check actual param name)
export const adminValidateInviteToken = (token) =>
  adminRequest(`/auth/admin/validate-invite?token=${token}`)

// Swagger: POST /auth/admin/register
export const adminRegister = (payload) =>
  adminRequest('/auth/admin/register', { method: 'POST', body: JSON.stringify(payload) })

// Swagger: POST /auth/admin/invites
export const adminInvite = (email) =>
  adminRequest('/auth/admin/invites', { method: 'POST', body: JSON.stringify({ email }) })

// ─── ADMIN DASHBOARD ──────────────────────────────────────────
export const adminGetStats = () =>
  adminRequest('/admin/stats')

export const adminGetActivityLog = () =>
  adminRequest('/admin/activity-log')

// ─── ADMIN USER MANAGEMENT ────────────────────────────────────
export const adminGetUsers = ({ search = '', filter = 'all', page = 1 } = {}) =>
  adminRequest(`/admin/users?search=${encodeURIComponent(search)}&filter=${filter}&page=${page}`)

export const adminUpdateUser = (userId, payload) =>
  adminRequest(`/admin/users/${userId}`, { method: 'PATCH', body: JSON.stringify(payload) })

export const adminSuspendUser = (userId) =>
  adminRequest(`/admin/users/${userId}/suspend`, { method: 'POST' })

export const adminUnsuspendUser = (userId) =>
  adminRequest(`/admin/users/${userId}/unsuspend`, { method: 'POST' })

// ─── ADMIN AD MANAGER ─────────────────────────────────────────
export const adminGetCampaigns = () =>
  adminRequest('/admin/campaigns')

export const adminUpdateCampaign = (campaignId, payload) =>
  adminRequest(`/admin/campaigns/${campaignId}`, { method: 'PATCH', body: JSON.stringify(payload) })

export const adminDeleteCampaign = (campaignId) =>
  adminRequest(`/admin/campaigns/${campaignId}`, { method: 'DELETE' })

export const adminCreateCampaign = (payload) =>
  adminRequest('/admin/campaigns', { method: 'POST', body: JSON.stringify(payload) })

// ─── ADMIN TEAM ───────────────────────────────────────────────
export const adminGetTeam = () =>
  adminRequest('/admin/team')

export const adminUpdateTeamMember = (adminId, payload) =>
  adminRequest(`/admin/team/${adminId}`, { method: 'PATCH', body: JSON.stringify(payload) })

export const adminRemoveTeamMember = (adminId) =>
  adminRequest(`/admin/team/${adminId}`, { method: 'DELETE' })

export default {
  requestMagicLink, verifyMagicLink, getCurrentUser, getMe, connectWallet,
  getFeedPosts, getFeedCategories, createCategory, createPost, likePost, unlikePost, getTrendingTopics,
  getComments, createComment, createReply,
  getUser, getSuggestedUsers, followUser, unfollowUser, getProfile, createProfile, updateProfile,
  getLeaderboard, getMyLeaderboardStats, getUserPosts,
  getStakingInfo, stakeTokens, unstakeTokens, claimRewards,
  getMarketplaceCampaigns, getMarketplaceAds, getMarketplacePricing, createCampaign,
  getNetworkStats,
  adminLogin, adminVerify2FA, adminResend2FA,
  adminValidateSetupToken, adminSetup,
  adminValidateInviteToken, adminRegister, adminInvite,
  adminGetStats, adminGetActivityLog,
  adminGetUsers, adminUpdateUser, adminSuspendUser, adminUnsuspendUser,
  adminGetCampaigns, adminUpdateCampaign, adminDeleteCampaign, adminCreateCampaign,
  adminGetTeam, adminUpdateTeamMember, adminRemoveTeamMember,
}
