export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  name?: string
  role?: string
  loyaltyPoints?: number
  isActive?: boolean
  createdAt?: string
}

export interface LoginResponse {
  data: {
    user: User
    accessToken: string
    refreshToken?: string
  }
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number | string
  product: {
    id: string
    name: string
    price: number | string
  }
}

export interface Order {
  id: string
  userId: string
  user: User
  totalAmount: number | string
  status: OrderStatus
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export type NotificationType = 'NEW_PRODUCT' | 'PRICE_CHANGE' | 'PROMOTION' | 'ORDER_UPDATE'

export interface Notification {
  id: string
  title: string
  body: string
  type: NotificationType
  imageUrl?: string
  sentAt: string
  createdBy?: string
}
