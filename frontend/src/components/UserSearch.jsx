import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Users, UserPlus, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'
import LoadingSpinner from './LoadingSpinner'

const UserSearch = ({ className = '', placeholder = "Search users..." }) => {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState('')
  const [followingUsers, setFollowingUsers] = useState(new Set())
  
  const searchRef = useRef(null)
  const resultsRef = useRef(null)
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 1) {
        performSearch(query.trim())
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300) // 300ms debounce
    
    return () => clearTimeout(timer)
  }, [query])
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowResults(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const performSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 1) {
      setResults([])
      setShowResults(false)
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await api.get('/api/search/users', {
        params: { 
          q: searchQuery,
          limit: 8 // Limit results for better UX
        }
      })
      
      if (response.data && response.data.users) {
        setResults(response.data.users)
        setShowResults(true)
        
        // Track following status
        const following = new Set()
        response.data.users.forEach(user => {
          if (user.is_following) {
            following.add(user.username)
          }
        })
        setFollowingUsers(following)
      }
    } catch (error) {
      console.error('Search error:', error)
      setError(error.response?.data?.error || 'Search failed')
      setResults([])
      setShowResults(false)
    } finally {
      setLoading(false)
    }
  }
  
  const handleFollow = async (username, e) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation()
    
    try {
      const response = await api.post('/api/follow', { username })
      
      // Update following status
      const newFollowingUsers = new Set(followingUsers)
      if (response.data.following) {
        newFollowingUsers.add(username)
      } else {
        newFollowingUsers.delete(username)
      }
      setFollowingUsers(newFollowingUsers)
      
      // Update results to reflect new following status
      setResults(prev => prev.map(user => 
        user.username === username 
          ? { ...user, is_following: response.data.following }
          : user
      ))
    } catch (error) {
      console.error('Follow error:', error)
    }
  }
  
  const clearSearch = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
    setError('')
  }
  
  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true)
    }
  }
  
  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={20} 
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base"
            maxLength="32"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          )}
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
      </div>
      
      {/* Search Results Dropdown */}
      {showResults && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto"
        >
          {error ? (
            <div className="p-4 text-center text-red-500">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <Users className="mx-auto mb-2" size={24} />
              <p>No users found</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((searchUser) => (
                <Link
                  key={searchUser.username}
                  to={`/profile/${searchUser.username}`}
                  onClick={() => setShowResults(false)}
                  className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar username={searchUser.username} size="md" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          @{searchUser.username}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {searchUser.post_count} posts • {searchUser.follower_count} followers
                        </p>
                      </div>
                    </div>
                    
                    {searchUser.username !== user?.username && (
                      <button
                        onClick={(e) => handleFollow(searchUser.username, e)}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          followingUsers.has(searchUser.username)
                            ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {followingUsers.has(searchUser.username) ? (
                          <>
                            <UserCheck size={16} />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus size={16} />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UserSearch
