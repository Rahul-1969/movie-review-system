import api from './client';
import { Notification, ApiResponse, NotificationsResponse, PaginationParams } from '../../types';

export const notificationsApi = {
  getAll: (params?: PaginationParams) => api.get<NotificationsResponse>('/notifications', { params }),
  markAsRead: (id: string) => api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch<ApiResponse<void>>('/notifications/read-all'),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/notifications/${id}`),
  deleteAllRead: () => api.delete<ApiResponse<void>>('/notifications/read'),
};
