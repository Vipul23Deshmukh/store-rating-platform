import api from './api';
import { Rating, CreateRatingRequest, UpdateRatingRequest } from '../types';

export const ratingService = {
  /**
   * Submit or update a rating (upsert behaviour).
   * First call creates, subsequent calls update the existing rating.
   */
  submit: async (data: CreateRatingRequest): Promise<Rating> => {
    const response = await api.post<Rating>('/ratings', data);
    return response.data;
  },

  /** Update a rating by its ID. */
  update: async (id: string, data: UpdateRatingRequest): Promise<Rating> => {
    const response = await api.put<Rating>(`/ratings/${id}`, data);
    return response.data;
  },

  /** Get all ratings for a store. */
  listByStore: async (storeId: string): Promise<Rating[]> => {
    const response = await api.get<Rating[]>(`/ratings/store/${storeId}`);
    return Array.isArray(response.data) ? response.data : [];
  },

  /** Get the current user's rating for a specific store. */
  getMyRating: async (storeId: string): Promise<Rating | null> => {
    const response = await api.get<Rating | null>(`/ratings/my-rating/${storeId}`);
    return response.data ?? null;
  },
};
