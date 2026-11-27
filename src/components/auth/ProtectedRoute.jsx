import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

/**
 * ProtectedRoute component:
 * 1. Blocks unauthenticated access and redirects to /login.
 * 2. Restricts access by allowedRoles; if unauthorized, redirects to the user's role dashboard.
 */
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, currentRole } = useApp();
  const location = useLocation();

  // If not logged in, redirect to login page and remember attempt in state
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user role is not authorized for this specific route section
  if (allowedRoles.length > 0 && currentRole && !allowedRoles.includes(currentRole)) {
    // Redirect unauthorized user directly to their own role dashboard
    const ownDashboardPath = `/${currentRole.toLowerCase()}/overview`;
    return <Navigate to={ownDashboardPath} replace />;
  }

  return <Outlet />;
}
