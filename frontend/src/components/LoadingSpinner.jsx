import React from 'react'

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-primary-500`}
        style={{
          borderTopColor: 'var(--color-brand-primary)'
        }}
      ></div>
    </div>
  )
}

export default React.memo(LoadingSpinner)
