/**
 * ============================================================
 *  CHICAGO WEB3 — API SERVICE
 * ============================================================
 *  Set VITE_API_BASE_URL in your .env to point at the backend.
 *  All calls hit the real backend — no mock fallbacks.
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

function getAuthHeaders() {
  try {
    const user = JSON.parse(localStorage.getItem('chicago_user') || 'null')
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {}
  } catch {
    return {}
  }
}

function getAdminAuthHeaders() {
  try {
    const token = sessionStorage.getItem('admin_temp_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

async function request(path, options = {}) {
  if (!BASE_URL) {
    throw new Error('API not configured: set VITE_API_BASE_URL in your .env file')
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
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
      message = body.message || body.error || message
    } catch { /* ignore parse errors */ }
    throw new Error(message)
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
      ...getAdminAuthHeaders(),
      ...options.headers,
    },
    ...options,
  })
  if (!res.ok) {
    let message = `API error ${res.status}`
    try {
      const body = await res.json()
      message = body.message || body.error || message
    } catch { /* ignore parse errors */ }
    throw new Error(message)
  }
  return res.json()
}

// ─── AUTH ─────────────────────────────────────────────────────
export const requestMagicLink = (email) =>
  request('/auth/magic-link', { method: 'POST', body: JSON.stringify({ email }) })

export const verifyMagicLink = (token) =>
  request('/auth/magic-link/verify', { method: 'POST', body: JSON.stringify({ token }) })

export const getCurrentUser = () =>
  request('/auth/me')

export const connectWallet = (address) =>
  request('/auth/wallet/connect', { method: 'POST', body: JSON.stringify({ address }) })

// ─── FEED ─────────────────────────────────────────────────────
export const getFeedPosts = (filter = 'general', page = 1) =>
  request(`/feed/posts?filter=${filter}&page=${page}`)

export const getFeedCategories = () =>
  request('/feed/categories')

export const createPost = (payload) =>
  request('/feed/posts', { method: 'POST', body: JSON.stringify(payload) })

export const likePost = (postId) =>
  request(`/posts/${postId}/like`, { method: 'POST' })

export const unlikePost = (postId) =>
  request(`/posts/${postId}/like`, { method: 'DELETE' })

export const getTrendingTopics = () =>
  request('/feed/trending')

// ─── COMMENTS ─────────────────────────────────────────────────
export const getComments = (postId) =>
  request(`/posts/${postId}/comments`)

export const createComment = (postId, content) =>
  request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) })

// ─── USERS ────────────────────────────────────────────────────
export const getUser = (userId) =>
  request(`/users/${userId}`)

export const getSuggestedUsers = () =>
  request('/users/suggestions')

export const followUser = (userId) =>
  request(`/users/${userId}/follow`, { method: 'POST' })

export const unfollowUser = (userId) =>
  request(`/users/${userId}/follow`, { method: 'DELETE' })

export const updateProfile = (payload) =>
  request('/users/me', { method: 'PATCH', body: JSON.stringify(payload) })

export const getUserPosts = (page = 1) =>
  request(`/users/me/posts?page=${page}`)

// ─── LEADERBOARD ──────────────────────────────────────────────
export const getLeaderboard = (type = 'creators') =>
  request(`/leaderboard?type=${type}`)

export const getMyLeaderboardStats = () =>
  request('/leaderboard/me')

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
export const adminLogin = (email, password) =>
  adminRequest('/admin/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const adminVerify2FA = (code) =>
  adminRequest('/admin/auth/verify-2fa', { method: 'POST', body: JSON.stringify({ code }) })

export const adminResend2FA = () =>
  adminRequest('/admin/auth/resend-2fa', { method: 'POST' })

export const adminValidateSetupToken = (token) =>
  adminRequest(`/admin/auth/validate-setup-token?token=${token}`)

export const adminSetup = (payload) =>
  adminRequest('/admin/auth/setup', { method: 'POST', body: JSON.stringify(payload) })

export const adminValidateInviteToken = (token) =>
  adminRequest(`/admin/auth/validate-invite?token=${token}`)

export const adminRegister = (payload) =>
  adminRequest('/admin/auth/register', { method: 'POST', body: JSON.stringify(payload) })

export const adminInvite = (email) =>
  adminRequest('/admin/invite', { method: 'POST', body: JSON.stringify({ email }) })

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
  requestMagicLink, verifyMagicLink, getCurrentUser, connectWallet,
  getFeedPosts, getFeedCategories, createPost, likePost, unlikePost, getTrendingTopics,
  getComments, createComment,
  getUser, getSuggestedUsers, followUser, unfollowUser, updateProfile, getUserPosts,
  getLeaderboard, getMyLeaderboardStats,
  getStakingInfo, stakeTokens, unstakeTokens, claimRewards,
  getMarketplaceCampaigns, getMarketplaceAds, getMarketplacePricing, createCampaign,
  getNetworkStats,
  adminLogin, adminVerify2FA, adminResend2FA,
  adminValidateSetupToken, adminSetup,
  adminValidateInviteToken, adminRegister,
  adminInvite,
  adminGetStats, adminGetActivityLog,
  adminGetUsers, adminUpdateUser, adminSuspendUser, adminUnsuspendUser,
  adminGetCampaigns, adminUpdateCampaign, adminDeleteCampaign, adminCreateCampaign,
  adminGetTeam, adminUpdateTeamMember, adminRemoveTeamMember,
}
