import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

/**
 * Protects any child routes behind an admin role check.
 * Non-admin users are silently redirected to the feed — /admin
 * never renders and returns a 404-like experience from their perspective.
 */
export default function AdminRoute() {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) return null; // wait for auth to resolve

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
