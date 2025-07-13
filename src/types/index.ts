export interface SubscriptionPlan {
  id: string
  name: string
  duration: string
  price: number
  features: string[]
  popular?: boolean
  durationInDays: number
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  subscription?: UserSubscription
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: 'active' | 'expired' | 'pending' | 'cancelled'
  startDate: Date
  endDate: Date
  autoRenew: boolean
  plan: SubscriptionPlan
}

export interface Payment {
  id: string
  orderId: string
  userId: string
  planId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'expired'
  paymentMethod: 'usdt-trc20' | 'usdt-erc20'
  walletAddress: string
  transactionHash?: string
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  userId: string
  paymentId: string
  type: 'payment' | 'refund'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: Date
}

export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
} 