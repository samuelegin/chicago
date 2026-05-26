/**
 * ============================================================
 *  CHICAGO WEB3 — MOCK API SERVICE  (chicago-mock-preview branch)
 * ============================================================
 *  This file mirrors every function in api.js but resolves from
 *  src/data/mockData.js with a realistic async delay.
 *
 *  TO DELETE when backend is ready:
 *    1. Delete this file (mockApi.js)
 *    2. Delete src/services/index.js  (or flip VITE_USE_MOCK=false)
 *    3. All pages already import from '../services/index.js' — done.
 * ============================================================
 */

import {
  currentUser,
  feedPosts,
  feedCategories,
  postComments,
  suggestedUsers,
  trendingTopics,
  leaderboardCreators,
  leaderboardStakers,
  leaderboardRising,
  leaderboardInfluence,
  leaderboardMyStats,
  stakingInfo,
  marketplaceCampaigns,
  marketplacePricing,
  networkStats,
  mockUsers,
  mockAdmins,
} from '../data/mockData'

// Simulates network latency (ms)
const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms))

// In-memory state (lives for the session — resets on page reload, just like a real API session would)
let _posts    = [...feedPosts]
let _comments = [...postComments]
let _users    = [...suggestedUsers]
let _session  = null

// ─── AUTH ─────────────────────────────────────────────────────
export const requestMagicLink = async (email) => {
  await delay(600)
  const found = mockUsers.find((u) => u.email === email)
  if (!found) {
    // In real app this would still succeed (creates account); mock does too
    return { success: true, email }
  }
  return { success: true, email }
}

export const verifyMagicLink = async (token) => {
  await delay(500)
  // Any token works in mock mode
  const user = mockUsers[0]
  const session = { ...user, token: 'mock_token_' + Date.now() }
  _session = session
  return session
}

export const getCurrentUser = async () => {
  await delay(300)
  return _session ?? { ...currentUser, token: 'mock_token_dev' }
}

export const connectWallet = async (address) => {
  await delay(400)
  return { success: true, address }
}

// ─── FEED ─────────────────────────────────────────────────────
export const getFeedPosts = async (filter = 'general', page = 1) => {
  await delay(450)
  if (filter === 'general') return [..._posts]
  const filterKey = filter.toLowerCase().replace('-', '')
  return _posts.filter((p) =>
    p.category?.toLowerCase().replace(' ', '') === filterKey
  )
}

export const getFeedCategories = async () => {
  await delay(200)
  return [...feedCategories]
}

export const createPost = async (payload) => {
  await delay(500)
  const newPost = {
    id: `p_${Date.now()}`,
    author: _session ?? currentUser,
    content: payload.content,
    images: payload.images ?? [],
    poll: payload.poll ?? null,
    likes: 0,
    comments: 0,
    shares: 0,
    trending: false,
    category: payload.category ?? 'General',
    timestamp: 'just now',
    liked: false,
  }
  _posts = [newPost, ..._posts]
  return newPost
}

export const likePost = async (postId) => {
  await delay(150)
  _posts = _posts.map((p) =>
    p.id === postId ? { ...p, liked: true, likes: p.likes + 1 } : p
  )
  return { success: true }
}

export const unlikePost = async (postId) => {
  await delay(150)
  _posts = _posts.map((p) =>
    p.id === postId ? { ...p, liked: false, likes: Math.max(0, p.likes - 1) } : p
  )
  return { success: true }
}

export const getTrendingTopics = async () => {
  await delay(250)
  return [...trendingTopics]
}

// ─── COMMENTS ─────────────────────────────────────────────────
export const getComments = async (postId) => {
  await delay(350)
  return _comments.filter((c) => c.postId === postId)
}

export const createComment = async (postId, content) => {
  await delay(400)
  const newComment = {
    id: `c_${Date.now()}`,
    postId,
    author: _session ?? currentUser,
    content,
    likes: 0,
    timestamp: 'just now',
    liked: false,
  }
  _comments = [..._comments, newComment]
  _posts = _posts.map((p) =>
    p.id === postId ? { ...p, comments: p.comments + 1 } : p
  )
  return newComment
}

// ─── USERS ────────────────────────────────────────────────────
export const getUser = async (userId) => {
  await delay(300)
  const found = _users.find((u) => u.id === userId)
  return found ?? { ...currentUser, id: userId }
}

export const getSuggestedUsers = async () => {
  await delay(300)
  return [..._users]
}

export const followUser = async (userId) => {
  await delay(200)
  _users = _users.map((u) =>
    u.id === userId ? { ...u, following: true } : u
  )
  return { success: true }
}

export const unfollowUser = async (userId) => {
  await delay(200)
  _users = _users.map((u) =>
    u.id === userId ? { ...u, following: false } : u
  )
  return { success: true }
}

export const updateProfile = async (payload) => {
  await delay(500)
  _session = _session ? { ..._session, ...payload } : { ...currentUser, ...payload }
  return _session
}

// ─── LEADERBOARD ──────────────────────────────────────────────
const _leaderboardMap = {
  creators:  leaderboardCreators,
  stakers:   leaderboardStakers,
  rising:    leaderboardRising,
  influence: leaderboardInfluence,
}

export const getLeaderboard = async (type = 'creators') => {
  await delay(400)
  return _leaderboardMap[type] ?? leaderboardCreators
}

export const getMyLeaderboardStats = async () => {
  await delay(300)
  return { ...leaderboardMyStats }
}

// ─── STAKING ──────────────────────────────────────────────────
let _staking = { ...stakingInfo }

export const getStakingInfo = async () => {
  await delay(350)
  return { ..._staking }
}

export const stakeTokens = async (amount, durationDays) => {
  await delay(600)
  _staking = {
    ..._staking,
    totalStaked: _staking.totalStaked + Number(amount),
    lockDurationDays: durationDays,
  }
  return { success: true, ..._staking }
}

export const unstakeTokens = async (amount) => {
  await delay(600)
  _staking = {
    ..._staking,
    totalStaked: Math.max(0, _staking.totalStaked - Number(amount)),
  }
  return { success: true, ..._staking }
}

export const claimRewards = async () => {
  await delay(700)
  _staking = { ..._staking, pendingRewards: 0 }
  return { success: true, claimed: _staking.pendingRewards }
}

// ─── MARKETPLACE ──────────────────────────────────────────────
let _campaigns = [...marketplaceCampaigns]
let _pricing   = { ...marketplacePricing }

export const getMarketplaceCampaigns = async (period = '3d') => {
  await delay(400)
  return [..._campaigns]
}

export const getMarketplaceAds = getMarketplaceCampaigns

export const getMarketplacePricing = async (duration = '3d') => {
  await delay(200)
  return { ..._pricing, selectedDuration: duration.toUpperCase() }
}

export const createCampaign = async (payload) => {
  await delay(600)
  const newCampaign = {
    id: `camp_${Date.now()}`,
    ...payload,
    status: 'active',
    clicks: 0,
    impressions: 0,
    spent: 0,
  }
  _campaigns = [newCampaign, ..._campaigns]
  return newCampaign
}

// ─── NETWORK ──────────────────────────────────────────────────
export const getNetworkStats = async () => {
  await delay(300)
  return { ...networkStats }
}

// ─── ADMIN AUTH ───────────────────────────────────────────────
export const adminLogin = async (email, password) => {
  await delay(600)
  const admin = mockAdmins.find((a) => a.email === email && a.password === password)
  if (!admin) throw new Error('Invalid credentials')
  return { success: true, requiresTwoFactor: true }
}

export const adminVerify2FA = async (code) => {
  await delay(500)
  if (code !== '123456') throw new Error('Invalid 2FA code')
  return { success: true, token: 'mock_admin_token_' + Date.now() }
}

export const adminResend2FA = async () => {
  await delay(300)
  return { success: true }
}

export const adminValidateSetupToken = async (token) => {
  await delay(300)
  return { valid: true, token }
}

export const adminSetup = async (payload) => {
  await delay(600)
  return { success: true }
}

export const adminValidateInviteToken = async (token) => {
  await delay(300)
  return { valid: true, token }
}

export const adminRegister = async (payload) => {
  await delay(600)
  return { success: true }
}

export const adminInvite = async (email) => {
  await delay(400)
  return { success: true, email }
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────
export const adminGetStats = async () => {
  await delay(400)
  return {
    totalUsers: 2481,
    activeToday: 342,
    totalPosts: 18720,
    totalStaked: '1.2M CLT',
    activeCampaigns: 38,
    revenue: '48.2 ETH',
  }
}

export const adminGetActivityLog = async () => {
  await delay(400)
  return [
    { id: 1, action: 'User registered', user: 'neon_flux.eth', time: '2m ago' },
    { id: 2, action: 'Campaign created', user: 'ChainAcademy', time: '8m ago' },
    { id: 3, action: 'Post flagged', user: 'chain_ghost.eth', time: '15m ago' },
    { id: 4, action: 'Stake deposited', user: 'void_master.eth', time: '22m ago' },
    { id: 5, action: 'User suspended', user: 'spam_bot.eth', time: '1h ago' },
  ]
}

// ─── ADMIN USER MANAGEMENT ────────────────────────────────────
export const adminGetUsers = async ({ search = '', filter = 'all', page = 1 } = {}) => {
  await delay(400)
  const allUsers = [
    { id: 'u_001', name: 'Jordan Neo', handle: '@jordan_neo.eth', email: 'user@chicago.io', role: 'user', status: 'active', joined: '2024-01-10' },
    { id: 'u_002', name: 'DevZero', handle: '@zero_layer.eth', email: 'dev@zero.io', role: 'user', status: 'active', joined: '2024-01-15' },
    { id: 'u_003', name: 'ArtBlock', handle: '@art_block.sol', email: 'art@block.io', role: 'user', status: 'active', joined: '2024-02-01' },
    { id: 'u_004', name: 'AlphaNode', handle: '@alpha_node', email: 'alpha@node.io', role: 'user', status: 'suspended', joined: '2024-02-10' },
    { id: 'u_005', name: 'ChainDev', handle: '@chain_master', email: 'chain@dev.io', role: 'user', status: 'active', joined: '2024-02-20' },
  ]
  const filtered = allUsers.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.handle.includes(search)) return false
    if (filter === 'suspended' && u.status !== 'suspended') return false
    if (filter === 'active' && u.status !== 'active') return false
    return true
  })
  return { users: filtered, total: filtered.length, page }
}

export const adminUpdateUser = async (userId, payload) => {
  await delay(400)
  return { success: true, userId, ...payload }
}

export const adminSuspendUser = async (userId) => {
  await delay(400)
  return { success: true, userId, status: 'suspended' }
}

export const adminUnsuspendUser = async (userId) => {
  await delay(400)
  return { success: true, userId, status: 'active' }
}

// ─── ADMIN AD MANAGER ─────────────────────────────────────────
export const adminGetCampaigns = async () => {
  await delay(400)
  return [..._campaigns]
}

export const adminUpdateCampaign = async (campaignId, payload) => {
  await delay(400)
  _campaigns = _campaigns.map((c) =>
    c.id === campaignId ? { ...c, ...payload } : c
  )
  return { success: true }
}

export const adminDeleteCampaign = async (campaignId) => {
  await delay(400)
  _campaigns = _campaigns.filter((c) => c.id !== campaignId)
  return { success: true }
}

export const adminCreateCampaign = async (payload) => {
  await delay(500)
  return createCampaign(payload)
}

// ─── ADMIN TEAM ───────────────────────────────────────────────
export const adminGetTeam = async () => {
  await delay(300)
  return [
    { id: 'admin_001', name: 'Chicago Admin', email: 'admin@chicago.io', role: 'superadmin', joined: '2024-01-01' },
  ]
}

export const adminUpdateTeamMember = async (adminId, payload) => {
  await delay(400)
  return { success: true, adminId, ...payload }
}

export const adminRemoveTeamMember = async (adminId) => {
  await delay(400)
  return { success: true, adminId }
}

export default {
  requestMagicLink, verifyMagicLink, getCurrentUser, connectWallet,
  getFeedPosts, getFeedCategories, createPost, likePost, unlikePost, getTrendingTopics,
  getComments, createComment,
  getUser, getSuggestedUsers, followUser, unfollowUser, updateProfile,
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
