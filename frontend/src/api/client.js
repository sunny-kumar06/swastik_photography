import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
const cleanBaseUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;
const baseURL = cleanBaseUrl.includes('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

// The base host for static assets like /uploads
export const API_ROOT = cleanBaseUrl.replace(/\/api\/?$/, '');

/**
 * Utility to ensure uploaded and external image URLs resolve correctly across Vercel & Render
 */
export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_ROOT}${cleanPath}`;
};

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token into Admin requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('swastik_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle session expirations
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and on admin page, clear token
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('swastik_admin_token');
        localStorage.removeItem('swastik_admin_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateCredentials: (data) => api.put('/auth/update-credentials', data),
};

// Settings endpoints
export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return api.put(
      '/settings',
      data,
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    );
  },
};

// Bootstrap endpoint (all public homepage data in 1 query)
export const bootstrapApi = {
  get: () => api.get('/bootstrap'),
};

// Gallery endpoints
export const galleryApi = {
  getAll: (params) => api.get('/gallery', { params }),
  getById: (id) => api.get(`/gallery/${id}`),
  upload: (formData) =>
    api.post('/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/gallery/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/gallery/${id}`),
};

// Services endpoints
export const servicesApi = {
  getAll: () => api.get('/services'),
  getAllAdmin: () => api.get('/services/admin/all'),
  create: (formData) =>
    api.post('/services', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/services/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/services/${id}`),
};

// Packages endpoints
export const packagesApi = {
  getAll: (params) => api.get('/packages', { params }),
  getAllAdmin: () => api.get('/packages/admin/all'),
  create: (data) => api.post('/packages', data),
  update: (id, data) => api.put(`/packages/${id}`, data),
  delete: (id) => api.delete(`/packages/${id}`),
};

// Reviews endpoints
export const reviewsApi = {
  getAll: () => api.get('/reviews'),
  getAllAdmin: () => api.get('/reviews/admin/all'),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Bookings endpoints
export const bookingsApi = {
  create: (data) => api.post('/bookings', data),
  sendOtp: (payload) => {
    const body = typeof payload === 'string'
      ? (payload.includes('@') ? { email: payload } : { phone: payload })
      : payload;
    return api.post('/bookings/send-otp', body);
  },
  verifyOtp: (target, otp) => {
    const body = typeof target === 'object'
      ? target
      : (String(target).includes('@') ? { email: target, otp } : { phone: target, otp });
    return api.post('/bookings/verify-otp', body);
  },
  checkAvailability: (date) => api.get('/bookings/check-availability', { params: { date } }),
  getBookedDates: (params) => api.get('/bookings/booked-dates', { params }),
  blockDate: (data) => api.post('/bookings/block-date', data),
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
  getDashboardStats: () => api.get('/bookings/dashboard-stats'),
};

// Contact endpoints
export const contactApi = {
  submit: (data) => api.post('/contact', data),
  getAll: () => api.get('/contact'),
  markRead: (id) => api.put(`/contact/${id}/read`),
  delete: (id) => api.delete(`/contact/${id}`),
};

export default api;
