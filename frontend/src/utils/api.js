import axios from 'axios'

// Create axios instance with backend URL
const getBaseURL = () => {
  // In development with React dev server on port 3000, use proxy (no explicit URL needed)
  if (process.env.NODE_ENV === 'development' && (window.location.port === '3000' || window.location.port === '5173')) {
    return '' // Use relative URLs - proxy will handle forwarding
  }
  
  // In production, backend and frontend are on same origin
  return window.location.origin
}

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('API Request interceptor:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
    })
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Added auth header to request')
    } else {
      console.log('No token found in localStorage')
    }
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response received:', {
      status: response.status,
      url: response.config.url,
      dataKeys: Object.keys(response.data || {})
    })
    return response
  },
  (error) => {
    console.error('API Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    })
    
    // Handle authentication errors more carefully
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.error || 'Token expired or invalid'
      const url = error.config?.url
      
      console.log('API 401 Error:', {
        url,
        error: errorMessage,
        fullError: error.response?.data
      })
      
      // Only force logout for certain critical endpoints, not all 401s
      const criticalEndpoints = ['/api/verify-token', '/api/login']
      const shouldForceLogout = criticalEndpoints.some(endpoint => url?.includes(endpoint))
      
      if (shouldForceLogout) {
        // Prevent duplicate events
        if (!window.handlingAuthError) {
          window.handlingAuthError = true
          
          console.log('Critical auth error, clearing token:', errorMessage)
          
          // Clear token from storage
          localStorage.removeItem('token')
          
          // Dispatch auth error event with details
          const event = new CustomEvent('auth:token-invalid', {
            detail: { 
              reason: errorMessage,
              path: url,
              status: error.response?.status
            }
          })
          
          // Use setTimeout to avoid React state conflicts
          setTimeout(() => {
            window.dispatchEvent(event)
            window.handlingAuthError = false
          }, 0)
        }
      } else {
        // For non-critical endpoints, just log the error but don't force logout
        console.warn('API 401 on non-critical endpoint:', url, errorMessage)
      }
    }
    
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error(
        'API Error:',
        error.response?.status,
        error.config?.url,
        error.response?.data?.error || error.message
      )
    }
    
    return Promise.reject(error)
  }
)
