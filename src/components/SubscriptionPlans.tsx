'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckIcon, StarIcon } from '@heroicons/react/20/solid'
import { CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'
import { SubscriptionPlan } from '@/types'

interface SubscriptionPlansProps {
  onPlanSelect?: (plan: SubscriptionPlan) => void
  selectedPlan?: string
  showHeader?: boolean
}

export default function SubscriptionPlans({ 
  onPlanSelect, 
  selectedPlan, 
  showHeader = true 
}: SubscriptionPlansProps) {
  const { t } = useTranslation()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (onPlanSelect) {
      onPlanSelect(plan)
    } else {
      // Default behavior - redirect to payment page
      window.location.href = `/payment?plan=${plan.id}`
    }
  }

  const getSavingsPercent = (plan: SubscriptionPlan) => {
    if (plan.id === 'monthly') return 0
    const monthlyPricePerDay = SUBSCRIPTION_PLANS.find(p => p.id === 'monthly')!.price / 30
    const currentPricePerDay = plan.price / plan.durationInDays
    return Math.round((1 - currentPricePerDay / monthlyPricePerDay) * 100)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {showHeader && (
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            {t('pricing.title')}
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            {t('pricing.subtitle')}
          </p>
        </div>
      )}

      <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-1 sm:gap-6 lg:grid-cols-3 xl:grid-cols-5">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const savings = getSavingsPercent(plan)
          const isSelected = selectedPlan === plan.id
          
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 shadow-lg scale-105'
                  : plan.popular
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } bg-white dark:bg-gray-800 p-6 cursor-pointer`}
              onClick={() => handlePlanSelect(plan)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <StarIcon className="h-4 w-4 mr-1" />
                    {t('pricing.popular')}
                  </div>
                </div>
              )}

              {savings > 0 && (
                <div className="absolute -top-3 -right-3">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white">
                    {t('pricing.save', { percent: savings })}
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t(`plans.${plan.name}`)}
                </h3>
                
                <div className="mt-4 flex items-center justify-center">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t(`plans.duration.${plan.duration}`)}
                  </span>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center justify-center">
                    <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white ml-1">
                      {plan.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('pricing.currency')} • {t(`plans.duration.${plan.duration}`)}
                  </p>
                  
                  {plan.durationInDays > 30 && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      ${(plan.price / plan.durationInDays * 30).toFixed(2)}/month
                    </p>
                  )}
                </div>
                
                <button
                  className={`mt-8 w-full rounded-lg px-6 py-3 text-center text-sm font-semibold transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                  }`}
                >
                  {isSelected ? t('pricing.selected') : t('pricing.selectPlan')}
                </button>
              </div>
              
              <div className="mt-8">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  {t('pricing.includedFeatures')}
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                      <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                        {t(`plans.features.${feature}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('pricing.moneyBackGuarantee')}
        </p>
      </div>
    </div>
  )
} 