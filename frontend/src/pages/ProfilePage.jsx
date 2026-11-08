import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { UserPlus, UserMinus, Users, FileText, Edit3, Save, X, Activity } from 'lucide-react'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useVulnerabilities } from '../context/VulnerabilityContext'
import Navbar from '../components/Navbar'
import PostCard from '../components/PostCard'
import Avatar from '../components/Avatar'
import LoadingSpinner from '../components/LoadingSpinner'
import TokenDiscoveryModal from '../components/TokenDiscoveryModal'
import SuggestedUsers from '../components/SuggestedUsers'

const ProfilePage = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { unlockVulnerability } = useVulnerabilities()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMorePosts, setLoadingMorePosts] = useState(false)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Bio editing state
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bioText, setBioText] = useState('')
  const [isSavingBio, setIsSavingBio] = useState(false)
  
  // Followers/Following modal state
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [loadingFollows, setLoadingFollows] = useState(false)
  
  // Activity logs modal state
  const [showActivityLogsModal, setShowActivityLogsModal] = useState(false)
  const [activityLogs, setActivityLogs] = useState([])
  const [loadingActivityLogs, setLoadingActivityLogs] = useState(false)

  // Token discovery modal state
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [discoveredTokenData, setDiscoveredTokenData] = useState(null)

  const isOwnProfile = currentUser?.username === username

  const fetchProfile = async (loadMorePosts = false, afterId = null) => {
    try {
      if (!loadMorePosts) {
        setLoading(true)
        setError('')
      } else {
        setLoadingMorePosts(true)
      }
      
      const params = afterId ? { after: afterId } : {}
      const response = await api.get(`/api/profile/${username}`, { params })
      
      if (response.data && response.data.user) {
        if (!loadMorePosts) {
          // First load - set profile and posts
          setProfile(response.data.user)
          setPosts(response.data.posts || [])
          setIsFollowing(response.data.user.is_following || false)
          setHasMorePosts((response.data.posts || []).length === 20)
        } else {
          // Load more posts - append to existing posts
          const newPosts = response.data.posts || []
          setPosts(prev => [...prev, ...newPosts])
          setHasMorePosts(newPosts.length === 20)
        }
      } else {
        setError('Invalid profile data received')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      if (error.response?.status === 404) {
        setError('User not found')
      } else if (error.response?.status === 403) {
        setError('Access denied')
      } else {
        setError('Failed to load profile. Please try again.')
      }
    } finally {
      setLoading(false)
      setLoadingMorePosts(false)
    }
  }

  useEffect(() => {
    if (username) {
      // Reset editing states and pagination when navigating to different profile
      setIsEditingBio(false)
      setError('')
      setPosts([])
      setHasMorePosts(true)
      fetchProfile()
    }
  }, [username])

  // Reset bio text when profile changes or editing starts
  useEffect(() => {
    if (profile?.bio !== undefined) {
      setBioText(profile.bio || '')
    }
  }, [profile?.bio, isEditingBio])

  const fetchFollowers = async () => {
    if (!isOwnProfile) return // Only show for own profile for privacy
    
    setLoadingFollows(true)
    try {
      const response = await api.get(`/api/followers/${username}`)
      setFollowers(response.data.followers || [])
      setShowFollowersModal(true)
    } catch (error) {
      console.error('Error fetching followers:', error)
      setError('Failed to load followers. You can only view your own followers list.')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoadingFollows(false)
    }
  }

  const fetchFollowing = async () => {
    if (!isOwnProfile) return // Only show for own profile for privacy
    
    setLoadingFollows(true)
    try {
      const response = await api.get(`/api/following/${username}`)
      setFollowing(response.data.following || [])
      setShowFollowingModal(true)
    } catch (error) {
      console.error('Error fetching following:', error)
      setError('Failed to load following list. You can only view your own following list.')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoadingFollows(false)
    }
  }

  const fetchActivityLogs = async () => {
    if (!isOwnProfile) return // Only show for own profile
    
    setLoadingActivityLogs(true)
    try {
      // Get user_content_id from already loaded profile data
      const userContentId = profile?.user_content_id
      
      console.log('Profile data:', profile)
      console.log('User content ID:', userContentId)
      
      if (!userContentId) {
        setError('User content ID not available. Please try refreshing the page.')
        setTimeout(() => setError(''), 3000)
        return
      }
      
      // Fetch activity logs using the user_content_id in headers
      console.log('Sending request with headers:', { 'X-User-Content': userContentId })
      const response = await api.get('/api/activity_log', {
        headers: {
          'X-User-Content': userContentId
        }
      })
      
      if (response.data.idor_detected) {
        unlockVulnerability('vuln1')
        
        setDiscoveredTokenData({
          type: 'IDOR',
          token: response.data.token_unlocked,
          message: response.data.message
        })
        setShowTokenModal(true)
      }
      
      // Format the activity logs for display
      const formattedLogs = response.data.activities.map(activity => ({
        id: activity.id,
        type: activity.type,
        title: activity.type === 'post_created' ? 'Created a post' : 'Added a comment',
        timestamp: activity.created_at,
        content: activity.body,
        icon: activity.type === 'post_created' ? '📝' : '�'
      }))
      
      setActivityLogs(formattedLogs)
      setShowActivityLogsModal(true)
    } catch (error) {
      console.error('Error fetching activity logs:', error)
      setError('Failed to load activity logs.')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoadingActivityLogs(false)
    }
  }

  const handleFollow = async () => {
    if (isFollowLoading) return

    setIsFollowLoading(true)
    try {
      await api.post('/api/follow', { username })
      setIsFollowing(!isFollowing)
      setProfile(prev => ({
        ...prev,
        follower_count: isFollowing ? prev.follower_count - 1 : prev.follower_count + 1
      }))
    } catch (error) {
      console.error('Error following/unfollowing user:', error)
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handlePostUpdate = () => {
    fetchProfile(false, null) // Refresh from beginning
  }

  const loadMorePosts = () => {
    if (hasMorePosts && !loadingMorePosts && posts.length > 0) {
      const lastPost = posts[posts.length - 1]
      fetchProfile(true, lastPost.id)
    }
  }

  const handleSaveBio = async () => {
    if (isSavingBio) return
    
    setIsSavingBio(true)
    try {
      const response = await api.post('/api/update_bio', { bio: bioText })
      setProfile(prev => ({ ...prev, bio: bioText }))
      setIsEditingBio(false)
      
      // Check for content processing token
      if (response.data.token_unlocked) {
        setDiscoveredTokenData({
          type: 'Content Processing',
          token: response.data.token_unlocked,
          message: response.data.message
        })
        setShowTokenModal(true)
      }
    } catch (error) {
      console.error('Error updating bio:', error)
      setError('Failed to update bio. Please try again.')
      setTimeout(() => setError(''), 3000)
    } finally {
      setIsSavingBio(false)
    }
  }

  const handleCancelBioEdit = () => {
    setBioText(profile?.bio || '')
    setIsEditingBio(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-modern p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || 'Profile not found'}
          </h3>
          <p className="text-gray-600 mb-4">
            The profile you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={fetchProfile}
              className="btn-gradient text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/feed')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Go to Feed
            </button>
          </div>
        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Posts */}
          <div className="lg:col-span-2">
            {/* Profile Header */}
            <div className="card-modern p-8 mb-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Avatar */}
                <Avatar username={username} size="2xl" />
                
                {/* Profile Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    @{username}
                  </h1>
                  
                  {/* Stats */}
                  <div className="flex justify-center sm:justify-start space-x-6 mb-4">
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <FileText size={16} className="text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          {profile.post_count || 0}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">Posts</span>
                    </div>
                    
                    <button
                      onClick={fetchFollowers}
                      disabled={loadingFollows || !isOwnProfile}
                      className={`text-center ${isOwnProfile ? 'hover:bg-gray-100 rounded-lg p-2 transition-colors' : 'cursor-default'}`}
                      title={isOwnProfile ? 'View followers' : 'Followers list is private'}
                    >
                      <div className="flex items-center space-x-1">
                        <Users size={16} className="text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          {profile.follower_count || 0}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">Followers</span>
                    </button>
                    
                    <button
                      onClick={fetchFollowing}
                      disabled={loadingFollows || !isOwnProfile}
                      className={`text-center ${isOwnProfile ? 'hover:bg-gray-100 rounded-lg p-2 transition-colors' : 'cursor-default'}`}
                      title={isOwnProfile ? 'View following' : 'Following list is private'}
                    >
                      <div className="flex items-center space-x-1">
                        <Users size={16} className="text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          {profile.following_count || 0}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">Following</span>
                    </button>
                  </div>

                  {/* Bio Section */}
                  <div className="mb-4">
                    {isOwnProfile && !isEditingBio && (
                      <button
                        onClick={() => setIsEditingBio(true)}
                        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-primary-500 mb-2"
                      >
                        <Edit3 size={14} />
                        <span>{profile?.bio ? 'Edit bio' : 'Add bio'}</span>
                      </button>
                    )}
                    
                    {isEditingBio ? (
                      <div className="space-y-3">
                        <textarea
                          value={bioText}
                          onChange={(e) => setBioText(e.target.value)}
                          placeholder="Tell people about yourself..."
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-sm"
                          rows="3"
                          maxLength="500"
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={handleCancelBioEdit}
                            className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all duration-200"
                          >
                            <X size={14} className="inline mr-1" />
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveBio}
                            disabled={isSavingBio}
                            className="btn-gradient px-3 py-1 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                          >
                            {isSavingBio ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <Save size={14} className="mr-1" />
                                Save
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : profile?.bio ? (
                      <div 
                        className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3"
                        dangerouslySetInnerHTML={{ __html: profile.bio }}
                      />
                    ) : isOwnProfile ? (
                      <p className="text-gray-500 text-sm italic">No bio yet</p>
                    ) : null}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {/* Follow Button */}
                    {!isOwnProfile && (
                      <button
                        onClick={handleFollow}
                        disabled={isFollowLoading}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                          isFollowing
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'btn-gradient text-white'
                        }`}
                      >
                        {isFollowLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : isFollowing ? (
                          <>
                            <UserMinus size={18} />
                            <span>Unfollow</span>
                          </>
                        ) : (
                          <>
                            <UserPlus size={18} />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Activity Logs Button - Only for own profile */}
                    {isOwnProfile && (
                      <button
                        onClick={fetchActivityLogs}
                        disabled={loadingActivityLogs}
                        className="flex items-center space-x-2 px-6 py-2 rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        {loadingActivityLogs ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Activity size={18} />
                            <span>Activity Logs</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {isOwnProfile ? 'Your Posts' : `${username}'s Posts`}
              </h2>
              
              {posts.length === 0 ? (
                <div className="card-modern p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-600">
                    {isOwnProfile 
                      ? 'Start sharing your thoughts with the community!' 
                      : `${username} hasn't posted anything yet.`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onUpdate={handlePostUpdate}
                    />
                  ))}
                  
                  {/* Load More Button */}
                  {hasMorePosts && posts.length > 0 && (
                    <div className="flex justify-center py-8">
                      <button
                        onClick={loadMorePosts}
                        disabled={loadingMorePosts}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                      >
                        {loadingMorePosts ? (
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
                  {!hasMorePosts && posts.length > 0 && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-600">
                        <span>🎉 You've seen all posts!</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Suggested Users */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <SuggestedUsers />
            </div>
          </div>
        </div>

        {/* Followers Modal */}
        {showFollowersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Followers</h3>
                <button
                  onClick={() => setShowFollowersModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[60vh] p-4">              {followers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No followers yet</p>
              ) : (
                <div className="space-y-3">
                  {followers.map((follower) => (
                    <Link 
                      key={follower.username} 
                      to={`/profile/${follower.username}`}
                      onClick={() => setShowFollowersModal(false)}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Avatar username={follower.username} size="sm" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">@{follower.username}</p>
                        <p className="text-sm text-gray-500">Follower</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Following Modal */}
        {showFollowingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Following</h3>
                <button
                  onClick={() => setShowFollowingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[60vh] p-4">              {following.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Not following anyone yet</p>
              ) : (
                <div className="space-y-3">
                  {following.map((followedUser) => (
                    <Link 
                      key={followedUser.username} 
                      to={`/profile/${followedUser.username}`}
                      onClick={() => setShowFollowingModal(false)}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Avatar username={followedUser.username} size="sm" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">@{followedUser.username}</p>
                        <p className="text-sm text-gray-500">Following</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Activity Logs Modal */}
        {showActivityLogsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
                <button
                  onClick={() => setShowActivityLogsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[60vh] p-4">
                {loadingActivityLogs ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : activityLogs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No activity logs found</p>
                ) : (
                  <div className="space-y-3">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-lg">{log.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {log.title}
                            </p>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {log.content}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Token Discovery Modal */}
      <TokenDiscoveryModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        tokenData={discoveredTokenData}
      />
      </div>
    </div>
  )
}

export default ProfilePage
