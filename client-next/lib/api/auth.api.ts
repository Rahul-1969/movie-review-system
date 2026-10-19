import api from './client';
import { ApiResponse, RegisterData, LoginCredentials, AuthResponseData } from '../../types';

export const authApi = {
  register: (data: RegisterData) => api.post<ApiResponse<AuthResponseData>>('/auth/register', data),
  login: (data: LoginCredentials) => api.post<ApiResponse<AuthResponseData>>('/auth/login', data),
  logout: () => api.post<ApiResponse<void>>('/auth/logout'),
  refreshToken: () => api.post<ApiResponse<AuthResponseData>>('/auth/refresh-token'),
  forgotPassword: (data: { email: string }) => api.post<ApiResponse<void>>('/auth/forgot-password', data),
  resetPassword: (token: string, data: { password: string }) => api.post<ApiResponse<void>>(`/auth/reset-password/${token}`, data),
};
