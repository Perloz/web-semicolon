import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [lastVerificationTime, setLastVerificationTime] = useState(0)

  // Handle token invalid events from API interceptor
  useEffect(() => {
    const handleTokenInvalid = () => {
      console.log('Token invalid event received, logging out...')
      // Use a function reference to prevent closure issues
      setUser(null)
      setToken(null)
      localStorage.removeItem('token')
    }

    window.addEventListener('auth:token-invalid', handleTokenInvalid)
    return () => window.removeEventListener('auth:token-invalid', handleTokenInvalid)
  }, [])

  useEffect(() => {
    const verifyTokenOnMount = async () => {
      // Clear state if no token
      if (!token) {
        setUser(null)
        setLoading(false)
        setIsInitialLoad(false)
        return
      }

      // Prevent multiple simultaneous verifications
      if (isVerifying) {
        return
      }

      // Force verification on initial load or if token hasn't been verified in 5 minutes
      const now = Date.now()
      const shouldVerify = isInitialLoad || now - lastVerificationTime > 5 * 60 * 1000

      if (!shouldVerify && user) {
        setLoading(false)
        return
      }

      setIsVerifying(true)
      try {
        // Verify token on app start using dedicated endpoint
        console.log('Verifying token...')
        const response = await api.get('/api/verify-token')
        console.log('Token verified successfully:', response.data)
        // Token is valid, use username from response
        setUser({ username: response.data.username })
        setLastVerificationTime(now)
      } catch (error) {
        console.log('Token verification failed:', error.response?.data?.error || error.message)
        // Token is invalid - clear it
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      } finally {
        setIsVerifying(false)
        setLoading(false)
        setIsInitialLoad(false)
      }
    }

    verifyTokenOnMount()
  }, [token, isInitialLoad]) // Remove problematic dependencies

  const login = async (username, password) => {
    try {
      const response = await api.post('/api/login', {
        username,
        password
      })
      
      const { token: newToken } = response.data
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser({ username })
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      }
    }
  }

  const logout = async () => {
    // Prevent multiple simultaneous logout calls
    if (!token && !user) {
      return
    }

    try {
      // Only call backend logout if we have a token
      if (token) {
        await api.post('/api/logout')
      }
    } catch (error) {
      // Even if the server call fails, we still clear the local token
      console.warn('Server logout failed, but clearing local token:', error.message)
    } finally {
      // Always clear the token from local storage and state
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    }
  }

  const verifyToken = async () => {
    try {
      const response = await api.get('/api/verify-token')
      return response.data
    } catch (error) {
      return { valid: false, error: error.response?.data?.error || 'Token verification failed' }
    }
  }

  const value = {
    user,
    token,
    login,
    logout,
    verifyToken,
    isAuthenticated: !!user && !!token,
    loading
  }

  // Add loading state UI
  if (isInitialLoad) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '20px', color: '#666' }}>Loading Application...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
