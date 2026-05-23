/**
 * ============================================================
 *  CHICAGO WEB3 — API SERVICE
 * ============================================================
 *  Set VITE_API_BASE_URL in your .env to point at the backend.
 *  Until then, all calls fall back to mockData automatically.
 * ============================================================
 */

import * as mock from '../data/mockData'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

function getAuthHeaders() {
  try {
    const user = JSON.parse(localStorage.getItem('chicago_user') || 'null')
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {}
  } catch {
    return {}
  }
}

async function request(path, options = {}) {
  if (!BASE_URL) throw new Error('No API URL configured')
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
export const requestMagicLink = (email) =>
  request('/auth/magic-link', { method: 'POST', body: JSON.stringify({ email }) })

export const verifyMagicLink = (token) =>
  request('/auth/magic-link/verify', { method: 'POST', body: JSON.stringify({ token }) })

export const getCurrentUser = () =>
  request('/auth/me').catch(() => mock.currentUser)

export const connectWallet = (address) =>
  request('/auth/wallet/connect', { method: 'POST', body: JSON.stringify({ address }) })

// ─── FEED ─────────────────────────────────────────────────────
export const getFeedPosts = (filter = 'general', page = 1) =>
  request(`/feed/posts?filter=${filter}&page=${page}`).catch(() => mock.feedPosts)

export const getFeedCategories = () =>
  request('/feed/categories').catch(() => mock.feedCategories)

export const createPost = (payload) =>
  request('/feed/posts', { method: 'POST', body: JSON.stringify(payload) })

export const likePost = (postId) =>
  request(`/posts/${postId}/like`, { method: 'POST' }).catch(() => ({ ok: true }))

export const unlikePost = (postId) =>
  request(`/posts/${postId}/like`, { method: 'DELETE' }).catch(() => ({ ok: true }))

export const getTrendingTopics = () =>
  request('/feed/trending').catch(() => mock.trendingTopics)

// ─── COMMENTS ─────────────────────────────────────────────────
export const getComments = (postId) =>
  request(`/posts/${postId}/comments`).catch(() =>
    mock.postComments.filter(c => c.postId === postId)
  )

export const createComment = (postId, content) =>
  request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) })

// ─── USERS ────────────────────────────────────────────────────
export const getUser = (userId) =>
  request(`/users/${userId}`).catch(() =>
    mock.mockUsers.find(u => u.id === userId) || mock.currentUser
  )

export const getSuggestedUsers = () =>
  request('/users/suggestions').catch(() => mock.suggestedUsers)

export const followUser = (userId) =>
  request(`/users/${userId}/follow`, { method: 'POST' }).catch(() => ({ ok: true }))

export const unfollowUser = (userId) =>
  request(`/users/${userId}/follow`, { method: 'DELETE' }).catch(() => ({ ok: true }))

export const updateProfile = (payload) =>
  request('/users/me', { method: 'PATCH', body: JSON.stringify(payload) })

// ─── LEADERBOARD ──────────────────────────────────────────────
export const getLeaderboard = (type = 'creators') =>
  request(`/leaderboard?type=${type}`).catch(() => ({
    creators:  mock.leaderboardCreators,
    stakers:   mock.leaderboardStakers,
    rising:    mock.leaderboardRising,
    influence: mock.leaderboardInfluence,
  }[type] || mock.leaderboardCreators))

export const getMyLeaderboardStats = () =>
  request('/leaderboard/me').catch(() => mock.leaderboardMyStats)

// ─── STAKING ──────────────────────────────────────────────────
export const getStakingInfo = () =>
  request('/staking/info').catch(() => mock.stakingInfo)

export const stakeTokens = (amount, durationDays) =>
  request('/staking/stake', { method: 'POST', body: JSON.stringify({ amount, durationDays }) })

export const unstakeTokens = (amount) =>
  request('/staking/unstake', { method: 'POST', body: JSON.stringify({ amount }) })

export const claimRewards = () =>
  request('/staking/claim-rewards', { method: 'POST' })

// ─── MARKETPLACE ──────────────────────────────────────────────
export const getMarketplaceCampaigns = (period = '3d') =>
  request(`/marketplace/campaigns?period=${period}`).catch(() => mock.marketplaceCampaigns)

export const getMarketplaceAds = (period = '3d') =>
  getMarketplaceCampaigns(period)

export const getMarketplacePricing = (duration = '3d') =>
  request(`/marketplace/pricing?duration=${duration}`).catch(() => mock.marketplacePricing)

export const createCampaign = (payload) =>
  request('/marketplace/campaigns', { method: 'POST', body: JSON.stringify(payload) })

// ─── NETWORK ──────────────────────────────────────────────────
export const getNetworkStats = () =>
  request('/network/stats').catch(() => mock.networkStats)

// ─── ADMIN ────────────────────────────────────────────────────
export const adminLogin = (email, password) =>
  request('/admin/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const adminVerify2FA = (adminId, code) =>
  request('/admin/auth/verify-2fa', { method: 'POST', body: JSON.stringify({ adminId, code }) })

export default {
  requestMagicLink, verifyMagicLink, getCurrentUser, connectWallet,
  getFeedPosts, getFeedCategories, createPost, likePost, unlikePost, getTrendingTopics,
  getComments, createComment,
  getUser, getSuggestedUsers, followUser, unfollowUser, updateProfile,
  getLeaderboard, getMyLeaderboardStats,
  getStakingInfo, stakeTokens, unstakeTokens, claimRewards,
  getMarketplaceCampaigns, getMarketplaceAds, getMarketplacePricing, createCampaign,
  getNetworkStats,
  adminLogin, adminVerify2FA,
}
