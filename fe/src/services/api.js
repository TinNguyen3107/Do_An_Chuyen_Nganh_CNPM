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
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (resetToken, new_password) => api.post(`/auth/reset-password/${resetToken}`, { token: resetToken, new_password }),
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
  submit: (id) => api.post(`/courses/${id}/submit`),
  delete: (id) => api.delete(`/courses/${id}`),
};

export const adminCourseReviewAPI = {
  getPending:        (params = {}) => api.get('/admin-review/pending',         { params }),
  getPendingNew:     (params = {}) => api.get('/admin-review/pending-new',     { params }),
  getPendingUpdates: (params = {}) => api.get('/admin-review/pending-updates', { params }),
  getApproved:       (params = {}) => api.get('/admin-review/approved',        { params }),
  getRejected:       (params = {}) => api.get('/admin-review/rejected',        { params }),
  getByIdForReview:  (id)          => api.get(`/admin-review/${id}/review`),
  approve:           (id)          => api.patch(`/admin-review/${id}/approve`),
  reject:            (id, rejectionReason) => api.patch(`/admin-review/${id}/reject`, { rejectionReason }),
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
// REVIEWS
//
export const reviewAPI = {
  getCourseReviews: (courseId) => api.get(`/reviews/course/${courseId}`),
  getMyReview: (courseId) => api.get(`/reviews/course/${courseId}/my-review`),
  createOrUpdate: (courseId, data) => api.post(`/reviews/course/${courseId}`, data),
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

// ─────────────────────────────────────────────────────────────────
// CHAPTERS
// ─────────────────────────────────────────────────────────────────
export const chapterAPI = {
  getByCourse: (courseId) => api.get(`/courses/${courseId}/chapters`),
  create: (courseId, data) => api.post(`/courses/${courseId}/chapters`, data),
  getById: (chapterId) => api.get(`/chapters/${chapterId}`),
  update: (chapterId, data) => api.put(`/chapters/${chapterId}`, data),
  delete: (chapterId) => api.delete(`/chapters/${chapterId}`),
};

// ─────────────────────────────────────────────────────────────────
// LESSONS
// ─────────────────────────────────────────────────────────────────
export const lessonAPI = {
  getByCourse: (courseId) => api.get(`/courses/${courseId}/lessons`),
  getByChapter: (chapterId) => api.get(`/chapters/${chapterId}/lessons`),
  create: (chapterId, data) => api.post(`/chapters/${chapterId}/lessons`, data),
  getById: (lessonId) => api.get(`/lessons/${lessonId}`),
  update: (lessonId, data) => api.put(`/lessons/${lessonId}`, data),
  delete: (lessonId) => api.delete(`/lessons/${lessonId}`),
};

// ─────────────────────────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────────────────────────
export const paymentAPI = {
  createMomo: (courseId) => api.post('/payments/momo', { courseId }),
  createMock: (courseId) => api.post('/payments/momo/mock', { courseId }),
  createATM: (courseId) => api.post('/payments/atm', { courseId }),
  createBank: (courseId) => api.post('/payments/bank', { courseId }),
  confirmBank: (orderId, transId) => api.post('/payments/bank/confirm', { orderId, transId }),
  getStatus: (orderId) => api.get(`/payments/status/${orderId}`),
  getMyPayments: () => api.get('/payments/my'),
  getAllPayments: () => api.get('/payments/list'),
  getStats: () => api.get('/payments/stats'),
};

// ─────────────────────────────────────────────────────────────────
// WALLET (Instructor ví tiền)
// ─────────────────────────────────────────────────────────────────
export const walletAPI = {
  getMyWallet: () => api.get('/wallet/me'),
  updateBankInfo: (data) => api.put('/wallet/bank-info', data),
  // Admin
  getAllWallets: () => api.get('/wallet/all'),
  updateRate: (id, commissionRate) => api.patch(`/wallet/${id}/rate`, { commissionRate }),
};

// ─────────────────────────────────────────────────────────────────
// PAYOUTS (Rút tiền)
// ─────────────────────────────────────────────────────────────────
export const payoutAPI = {
  request: (amount) => api.post('/payouts/request', { amount }),
  getMyPayouts: () => api.get('/payouts/my'),
  // Admin
  getPending: () => api.get('/payouts/pending'),
  getAll: (params = {}) => api.get('/payouts/all', { params }),
  process: (id) => api.patch(`/payouts/${id}/process`),
  approve: (id, transactionId) => api.patch(`/payouts/${id}/approve`, { transactionId }),
  reject: (id, reason) => api.patch(`/payouts/${id}/reject`, { reason }),
};

export default api;
