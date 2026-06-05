import api from './api';

export interface OwnerStats {
  totalStores: number;
  totalRatings: number;
  averageRating: number;
}

export interface OwnerRatingsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'userName' | 'userEmail' | 'storeName' | 'value' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface OwnerRatingItem {
  id: string;
  value: number;
  comment: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  store?: {
    id: string;
    name: string;
  };
}

export interface OwnerRatingsResponse {
  ratings: OwnerRatingItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const ownerService = {
  getStats: async (): Promise<OwnerStats> => {
    const response = await api.get<OwnerStats>('/owner/dashboard/stats');
    const data = response.data as Partial<OwnerStats> | undefined;
    return {
      totalStores: typeof data?.totalStores === 'number' ? data.totalStores : 0,
      totalRatings: typeof data?.totalRatings === 'number' ? data.totalRatings : 0,
      averageRating: typeof data?.averageRating === 'number' ? data.averageRating : 0,
    };
  },

  getRatings: async (params?: OwnerRatingsQueryParams): Promise<OwnerRatingsResponse> => {
    const response = await api.get<OwnerRatingsResponse>('/owner/dashboard/ratings', { params });
    const data = response.data as any;
    const ratings = Array.isArray(data?.ratings) ? data.ratings : [];
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
        total: typeof data?.total === 'number' ? data.total : ratings.length,
        page: typeof data?.page === 'number' ? data.page : 1,
        limit: typeof data?.limit === 'number' ? data.limit : 10,
        totalPages: typeof data?.totalPages === 'number' ? data.totalPages : 1,
      };
    }
    return { ratings, meta };
  },
};
