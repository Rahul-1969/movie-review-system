import api from './axiosInstance.js';

export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (formData) => api.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  toggleWatchlist: (movieId) => api.post(`/users/watchlist/${movieId}`),
  getWatchlist: () => api.get('/users/watchlist'),
  getPublicProfile: (id) => api.get(`/users/${id}/public`),
};
