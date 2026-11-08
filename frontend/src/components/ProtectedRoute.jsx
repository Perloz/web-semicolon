import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user, token } = useAuth()

  // Show loading while authentication is being verified, but only briefly
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Save the current URL to redirect back after login
  if (!isAuthenticated || !user || !token) {
    const currentPath = window.location.pathname
    const searchParams = window.location.search
    const returnTo = currentPath + searchParams
    
    // Store the return path in sessionStorage
    if (returnTo !== '/login') {
      sessionStorage.setItem('returnTo', returnTo)
    }
    
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
