'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from 'react-i18next'
import UserDashboard from '@/components/UserDashboard'

interface SubscriptionData {
  id: string
  status: string
  startDate: string
  endDate: string
  autoRenew: boolean
  plan: {
    id: string
    name: string
    price: number
    duration: string
  }
}

interface TransactionData {
  id: string
  amount: number
  currency: string
  paymentMethod: string
  status: string
  createdAt: string
  transactionHash?: string
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  // Fetch subscription data
  const fetchSubscriptionData = useCallback(async () => {
    if (!user?.id) return
    
    setDataLoading(true)
    try {
      const response = await fetch('/api/subscriptions')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
        setTransactions(data.transactions)
      } else {
        console.error('Failed to fetch subscription data')
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
    } finally {
      setDataLoading(false)
    }
  }, [user?.id])

  // Check for payment success notification
  useEffect(() => {
    const paymentStatus = searchParams.get('payment')
    if (paymentStatus === 'success') {
      setShowPaymentSuccess(true)
      // Remove the parameter from URL after showing notification
      const url = new URL(window.location.href)
      url.searchParams.delete('payment')
      window.history.replaceState({}, '', url.pathname)
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => setShowPaymentSuccess(false), 5000)
      
      // Refresh subscription data after payment success
      fetchSubscriptionData()
    }
  }, [searchParams, fetchSubscriptionData])

  // Fetch subscription data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSubscriptionData()
    }
  }, [isAuthenticated, user, fetchSubscriptionData])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null
  }

  const handleRenew = () => {
    router.push('/#pricing')
  }

  const handleUpgrade = () => {
    router.push('/#pricing')
  }

  const handleDownloadConfig = () => {
    alert(t('dashboard.configDownload'))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Payment Success Notification */}
      {showPaymentSuccess && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-green-500 text-white rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold">Payment Successful!</p>
              <p className="text-sm">Your subscription has been activated.</p>
            </div>
            <button
              onClick={() => setShowPaymentSuccess(false)}
              className="ml-auto text-white hover:text-gray-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('dashboard.welcome')}, {user.name}!
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t('dashboard.subtitle')}
            </p>
          </div>
          
          <UserDashboard 
            user={{
              id: user.id,
              name: user.name,
              email: user.email
            }}
            subscription={subscription ? {
              id: subscription.id,
              userId: user.id,
              planId: subscription.plan.id,
              status: subscription.status as 'active' | 'expired' | 'pending' | 'cancelled',
              startDate: new Date(subscription.startDate),
              endDate: new Date(subscription.endDate),
              autoRenew: subscription.autoRenew,
              plan: {
                ...subscription.plan,
                features: [], // Will be filled from SUBSCRIPTION_PLANS
                durationInDays: 30 // Default, will be updated from SUBSCRIPTION_PLANS
              }
            } : undefined}
            transactions={transactions.map(t => ({
              id: t.id,
              userId: user.id,
              paymentId: t.id, // Using transaction id as payment id for now
              type: 'payment' as const,
              amount: t.amount,
              currency: t.currency,
              status: t.status as 'pending' | 'completed' | 'failed',
              createdAt: new Date(t.createdAt)
            }))}
            onRenew={handleRenew}
            onUpgrade={handleUpgrade}
            onDownloadConfig={handleDownloadConfig}
          />
          
          {dataLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading subscription data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 