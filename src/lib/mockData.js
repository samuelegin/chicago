/**
 * Mock Data for Demo
 * 
 * This file contains all mock data for the application demo.
 * Delete this file and update src/lib/mockApiInterceptor.js to use real API when ready.
 */

// available demo images in public/
export const MOCK_IMAGES = ['/download.jfif', '/download.webp'];
const MOCK_IMAGE = MOCK_IMAGES[0];

// Mock users
export const MOCK_USERS = {
  user1: {
    id: 'user1',
    email: '0xtester@chicago.com',
    full_name: '0xtester',
    role: 'user',
  },
  admin1: {
    id: 'admin1',
    email: '0xadmin@chicago.com',
    full_name: '0xadmin',
    role: 'admin',
  },
};

export const MOCK_CREDENTIALS = {
  '0xtester': { password: '00000000', userId: 'user1' },
  '0xadmin': { password: '00000000', userId: 'admin1' },
};

// Mock user profiles
export const MOCK_PROFILES = [
  {
    id: 'profile1',
    user_id: 'user1',
    username: '0xtester',
    avatar: MOCK_IMAGE,
    avatar_url: MOCK_IMAGE,
    bio: 'Test user exploring Chicago Social',
    wallet_address: '0x1234567890123456789012345678901234567890',
    cis_score: 2500,
    rank: 'Diamond',
    followers_count: 145,
    following_count: 89,
    posts_count: 23,
    staked_amount: 5000,
    clt_staked: 5000,
    daily_streak: 12,
    badges: ['early_adopter', 'content_creator'],
    created_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'profile2',
    user_id: 'admin1',
    username: '0xadmin',
    avatar: MOCK_IMAGE,
    avatar_url: MOCK_IMAGE,
    bio: 'Admin of Chicago Social',
    wallet_address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    cis_score: 5000,
    rank: 'Platinum',
    followers_count: 2341,
    following_count: 156,
    posts_count: 412,
    staked_amount: 50000,
    clt_staked: 50000,
    daily_streak: 45,
    badges: ['admin', 'verified', 'founder'],
    created_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'profile3',
    user_id: 'user3',
    username: 'alice_chicago',
    avatar: MOCK_IMAGE,
    avatar_url: MOCK_IMAGE,
    bio: 'Web3 developer and creator',
    wallet_address: '0xfedcbafedcbafedcbafedcbafedcbafedcbafedcba',
    cis_score: 3200,
    rank: 'Platinum',
    followers_count: 523,
    following_count: 234,
    posts_count: 156,
    staked_amount: 15000,
    clt_staked: 15000,
    daily_streak: 8,
    badges: ['verified'],
    created_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'profile4',
    user_id: 'user4',
    username: 'bob_social',
    avatar: MOCK_IMAGE,
    avatar_url: MOCK_IMAGE,
    bio: 'Community manager',
    wallet_address: '0x9876543210987654321098765432109876543210',
    cis_score: 1800,
    rank: 'Gold',
    followers_count: 234,
    following_count: 145,
    posts_count: 89,
    staked_amount: 8000,
    clt_staked: 8000,
    daily_streak: 3,
    badges: [],
    created_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'profile5',
    user_id: 'user5',
    username: 'carol_eth',
    avatar: MOCK_IMAGE,
    avatar_url: MOCK_IMAGE,
    bio: 'Blockchain enthusiast',
    wallet_address: '0x5555555555555555555555555555555555555555',
    cis_score: 2100,
    rank: 'Silver',
    followers_count: 156,
    following_count: 112,
    posts_count: 67,
    staked_amount: 3000,
    clt_staked: 3000,
    daily_streak: 5,
    badges: ['early_adopter'],
    created_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock posts
export const MOCK_POSTS = [
  {
    id: 'post1',
    author_id: 'user1',
    author_name: '0xtester',
    content: 'Just launched my first project on Chicago Social! Excited to connect with the community here.',
    // use first demo image
    image: MOCK_IMAGES[0],
    category: 'announcements',
    likes_count: 34,
    comments_count: 8,
    created_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post2',
    author_id: 'admin1',
    author_name: '0xadmin',
    content: 'Exploring Web3 opportunities and what they mean for creators. 🚀 #Web3 #Creator',
    // use second demo image
    image: MOCK_IMAGES[1],
    category: 'insights',
    likes_count: 234,
    comments_count: 45,
    created_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  // removed four no-image posts per request (post3-post6)
  {
    id: 'post7',
    author_id: 'user3',
    author_name: 'alice_chicago',
    content: 'Smart contracts are the future. Here\'s a deep dive into how they work.',
    image: null,
    category: 'tutorials',
    likes_count: 345,
    comments_count: 89,
    created_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post8',
    author_id: 'user4',
    author_name: 'bob_social',
    content: 'Community management tips for Web3 projects. What\'s your experience?',
    image: null,
    category: 'discussions',
    likes_count: 123,
    comments_count: 34,
    created_date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock likes
export const MOCK_LIKES = [
  { id: 'like1', post_id: 'post1', user_id: 'user3', created_date: new Date().toISOString() },
  { id: 'like2', post_id: 'post1', user_id: 'user4', created_date: new Date().toISOString() },
  { id: 'like3', post_id: 'post2', user_id: 'user1', created_date: new Date().toISOString() },
];

// Mock comments
export const MOCK_COMMENTS = [
  {
    id: 'comment1',
    post_id: 'post1',
    author_id: 'user3',
    author_name: 'alice_chicago',
    content: 'Welcome to the platform! Great to have you here.',
    created_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comment2',
    post_id: 'post2',
    author_id: 'user1',
    author_name: '0xtester',
    content: 'This is really insightful. Thanks for sharing!',
    created_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comment3',
    post_id: 'post1',
    author_id: 'user4',
    author_name: 'bob_social',
    content: 'Love this update—can’t wait to see what comes next.',
    created_date: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: 'comment4',
    post_id: 'post2',
    author_id: 'user5',
    author_name: 'carol_eth',
    content: 'Solid take! The creator economy is evolving so fast.',
    created_date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comment5',
    post_id: 'post7',
    author_id: 'user1',
    author_name: '0xtester',
    content: 'Really well explained. This helped me understand smart contracts better.',
    created_date: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comment6',
    post_id: 'post7',
    author_id: 'user4',
    author_name: 'bob_social',
    content: 'Nice breakdown! Would love a follow-up on gas optimization.',
    created_date: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comment7',
    post_id: 'post8',
    author_id: 'user3',
    author_name: 'alice_chicago',
    content: 'Community management is key. These are great practical tips.',
    created_date: new Date(Date.now() - 70 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comment8',
    post_id: 'post8',
    author_id: 'user1',
    author_name: '0xtester',
    content: 'I agree—engagement and transparency matter most.',
    created_date: new Date(Date.now() - 68 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock follows
export const MOCK_FOLLOWS = [
  { id: 'follow1', follower_id: 'user1', following_id: 'admin1', created_date: new Date().toISOString() },
  { id: 'follow2', follower_id: 'user1', following_id: 'user3', created_date: new Date().toISOString() },
  { id: 'follow3', follower_id: 'user1', following_id: 'user4', created_date: new Date().toISOString() },
];

// Mock ads/campaigns
export const MOCK_AD_CAMPAIGNS = [
  {
    id: 'ad1',
    advertiser_id: 'admin1',
    title: 'Web3 Summit 2024',
    description: 'Join us for the biggest Web3 conference of the year!',
    image: MOCK_IMAGE,
    category: 'events',
    budget: 50000,
    status: 'active',
    ctr: 3.2,
    impressions: 125000,
    clicks: 4000,
    created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ad2',
    advertiser_id: 'user3',
    title: 'Learn Smart Contracts',
    description: 'Master smart contracts in 30 days',
    image: MOCK_IMAGE,
    category: 'courses',
    budget: 10000,
    status: 'active',
    ctr: 2.8,
    impressions: 45000,
    clicks: 1260,
    created_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock support transactions (donations)
export const MOCK_SUPPORT_TRANSACTIONS = [
  {
    id: 'support1',
    sender_id: 'user3',
    receiver_id: 'user1',
    amount: 100,
    message: 'Love your content!',
    created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'support2',
    sender_id: 'user4',
    receiver_id: 'user1',
    amount: 50,
    message: 'Great insights!',
    created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Export data store for updates during demo
export const mockDataStore = {
  users: { ...MOCK_USERS },
  profiles: [...MOCK_PROFILES],
  posts: [...MOCK_POSTS],
  likes: [...MOCK_LIKES],
  comments: [...MOCK_COMMENTS],
  follows: [...MOCK_FOLLOWS],
  adCampaigns: [...MOCK_AD_CAMPAIGNS],
  supportTransactions: [...MOCK_SUPPORT_TRANSACTIONS],
};

// Helper to generate unique IDs
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
