import { Role } from './auth.types';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  address: string;
  role?: Role;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  address?: string;
  role?: Role;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  email?: string;
  address?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

