import api from './api';

export interface AdminStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get<AdminStats>('/admin/dashboard');
    const data = response.data as Partial<AdminStats> | undefined;
    return {
      totalUsers: typeof data?.totalUsers === 'number' ? data.totalUsers : 0,
      totalStores: typeof data?.totalStores === 'number' ? data.totalStores : 0,
      totalRatings: typeof data?.totalRatings === 'number' ? data.totalRatings : 0,
    };
  },
};

export default adminService;
