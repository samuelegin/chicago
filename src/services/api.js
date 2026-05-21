/**
 * ============================================================
 *  CHICAGO WEB3 — API SERVICE
 * ============================================================
 *  When the backend is ready:
 *    1. Set VITE_API_BASE_URL in your .env file
 *    2. Replace mock imports in each component/page with
 *       the corresponding api.* call below
 *    3. Delete src/data/mockData.js
 *
 *  Example swap in Feed.jsx:
 *    BEFORE:
 *      import { feedPosts } from '../data/mockData'
 *      const [posts, setPosts] = useState(feedPosts)
 *
 *    AFTER:
 *      const [posts, setPosts] = useState([])
 *      useEffect(() => { api.getFeedPosts().then(setPosts) }, [])
 * ============================================================
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

// ─── AUTH ─────────────────────────────────────────────────────
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
// GET /leaderboard?period=weekly
export const getLeaderboard = (period = 'weekly') =>
  request(`/leaderboard?period=${period}`)

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

// GET /marketplace/pricing?duration=3d
export const getMarketplacePricing = (duration = '3d') =>
  request(`/marketplace/pricing?duration=${duration}`)

// POST /marketplace/campaigns  { title, image, budget, durationDays }
export const createCampaign = (payload) =>
  request('/marketplace/campaigns', { method: 'POST', body: JSON.stringify(payload) })

// ─── NETWORK ──────────────────────────────────────────────────
// GET /network/stats
export const getNetworkStats = () => request('/network/stats')

export default {
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
  getMarketplacePricing,
  createCampaign,
  getNetworkStats,
}
