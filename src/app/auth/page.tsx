'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import AuthForm, { AuthFormData } from '@/components/AuthForm'
import { useTranslation } from 'react-i18next'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  
  const { login, signup, isAuthenticated, isLoading } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const returnUrl = searchParams.get('returnUrl')
      router.push(returnUrl ? decodeURIComponent(returnUrl) : '/dashboard')
    }
  }, [isAuthenticated, isLoading, router, searchParams])

  const handleSubmit = async (data: AuthFormData) => {
    setError('')
    setLoading(true)

    try {
      let result
      
      if (mode === 'login') {
        result = await login(data.email, data.password)
      } else {
        if (!data.name || !data.confirmPassword) {
          setError(t('validation.required'))
          setLoading(false)
          return
        }
        result = await signup(data.name, data.email, data.password, data.confirmPassword)
      }

      if (result.success) {
        // Redirect will happen via useEffect when isAuthenticated changes
        const returnUrl = searchParams.get('returnUrl')
        router.push(returnUrl ? decodeURIComponent(returnUrl) : '/dashboard')
      } else {
        setError(result.error || t('auth.genericError'))
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleModeChange = (newMode: 'login' | 'signup') => {
    setMode(newMode)
    setError('') // Clear errors when switching modes
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render the form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  return (
    <AuthForm
      mode={mode}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onModeChange={handleModeChange}
    />
  )
} 