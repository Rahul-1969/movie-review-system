import api from './axiosInstance.js';

export const reviewsApi = {
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  toggleLike: (id) => api.post(`/reviews/${id}/like`),
  getMyReviews: (params) => api.get('/reviews/my-reviews', { params }),
  flag: (id) => api.patch(`/reviews/${id}/flag`),
};
