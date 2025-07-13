'use client'

import { useTranslation } from 'react-i18next'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { formatPrice, formatDate } from '@/lib/utils'

interface SubscriptionStatusProps {
  subscription: {
    id: string
    status: string
    startDate: Date
    endDate: Date
    plan: {
      name: string
      price: number
      duration: string
    }
  } | null
}

export default function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  const { t } = useTranslation()

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'expired':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-gray-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const getDaysRemaining = (endDate: Date) => {
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  if (!subscription) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Active Subscription
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Choose a plan to get started with FreedomGate VPN
          </p>
          <button
            onClick={() => window.location.href = '/#pricing'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            View Plans
          </button>
        </div>
      </div>
    )
  }

  const daysRemaining = getDaysRemaining(subscription.endDate)
  const isExpiringSoon = daysRemaining <= 7 && subscription.status === 'active'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Subscription Status
        </h2>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(subscription.status)}`}>
          {getStatusIcon(subscription.status)}
          <span className="ml-2 capitalize">{subscription.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Current Plan
            </h3>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {subscription.plan.name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatPrice(subscription.plan.price)} / {subscription.plan.duration}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Started On
            </h3>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatDate(subscription.startDate)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {subscription.status === 'expired' ? 'Expired On' : 'Expires On'}
            </h3>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatDate(subscription.endDate)}
            </p>
            {subscription.status === 'active' && (
              <p className={`text-sm ${isExpiringSoon ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>
                {daysRemaining === 0 ? 'Expires today' : 
                 daysRemaining === 1 ? '1 day remaining' : 
                 `${daysRemaining} days remaining`}
              </p>
            )}
          </div>

          {isExpiringSoon && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Your subscription expires soon. Renew now to avoid interruption.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 