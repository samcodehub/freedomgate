'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import axios, { AxiosError } from 'axios'

export interface User {
  id: string
  name: string
  email: string
  isVerified: boolean
  language: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const response = await axios.get('/api/auth/me', {
        withCredentials: true,
      })

      if (response.data.success && response.data.user) {
        setAuthState({
          user: response.data.user,
          isLoading: false,
          isAuthenticated: true
        })
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    } catch {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      const response = await axios.post('/api/auth/login', {
        email,
        password
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success && response.data.user) {
        setAuthState({
          user: response.data.user,
          isLoading: false,
          isAuthenticated: true
        })
        return { success: true }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: response.data.error || 'Login failed' }
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      
      if (error instanceof AxiosError) {
        return { 
          success: false, 
          error: error.response?.data?.error || 'Network error occurred' 
        }
      }
      
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const signup = async (name: string, email: string, password: string, confirmPassword: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      const response = await axios.post('/api/auth/signup', {
        name,
        email,
        password,
        confirmPassword
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success && response.data.user) {
        setAuthState({
          user: response.data.user,
          isLoading: false,
          isAuthenticated: true
        })
        return { success: true }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: response.data.error || 'Signup failed' }
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      
      if (error instanceof AxiosError) {
        const errorData = error.response?.data
        if (errorData?.details) {
          // Handle validation errors
          const validationErrors = errorData.details.map((err: { message: string }) => err.message).join(', ')
          return { success: false, error: validationErrors }
        }
        return { 
          success: false, 
          error: errorData?.error || 'Network error occurred' 
        }
      }
      
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, {
        withCredentials: true
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })
    }
  }

  const contextValue: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 