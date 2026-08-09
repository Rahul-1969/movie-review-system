import api from './client';
import { User, Review, ApiResponse, PaginatedResponse } from '../../types';

export const adminApi = {
  getStats: () => api.get<ApiResponse<any>>('/admin/stats'),
  getUsers: (params?: any) => api.get<PaginatedResponse<User>>('/admin/users', { params }),
  toggleBan: (id: string) => api.patch<ApiResponse<User>>(`/admin/users/${id}/ban`),
  getFlaggedReviews: (params?: any) => api.get<PaginatedResponse<Review>>('/admin/reviews/flagged', { params }),
  getAnalytics: () => api.get<ApiResponse<any>>('/admin/analytics'),
};
