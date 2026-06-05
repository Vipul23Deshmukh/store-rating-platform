import { useAuth } from './useAuth';
import { Role } from '../types';

export const usePermission = () => {
  const { user } = useAuth();

  const hasRole = (roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAdmin = () => {
    return user?.role === Role.ADMIN;
  };

  const isStoreOwner = () => {
    return user?.role === Role.STORE_OWNER;
  };

  const isUser = () => {
    return user?.role === Role.USER;
  };

  return {
    hasRole,
    isAdmin,
    isStoreOwner,
    isUser,
    role: user?.role || null,
  };
};
