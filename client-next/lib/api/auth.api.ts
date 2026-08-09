import api from './client';
import { User, ApiResponse } from '../../types';

export const authApi = {
  register: (data: any) => api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/register', data),
  login: (data: any) => api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', data),
  logout: () => api.post<ApiResponse<void>>('/auth/logout'),
  refreshToken: () => api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/refresh-token'),
  forgotPassword: (data: any) => api.post<ApiResponse<void>>('/auth/forgot-password', data),
  resetPassword: (token: string, data: any) => api.post<ApiResponse<void>>(`/auth/reset-password/${token}`, data),
};
