import React from 'react';
import { usePermission } from '../../hooks/usePermission';
import { Role } from '../../types';

interface RoleGuardProps {
  roles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  roles,
  children,
  fallback = null,
}) => {
  const { hasRole } = usePermission();

  if (!hasRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;
