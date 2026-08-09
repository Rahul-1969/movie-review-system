import api from './client';
import { User, Movie, ApiResponse } from '../../types';

export const usersApi = {
  getProfile: () => api.get<ApiResponse<User>>('/users/profile'),
  updateProfile: (formData: FormData) => api.put<ApiResponse<User>>('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  toggleWatchlist: (movieId: string) => api.post<ApiResponse<{ user: User, message: string }>>(`/users/watchlist/${movieId}`),
  getWatchlist: () => api.get<ApiResponse<Movie[]>>('/users/watchlist'),
  getPublicProfile: (id: string) => api.get<ApiResponse<User>>(`/users/${id}/public`),
};
