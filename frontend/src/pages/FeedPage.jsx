import React, { useState, useEffect, useCallback } from 'react'
import { Users, UserPlus, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { formatErrorMessage } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'
import SuggestedUsers from '../components/SuggestedUsers'
import UserSearch from '../components/UserSearch'

const FeedPage = () => {
  
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [feedType, setFeedType] = useState('all') // 'all' or 'following'
  const [error, setError] = useState('')
  const { isAuthenticated, user, token, loading: authLoading } = useAuth()

  const fetchPosts = useCallback(async (type = feedType, afterId = null, append = false) => {
    // Don't fetch if not authenticated or no token
    if (!isAuthenticated || !user || !token) {
      setLoading(false)
      return
    }

    try {
      if (!append) {
        setLoading(true)
        setPosts([]) // Clear posts if not appending
        setHasMore(true)
      } else {
        setLoadingMore(true)
      }
      setError('')
      
      const endpoint = type === 'following' ? '/api/feed/following' : '/api/feed'
      const params = afterId ? { after: afterId } : {}
      
      const response = await api.get(endpoint, { params })
      const newPosts = response.data.posts || []
      
      if (append) {
        setPosts(prev => [...prev, ...newPosts])
      } else {
        setPosts(newPosts)
      }
      
      // Check if there are more posts (if we got less than 20, there's no more)
      setHasMore(newPosts.length === 20)
      setError('')
    } catch (error) {
      console.error('Error fetching posts:', error)
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      // Don't show error for authentication issues - let auth context handle it
      if (error.response?.status !== 401) {
        setError(formatErrorMessage(error))
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [feedType, isAuthenticated, user, token])

  useEffect(() => {
    // Only fetch when we have valid authentication and auth is not loading
    if (authLoading) {
      return
    }
    
    if (isAuthenticated && user && token) {
      fetchPosts()
    } else {
      setLoading(false)
    }
  }, [fetchPosts, authLoading]) // Add authLoading dependency

  const handleFeedTypeChange = useCallback((type) => {
    setFeedType(type)
    // Reset pagination when changing feed type
    setPosts([])
    setHasMore(true)
  }, [])

  const handlePostUpdate = () => {
    fetchPosts(feedType, null, false) // Refresh from beginning
  }

  const loadMorePosts = () => {
    if (hasMore && !loadingMore && posts.length > 0) {
      const lastPost = posts[posts.length - 1]
      fetchPosts(feedType, lastPost.id, true)
    }
  }

  // Safety check - if auth is still loading, show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Safety check - if not authenticated after loading, redirect or show message
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please log in to access the feed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ErrorBoundary>
        <Navbar />
      </ErrorBoundary>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Feed */}
          <div className="lg:col-span-2">
            {/* Feed Type Toggle - Larger and More Prominent */}
            <div className="mb-16">
              <div className="flex flex-col sm:flex-row bg-white dark:bg-gray-800 rounded-3xl p-3 shadow-xl border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto gap-3 sm:gap-0">
                <button
                  onClick={() => handleFeedTypeChange('all')}
                  className={`flex-1 flex items-center justify-center space-x-4 py-6 px-12 rounded-2xl font-bold text-xl transition-all duration-200 ${
                    feedType === 'all'
                      ? 'bg-blue-500 text-white shadow-lg transform scale-[1.02]'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Users size={28} />
                  <span>All Posts</span>
                </button>
                <button
                  onClick={() => handleFeedTypeChange('following')}
                  className={`flex-1 flex items-center justify-center space-x-4 py-6 px-12 rounded-2xl font-bold text-xl transition-all duration-200 ${
                    feedType === 'following'
                      ? 'bg-blue-500 text-white shadow-lg transform scale-[1.02]'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <UserPlus size={28} />
                  <span>Following</span>
                </button>
              </div>
            </div>

            {/* Create Post */}
            <ErrorBoundary>
              <CreatePost onPostCreated={handlePostUpdate} />
            </ErrorBoundary>

            {/* Posts Feed */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <LoadingSpinner size="xl" />
                <p className="text-gray-500 dark:text-gray-400 mt-8 text-xl">Loading posts...</p>
              </div>
            ) : error ? (
              <div className="bg-white dark:bg-gray-800 p-20 text-center rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="text-red-500" size={40} />
                  </div>
                  <p className="text-red-500 text-2xl font-semibold">{error}</p>
                </div>
                <button
                  onClick={() => fetchPosts()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-5 rounded-2xl transition-colors font-bold text-xl shadow-lg hover:shadow-xl"
                >
                  Try Again
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-20 text-center rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-10">
                  <Users className="text-gray-400" size={48} />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  {feedType === 'following' ? 'No posts from people you follow' : 'No posts yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xl max-w-lg mx-auto leading-relaxed">
                  {feedType === 'following' 
                    ? 'Follow some users to see their posts here, or switch to "All Posts" to see everything.' 
                    : 'Be the first to share something with the community!'
                  }
                </p>
              </div>
            ) : (
              <ErrorBoundary>
                <div className="space-y-12">
                  {posts.map((post) => (
                    <ErrorBoundary key={post.id}>
                      <div className="transform transition-all duration-200 hover:scale-[1.01]">
                        <PostCard
                          post={post}
                          onUpdate={handlePostUpdate}
                        />
                      </div>
                    </ErrorBoundary>
                  ))}
                  
                  {/* Load More Button */}
                  {hasMore && posts.length > 0 && (
                    <div className="flex justify-center py-12">
                      <button
                        onClick={loadMorePosts}
                        disabled={loadingMore}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3"
                      >
                        {loadingMore ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span>Loading more posts...</span>
                          </>
                        ) : (
                          <span>Load More Posts</span>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {/* End of Posts Message */}
                  {!hasMore && posts.length > 0 && (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center px-6 py-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        <span className="text-lg">🎉 You've reached the end! No more posts to load.</span>
                      </div>
                    </div>
                  )}
                </div>
              </ErrorBoundary>
            )}
          </div>

          {/* Sidebar - Search and Suggested Users */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Quick Search */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  🔍 Find Users
                </h3>
                <UserSearch placeholder="Search users..." className="w-full" />
              </div>
              
              {/* Suggested Users */}
              <SuggestedUsers />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeedPage
