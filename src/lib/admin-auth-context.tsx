'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import axios, { AxiosError } from 'axios'

export interface Admin {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminAuthState {
  admin: Admin | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AdminAuthContextType extends AdminAuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

interface AdminAuthProviderProps {
  children: ReactNode
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [authState, setAuthState] = useState<AdminAuthState>({
    admin: null,
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
      
      const response = await axios.get('/api/admin/me', {
        withCredentials: true,
      })

      if (response.data.success && response.data.admin) {
        setAuthState({
          admin: response.data.admin,
          isLoading: false,
          isAuthenticated: true
        })
      } else {
        setAuthState({
          admin: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    } catch (error) {
      setAuthState({
        admin: null,
        isLoading: false,
        isAuthenticated: false
      })
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      const response = await axios.post('/api/admin/login', {
        email,
        password
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success && response.data.admin) {
        setAuthState({
          admin: response.data.admin,
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

  const logout = async () => {
    try {
      await axios.post('/api/admin/logout', {}, {
        withCredentials: true
      })
    } catch (error) {
      console.error('Admin logout error:', error)
    } finally {
      setAuthState({
        admin: null,
        isLoading: false,
        isAuthenticated: false
      })
    }
  }

  const contextValue: AdminAuthContextType = {
    ...authState,
    login,
    logout,
    checkAuth
  }

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
} 