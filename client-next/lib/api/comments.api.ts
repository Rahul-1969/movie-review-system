import api from './client';
import { Comment, ApiResponse } from '../../types';

export const commentsApi = {
  getByReviewId: (reviewId: string) => api.get<ApiResponse<Comment[]>>(`/comments/review/${reviewId}`),
  create: (data: any) => api.post<ApiResponse<Comment>>('/comments', data),
  update: (id: string, data: any) => api.put<ApiResponse<Comment>>(`/comments/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/comments/${id}`),
  toggleLike: (id: string) => api.post<ApiResponse<Comment>>(`/comments/${id}/like`),
};
