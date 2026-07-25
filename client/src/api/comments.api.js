import api from './axiosInstance.js';

export const commentsApi = {
  getByReviewId: (reviewId) => api.get(`/comments/review/${reviewId}`),
  create: (data) => api.post('/comments', data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
  toggleLike: (id) => api.post(`/comments/${id}/like`),
};
