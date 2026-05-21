/**
 * ============================================================
 *  CHICAGO WEB3 — MOCK DATA
 * ============================================================
 *  Replace each object/array below with a real API call when
 *  the backend is ready.  Every section is annotated with the
 *  REST endpoint the backend should expose.
 *
 *  Pattern for swapping:
 *    BEFORE  →  import { posts } from '../data/mockData'
 *    AFTER   →  const posts = await api.get('/feed/posts')
 *
 *  See src/services/api.js for the ready-made API client.
 * ============================================================
 */

// ─── CURRENT USER ─────────────────────────────────────────────
// Endpoint: GET /auth/me
export const currentUser = {
  id: 'u_001',
  name: 'Jordan Neo',
  handle: '@jordan_neo.eth',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCG8rIH4Dxn2mNYlShmTd6eVt8zq_1mPZy00yVqedHW548TBXBtirL-qRN8CvBR85cOt5CCx7z1CCKVTZ-WQ0JSslAn-29TrVvHrC18PLRLQdUa2VBoyu7j0S9lzk3VhYPQI-CmGUrRHbhDoCmFM9EM99s-lWavGg1B962TVZTtxIj6D3VMuMUZxHlEYovyLerMC4a3gvfOwSXq3rZHZGzTxUsrhKOPFk1-vh2CH7qb6v-6Iv0s6NfYl_d8qEroRvJmmFtav3xt41B4',
  bio: 'Architect of the digital frontier. Exploring the intersection of Web3 liquidity and Brutalist aesthetics. Chicago grid enthusiast.',
  website: 'jordanneo.eth',
  twitter: '@jordan_neo',
  farcaster: '@jordan.fc',
  posts: 1284,
  followers: 8500,
  following: 492,
  cltHeld: 15000,
  cltStaked: 5000,
  walletConnected: false,
  walletAddress: null,
}

// ─── FEED POSTS ───────────────────────────────────────────────
// Endpoint: GET /feed/posts?filter=general&page=1
export const feedPosts = [
  {
    id: 'p_001',
    author: {
      id: 'u_002',
      name: 'DevZero',
      handle: '@zero_layer.eth',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhxweI5XB4NaoVsXOZdLJoaR2umH_RInP3BhAN8qJGW2pJsPsdZar46UapmcCqDalPWjpoR2zUjIarpvDCOkpzi204RJT3RwXuWCffiXsaZixiT_lh60N4V9KXPwWc0ULHd-TuUIAAjWj9gTfI0gbb6Y9yuhwaq0sl1wT9CThFTV7Qklc2kM2NO341F2eUTrl6WcfkiT2NflSQx7Q10HmoAkVM3olZvnLrDRbzHB_ndjah93I6lB4OQzrRqk7FpHTytXAt3MEOu2NL',
    },
    content: 'Just deployed the first cross-chain smart contract for the Chicago DAO treasury. Gas fees are optimized by 40% using the new batching logic. LFG! 🚀',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAd2gdrXLxBiBEm1qRJJoHRALYnT0uYCPPNPENf6CV2K70Yk3iJs7zXEXM8xQ_4Q8-2foYAhIeOHczBYXd9bRHjmNmLke173v_mRWW-RRfZ3g7tBcwRj1NGbgNDZLZVcejurEJxDi3MRzB5IT-VFAp99ktgoVocPME3jzjwbCHPDaSGS71fzFuSee-0GoYS6VzQ1y7-7F0R6zYFisHXXLYqFCOmFwTjE6ApOuwvZtBrvymcG_RerM9-q270hvnlox8zBRRQcp0ULovt',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBkdXqM3YxTa0ImPodVfqKgCMaEYBDJjU3MHx7fZbEa9_kTiyZzZiMo03rlHGgKVZdcJ5aJTpNiuWbtMy93n6m3sOG1947vBT01x2BpJkBW6RXTUoxgEzuKa8O1A7P0GFTaz0fhhh3e87e6JGtWYmZvi4V77w_1fq2gJjHJUhcI6EgE-jDURgDGFKmfzmk7Zu9PP8ZJeNygO1K8V1_9jui7096g52eY1hbLkxLgAdjHWlzWJg8QNjR5bFz2j6-vO0uWcRJ_dh3PjWyw',
    ],
    likes: 1200,
    comments: 84,
    shares: 32,
    trending: true,
    category: 'DevLog',
    timestamp: '2h ago',
    liked: false,
  },
  {
    id: 'p_002',
    author: {
      id: 'u_003',
      name: 'ArtBlock',
      handle: '@art_block.sol',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATNH21i5kL4jTaWK78FEk5H-jm0LSGARwVb7wbQDqyW9ggjF5DYPuGR9S3X1IDTNcgGewBTa3DBWQ07BydDsl1ld9aG05Rr7krOvAMw0remw4i966s0BnCbFoeCK-gaJ9VHs3dRaI9XhE8ob0QcGvJ-j0yx_O7umCm1vp-vn4AgnSuKBBbF6UssGy83uHRjYWxS8kPqWMKZFRxiJq0MHWU_VlAEgk7PIyrDkw0r8rmidr_RcImQo3tUcO5uh4jyxlog7GfB_Pv66zp',
    },
    content: 'The "Chicago Skyline" series is finally complete. 50 unique algorithmically generated pieces reflecting the city\'s spirit in the digital age. Drop your wallet addresses for the whitelist.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDBd3CYUMN7qNDtcZp0njiq-QpsNe3IYCKrgDdB13Gz8dukTGWGaAapLgrhaS0T5eAak2neQW2x8qlkrTQL-ZfEPqXy6OV5_278YTRutxfep4W_V67-H8ygRkZGYSM9L5-RMn8kzwoF6kWrD6Bo7HAIb-NWcSN74c6wGDXXi9RgiUyAWZFBoccqyc5TvVec88QU1qVbR-0PXkbpseIujbvHA34x_3AXhzXxICAkZVp0lt4q6bpKeRoycvMbWVPk920jURFM7kRopzfD',
    ],
    likes: 542,
    comments: 215,
    shares: 110,
    trending: false,
    category: 'Meme',
    timestamp: '5h ago',
    liked: false,
  },
  {
    id: 'p_003',
    author: {
      id: 'u_001',
      name: 'Jordan Neo',
      handle: '@jordan_neo.eth',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCG8rIH4Dxn2mNYlShmTd6eVt8zq_1mPZy00yVqedHW548TBXBtirL-qRN8CvBR85cOt5CCx7z1CCKVTZ-WQ0JSslAn-29TrVvHrC18PLRLQdUa2VBoyu7j0S9lzk3VhYPQI-CmGUrRHbhDoCmFM9EM99s-lWavGg1B962TVZTtxIj6D3VMuMUZxHlEYovyLerMC4a3gvfOwSXq3rZHZGzTxUsrhKOPFk1-vh2CH7qb6v-6Iv0s6NfYl_d8qEroRvJmmFtav3xt41B4',
    },
    content: 'Just secured my first block in the North District. The architecture here is purely structural—no fluff. #Web3RealEstate #ChicagoGrid',
    images: [],
    likes: 312,
    comments: 47,
    shares: 18,
    trending: false,
    category: 'General',
    timestamp: '2h ago',
    liked: false,
  },
]

// ─── POST CATEGORIES / FILTERS ────────────────────────────────
// Endpoint: GET /feed/categories
export const feedCategories = [
  { id: 'general', label: 'General' },
  { id: 'meme', label: 'Meme' },
  { id: 'crypto-insight', label: 'Crypto Insight' },
  { id: 'humor', label: 'Humor' },
  { id: 'devlog', label: 'DevLog' },
]

// ─── COMMENTS (for a post) ────────────────────────────────────
// Endpoint: GET /posts/:postId/comments
export const postComments = [
  {
    id: 'c_001',
    postId: 'p_001',
    author: {
      id: 'u_004',
      name: 'AlphaNode',
      handle: '@alpha_node',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxOQUfSYc5bf6voVhHXLlY3OF_NibmvoYhTyj6KBaBRQAn7L5s4Eb47sCouYZjpK4e2TVz9YW2ZNRakO68vdEBaiyC0VPHl9cK1T4vy8exl06zpdoLhI7Wnl4hfZNvOeMgCcpysW7gN5DJwB6mCtMlgKy88zQKy2Gw17y9glRAL4DJfXUj-o_GAXbt1DFnFHnt3Ij-XjvK28MJUlc1sdT0Mlt0zr41RsyjkwGi3C9rYBVoWwD5ObspcEtd-OjLyv0ra6GrKWooXjAP',
    },
    content: 'This is massive. The gas optimization alone justifies the whole architecture shift. Are you open-sourcing the batching logic?',
    likes: 48,
    timestamp: '1h ago',
    liked: false,
  },
  {
    id: 'c_002',
    postId: 'p_001',
    author: {
      id: 'u_005',
      name: 'ChainDev',
      handle: '@chain_master',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtv-y9HoBNiyXItNXZj4tbW79Ee66Yd0lkHufIwJQWX1RPBiNPsxDKP88jKA_BFM4qzPsswMbLoTybeRD_NCTonnrVgAU1GsHLNsL19yZAS_ELuSEDmiHzLGIXV_q_9vfFSrxFI7Vch281YNMdelu_z282HkB9Agc0xoGSNwIUT7OQoM7fjSeDwpG_n-dAmRMG2eXwxZQAtvV0Cz1rmx9n0napSodtBee2GnSsgSy4oUas-jIIZzNtY8v62ouQEFipFTZ4gtZNM2-C',
    },
    content: 'Cross-chain treasury management done right. Chicago DAO is setting the standard for decentralized governance.',
    likes: 31,
    timestamp: '45m ago',
    liked: false,
  },
]

// ─── WHO TO FOLLOW ────────────────────────────────────────────
// Endpoint: GET /users/suggestions
export const suggestedUsers = [
  {
    id: 'u_004',
    name: 'AlphaNode',
    handle: '@alpha_node',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxOQUfSYc5bf6voVhHXLlY3OF_NibmvoYhTyj6KBaBRQAn7L5s4Eb47sCouYZjpK4e2TVz9YW2ZNRakO68vdEBaiyC0VPHl9cK1T4vy8exl06zpdoLhI7Wnl4hfZNvOeMgCcpysW7gN5DJwB6mCtMlgKy88zQKy2Gw17y9glRAL4DJfXUj-o_GAXbt1DFnFHnt3Ij-XjvK28MJUlc1sdT0Mlt0zr41RsyjkwGi3C9rYBVoWwD5ObspcEtd-OjLyv0ra6GrKWooXjAP',
    following: false,
  },
  {
    id: 'u_005',
    name: 'ChainDev',
    handle: '@chain_master',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtv-y9HoBNiyXItNXZj4tbW79Ee66Yd0lkHufIwJQWX1RPBiNPsxDKP88jKA_BFM4qzPsswMbLoTybeRD_NCTonnrVgAU1GsHLNsL19yZAS_ELuSEDmiHzLGIXV_q_9vfFSrxFI7Vch281YNMdelu_z282HkB9Agc0xoGSNwIUT7OQoM7fjSeDwpG_n-dAmRMG2eXwxZQAtvV0Cz1rmx9n0napSodtBee2GnSsgSy4oUas-jIIZzNtY8v62ouQEFipFTZ4gtZNM2-C',
    following: false,
  },
]

// ─── TRENDING TOPICS ──────────────────────────────────────────
// Endpoint: GET /feed/trending
export const trendingTopics = [
  {
    id: 't_001',
    hashtag: '#EthereumChicago',
    title: 'Chicago Dev Conference 2024',
    postCount: '15.4k',
  },
  {
    id: 't_002',
    hashtag: '#Layer2Summer',
    title: 'Scaling the ecosystem',
    postCount: '8.2k',
  },
  {
    id: 't_003',
    hashtag: '#Web3Design',
    title: 'The Neo-Brutalist movement',
    postCount: '5.9k',
  },
]

// ─── LEADERBOARD ──────────────────────────────────────────────
// Endpoint: GET /leaderboard?period=weekly
export const leaderboardEntries = [
  {
    rank: 1,
    id: 'u_010',
    name: 'brutal_arch.eth',
    handle: '@brutal_arch',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApJKaeJh6Ps6BWuJrylXAAlREnlK-so0RPqU56IAYnDaTIhrkX9C9ANTQmFre8ShigAv5S5KdhsAUhUyw3HPcJfx8wOKhCyXcjH9UuFtgk3eIuV-LMkGSDGGL9Z_H0EyMB69ePHN4IWex6a7mLBt-raR6NOG0WDOCO1f9rQFO0mbpa14UZhl8ASPvN6XcQqWjO2aT54uIIToMtdLr9ODf_e6RyRSC7UijbqRypSmlEC7tQUfruEknt-CCMqWeeGYlHOqY-u_vKaEsi',
    influence: 98420,
    tier: 'gold',
  },
  {
    rank: 2,
    id: 'u_011',
    name: 'void_master.eth',
    handle: '@void_master',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxOQUfSYc5bf6voVhHXLlY3OF_NibmvoYhTyj6KBaBRQAn7L5s4Eb47sCouYZjpK4e2TVz9YW2ZNRakO68vdEBaiyC0VPHl9cK1T4vy8exl06zpdoLhI7Wnl4hfZNvOeMgCcpysW7gN5DJwB6mCtMlgKy88zQKy2Gw17y9glRAL4DJfXUj-o_GAXbt1DFnFHnt3Ij-XjvK28MJUlc1sdT0Mlt0zr41RsyjkwGi3C9rYBVoWwD5ObspcEtd-OjLyv0ra6GrKWooXjAP',
    influence: 87110,
    tier: 'silver',
  },
  {
    rank: 3,
    id: 'u_012',
    name: 'gold_standard.eth',
    handle: '@gold_standard',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtv-y9HoBNiyXItNXZj4tbW79Ee66Yd0lkHufIwJQWX1RPBiNPsxDKP88jKA_BFM4qzPsswMbLoTybeRD_NCTonnrVgAU1GsHLNsL19yZAS_ELuSEDmiHzLGIXV_q_9vfFSrxFI7Vch281YNMdelu_z282HkB9Agc0xoGSNwIUT7OQoM7fjSeDwpG_n-dAmRMG2eXwxZQAtvV0Cz1rmx9n0napSodtBee2GnSsgSy4oUas-jIIZzNtY8v62ouQEFipFTZ4gtZNM2-C',
    influence: 76500,
    tier: 'bronze',
  },
  {
    rank: 4,
    id: 'u_013',
    name: 'monolith.eth',
    handle: '@monolith',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATNH21i5kL4jTaWK78FEk5H-jm0LSGARwVb7wbQDqyW9ggjF5DYPuGR9S3X1IDTNcgGewBTa3DBWQ07BydDsl1ld9aG05Rr7krOvAMw0remw4i966s0BnCbFoeCK-gaJ9VHs3dRaI9XhE8ob0QcGvJ-j0yx_O7umCm1vp-vn4AgnSuKBBbF6UssGy83uHRjYWxS8kPqWMKZFRxiJq0MHWU_VlAEgk7PIyrDkw0r8rmidr_RcImQo3tUcO5uh4jyxlog7GfB_Pv66zp',
    influence: 54200,
    tier: 'default',
  },
  {
    rank: 5,
    id: 'u_014',
    name: 'struct_aura.eth',
    handle: '@struct_aura',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhxweI5XB4NaoVsXOZdLJoaR2umH_RInP3BhAN8qJGW2pJsPsdZar46UapmcCqDalPWjpoR2zUjIarpvDCOkpzi204RJT3RwXuWCffiXsaZixiT_lh60N4V9KXPwWc0ULHd-TuUIAAjWj9gTfI0gbb6Y9yuhwaq0sl1wT9CThFTV7Qklc2kM2NO341F2eUTrl6WcfkiT2NflSQx7Q10HmoAkVM3olZvnLrDRbzHB_ndjah93I6lB4OQzrRqk7FpHTytXAt3MEOu2NL',
    influence: 42910,
    tier: 'default',
  },
]

// ─── LEADERBOARD CURRENT USER STATS ──────────────────────────
// Endpoint: GET /leaderboard/me
export const leaderboardMyStats = {
  rank: 47,
  percentile: 'top 15%',
  influence: 12480,
  stakeToNextTier: 500,
}

// ─── STAKING ──────────────────────────────────────────────────
// Endpoint: GET /staking/info
export const stakingInfo = {
  totalStaked: 0,
  pendingRewards: 0,
  apr: 12.5,
  lockDurationDays: 0,
  scoreWeights: {
    socialReputation: 70,
    stakingPower: 20,
    consistency: 10,
  },
  amountBoosts: [
    { threshold: '< 100 CLT', label: 'No Boost', multiplier: 0 },
    { threshold: '100+ CLT', label: '+10% Boost', multiplier: 10 },
    { threshold: '500+ CLT', label: '+25% Boost', multiplier: 25 },
    { threshold: '1,000+ CLT', label: '+50% Boost', multiplier: 50 },
  ],
  durationBonuses: [
    { days: 7, label: '7D', description: 'Minimum Lock', bonus: 0 },
    { days: 30, label: '30D', description: 'Quarterly lock', bonus: 5 },
    { days: 90, label: '90D', description: 'Strategic lock', bonus: 15 },
    { days: 180, label: '180D', description: 'Legacy lock', bonus: 30 },
  ],
}

// ─── MARKETPLACE CAMPAIGNS ────────────────────────────────────
// Endpoint: GET /marketplace/campaigns?period=3d
export const marketplaceCampaigns = [
  {
    id: 'camp_001',
    title: 'Join us for the biggest Web3 conference of the year!',
    advertiser: 'EthChicago Conf',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAd2gdrXLxBiBEm1qRJJoHRALYnT0uYCPPNPENf6CV2K70Yk3iJs7zXEXM8xQ_4Q8-2foYAhIeOHczBYXd9bRHjmNmLke173v_mRWW-RRfZ3g7tBcwRj1NGbgNDZLZVcejurEJxDi3MRzB5IT-VFAp99ktgoVocPME3jzjwbCHPDaSGS71fzFuSee-0GoYS6VzQ1y7-7F0R6zYFisHXXLYqFCOmFwTjE6ApOuwvZtBrvymcG_RerM9-q270hvnlox8zBRRQcp0ULovt',
    status: 'active',
    budget: 0.15,
    spent: 0.07,
    clicks: 1240,
    impressions: 45200,
  },
  {
    id: 'camp_002',
    title: 'Master smart contracts in 30 days',
    advertiser: 'ChainAcademy',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkdXqM3YxTa0ImPodVfqKgCMaEYBDJjU3MHx7fZbEa9_kTiyZzZiMo03rlHGgKVZdcJ5aJTpNiuWbtMy93n6m3sOG1947vBT01x2BpJkBW6RXTUoxgEzuKa8O1A7P0GFTaz0fhhh3e87e6JGtWYmZvi4V77w_1fq2gJjHJUhcI6EgE-jDURgDGFKmfzmk7Zu9PP8ZJeNygO1K8V1_9jui7096g52eY1hbLkxLgAdjHWlzWJg8QNjR5bFz2j6-vO0uWcRJ_dh3PjWyw',
    status: 'active',
    budget: 0.08,
    spent: 0.03,
    clicks: 680,
    impressions: 22100,
  },
]

// ─── MARKETPLACE PRICING ──────────────────────────────────────
// Endpoint: GET /marketplace/pricing?duration=3d
export const marketplacePricing = {
  durations: [
    { label: '1D', days: 1, priceEth: 0.02 },
    { label: '3D', days: 3, priceEth: 0.05 },
    { label: '7D', days: 7, priceEth: 0.10 },
  ],
  selectedDuration: '3D',
  totalCostEth: 0.05,
}

// ─── NETWORK INSIGHTS ─────────────────────────────────────────
// Endpoint: GET /network/stats
export const networkStats = {
  totalUsers: '24.8k',
  totalStaked: '1.2M CLT',
  activeCampaigns: 38,
  totalVolume: '48.2 ETH',
}

// ─── NAV LINKS ────────────────────────────────────────────────
// Static — no endpoint needed; can be driven by feature flags later
// Endpoint: GET /config/nav  (optional)
export const navLinks = [
  { id: 'home', label: 'Home', icon: 'home', path: '/' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'leaderboard', path: '/leaderboard' },
  { id: 'staking', label: 'Staking', icon: 'account_balance', path: '/staking' },
  { id: 'marketplace', label: 'Marketplace', icon: 'storefront', path: '/marketplace' },
  { id: 'profile', label: 'Profile', icon: 'person', path: '/profile' },
]

// ─── FOOTER LINKS ─────────────────────────────────────────────
// Static — no endpoint needed
export const footerLinks = ['Privacy', 'Terms', 'Ads', 'Cookies']
