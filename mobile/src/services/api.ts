import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://natalie-callow-welcomingly.ngrok-free.dev/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token on 401
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        await AsyncStorage.setItem('accessToken', data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(original);
      } catch {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        // The auth store will detect missing tokens and redirect to login
      }
    }
    return Promise.reject(error);
  },
);

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    apiClient.post('/auth/register', data),
  me: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
};

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────
export const productsApi = {
  list: (params?: { page?: number; limit?: number; category?: string; search?: string; featured?: boolean }) =>
    apiClient.get('/products', { params }),
  getById: (id: string) => apiClient.get(`/products/${id}`),
  getCategories: () => apiClient.get('/products/categories'),
};

// ─────────────────────────────────────────────
// Cart
// ─────────────────────────────────────────────
export const cartApi = {
  getCart: () => apiClient.get('/cart'),
  addItem: (productId: string, quantity: number) =>
    apiClient.post('/cart/items', { productId, quantity }),
  updateItem: (itemId: string, quantity: number) =>
    apiClient.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => apiClient.delete(`/cart/items/${itemId}`),
  clearCart: () => apiClient.delete('/cart'),
};

// ─────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────
export const ordersApi = {
  placeOrder: () => apiClient.post('/orders'),
  getMyOrders: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/orders/my', { params }),
  getOrderById: (id: string) => apiClient.get(`/orders/${id}`),
  list: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/admin/orders', { params }),
};

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────
export const notificationsApi = {
  getMyNotifications: () => apiClient.get('/notifications/my'),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
  registerPushToken: (token: string) =>
    apiClient.post('/notifications/push-token', { token }),
};

// ─────────────────────────────────────────────
// Loyalty
// ─────────────────────────────────────────────
export const loyaltyApi = {
  getMyPoints: () => apiClient.get('/loyalty/my-points'),
  getTransactions: () => apiClient.get('/loyalty/transactions'),
  getLeaderboard: () => apiClient.get('/loyalty/leaderboard'),
};

// ─────────────────────────────────────────────
// Customers (Admin)
// ─────────────────────────────────────────────
export const customersApi = {
  list: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/admin/all-users', { params }),
};

// ─────────────────────────────────────────────
// Categories (Admin)
// ─────────────────────────────────────────────
export const categoriesApi = {
  list: () => apiClient.get('/admin/categories'),
};

// ─────────────────────────────────────────────
// Admin - Notifications
// ─────────────────────────────────────────────
export const notificationsAdminApi = {
  list: (params?: { page?: number }) => apiClient.get('/admin/notifications', { params }),
  send: (payload: {
    title: string;
    body: string;
    type: string;
    imageUrl?: string;
    targetAll: boolean;
    targetUserIds?: string[];
  }) => apiClient.post('/admin/notifications/send', payload),
};

// ─────────────────────────────────────────────
// Admin - Dashboard
// ─────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => apiClient.get('/admin/dashboard'),
};

export default apiClient;
