'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  ClipboardIcon, 
  CheckIcon, 
  QrCodeIcon,
  CreditCardIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import QRCode from 'qrcode'
import { formatPrice, generateOrderId } from '@/lib/utils'
import { SubscriptionPlan } from '@/types'

interface PaymentInterfaceProps {
  plan: SubscriptionPlan
  onPaymentSuccess: (transactionData: { subscription: unknown; transaction: unknown; message: string }) => void
  onPaymentError: (error: string) => void
}

export default function PaymentInterface({
  plan,
  onPaymentSuccess,
  onPaymentError
}: PaymentInterfaceProps) {
  const { t } = useTranslation()
  const [paymentMethod, setPaymentMethod] = useState<'usdt-trc20' | 'usdt-erc20'>('usdt-erc20')
  const [walletAddress, setWalletAddress] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'confirming' | 'completed' | 'failed'>('pending')
  const [orderId] = useState(() => generateOrderId())
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Generate mock wallet address and QR code
  useEffect(() => {
    const generateWalletAddress = () => {
      // Mock wallet address generation
      const mockAddress = paymentMethod === 'usdt-trc20' 
        ? 'TQrPXwvB7xEJNNxNYvfJjfFVvBRBEhxMr3'
        : '0x742d35Cc6634C0532925a3b8D2A4e5E4d5F4e8Db'
      
      setWalletAddress(mockAddress)
      
      // Generate QR code
      QRCode.toDataURL(mockAddress, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      .then(url => setQrCodeUrl(url))
      .catch(console.error)
    }

    generateWalletAddress()
  }, [paymentMethod])

  // Payment timeout countdown
  useEffect(() => {
    if (paymentStatus === 'pending' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setPaymentStatus('failed')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [paymentStatus, timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleConfirmPayment = async () => {
    setPaymentStatus('confirming')
    
    try {
      // Generate a mock transaction hash for demo
      const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`
      
      // Call the payment completion API
      const response = await fetch('/api/payment/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          paymentMethod,
          walletAddress,
          transactionHash,
          orderRef: orderId
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setPaymentStatus('completed')
        onPaymentSuccess({
          subscription: result.subscription,
          transaction: result.transaction,
          message: result.message
        })
      } else {
        setPaymentStatus('failed')
        onPaymentError(result.error || 'Payment processing failed')
      }
    } catch (error) {
      console.error('Payment confirmation error:', error)
      setPaymentStatus('failed')
      onPaymentError('Network error occurred. Please try again.')
    }
  }

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'pending':
        return <ClockIcon className="h-6 w-6 text-yellow-500" />
      case 'confirming':
        return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      case 'completed':
        return <CheckIcon className="h-6 w-6 text-green-500" />
      case 'failed':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'pending':
        return t('payment.paymentPending')
      case 'confirming':
        return 'Confirming payment...'
      case 'completed':
        return t('payment.paymentCompleted')
      case 'failed':
        return t('payment.paymentFailed')
    }
  }

  if (paymentStatus === 'completed') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <CheckIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('payment.paymentCompleted')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your {plan.name} subscription has been activated successfully.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('payment.title')}
        </h1>
        <div className="flex items-center">
          {getStatusIcon()}
          <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
            {getStatusText()}
          </span>
          {paymentStatus === 'pending' && (
            <span className="ml-4 text-sm text-red-600 dark:text-red-400">
              Time remaining: {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Details */}
        <div className="space-y-6">
          {/* Selected Plan */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('payment.selectedPlan')}
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {plan.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {plan.duration}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(plan.price)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('payment.orderRef')}: {orderId}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('payment.paymentMethod')} - Current: {paymentMethod}
            </h3>
            <div className="space-y-3">
              <div 
                className={`flex items-center cursor-pointer p-3 border rounded-lg transition-colors ${
                  paymentMethod === 'usdt-trc20' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => {
                  console.log('TRON Network clicked - setting to: usdt-trc20')
                  setPaymentMethod('usdt-trc20')
                }}
              >
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'usdt-trc20' 
                    ? 'border-blue-600 bg-blue-600' 
                    : 'border-gray-300'
                }`}>
                  {paymentMethod === 'usdt-trc20' && (
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                  USDT (TRC-20) - TRON Network
                </span>
              </div>
              
              <div 
                className={`flex items-center cursor-pointer p-3 border rounded-lg transition-colors ${
                  paymentMethod === 'usdt-erc20' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => {
                  console.log('Ethereum Network clicked - setting to: usdt-erc20')
                  setPaymentMethod('usdt-erc20')
                }}
              >
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'usdt-erc20' 
                    ? 'border-blue-600 bg-blue-600' 
                    : 'border-gray-300'
                }`}>
                  {paymentMethod === 'usdt-erc20' && (
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                  USDT (ERC-20) - Ethereum Network
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('payment.walletAddress')}
            </h3>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                <code className="text-sm text-gray-900 dark:text-white break-all">
                  {walletAddress}
                </code>
              </div>
              <button
                onClick={copyToClipboard}
                className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {copied ? (
                  <CheckIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <ClipboardIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('payment.paymentInstructions', { amount: formatPrice(plan.price) })}
            </p>
          </div>
        </div>

        {/* QR Code and Actions */}
        <div className="space-y-6">
          {/* QR Code */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('payment.scanQR')}
            </h3>
            {qrCodeUrl ? (
              <div className="inline-block p-4 bg-white rounded-lg">
                <img src={qrCodeUrl} alt="Payment QR Code" className="mx-auto" />
              </div>
            ) : (
              <div className="w-64 h-64 mx-auto bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                <QrCodeIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Scan this QR code with your crypto wallet
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleConfirmPayment}
              disabled={paymentStatus !== 'pending'}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {paymentStatus === 'confirming' ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Confirming Payment...
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  {t('payment.confirmPayment')}
                </>
              )}
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 