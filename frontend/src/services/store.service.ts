import api from './api';
import { Store, StoreListResponse, CreateStoreRequest, UpdateStoreRequest } from '../types';

export interface StoreQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  address?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const storeService = {
  list: async (params?: StoreQueryParams): Promise<StoreListResponse> => {
    const response = await api.get<StoreListResponse>('/stores', { params });
    const data = response.data as any;
    const stores = Array.isArray(data?.stores) ? data.stores : [];
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
        total: typeof data?.total === 'number' ? data.total : stores.length,
        page: typeof data?.page === 'number' ? data.page : 1,
        limit: typeof data?.limit === 'number' ? data.limit : 10,
        totalPages: typeof data?.totalPages === 'number' ? data.totalPages : 1,
      };
    }
    return { stores, meta };
  },
  get: async (id: string): Promise<Store> => {
    const response = await api.get<Store>(`/stores/${id}`);
    return response.data;
  },

  create: async (data: CreateStoreRequest): Promise<Store> => {
    const response = await api.post<Store>('/stores', data);
    return response.data;
  },

  update: async (id: string, data: UpdateStoreRequest): Promise<Store> => {
    const response = await api.put<Store>(`/stores/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/stores/${id}`);
  },
};
