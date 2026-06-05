import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If specified, only these roles may access this route. */
  allowedRoles?: Role[];
}

/**
 * Returns the default landing page for a given role.
 *  - ADMIN        → /dashboard   (Admin Dashboard)
 *  - STORE_OWNER  → /dashboard   (Owner Dashboard)
 *  - USER         → /stores      (Stores Page)
 */
export const getDefaultRoute = (role?: Role): string => {
  switch (role) {
    case Role.ADMIN:
      return '/dashboard';
    case Role.STORE_OWNER:
      return '/dashboard';
    case Role.USER:
      return '/stores';
    default:
      return '/dashboard';
  }
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        }}
      >
        <CircularProgress sx={{ color: '#818CF8' }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access control: if allowedRoles are specified,
  // redirect users without the right role to their default page.
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const fallbackRoute = getDefaultRoute(user.role);
    return <Navigate to={fallbackRoute} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
