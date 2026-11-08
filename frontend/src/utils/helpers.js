// Generate consistent color for user based on username
export const generateUserColor = (username) => {
  if (!username) return '#6366f1'
  
  // Simple hash function to generate consistent color
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Define a palette of professional colors that work well with our theme
  const colors = [
    '#6366f1', // Primary blue
    '#a855f7', // Primary purple
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#84cc16', // Lime
    '#f97316', // Orange
  ]
  
  return colors[Math.abs(hash) % colors.length]
}

// Get user initials
export const getUserInitials = (username) => {
  if (!username) return '?'
  return username.charAt(0).toUpperCase()
}

// Format date for posts
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString()
  }
}

// Truncate text with ellipsis
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Validate username format
export const validateUsername = (username) => {
  const usernameRegex = /^[A-Za-z0-9_]{1,32}$/
  return usernameRegex.test(username)
}

// Validate password strength
export const validatePassword = (password) => {
  return password && password.length >= 6
}

// Safe error message formatting
export const formatErrorMessage = (error) => {
  if (!error) return 'Unknown error occurred'
  
  if (typeof error === 'string') return error
  
  if (error.response?.data?.error) {
    return error.response.data.error
  }
  
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input.'
      case 401:
        return 'Authentication required. Please log in.'
      case 403:
        return 'Access denied. You do not have permission.'
      case 404:
        return 'Resource not found.'
      case 500:
        return 'Server error. Please try again later.'
      default:
        return `Server responded with status ${error.response.status}`
    }
  }
  
  if (error.message) return error.message
  
  if (error.toString && error.toString() !== '[object Object]') {
    return error.toString()
  }
  
  return 'An unexpected error occurred'
}
