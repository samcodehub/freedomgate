'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/admin-auth-context'
import axios from 'axios'
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  CalendarIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'

interface Subscription {
  id: string
  userId: string
  planId: string
  status: string
  startDate: string
  endDate: string
  autoRenew: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  
  const { isAuthenticated, isLoading } = useAdminAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin')
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    if (!isAuthenticated) return
    
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/subscriptions', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search,
          status: statusFilter
        },
        withCredentials: true
      })
      
      if (response.data.success) {
        setSubscriptions(response.data.subscriptions)
        setPagination(response.data.pagination)
      } else {
        setError('Failed to load subscriptions')
      }
    } catch {
      setError('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, pagination.page, pagination.limit, search, statusFilter])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  const handleStatusUpdate = async (subscriptionId: string, newStatus: string) => {
    try {
      const response = await axios.patch('/api/admin/subscriptions', {
        subscriptionId,
        action: 'updateStatus',
        newStatus
      }, {
        withCredentials: true
      })

      if (response.data.success) {
        fetchSubscriptions() // Refresh the list
      } else {
        alert('Failed to update subscription status')
      }
    } catch {
      alert('Failed to update subscription status')
    }
  }

  const handlePlanUpdate = async (subscriptionId: string, newPlanId: string) => {
    try {
      const response = await axios.patch('/api/admin/subscriptions', {
        subscriptionId,
        action: 'updatePlan',
        newPlan: newPlanId
      }, {
        withCredentials: true
      })

      if (response.data.success) {
        fetchSubscriptions() // Refresh the list
      } else {
        alert('Failed to update subscription plan')
      }
    } catch {
      alert('Failed to update subscription plan')
    }
  }

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return

    try {
      const response = await axios.patch('/api/admin/subscriptions', {
        subscriptionId,
        action: 'cancel'
      }, {
        withCredentials: true
      })

      if (response.data.success) {
        fetchSubscriptions() // Refresh the list
      } else {
        alert('Failed to cancel subscription')
      }
    } catch {
      alert('Failed to cancel subscription')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPlanName = (planId: string) => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
    return plan ? plan.name : planId
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <CreditCardIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
                <p className="text-sm text-gray-500">Manage user subscriptions and plans</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search subscriptions..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Subscriptions Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No subscriptions found</h3>
            <p className="mt-1 text-sm text-gray-500">No subscriptions match your current filters.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {subscriptions.map((subscription) => (
                <li key={subscription.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center text-sm">
                            <p className="font-medium text-indigo-600 truncate">
                              {subscription.user.name}
                            </p>
                            <p className="ml-2 text-gray-500">
                              {subscription.user.email}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <div className="flex items-center mr-6">
                              <CreditCardIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                              <span className="font-medium">{getPlanName(subscription.planId)}</span>
                            </div>
                            <div className="flex items-center mr-6">
                              <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                              <span>
                                {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                              </span>
                            </div>
                            {subscription.status === 'active' && (
                              <span className="text-xs">
                                ({getDaysRemaining(subscription.endDate)} days remaining)
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(subscription.status)}`}>
                            {subscription.status}
                          </span>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            {subscription.status === 'active' && (
                              <button
                                onClick={() => handleStatusUpdate(subscription.id, 'expired')}
                                className="text-red-600 hover:text-red-900 text-sm"
                                title="Expire subscription"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            )}
                            
                            {subscription.status === 'expired' && (
                              <button
                                onClick={() => handleStatusUpdate(subscription.id, 'active')}
                                className="text-green-600 hover:text-green-900 text-sm"
                                title="Reactivate subscription"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                            )}
                            
                            <select
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                              value={subscription.planId}
                              onChange={(e) => handlePlanUpdate(subscription.id, e.target.value)}
                              title="Change plan"
                            >
                              {SUBSCRIPTION_PLANS.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                  {plan.name}
                                </option>
                              ))}
                            </select>
                            
                            {['active', 'pending'].includes(subscription.status) && (
                              <button
                                onClick={() => handleCancelSubscription(subscription.id)}
                                className="text-gray-600 hover:text-gray-900 text-sm"
                                title="Cancel subscription"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pagination */}
        {!loading && subscriptions.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.page === i + 1
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 