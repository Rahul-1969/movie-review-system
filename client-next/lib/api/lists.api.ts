import api from './client';
import { List, ApiResponse, PaginatedResponse } from '../../types';

export const listsApi = {
  create: (data: any) => api.post<ApiResponse<List>>('/lists', data),
  getMyLists: (params?: any) => api.get<PaginatedResponse<List>>('/lists/my-lists', { params }),
  getPublicLists: (params?: any) => api.get<PaginatedResponse<List>>('/lists/public', { params }),
  getById: (id: string) => api.get<ApiResponse<List>>(`/lists/${id}`),
  update: (id: string, data: any) => api.put<ApiResponse<List>>(`/lists/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/lists/${id}`),
  addMovie: (listId: string, movieId: string) => api.post<ApiResponse<List>>(`/lists/${listId}/movies/${movieId}`),
  removeMovie: (listId: string, movieId: string) => api.delete<ApiResponse<List>>(`/lists/${listId}/movies/${movieId}`),
};
