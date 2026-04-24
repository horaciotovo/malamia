import axios, { AxiosInstance } from 'axios';

// Render backend URL
const BASE_URL = process.env.REACT_APP_API_URL || 'https://malamia.onrender.com/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Attach admin JWT and handle FormData content type
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Let axios automatically set Content-Type for FormData
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  } else {
    // Remove Content-Type for FormData so axios/browser can set it with boundary
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Redirect to login on 401
apiClient.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────
export const authApi = {
  adminLogin: (email: string, password: string) =>
    apiClient.post('/auth/admin/login', { email, password }),
  getCurrentUser: () =>
    apiClient.get('/auth/me'),
};

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────
export const productsApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get('/admin/products', { params }),
  getById: (id: string) => apiClient.get(`/admin/products/${id}`),
  create: (formData: FormData) =>
    apiClient.post('/admin/products', formData),
  update: (id: string, formData: FormData) =>
    apiClient.put(`/admin/products/${id}`, formData),
  delete: (id: string) => apiClient.delete(`/admin/products/${id}`),
  togglePublish: (id: string, isPublished: boolean) =>
    apiClient.patch(`/admin/products/${id}/publish`, { isPublished }),
};

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────
export const categoriesApi = {
  list: () => apiClient.get('/admin/categories'),
  create: (data: { name: string; slug: string }) => apiClient.post('/admin/categories', data),
  delete: (id: string) => apiClient.delete(`/admin/categories/${id}`),
};

// ─────────────────────────────────────────────
// Customers
// ─────────────────────────────────────────────
export const customersApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get('/admin/users', { params }),
  getById: (id: string) => apiClient.get(`/admin/users/${id}`),
};

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────
export const notificationsApi = {
  list: (params?: { page?: number }) => apiClient.get('/admin/notifications', { params, timeout: 30000 }),
  send: (payload: {
    title: string;
    body: string;
    type: string;
    imageUrl?: string;
    data?: Record<string, unknown>;
    targetAll: boolean;
    targetUserIds?: string[];
  }) => apiClient.post('/admin/notifications/send', payload, { timeout: 30000 }),
};

// ─────────────────────────────────────────────
// Loyalty
// ─────────────────────────────────────────────
export const loyaltyApi = {
  leaderboard: () => apiClient.get('/loyalty/leaderboard'),
};

// ─────────────────────────────────────────────
// Admin Management
// ─────────────────────────────────────────────
export const adminApi = {
  getAllUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get('/admin/all-users', { params }),
  changeUserRole: (userId: string, role: 'CUSTOMER' | 'ADMIN') =>
    apiClient.patch(`/admin/users/${userId}/role`, { role }),
  toggleUserStatus: (userId: string) =>
    apiClient.patch(`/admin/users/${userId}/toggle`),
};

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => apiClient.get('/admin/dashboard'),
};

export default apiClient;
