/**
 * AuthContext
 *
 * Replaces the base44-backed auth context with a simple JWT/cookie-based
 * auth flow.  Your backend must expose:
 *
 *   GET  /api/auth/me          → { id, email, full_name, role, ... } | 401
 *   POST /api/auth/logout      → 204
 *
 * The access token is expected to live in localStorage under "access_token".
 * On unauthenticated responses the user is redirected to VITE_LOGIN_URL
 * (default: /login).
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '@/api/apiClient';

const LOGIN_URL = import.meta.env.VITE_LOGIN_URL ?? '/login';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,              setUser]              = useState(null);
  const [isAuthenticated,   setIsAuthenticated]   = useState(false);
  const [isLoadingAuth,     setIsLoadingAuth]     = useState(true);
  const [authChecked,       setAuthChecked]       = useState(false);
  const [authError,         setAuthError]         = useState(null);

  // ── Check current user ──────────────────────────────────────────────────

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const currentUser = await api.get('/auth/me');
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);

      if (error.status === 401 || error.status === 403) {
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      } else {
        setAuthError({ type: 'unknown', message: error.message ?? 'Failed to authenticate' });
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  // ── Logout ───────────────────────────────────────────────────────────────

  const logout = useCallback(async (shouldRedirect = true) => {
    try {
      await api.post('/auth/logout');
    } catch {
      // best-effort
    }
    localStorage.removeItem('access_token');
    setUser(null);
    setIsAuthenticated(false);
    setAuthChecked(false);

    if (shouldRedirect) {
      window.location.href = LOGIN_URL;
    }
  }, []);

  // ── Redirect to login ────────────────────────────────────────────────────

  const navigateToLogin = useCallback((returnTo = window.location.href) => {
    const url = new URL(LOGIN_URL, window.location.origin);
    url.searchParams.set('return_to', returnTo);
    window.location.href = url.toString();
  }, []);

  // isLoadingPublicSettings shim - kept for API compatibility
  const isLoadingPublicSettings = isLoadingAuth;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
