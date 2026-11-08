import React, { useState, useEffect } from 'react'
import { ArrowLeft, Trophy, Users, MessageSquare, Heart, Crown, Medal, Award } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Avatar from '../components/Avatar'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('followers')
  const { isAuthenticated, user } = useAuth()

  const sortOptions = [
    {
      key: 'followers',
      label: 'Top Followers',
      icon: <Users size={20} />,
      description: 'Users with most followers',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      key: 'posts',
      label: 'Top Posts',
      icon: <MessageSquare size={20} />,
      description: 'Most active content creators',
      gradient: 'from-green-500 to-teal-600'
    },
    {
      key: 'most_liked',
      label: 'Most Liked',
      icon: <Heart size={20} />,
      description: 'Most appreciated by community',
      gradient: 'from-pink-500 to-red-600'
    }
  ]

  const fetchLeaderboard = async (sortType) => {
    if (!isAuthenticated || !user) return

    setLoading(true)
    setError('')

    try {
      const response = await api.get('/api/leaderboard', {
        params: { sort: sortType }
      })
      setLeaderboard(response.data.users || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      setError('Failed to load leaderboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard(sortBy)
  }, [sortBy, isAuthenticated, user])

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500" size={28} />
      case 2:
        return <Medal className="text-gray-400" size={24} />
      case 3:
        return <Award className="text-orange-500" size={24} />
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankBg = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    }
  }

  const getCurrentSortInfo = () => {
    return sortOptions.find(option => option.key === sortBy)
  }

  const getStatValue = (user) => {
    switch (sortBy) {
      case 'followers':
        return `${user.follower_count} followers`
      case 'posts':
        return `${user.post_count} posts`
      case 'most_liked':
        return `${user.total_likes} likes received`
      default:
        return ''
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please log in to view the leaderboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ErrorBoundary>
        <Navbar />
      </ErrorBoundary>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/feed"
            className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Back to Feed</span>
          </Link>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Trophy className="text-yellow-500" size={48} />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Community Leaders
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Discover the most influential members of our cybersecurity community
            </p>
          </div>
        </div>

        {/* Sort Options */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {sortOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => handleSortChange(option.key)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 ${
                  sortBy === option.key
                    ? `bg-gradient-to-r ${option.gradient} text-white shadow-lg`
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md'
                }`}
              >
                {option.icon}
                <div className="text-left">
                  <div className="font-bold">{option.label}</div>
                  <div className="text-xs opacity-80">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="xl" />
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-2xl shadow-lg">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button
              onClick={() => fetchLeaderboard(sortBy)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-2xl shadow-lg">
            <Trophy className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No data available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              The leaderboard will populate as users become more active.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((userData, index) => {
              const rank = index + 1
              const isCurrentUser = userData.username === user?.username
              const currentSort = getCurrentSortInfo()

              return (
                <div
                  key={userData.username}
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border transition-all duration-200 hover:shadow-xl hover:scale-[1.01] ${
                    rank <= 3
                      ? 'border-yellow-200 dark:border-yellow-800'
                      : 'border-gray-200 dark:border-gray-700'
                  } ${
                    isCurrentUser
                      ? 'ring-2 ring-blue-500 ring-opacity-50'
                      : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-6">
                      {/* Rank */}
                      <div className={`flex items-center justify-center w-16 h-16 rounded-full ${getRankBg(rank)}`}>
                        {getRankIcon(rank)}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 flex items-center space-x-4">
                        <Link to={`/profile/${userData.username}`}>
                          <Avatar username={userData.username} size="lg" />
                        </Link>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/profile/${userData.username}`}
                              className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              @{userData.username}
                            </Link>
                            {isCurrentUser && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="flex items-center space-x-1">
                              <Users size={14} />
                              <span>{userData.follower_count} followers</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageSquare size={14} />
                              <span>{userData.post_count} posts</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Heart size={14} />
                              <span>{userData.total_likes} likes</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Current Stat */}
                      <div className="text-right">
                        <div className={`text-2xl font-bold bg-gradient-to-r ${currentSort.gradient} bg-clip-text text-transparent`}>
                          {getStatValue(userData).split(' ')[0]}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {getStatValue(userData).split(' ').slice(1).join(' ')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Rankings update in real-time based on community activity
          </p>
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPage
