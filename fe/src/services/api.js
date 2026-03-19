import axios from 'axios';

/**
 * Axios instance pre-configured for 26Tech LMS API
 * Full API exports for all modules
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // send JWT cookie automatically
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach token from localStorage if present ───
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('26tech_user');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch {
      localStorage.removeItem('26tech_user');
    }
  }
  return config;
});

// ─── Response interceptor: handle 401 globally ───────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('26tech_user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (formData) => api.post('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  uploadAvatar: (formData) => api.put('/auth/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ─────────────────────────────────────────────────────────────────
// COURSE API (SỬA ENDPOINT)
// ─────────────────────────────────────────────────────────────────
export const courseAPI = {
  // Public routes
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  getFeatured: (limit = 8) => api.get(`/courses?limit=${limit}&sort=featured`),
  
  // Instructor routes (cần xác thực)
  getMyCourses: () => api.get('/courses/my-courses'),  // ĐÃ SỬA: từ '/instructor/me' thành '/my-courses'
  create: (formData) => api.post('/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/courses/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  publish: (id) => api.patch(`/courses/${id}/publish`),  // THÊM hàm publish
  delete: (id) => api.delete(`/courses/${id}`),
  
  // Student routes
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  getEnrolled: () => api.get('/courses/student/me'),
};

// ─────────────────────────────────────────────────────────────────
// CATEGORY API
// ─────────────────────────────────────────────────────────────────
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ─────────────────────────────────────────────────────────────────
// USER API (dành cho Admin)
// ─────────────────────────────────────────────────────────────────
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
};

// ─────────────────────────────────────────────────────────────────
// STATS API (dành cho Admin)
// ─────────────────────────────────────────────────────────────────
export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
  getRevenue: (period) => api.get('/stats/revenue', { params: { period } }),
  getCoursesStats: () => api.get('/stats/courses'),
  getUsersStats: () => api.get('/stats/users'),
};

// Export default api instance
export default api;