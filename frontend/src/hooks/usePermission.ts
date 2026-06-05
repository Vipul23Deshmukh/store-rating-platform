import { useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { Role } from '../types';

export const usePermission = () => {
  const { user } = useAuth();

  const hasRole = useCallback((roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const isAdmin = useCallback(() => {
    return user?.role === Role.ADMIN;
  }, [user?.role]);

  const isStoreOwner = useCallback(() => {
    return user?.role === Role.STORE_OWNER;
  }, [user?.role]);

  const isUser = useCallback(() => {
    return user?.role === Role.USER;
  }, [user?.role]);

  return useMemo(() => ({
    hasRole,
    isAdmin,
    isStoreOwner,
    isUser,
    role: user?.role || null,
  }), [hasRole, isAdmin, isStoreOwner, isUser, user?.role]);
};
