import api from './api';

export interface AdminStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get<AdminStats>('/admin/dashboard');
    return response.data;
  },
};

export default adminService;
