import api from './axiosInstance.js';

export const moviesApi = {
  getAll: (params) => api.get('/movies', { params }),
  getById: (id) => api.get(`/movies/${id}`),
  getTopRated: () => api.get('/movies/top-rated'),
  getTrending: () => api.get('/movies/trending'),
  getRecommendations: () => api.get('/movies/recommendations'),
  getSearchSuggestions: (q) => api.get('/movies/search-suggestions', { params: { q } }),
  create: (formData) => api.post('/movies', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/movies/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/movies/${id}`),
};
