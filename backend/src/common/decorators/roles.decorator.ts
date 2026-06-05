import { SetMetadata } from '@nestjs/common';
import { Role } from '../constants/roles.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles can access a route.
 * Usage: @Roles(Role.ADMIN, Role.STORE_OWNER)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
