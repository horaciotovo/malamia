import axios, { AxiosInstance } from 'axios'

// API client configuration
// Use environment variable if available, otherwise default to /api
const BASE_URL = (import.meta.env.VITE_API_URL as string) || '/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})

// Attach user JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['Content-Type'] = 'application/json'
  return config
})

// Redirect to login on 401
apiClient.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userToken')
      localStorage.removeItem('userData')
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  },
)

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/admin/login', { email, password }),
  getCurrentUser: () =>
    apiClient.get('/auth/me'),
}

export const productsApi = {
  getAll: (page = 1, limit = 20, search?: string, category?: string) => {
    const params: Record<string, any> = { page, limit }
    if (search) params.search = search
    if (category) params.category = category
    return apiClient.get('/products', { params })
  },
  getById: (id: string) =>
    apiClient.get(`/products/${id}`),
  getCategories: () =>
    apiClient.get('/products/categories'),
}

export const cartApi = {
  getCart: () =>
    apiClient.get('/cart'),
  addItem: (productId: string, quantity: number) =>
    apiClient.post('/cart/items', { productId, quantity }),
  updateItem: (itemId: string, quantity: number) =>
    apiClient.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) =>
    apiClient.delete(`/cart/items/${itemId}`),
  checkout: (data: any) =>
    apiClient.post('/cart/checkout', data),
}

export const ordersApi = {
  placeOrder: () =>
    apiClient.post('/orders'),
  getOrders: () =>
    apiClient.get('/orders/my'),
  getOrder: (id: string) =>
    apiClient.get(`/orders/${id}`),
  updateOrder: (id: string, items: any[]) =>
    apiClient.put(`/orders/${id}`, { items }),
  deleteOrder: (id: string) =>
    apiClient.delete(`/orders/${id}`),
}

export const loyaltyApi = {
  getPoints: () =>
    apiClient.get('/loyalty/points'),
  getRewards: () =>
    apiClient.get('/loyalty/rewards'),
}

export const notificationsApi = {
  getMyNotifications: () =>
    apiClient.get('/notifications/my'),
  markAsRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () =>
    apiClient.patch('/notifications/read-all'),
}

export const notificationsAdminApi = {
  list: (params?: { page?: number }) =>
    apiClient.get('/admin/notifications', { params }),
  send: (payload: {
    title: string
    body: string
    type: string
    imageUrl?: string
    targetAll: boolean
    targetUserIds?: string[]
  }) =>
    apiClient.post('/admin/notifications/send', payload),
}

export const customersApi = {
  list: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/admin/all-users', { params }),
}

export const ordersAdminApi = {
  list: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/admin/orders', { params }),
  approve: (orderId: string) =>
    apiClient.patch(`/admin/orders/${orderId}/approve`),
  decline: (orderId: string) =>
    apiClient.patch(`/admin/orders/${orderId}/decline`),
  markDelivered: (orderId: string) =>
    apiClient.patch(`/admin/orders/${orderId}/mark-delivered`),
}

export default apiClient
