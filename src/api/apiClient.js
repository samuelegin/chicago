/**
 * REST API client for the Chicago Social backend.
 *
 * All calls go to the base URL configured by VITE_API_BASE_URL (default: /api).
 * The auth token is read from localStorage under the key "access_token".
 *
 * Usage:
 *   import api from '@/api/apiClient';
 *   const posts = await api.get('/posts');
 *   const post  = await api.post('/posts', { content: '...' });
 *   await api.put('/posts/123', { likes_count: 5 });
 *   await api.delete('/posts/123');
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

function getToken() {
  return localStorage.getItem('access_token') ?? null;
}

async function request(method, path, body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `${method} ${path} failed with status ${res.status}`;
    try {
      const err = await res.json();
      message = err?.message ?? err?.error ?? message;
    } catch {
      // ignore parse error
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  patch:  (path, body)  => request('PATCH',  path, body),
  delete: (path)        => request('DELETE', path),
};

export default api;
