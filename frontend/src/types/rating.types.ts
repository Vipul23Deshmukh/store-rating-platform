export interface Rating {
  id: string;
  value: number;
  comment?: string;
  userId: string;
  storeId: string;
  user?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRatingRequest {
  value: number;
  comment?: string;
  storeId: string;
}

export interface UpdateRatingRequest {
  value?: number;
  comment?: string;
}
