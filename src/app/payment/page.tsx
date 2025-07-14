'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from 'react-i18next'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'
import { SubscriptionPlan } from '@/types'
import PaymentInterface from '@/components/PaymentInterface'

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(true)
  
  const { isAuthenticated, isLoading, user } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get plan from URL parameters
    const planId = searchParams.get('plan')
    
    if (planId) {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
      if (plan) {
        setSelectedPlan(plan)
      } else {
        // Invalid plan ID, redirect to pricing
        router.push('/#pricing')
        return
      }
    } else {
      // No plan selected, redirect to pricing
      router.push('/#pricing')
      return
    }
    
    setLoading(false)
  }, [searchParams, router])

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the intended destination to redirect back after login
      const planId = searchParams.get('plan')
      const returnUrl = planId ? `/payment?plan=${planId}` : '/payment'
      router.push(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`)
    }
  }, [isAuthenticated, isLoading, router, searchParams])

  const handlePaymentSuccess = (transactionData: { subscription: unknown; transaction: unknown; message: string }) => {
    // Handle successful payment
    console.log('Payment successful:', transactionData)
    router.push('/dashboard?payment=success')
  }

  const handlePaymentError = (error: string) => {
    // Handle payment error
    console.error('Payment error:', error)
  }

  const handleBackToPricing = () => {
    router.push('/#pricing')
  }

  // Show loading while checking authentication or loading plan
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !user || !selectedPlan) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={handleBackToPricing}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← {t('common.back')} to pricing
          </button>
          
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            {t('payment.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Complete your subscription for {t(`plans.${selectedPlan.name}`)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plan Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('payment.selectedPlan')}
              </h3>
              
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {t(`plans.${selectedPlan.name}`)}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t(`plans.duration.${selectedPlan.duration}`)}
                    </p>
                  </div>
                  {selectedPlan.popular && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {t('pricing.popular')}
                    </span>
                  )}
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${selectedPlan.price.toFixed(2)} USDT
                    </span>
                  </div>
                  
                  {selectedPlan.durationInDays > 30 && (
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Monthly equivalent:</span>
                      <span className="text-sm text-green-600 dark:text-green-400">
                        ${(selectedPlan.price / selectedPlan.durationInDays * 30).toFixed(2)}/month
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  {t('pricing.includedFeatures')}
                </h4>
                <ul className="space-y-2">
                  {selectedPlan.features.map((feature) => (
                    <li key={feature} className="flex items-start text-sm">
                      <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-300">
                        {t(`plans.features.${feature}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Interface */}
          <div className="lg:col-span-2">
            <PaymentInterface
              plan={selectedPlan}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 