export enum Role {
  ADMIN = 'ADMIN',
  STORE_OWNER = 'STORE_OWNER',
  USER = 'USER',
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  address?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  address: string;
  role?: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
