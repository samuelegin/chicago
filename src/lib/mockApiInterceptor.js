/**
 * Mock API Interceptor
 * 
 * Intercepts API calls and returns mock data.
 * This allows the app to work without a backend.
 * 
 * To disable: Remove the interceptor setup from src/main.jsx
 */

import {
  mockDataStore,
  generateId,
  MOCK_CREDENTIALS,
  MOCK_USERS,
} from './mockData';

// Store the original fetch
const originalFetch = window.fetch;

// Helper to extract query params from a path like "/users?sort=-cis_score&limit=50"
function getQueryParams(path) {
  const [pathOnly, queryString] = path.split('?');
  const params = new URLSearchParams(queryString || '');
  return { path: pathOnly, params };
}

// Intercept fetch for our /api routes
window.fetch = async (resource, config) => {
  const url = typeof resource === 'string' ? resource : resource.url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

  // Only intercept our API calls
  if (!url.includes(baseUrl)) {
    return originalFetch(resource, config);
  }

  // Remove the base URL to get the path
  const fullPath = url.replace(baseUrl, '');
  const { path, params } = getQueryParams(fullPath);
  const method = config?.method || 'GET';
  const body = config?.body ? JSON.parse(config.body) : null;

  try {
    const response = await handleApiCall(method, path, body, params);
    
    // Return a mock Response object
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const status = error.status || 400;
    return new Response(JSON.stringify({ error: error.message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Main API handler
async function handleApiCall(method, path, body, params) {
  // Auth endpoints
  if (path === '/auth/login' && method === 'POST') {
    return handleLogin(body);
  }

  if (path === '/auth/me' && method === 'GET') {
    return handleGetMe();
  }

  if (path === '/auth/logout' && method === 'POST') {
    handleLogout();
    return { status: 'logged out' };
  }

  // User endpoints
  if (path.match(/^\/users$/) && method === 'GET') {
    return handleListUsers(params);
  }

  if (path.match(/^\/users\//) && method === 'GET') {
    const id = path.split('/').pop();
    return handleGetUser(id);
  }

  if (path === '/users' && method === 'POST') {
    return handleCreateUser(body);
  }

  if (path.match(/^\/users\//) && method === 'PATCH') {
    const id = path.split('/').pop();
    return handleUpdateUser(id, body);
  }

  // Post endpoints
  if (path.match(/^\/posts$/) && method === 'GET') {
    return handleListPosts(params);
  }

  if (path.match(/^\/posts\//) && method === 'GET') {
    const id = path.split('/').pop();
    return handleGetPost(id);
  }

  if (path === '/posts' && method === 'POST') {
    return handleCreatePost(body);
  }

  if (path.match(/^\/posts\//) && method === 'PATCH') {
    const id = path.split('/').pop();
    return handleUpdatePost(id, body);
  }

  if (path.match(/^\/posts\//) && method === 'DELETE') {
    const id = path.split('/').pop();
    return handleDeletePost(id);
  }

  // Like endpoints
  if (path === '/likes' && method === 'POST') {
    return handleCreateLike(body);
  }

  if (path.match(/^\/likes$/) && method === 'GET') {
    return handleGetLikes(params);
  }

  if (path.match(/^\/likes\//) && method === 'DELETE') {
    const id = path.split('/').pop();
    return handleDeleteLike(id);
  }

  // Comment endpoints
  if (path === '/comments' && method === 'POST') {
    return handleCreateComment(body);
  }

  if (path.match(/^\/comments$/) && method === 'GET') {
    return handleGetComments(params);
  }

  if (path.match(/^\/comments\//) && method === 'DELETE') {
    const id = path.split('/').pop();
    return handleDeleteComment(id);
  }

  // Follow endpoints
  if (path === '/follows' && method === 'POST') {
    return handleCreateFollow(body);
  }

  if (path === '/follows' && method === 'GET') {
    return handleGetFollows(params);
  }

  if (path.match(/^\/follows\//) && method === 'DELETE') {
    const id = path.split('/').pop();
    return handleDeleteFollow(id);
  }

  // Ad campaign endpoints
  if (path.match(/^\/ads$/) && method === 'GET') {
    return handleListAdCampaigns();
  }

  if (path === '/ads' && method === 'POST') {
    return handleCreateAdCampaign(body);
  }

  // Support transaction endpoints
  if (path === '/support-transactions' && method === 'POST') {
    return handleCreateSupportTransaction(body);
  }

  if (path === '/support-transactions' && method === 'GET') {
    return handleGetSupportTransactions(params);
  }

  // Legacy support endpoint
  if (path === '/support' && method === 'POST') {
    return handleCreateSupportTransaction(body);
  }

  throw new Error(`Mock endpoint not implemented: ${method} ${path}`);
}

// Auth handlers
function handleLogin(body) {
  const { username, password } = body;

  if (!username || !password) {
    const error = new Error('Username and password required');
    error.status = 400;
    throw error;
  }

  const creds = MOCK_CREDENTIALS[username];
  if (!creds || creds.password !== password) {
    const error = new Error('Invalid username or password');
    error.status = 401;
    throw error;
  }

  const userId = creds.userId;
  const user = MOCK_USERS[userId];

  // Generate a mock token
  const token = btoa(JSON.stringify({ userId, username }));
  localStorage.setItem('access_token', token);

  return {
    access_token: token,
    user,
  };
}

function handleGetMe() {
  const token = localStorage.getItem('access_token');
  if (!token) {
    const error = new Error('Not authenticated');
    error.status = 401;
    throw error;
  }

  try {
    const decoded = JSON.parse(atob(token));
    const user = MOCK_USERS[decoded.userId];
    if (!user) throw new Error('User not found');
    return user;
  } catch {
    const error = new Error('Invalid token');
    error.status = 401;
    throw error;
  }
}

function handleLogout() {
  localStorage.removeItem('access_token');
}

// User handlers
function handleListUsers(params) {
  const sort = params.get('sort') || '-cis_score';
  const limit = parseInt(params.get('limit')) || 50;

  let profiles = [...mockDataStore.profiles];

  // Sort by field (prefix - means descending)
  if (sort) {
    const field = sort.replace('-', '');
    const isDesc = sort.startsWith('-');
    profiles.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      return isDesc ? bVal - aVal : aVal - bVal;
    });
  }

  return profiles.slice(0, limit);
}

function handleGetUser(id) {
  const profile = mockDataStore.profiles.find(p => p.id === id);
  if (!profile) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return profile;
}

function handleCreateUser(body) {
  const profile = {
    id: generateId('profile'),
    ...body,
    followers_count: 0,
    following_count: 0,
    posts_count: 0,
    cis_score: 100,
    rank: 'Bronze',
    created_date: new Date().toISOString(),
  };
  mockDataStore.profiles.push(profile);
  return profile;
}

function handleUpdateUser(id, body) {
  const profile = mockDataStore.profiles.find(p => p.id === id);
  if (!profile) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  Object.assign(profile, body);
  return profile;
}

// Post handlers
function handleListPosts(params) {
  const category = params.get('category');
   const author_id = params.get('author_id');
   const sort = params.get('sort') || '-created_date';
  const limit = parseInt(params.get('limit')) || 50;

  let posts = [...mockDataStore.posts];

  if (category) {
    posts = posts.filter(p => p.category === category);
  }
 
    if (author_id) {
      posts = posts.filter(p => p.author_id === author_id);
    }

  if (sort) {
    const field = sort.replace('-', '');
    const isDesc = sort.startsWith('-');
    posts.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      if (typeof aVal === 'string' && aVal.includes('-')) {
        // ISO date
        return isDesc
          ? new Date(bVal) - new Date(aVal)
          : new Date(aVal) - new Date(bVal);
      }
      return isDesc ? bVal - aVal : aVal - bVal;
    });
  }

  // map to API shape expected by UI (image_url)
  const shaped = posts.slice(0, limit).map(p => ({ ...p, image_url: p.image || null }));
  return shaped;
}

function handleGetPost(id) {
  const post = mockDataStore.posts.find(p => p.id === id);
  if (!post) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }
  return { ...post, image_url: post.image || null };
}

function handleCreatePost(body) {
  const post = {
    id: generateId('post'),
    ...body,
    likes_count: 0,
    comments_count: 0,
    created_date: new Date().toISOString(),
  };
  mockDataStore.posts.unshift(post);
  return { ...post, image_url: post.image || null };
}

function handleUpdatePost(id, body) {
  const post = mockDataStore.posts.find(p => p.id === id);
  if (!post) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }
  Object.assign(post, body);
  return { ...post, image_url: post.image || null };
}

function handleDeletePost(id) {
  const idx = mockDataStore.posts.findIndex(p => p.id === id);
  if (idx === -1) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }
  mockDataStore.posts.splice(idx, 1);
  return { deleted: true };
}

// Like handlers
function handleCreateLike(body) {
  const like = {
    id: generateId('like'),
    ...body,
    created_date: new Date().toISOString(),
  };
  mockDataStore.likes.push(like);

  // Update post likes_count
  const post = mockDataStore.posts.find(p => p.id === body.post_id);
  if (post) post.likes_count++;

  return like;
}

function handleGetLikes(params) {
  const postId = params.get('post_id');

  if (postId) {
    return mockDataStore.likes.filter(l => l.post_id === postId);
  }
  return mockDataStore.likes;
}

function handleDeleteLike(id) {
  const idx = mockDataStore.likes.findIndex(l => l.id === id);
  if (idx === -1) {
    const error = new Error('Like not found');
    error.status = 404;
    throw error;
  }
  const like = mockDataStore.likes[idx];
  mockDataStore.likes.splice(idx, 1);

  // Update post likes_count
  const post = mockDataStore.posts.find(p => p.id === like.post_id);
  if (post && post.likes_count > 0) post.likes_count--;

  return { deleted: true };
}

// Comment handlers
function handleCreateComment(body) {
  const comment = {
    id: generateId('comment'),
    ...body,
    created_date: new Date().toISOString(),
  };
  mockDataStore.comments.push(comment);

  // Update post comments_count
  const post = mockDataStore.posts.find(p => p.id === body.post_id);
  if (post) post.comments_count++;

  return comment;
}

function handleGetComments(params) {
  const postId = params.get('post_id');

  if (postId) {
    return mockDataStore.comments.filter(c => c.post_id === postId);
  }
  return mockDataStore.comments;
}

function handleDeleteComment(id) {
  const idx = mockDataStore.comments.findIndex(c => c.id === id);
  if (idx === -1) {
    const error = new Error('Comment not found');
    error.status = 404;
    throw error;
  }
  const comment = mockDataStore.comments[idx];
  mockDataStore.comments.splice(idx, 1);

  // Update post comments_count
  const post = mockDataStore.posts.find(p => p.id === comment.post_id);
  if (post && post.comments_count > 0) post.comments_count--;

  return { deleted: true };
}

// Follow handlers
function handleCreateFollow(body) {
  const follow = {
    id: generateId('follow'),
    ...body,
    created_date: new Date().toISOString(),
  };
  mockDataStore.follows.push(follow);

  // Update follower/following counts
  const follower = mockDataStore.profiles.find(p => p.user_id === body.follower_id);
  const following = mockDataStore.profiles.find(p => p.user_id === body.following_id);
  if (follower) follower.following_count++;
  if (following) following.followers_count++;

  return follow;
}

function handleGetFollows(params) {
  const followerId = params.get('follower_id');
  const followingId = params.get('following_id');

  let follows = [...mockDataStore.follows];

  if (followerId) {
    follows = follows.filter(f => f.follower_id === followerId);
  }

  if (followingId) {
    follows = follows.filter(f => f.following_id === followingId);
  }

  return follows;
}

function handleDeleteFollow(id) {
  const idx = mockDataStore.follows.findIndex(f => f.id === id);
  if (idx === -1) {
    const error = new Error('Follow not found');
    error.status = 404;
    throw error;
  }
  const follow = mockDataStore.follows[idx];
  mockDataStore.follows.splice(idx, 1);

  // Update follower/following counts
  const follower = mockDataStore.profiles.find(p => p.user_id === follow.follower_id);
  const following = mockDataStore.profiles.find(p => p.user_id === follow.following_id);
  if (follower && follower.following_count > 0) follower.following_count--;
  if (following && following.followers_count > 0) following.followers_count--;

  return { deleted: true };
}

// Ad campaign handlers
function handleListAdCampaigns() {
  return mockDataStore.adCampaigns;
}

function handleCreateAdCampaign(body) {
  const campaign = {
    id: generateId('ad'),
    ...body,
    ctr: 0,
    impressions: 0,
    clicks: 0,
    created_date: new Date().toISOString(),
  };
  mockDataStore.adCampaigns.push(campaign);
  return campaign;
}

// Support transaction handlers
function handleCreateSupportTransaction(body) {
  const transaction = {
    id: generateId('support'),
    ...body,
    created_date: new Date().toISOString(),
  };
  mockDataStore.supportTransactions.push(transaction);
  return transaction;
}

function handleGetSupportTransactions(params) {
  const userId = params.get('user_id');

  let transactions = [...mockDataStore.supportTransactions];

  if (userId) {
    transactions = transactions.filter(t => t.receiver_id === userId);
  }

  return transactions;
}
