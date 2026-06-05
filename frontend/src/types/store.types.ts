export interface UserRating {
  id: string;
  value: number;
  comment?: string;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerId: string;
  averageRating: number;
  ratingCount: number;
  userRating: UserRating | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreListResponse {
  stores: Store[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateStoreRequest {
  name: string;
  email: string;
  address: string;
}

export interface UpdateStoreRequest {
  name?: string;
  email?: string;
  address?: string;
}
