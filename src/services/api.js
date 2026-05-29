/**
 * ============================================================
 *  CHICAGO WEB3 — API SERVICE
 * ============================================================
 *  Auth uses HttpOnly cookies (set by backend on login).
 *  No tokens in localStorage. credentials:'include' on every call.
 *  On 401 → auto-attempt /auth/refresh → retry → if still 401,
 *  fire onUnauthorized() so AuthContext can clear state.
 * ============================================================
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// ── 401 broadcast ──────────────────────────────────────────────
const unauthorizedCallbacks = new Set()
export function onUnauthorized(cb) {
  unauthorizedCallbacks.add(cb)
  return () => unauthorizedCallbacks.delete(cb)
}
function notifyUnauthorized() {
  unauthorizedCallbacks.forEach(cb => cb())
}

// ── Token refresh (single in-flight promise, queues callers) ──
let refreshPromise = null

async function attemptRefresh() {
  if (refreshPromise) return refreshPromise
  refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then(r => r.ok)
    .catch(() => false)
    .finally(() => { refreshPromise = null })
  return refreshPromise
}

// ── Core fetch wrapper ─────────────────────────────────────────
async function request(path, options = {}, isRetry = false) {
  if (!BASE_URL) {
    throw new Error('API not configured: set VITE_API_BASE_URL in your .env file')
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',           // always send cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  // 401 → try refresh once, then retry the original call
  if (res.status === 401 && !isRetry) {
    const refreshed = await attemptRefresh()
    if (refreshed) {
      return request(path, options, true)  // retry
    }
    // Refresh also failed → session is truly gone
    notifyUnauthorized()
    throw new Error('Session expired. Please sign in again.')
  }

  if (!res.ok) {
    let message = `API error ${res.status}`
    try {
      const body = await res.json()
      message = body.message || body.error || message
    } catch { /* ignore */ }
    throw new Error(message)
  }

  // 204 No Content
  if (res.status === 204) return {}

  return res.json()
}

// ─── AUTH ──────────────────────────────────────────────────────

/**
 * Check if the user is currently authenticated.
 * Backend reads the HttpOnly cookie and returns the user or 401.
 * Returns null if not authenticated (never throws).
 */
export const getMe = () =>
  request('/auth/me').catch(() => null)

export const requestMagicLink = (email) =>
  request('/auth/magic-link', { method: 'POST', body: JSON.stringify({ email }) })

/**
 * Verify magic link token. Backend sets HttpOnly access + refresh cookies.
 * Returns the user object.
 */
export const verifyMagicLink = (token) =>
  request('/auth/magic-link/verify', { method: 'POST', body: JSON.stringify({ token }) })

export const connectWallet = (address) =>
  request('/auth/wallet/connect', { method: 'POST', body: JSON.stringify({ address }) })

// ─── FEED ──────────────────────────────────────────────────────
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

// ─── COMMENTS ──────────────────────────────────────────────────
export const getComments = (postId) =>
  request(`/posts/${postId}/comments`)

export const createComment = (postId, content) =>
  request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) })

export const createReply = (postId, commentId, content) =>
  request(`/posts/${postId}/comments/${commentId}/replies`, { method: 'POST', body: JSON.stringify({ content }) })

export const likeComment = (commentId) =>
  request(`/comments/${commentId}/like`, { method: 'POST' })

export const unlikeComment = (commentId) =>
  request(`/comments/${commentId}/like`, { method: 'DELETE' })

export const likeReply = (replyId) =>
  request(`/replies/${replyId}/like`, { method: 'POST' })

export const unlikeReply = (replyId) =>
  request(`/replies/${replyId}/like`, { method: 'DELETE' })

// ─── USERS ─────────────────────────────────────────────────────
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

// ─── LEADERBOARD ───────────────────────────────────────────────
export const getLeaderboard = (type = 'creators') =>
  request(`/leaderboard?type=${type}`)

export const getMyLeaderboardStats = () =>
  request('/leaderboard/me')

// ─── STAKING ───────────────────────────────────────────────────
export const getStakingInfo = () =>
  request('/staking/info')

export const stakeTokens = (amount, durationDays) =>
  request('/staking/stake', { method: 'POST', body: JSON.stringify({ amount, durationDays }) })

export const unstakeTokens = (amount) =>
  request('/staking/unstake', { method: 'POST', body: JSON.stringify({ amount }) })

export const claimRewards = () =>
  request('/staking/claim-rewards', { method: 'POST' })

// ─── MARKETPLACE ───────────────────────────────────────────────
export const getMarketplaceCampaigns = (period = '3d') =>
  request(`/marketplace/campaigns?period=${period}`)

export const getMarketplaceAds = (period = '3d') =>
  getMarketplaceCampaigns(period)

export const getMarketplacePricing = (duration = '3d') =>
  request(`/marketplace/pricing?duration=${duration}`)

export const createCampaign = (payload) =>
  request('/marketplace/campaigns', { method: 'POST', body: JSON.stringify(payload) })

// ─── NETWORK ───────────────────────────────────────────────────
export const getNetworkStats = () =>
  request('/network/stats')

// ─── ADMIN AUTH ────────────────────────────────────────────────
// Admin still uses cookies (credentials:include) for session.
// During OTP step, tempToken is sent as Bearer via sessionStorage.

function getAdminTempHeader() {
  try {
    const token = sessionStorage.getItem('admin_temp_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

async function adminRequest(path, options = {}) {
  if (!BASE_URL) throw new Error('API not configured: set VITE_API_BASE_URL in your .env file')
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAdminTempHeader(),
      ...options.headers,
    },
  })
  if (!res.ok) {
    let message = `API error ${res.status}`
    try {
      const body = await res.json()
      message = body.message || body.error || message
    } catch { /* ignore */ }
    throw new Error(message)
  }
  if (res.status === 204) return {}
  return res.json()
}

export const adminLogin = (email, password) =>
  adminRequest('/auth/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const adminVerifyOtp = (email, otp) =>
  adminRequest('/auth/admin/login/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) })

export const adminForgotPassword = (email) =>
  adminRequest('/auth/admin/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })

export const adminResetPassword = (token, password) =>
  adminRequest('/auth/admin/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) })

export const adminVerifyEmail = (token) =>
  adminRequest('/auth/admin/verify-email', { method: 'POST', body: JSON.stringify({ token }) })

export const adminSendInvite = (email) =>
  adminRequest('/auth/admin/invites', { method: 'POST', body: JSON.stringify({ email }) })

export const adminRegister = (payload) =>
  adminRequest('/auth/admin/register', { method: 'POST', body: JSON.stringify(payload) })

// ─── ADMIN DASHBOARD ───────────────────────────────────────────
export const adminGetStats = () =>
  adminRequest('/admin/stats')

export const adminGetActivityLog = () =>
  adminRequest('/admin/activity-log')

export const adminGetUsers = ({ search = '', filter = 'all', page = 1 } = {}) =>
  adminRequest(`/admin/users?search=${encodeURIComponent(search)}&filter=${filter}&page=${page}`)

export const adminUpdateUser = (userId, payload) =>
  adminRequest(`/admin/users/${userId}`, { method: 'PATCH', body: JSON.stringify(payload) })

export const adminSuspendUser = (userId) =>
  adminRequest(`/admin/users/${userId}/suspend`, { method: 'POST' })

export const adminUnsuspendUser = (userId) =>
  adminRequest(`/admin/users/${userId}/unsuspend`, { method: 'POST' })

export const adminGetCampaigns = () =>
  adminRequest('/admin/campaigns')

export const adminUpdateCampaign = (campaignId, payload) =>
  adminRequest(`/admin/campaigns/${campaignId}`, { method: 'PATCH', body: JSON.stringify(payload) })

export const adminDeleteCampaign = (campaignId) =>
  adminRequest(`/admin/campaigns/${campaignId}`, { method: 'DELETE' })

export const adminCreateCampaign = (payload) =>
  adminRequest('/admin/campaigns', { method: 'POST', body: JSON.stringify(payload) })

export const adminGetTeam = () =>
  adminRequest('/admin/team')

export const adminUpdateTeamMember = (adminId, payload) =>
  adminRequest(`/admin/team/${adminId}`, { method: 'PATCH', body: JSON.stringify(payload) })

export const adminRemoveTeamMember = (adminId) =>
  adminRequest(`/admin/team/${adminId}`, { method: 'DELETE' })

export const adminInvite = (email) =>
  adminRequest('/admin/invite', { method: 'POST', body: JSON.stringify({ email }) })


// ─── LEGACY ALIASES (keep old import names working) ───────────
export const getCurrentUser = getMe
export const adminVerify2FA = (code) => adminVerifyOtp('', code)
export const adminResend2FA = () => Promise.resolve()
export const adminValidateSetupToken = () => Promise.resolve({ valid: true })
export const adminSetup = (payload) =>
  adminRequest('/auth/admin/register', { method: 'POST', body: JSON.stringify(payload) })
export const adminValidateInviteToken = () => Promise.resolve({ valid: true, email: '' })

export default {
  getMe,
  requestMagicLink, verifyMagicLink, connectWallet,
  getFeedPosts, getFeedCategories, createPost, likePost, unlikePost, getTrendingTopics,
  getComments, createComment, createReply, likeComment, unlikeComment, likeReply, unlikeReply,
  getUser, getSuggestedUsers, followUser, unfollowUser, updateProfile, getUserPosts,
  getLeaderboard, getMyLeaderboardStats,
  getStakingInfo, stakeTokens, unstakeTokens, claimRewards,
  getMarketplaceCampaigns, getMarketplaceAds, getMarketplacePricing, createCampaign,
  getNetworkStats,
  adminLogin, adminVerifyOtp, adminForgotPassword, adminResetPassword,
  adminVerifyEmail, adminSendInvite, adminRegister,
  adminGetStats, adminGetActivityLog,
  adminGetUsers, adminUpdateUser, adminSuspendUser, adminUnsuspendUser,
  adminGetCampaigns, adminUpdateCampaign, adminDeleteCampaign, adminCreateCampaign,
  adminGetTeam, adminUpdateTeamMember, adminRemoveTeamMember, adminInvite,
}
