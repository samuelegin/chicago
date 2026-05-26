/**
 * ============================================================
 *  CHICAGO WEB3 — API ROUTER
 * ============================================================
 *  Set VITE_USE_MOCK=true in .env to use mock data.
 *  When backend is ready:
 *    - Set VITE_USE_MOCK=false (or remove it)
 *    - Set VITE_API_BASE_URL=https://your-backend.com
 *  Nothing else needs to change.
 * ============================================================
 */

import * as realApi from './api'
import { onUnauthorized as _realOnUnauthorized } from './api'
import * as mockApi from './mockApi'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_BASE_URL

const api = USE_MOCK ? mockApi : realApi

export const {
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
  adminResend2FA,
  adminValidateSetupToken,
  adminSetup,
  adminValidateInviteToken,
  adminRegister,
  adminInvite,
  adminGetStats,
  adminGetActivityLog,
  adminGetUsers,
  adminUpdateUser,
  adminSuspendUser,
  adminUnsuspendUser,
  adminGetCampaigns,
  adminUpdateCampaign,
  adminDeleteCampaign,
  adminCreateCampaign,
  adminGetTeam,
  adminUpdateTeamMember,
  adminRemoveTeamMember,
} = api

// onUnauthorized is a real-API-only concern; in mock mode it's a safe no-op
export const onUnauthorized = USE_MOCK
  ? (cb) => () => {}        // mock: returns an unsubscribe noop
  : _realOnUnauthorized

export default api
