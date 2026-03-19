import axios from 'axios';

/**
 * Axios instance pre-configured for 26Tech LMS API
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
// AUTH
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
// CATEGORIES
// ─────────────────────────────────────────────────────────────────
export const categoryAPI = {
  getAll: (onlyActive = false) => api.get(`/categories${onlyActive ? '?active=true' : ''}`),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ─────────────────────────────────────────────────────────────────
// COURSES
// ─────────────────────────────────────────────────────────────────
export const courseAPI = {
  getAll: (params = {}) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  getMyCourses: () => api.get('/courses/my-courses'),
  create: (formData) => api.post('/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/courses/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  publish: (id) => api.patch(`/courses/${id}/publish`),
  delete: (id) => api.delete(`/courses/${id}`),
};

// ─────────────────────────────────────────────────────────────────
// ENROLLMENTS
// ─────────────────────────────────────────────────────────────────
export const enrollmentAPI = {
  enroll: (courseId) => api.post('/enrollments', { courseId }),
  getMyEnrollments: () => api.get('/enrollments/my'),
  getMyCourses: () => api.get('/enrollments/my-courses'), // alias per spec
  checkEnrollment: (courseId) => api.get(`/enrollments/check/${courseId}`),
  getCourseStudents: (courseId) => api.get(`/enrollments/course/${courseId}`),
};

// ─────────────────────────────────────────────────────────────────
// STATS (admin overview)
// ─────────────────────────────────────────────────────────────────
export const statsAPI = {
  getOverview: () => api.get('/stats/overview'),
};

// ─────────────────────────────────────────────────────────────────
// INSTRUCTORS (applications)
// ─────────────────────────────────────────────────────────────────
export const instructorAPI = {
  getMyApplication: () => api.get('/instructors/application'),
  apply: (formData) => api.post('/instructors/apply', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  // Admin
  getAllApplications: (params = {}) => api.get('/instructors/applications', { params }),
  approve: (id) => api.patch(`/instructors/applications/${id}/approve`),
  reject: (id, adminNote) => api.patch(`/instructors/applications/${id}/reject`, { adminNote }),
};

// ─────────────────────────────────────────────────────────────────
// USERS (admin)
// ─────────────────────────────────────────────────────────────────
export const userAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  changeRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
};

export default api;

