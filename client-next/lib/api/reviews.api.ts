import api from './client';
import { Review, ApiResponse, PaginatedResponse } from '../../types';

export const reviewsApi = {
  create: (data: any) => api.post<ApiResponse<Review>>('/reviews', data),
  update: (id: string, data: any) => api.put<ApiResponse<Review>>(`/reviews/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/reviews/${id}`),
  toggleLike: (id: string) => api.post<ApiResponse<Review>>(`/reviews/${id}/like`),
  getMyReviews: (params?: any) => api.get<PaginatedResponse<Review>>('/reviews/my-reviews', { params }),
  flag: (id: string) => api.patch<ApiResponse<Review>>(`/reviews/${id}/flag`),
};
