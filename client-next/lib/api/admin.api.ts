import api from './client';
import { User, Review, ApiResponse, PaginatedResponse, PaginationParams, AdminStats, AdminAnalytics } from '../../types';

export const adminApi = {
  getStats: () => api.get<ApiResponse<AdminStats>>('/admin/stats'),
  getUsers: (params?: PaginationParams) => api.get<PaginatedResponse<User>>('/admin/users', { params }),
  toggleBan: (id: string) => api.patch<ApiResponse<User>>(`/admin/users/${id}/ban`),
  getFlaggedReviews: (params?: PaginationParams) => api.get<PaginatedResponse<Review>>('/admin/reviews/flagged', { params }),
  getAnalytics: () => api.get<ApiResponse<AdminAnalytics>>('/admin/analytics'),
};
