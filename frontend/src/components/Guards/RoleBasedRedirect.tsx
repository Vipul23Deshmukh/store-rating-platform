import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDefaultRoute } from './ProtectedRoute';

/**
 * Redirects authenticated users to their role-specific default page.
 *  - ADMIN        → /dashboard (Admin Dashboard)
 *  - STORE_OWNER  → /dashboard (Owner Dashboard)
 *  - USER         → /stores    (Stores Page)
 */
export const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();
  const destination = getDefaultRoute(user?.role);
  return <Navigate to={destination} replace />;
};

export default RoleBasedRedirect;
