import api from './client';
import { Review, ApiResponse, PaginatedResponse, PaginationParams, CreateReviewData, UpdateReviewData } from '../../types';

export const reviewsApi = {
  create: (data: CreateReviewData) => api.post<ApiResponse<Review>>('/reviews', data),
  update: (id: string, data: UpdateReviewData) => api.put<ApiResponse<Review>>(`/reviews/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/reviews/${id}`),
  toggleLike: (id: string) => api.post<ApiResponse<{ liked: boolean; likesCount: number }>>(`/reviews/${id}/like`),
  getMyReviews: (params?: PaginationParams) => api.get<PaginatedResponse<Review>>('/reviews/my-reviews', { params }),
  flag: (id: string) => api.patch<ApiResponse<Review>>(`/reviews/${id}/flag`),
};
