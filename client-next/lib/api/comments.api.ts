import api from './client';
import { Comment, ApiResponse, CreateCommentData, UpdateCommentData } from '../../types';

export const commentsApi = {
  getByReviewId: (reviewId: string) => api.get<ApiResponse<Comment[]>>(`/comments/review/${reviewId}`),
  create: (data: CreateCommentData) => api.post<ApiResponse<Comment>>('/comments', data),
  update: (id: string, data: UpdateCommentData) => api.put<ApiResponse<Comment>>(`/comments/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/comments/${id}`),
  toggleLike: (id: string) => api.post<ApiResponse<Comment>>(`/comments/${id}/like`),
};
