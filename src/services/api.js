/**
 * ============================================================
 *  CHICAGO WEB3 — API SERVICE
 * ============================================================
 *  Set VITE_API_BASE_URL in your .env file to point at the backend.
 *  All requests automatically attach the stored auth token when present.
 * ============================================================
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

function getAuthHeaders() {
  try {
    const user = JSON.parse(localStorage.getItem('chicago_user') || 'null')
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {}
  } catch {
    return {}
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

// ─── AUTH ─────────────────────────────────────────────────────
// POST /auth/magic-link  { email }
export const requestMagicLink = (email) =>
  request('/auth/magic-link', { method: 'POST', body: JSON.stringify({ email }) })

// POST /auth/magic-link/verify  { token }
export const verifyMagicLink = (token) =>
  request('/auth/magic-link/verify', { method: 'POST', body: JSON.stringify({ token }) })

// GET /auth/me
export const getCurrentUser = () => request('/auth/me')

// POST /auth/wallet/connect  { address }
export const connectWallet = (address) =>
  request('/auth/wallet/connect', { method: 'POST', body: JSON.stringify({ address }) })

// ─── FEED ─────────────────────────────────────────────────────
// GET /feed/posts?filter=general&page=1
export const getFeedPosts = (filter = 'general', page = 1) =>
  request(`/feed/posts?filter=${filter}&page=${page}`)

// GET /feed/categories
export const getFeedCategories = () => request('/feed/categories')

// POST /feed/posts  { content, images, category }
export const createPost = (payload) =>
  request('/feed/posts', { method: 'POST', body: JSON.stringify(payload) })

// POST /posts/:postId/like
export const likePost = (postId) =>
  request(`/posts/${postId}/like`, { method: 'POST' })

// DELETE /posts/:postId/like
export const unlikePost = (postId) =>
  request(`/posts/${postId}/like`, { method: 'DELETE' })

// GET /feed/trending
export const getTrendingTopics = () => request('/feed/trending')

// ─── COMMENTS ─────────────────────────────────────────────────
// GET /posts/:postId/comments
export const getComments = (postId) => request(`/posts/${postId}/comments`)

// POST /posts/:postId/comments  { content }
export const createComment = (postId, content) =>
  request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) })

// ─── USERS ────────────────────────────────────────────────────
// GET /users/:userId
export const getUser = (userId) => request(`/users/${userId}`)

// GET /users/suggestions
export const getSuggestedUsers = () => request('/users/suggestions')

// POST /users/:userId/follow
export const followUser = (userId) =>
  request(`/users/${userId}/follow`, { method: 'POST' })

// DELETE /users/:userId/follow
export const unfollowUser = (userId) =>
  request(`/users/${userId}/follow`, { method: 'DELETE' })

// PATCH /users/me  { name, bio, website, twitter, farcaster, avatar }
export const updateProfile = (payload) =>
  request('/users/me', { method: 'PATCH', body: JSON.stringify(payload) })

// ─── LEADERBOARD ──────────────────────────────────────────────
// GET /leaderboard?type=creators|stakers|rising|influence
export const getLeaderboard = (type = 'creators') =>
  request(`/leaderboard?type=${type}`)

// GET /leaderboard/me
export const getMyLeaderboardStats = () => request('/leaderboard/me')

// ─── STAKING ──────────────────────────────────────────────────
// GET /staking/info
export const getStakingInfo = () => request('/staking/info')

// POST /staking/stake  { amount, durationDays }
export const stakeTokens = (amount, durationDays) =>
  request('/staking/stake', { method: 'POST', body: JSON.stringify({ amount, durationDays }) })

// POST /staking/unstake  { amount }
export const unstakeTokens = (amount) =>
  request('/staking/unstake', { method: 'POST', body: JSON.stringify({ amount }) })

// POST /staking/claim-rewards
export const claimRewards = () =>
  request('/staking/claim-rewards', { method: 'POST' })

// ─── MARKETPLACE ──────────────────────────────────────────────
// GET /marketplace/campaigns?period=3d
export const getMarketplaceCampaigns = (period = '3d') =>
  request(`/marketplace/campaigns?period=${period}`)

export const getMarketplaceAds = (period = '3d') =>
  getMarketplaceCampaigns(period)

// GET /marketplace/pricing?duration=3d
export const getMarketplacePricing = (duration = '3d') =>
  request(`/marketplace/pricing?duration=${duration}`)

// POST /marketplace/campaigns  { title, image, budget, durationDays }
export const createCampaign = (payload) =>
  request('/marketplace/campaigns', { method: 'POST', body: JSON.stringify(payload) })

// ─── NETWORK ──────────────────────────────────────────────────
// GET /network/stats
export const getNetworkStats = () => request('/network/stats')

// ─── ADMIN ────────────────────────────────────────────────────
// POST /admin/auth/login  { email, password }
export const adminLogin = (email, password) =>
  request('/admin/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

// POST /admin/auth/verify-2fa  { adminId, code }
export const adminVerify2FA = (adminId, code) =>
  request('/admin/auth/verify-2fa', { method: 'POST', body: JSON.stringify({ adminId, code }) })

export default {
  requestMagicLink,
  verifyMagicLink,
  getCurrentUser,
  connectWallet,
  getFeedPosts,
  getFeedCategories,
  createPost,
  likePost,
  unlikePost,
  getTrendingTopics,
  getComments,
  createComment,
  getUser,
  getSuggestedUsers,
  followUser,
  unfollowUser,
  updateProfile,
  getLeaderboard,
  getMyLeaderboardStats,
  getStakingInfo,
  stakeTokens,
  unstakeTokens,
  claimRewards,
  getMarketplaceCampaigns,
  getMarketplaceAds,
  getMarketplacePricing,
  createCampaign,
  getNetworkStats,
  adminLogin,
  adminVerify2FA,
}
