import api from './api';
import { AuthResponse, LoginRequest, RegisterRequest, AuthUser, ChangePasswordRequest } from '../types';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (token?: string): Promise<AuthUser> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await api.get<AuthUser>('/auth/me', { headers });
    if (!response.data) {
      throw new Error('Invalid current user response');
    }
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/auth/change-password', data);
    return response.data;
  },

  updateProfile: async (data: { name: string; email: string; address: string }): Promise<AuthUser> => {
    const response = await api.put<AuthUser>('/auth/profile', data);
    return response.data;
  },
};
