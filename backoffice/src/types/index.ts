// Shared types for the backoffice — mirrors mobile/src/types/index.ts

export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  category?: Category;
  images: string[];
  stock: number;
  isPublished: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  user: User;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export type NotificationType = 'NEW_PRODUCT' | 'PRICE_CHANGE' | 'PROMOTION' | 'ORDER_UPDATE';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  imageUrl?: string;
  data?: Record<string, unknown>;
  sentAt: string;
  createdBy: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  totalPoints: number;
}

export interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  stock: number;
  isPublished: boolean;
  isFeatured: boolean;
  tags: string[];
  images: File[];
  existingImages: string[];
}

export interface SendNotificationPayload {
  title: string;
  body: string;
  type: NotificationType;
  imageUrl?: string;
  data?: Record<string, unknown>;
  targetAll: boolean;
  targetUserIds?: string[];
}
