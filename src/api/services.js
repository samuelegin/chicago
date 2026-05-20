/**
 * Service layer – one function group per entity.
 *
 * Each function maps directly to a REST endpoint your backend will expose.
 * Replace the path strings below if your backend uses a different convention.
 *
 * Entities: UserProfile, Post, Like, Comment, Follow, StakeRecord, AdCampaign, SupportTransaction
 */

import api from './apiClient';

// ─── UserProfile ────────────────────────────────────────────────────────────

export const UserProfileService = {
  /** GET /users/:id */
  getById: (id) => api.get(`/users/${id}`),

  /** GET /users?user_id=<uid> */
  getByUserId: (userId) => api.get(`/users?user_id=${encodeURIComponent(userId)}`),

  /** GET /users?sort=<sort>&limit=<n>  e.g. sort=-cis_score&limit=10 */
  list: (sort = '-cis_score', limit = 50) =>
    api.get(`/users?sort=${encodeURIComponent(sort)}&limit=${limit}`),

  /** POST /users */
  create: (data) => api.post('/users', data),

  /** PATCH /users/:id */
  update: (id, data) => api.patch(`/users/${id}`, data),

  /** DELETE /users/:id */
  delete: (id) => api.delete(`/users/${id}`),
};

// ─── Post ────────────────────────────────────────────────────────────────────

export const PostService = {
  /** GET /posts/:id */
  getById: (id) => api.get(`/posts/${id}`),

  /**
   * GET /posts?category=<c>&sort=<s>&limit=<n>
   * Pass an empty filter object {} for no category filter.
   */
  filter: (filter = {}, sort = '-created_date', limit = 50) => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([k, v]) => params.set(k, v));
    params.set('sort', sort);
    params.set('limit', String(limit));
    return api.get(`/posts?${params.toString()}`);
  },

  /** GET /posts?sort=<sort>&limit=<n> */
  list: (sort = '-created_date', limit = 50) =>
    api.get(`/posts?sort=${encodeURIComponent(sort)}&limit=${limit}`),

  /** POST /posts */
  create: (data) => api.post('/posts', data),

  /** PATCH /posts/:id */
  update: (id, data) => api.patch(`/posts/${id}`, data),

  /** DELETE /posts/:id */
  delete: (id) => api.delete(`/posts/${id}`),
};

// ─── Like ────────────────────────────────────────────────────────────────────

export const LikeService = {
  /** POST /likes */
  create: (data) => api.post('/likes', data),

  /** DELETE /likes/:id */
  delete: (id) => api.delete(`/likes/${id}`),

  /** GET /likes?post_id=<id> */
  getByPost: (postId) => api.get(`/likes?post_id=${encodeURIComponent(postId)}`),
};

// ─── Comment ─────────────────────────────────────────────────────────────────

export const CommentService = {
  /** GET /comments?post_id=<id>&sort=-created_date */
  getByPost: (postId) =>
    api.get(`/comments?post_id=${encodeURIComponent(postId)}&sort=-created_date`),

  /** POST /comments */
  create: (data) => api.post('/comments', data),

  /** DELETE /comments/:id */
  delete: (id) => api.delete(`/comments/${id}`),
};

// ─── Follow ───────────────────────────────────────────────────────────────────

export const FollowService = {
  /** POST /follows */
  create: (data) => api.post('/follows', data),

  /** DELETE /follows/:id */
  delete: (id) => api.delete(`/follows/${id}`),

  /** GET /follows?follower_id=<id> */
  getByFollower: (followerId) =>
    api.get(`/follows?follower_id=${encodeURIComponent(followerId)}`),

  /** GET /follows?following_id=<id> */
  getByFollowing: (followingId) =>
    api.get(`/follows?following_id=${encodeURIComponent(followingId)}`),
};

// ─── StakeRecord ──────────────────────────────────────────────────────────────

export const StakeRecordService = {
  /** GET /stakes?user_id=<id>&status=active */
  getActiveByUser: (userId) =>
    api.get(`/stakes?user_id=${encodeURIComponent(userId)}&status=active`),

  /** GET /stakes?user_id=<id> */
  getAllByUser: (userId) =>
    api.get(`/stakes?user_id=${encodeURIComponent(userId)}`),

  /** POST /stakes */
  create: (data) => api.post('/stakes', data),

  /** PATCH /stakes/:id */
  update: (id, data) => api.patch(`/stakes/${id}`, data),
};

// ─── AdCampaign ───────────────────────────────────────────────────────────────

export const AdCampaignService = {
  /** GET /ads?sort=<sort>&limit=<n> */
  list: (sort = '-created_date', limit = 50) =>
    api.get(`/ads?sort=${encodeURIComponent(sort)}&limit=${limit}`),

  /** GET /ads?status=<status> */
  filter: (filter = {}) => {
    const params = new URLSearchParams(filter);
    return api.get(`/ads?${params.toString()}`);
  },

  /** POST /ads */
  create: (data) => api.post('/ads', data),

  /** PATCH /ads/:id */
  update: (id, data) => api.patch(`/ads/${id}`, data),

  /** DELETE /ads/:id */
  delete: (id) => api.delete(`/ads/${id}`),
};

// ─── SupportTransaction ───────────────────────────────────────────────────────

export const SupportTransactionService = {
  /** POST /support-transactions */
  create: (data) => api.post('/support-transactions', data),

  /** GET /support-transactions?user_id=<id> */
  getByUser: (userId) =>
    api.get(`/support-transactions?user_id=${encodeURIComponent(userId)}`),
};

// ─── File upload ──────────────────────────────────────────────────────────────

/**
 * Upload a file and get back a URL.
 * POST /uploads  (multipart/form-data, field name: "file")
 * Expected response: { file_url: string }
 */
export async function uploadFile(file) {
  const token = localStorage.getItem('access_token') ?? null;
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const form = new FormData();
  form.append('file', file);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
  const res = await fetch(`${BASE_URL}/uploads`, {
    method: 'POST',
    headers,
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Upload failed (${res.status})`);
  }
  return res.json(); // { file_url: string }
}
