import api from './api';
import { User, CreateUserRequest, UpdateUserRequest, UserQueryParams, UserListResponse } from '../types';

export const userService = {
  list: async (params?: UserQueryParams): Promise<UserListResponse> => {
    const response = await api.get<UserListResponse>('/users', { params });
    const data = response.data as any;
    const users = Array.isArray(data?.users) ? data.users : [];
    let meta = { total: 0, page: 1, limit: 10, totalPages: 1 };
    if (data?.meta) {
      meta = {
        total: typeof data.meta.total === 'number' ? data.meta.total : 0,
        page: typeof data.meta.page === 'number' ? data.meta.page : 1,
        limit: typeof data.meta.limit === 'number' ? data.meta.limit : 10,
        totalPages: typeof data.meta.totalPages === 'number' ? data.meta.totalPages : 1,
      };
    } else {
      meta = {
        total: typeof data?.total === 'number' ? data.total : users.length,
        page: typeof data?.page === 'number' ? data.page : 1,
        limit: typeof data?.limit === 'number' ? data.limit : 10,
        totalPages: typeof data?.totalPages === 'number' ? data.totalPages : 1,
      };
    }
    return { users, meta };
  },

  get: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
