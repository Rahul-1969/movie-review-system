import api from './axiosInstance.js';

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleBan: (id) => api.patch(`/admin/users/${id}/ban`),
  getFlaggedReviews: (params) => api.get('/admin/reviews/flagged', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
};
