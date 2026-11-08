import React from 'react'
import { Link } from 'react-router-dom'

const UserLink = ({ username, children, className = '', onClick }) => {
  const handleClick = (e) => {
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <Link 
      to={`/profile/${username}`}
      className={`hover:text-primary-600 transition-colors ${className}`}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}

export default UserLink
