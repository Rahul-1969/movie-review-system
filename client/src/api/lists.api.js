import api from './axiosInstance.js';

export const listsApi = {
  create: (data) => api.post('/lists', data),
  getMyLists: (params) => api.get('/lists/my-lists', { params }),
  getPublicLists: (params) => api.get('/lists/public', { params }),
  getById: (id) => api.get(`/lists/${id}`),
  update: (id, data) => api.put(`/lists/${id}`, data),
  delete: (id) => api.delete(`/lists/${id}`),
  addMovie: (listId, movieId) => api.post(`/lists/${listId}/movies/${movieId}`),
  removeMovie: (listId, movieId) => api.delete(`/lists/${listId}/movies/${movieId}`),
};
