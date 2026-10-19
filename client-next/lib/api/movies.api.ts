import api from './client';
import { Movie, ApiResponse, PaginatedResponse, MovieQueryParams } from '../../types';

export const moviesApi = {
  getAll: (params?: MovieQueryParams) => api.get<PaginatedResponse<Movie>>('/movies', { params }),
  getById: (id: string) => api.get<ApiResponse<Movie>>(`/movies/${id}`),
  getTopRated: () => api.get<ApiResponse<Movie[]>>('/movies/top-rated'),
  getTrending: () => api.get<ApiResponse<Movie[]>>('/movies/trending'),
  getRecommendations: () => api.get<ApiResponse<Movie[]>>('/movies/recommendations'),
  getSearchSuggestions: (q: string) => api.get<ApiResponse<Movie[]>>('/movies/search-suggestions', { params: { q } }),
  create: (formData: FormData) => api.post<ApiResponse<Movie>>('/movies', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, formData: FormData) => api.put<ApiResponse<Movie>>(`/movies/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/movies/${id}`),
};
