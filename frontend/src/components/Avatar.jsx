import React from 'react'
import { generateUserColor, getUserInitials } from '../utils/helpers'

const Avatar = ({ username, size = 'md', className = '' }) => {
  const color = generateUserColor(username)
  const initials = getUserInitials(username)
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  }

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}

export default Avatar
