import React, { useState, useEffect } from 'react'
import { MessageCircle, Heart, Trash2, Send, UserPlus, UserCheck, Edit3, Save, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { formatDate, formatErrorMessage } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'
import LoadingSpinner from './LoadingSpinner'


const PostCard = ({ post, onUpdate }) => {
  const { user } = useAuth()
  
  // Validate post data to prevent crashes
  if (!post || !post.id) {
    console.error('PostCard received invalid post data:', post)
    return (
      <div className="card-modern p-6 animate-fade-in">
        <div className="text-red-500 text-center">
          Invalid post data. Please refresh the page.
        </div>
      </div>
    )
  }

  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState('')
  const [isLiking, setIsLiking] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFollowing, setIsFollowing] = useState(post.author_is_following || false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Edit post functionality
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.body || '')
  const [isSaving, setIsSaving] = useState(false)
  const [xssDetected, setXssDetected] = useState(false)
  const [xssToken, setXssToken] = useState('')

  const [deletingCommentId, setDeletingCommentId] = useState(null)

  const isOwnPost = post.author === user?.username

  const handleLike = async () => {
    if (isLiking) return
    
    // Optimistic update for better UX
    const wasLiked = post.user_liked || false
    const currentLikeCount = post.like_count || 0
    const newLikeCount = wasLiked ? currentLikeCount - 1 : currentLikeCount + 1
    
    // Update UI immediately
    post.user_liked = !wasLiked
    post.like_count = newLikeCount
    
    setIsLiking(true)
    setError('')
    try {
      await api.post('/api/like', { post_id: post.id })
      // Don't refresh the entire feed, the optimistic update is enough
    } catch (error) {
      // Revert optimistic update on error
      post.user_liked = wasLiked
      post.like_count = currentLikeCount
      console.error('Error liking post:', error)
      
      setError(formatErrorMessage(error))
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsLiking(false)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim() || isCommenting) return

    setIsCommenting(true)
    setError('')
    
    // Create optimistic comment
    const tempComment = {
      id: 'temp-' + Date.now(),
      author: user?.username,
      body: comment.trim(),
      created_at: new Date().toISOString()
    }
    
    // Add comment optimistically
    post.comments = post.comments || []
    post.comments.push(tempComment)
    post.comment_count = (post.comment_count || 0) + 1
    
    const commentText = comment.trim()
    setComment('')
    
    try {
      const response = await api.post('/api/comment', {
        post_id: post.id,
        body: commentText
      })
      
      // Replace temp comment with real one using the returned ID
      if (response.data.ok && response.data.id) {
        const realComment = {
          id: response.data.id,
          author: user?.username,
          body: commentText,
          created_at: tempComment.created_at
        }
        post.comments = post.comments.map(c => 
          c.id === tempComment.id ? realComment : c
        )
      }
    } catch (error) {
      // Remove the optimistic comment on error
      post.comments = post.comments.filter(c => c.id !== tempComment.id)
      post.comment_count = Math.max(0, (post.comment_count || 0) - 1)
      setComment(commentText) // Restore the comment text
      console.error('Error adding comment:', error)
      
      setError(formatErrorMessage(error))
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsCommenting(false)
    }
  }

  const handleDelete = async () => {
    if (isDeleting) return

    setIsDeleting(true)
    setError('')
    try {
      await api.post('/api/delete_post', { post_id: post.id })
      // Only call onUpdate for post deletion since it affects the feed
      onUpdate()
    } catch (error) {
      console.error('Error deleting post:', error)
      setError('Failed to delete post. Please try again.')
      setTimeout(() => setError(''), 3000)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditPost = async () => {
    if (isSaving) return

    setIsSaving(true)
    setError('')
    setXssDetected(false)
    setXssToken('')
    
    try {
      const response = await api.post('/api/edit_post', {
        post_id: post.id,
        body: editContent
      })

      console.log('Edit post response:', response.data)

      if (response.data.ok) {
        post.body = response.data.body
        setIsEditing(false)
        
        if (response.data.xss_detected) {
          console.log('XSS DETECTED IN FRONTEND!')
          setXssDetected(true)
          setXssToken(response.data.token_unlocked || '')
          
          console.log('XSS Detected! Token:', response.data.token_unlocked)
          console.log('Full response:', response.data)
          
          return
        }
        
        onUpdate()
      }
    } catch (error) {
      console.error('Error editing post:', error)
      setError('Failed to edit post. Please try again.')
      setTimeout(() => setError(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditContent(post.body || '')
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(post.body || '')
    setError('')
  }

  const submitXssToken = async () => {
    if (!xssToken) return
    
    try {
      const response = await api.post('/api/submit_token', {
        token: xssToken,
        token_type: 'XSS'
      })
      
      if (response.data.is_correct) {
        alert(`🎉 ${response.data.message}`)
        setXssDetected(false)
        setXssToken('')
      } else {
        alert(`❌ ${response.data.message}`)
      }
    } catch (error) {
      console.error('Error submitting XSS token:', error)
      alert('Failed to submit token. Please try again.')
    }
  }

  const handleDeleteComment = async (commentId) => {
    // Prevent multiple delete attempts
    if (deletingCommentId === commentId) return
    
    setDeletingCommentId(commentId)
    setError('')
    
    // Store original comment and remove optimistically
    const originalComments = [...(post.comments || [])]
    post.comments = post.comments.filter(c => c.id !== commentId)
    post.comment_count = Math.max(0, (post.comment_count || 0) - 1)
    
    try {
      await api.post('/api/delete_comment', { comment_id: commentId })
      // Success - keep the optimistic update
    } catch (error) {
      // Restore comments on error
      post.comments = originalComments
      post.comment_count = originalComments.length
      console.error('Error deleting comment:', error)
      setError('Failed to delete comment. Please try again.')
      setTimeout(() => setError(''), 3000)
    } finally {
      setDeletingCommentId(null)
    }
  }

  const handleFollow = async () => {
    if (isOwnPost || isFollowLoading) return

    setIsFollowLoading(true)
    setError('')
    
    // Optimistic update
    const wasFollowing = isFollowing
    setIsFollowing(!wasFollowing)
    
    try {
      const response = await api.post('/api/follow', { username: post.author })
      // Update based on server response if needed
      setIsFollowing(response.data.following)
    } catch (error) {
      // Revert on error
      setIsFollowing(wasFollowing)
      console.error('Error following user:', error)
      setError('Failed to follow user. Please try again.')
      setTimeout(() => setError(''), 3000)
    } finally {
      setIsFollowLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-fade-in transition-all duration-200 hover:shadow-xl">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <Link 
          to={`/profile/${post.author}`}
          className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
        >
          <Avatar username={post.author} size="md" />
          <div>
            <h4 className="font-bold text-base text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {post.author}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(post.created_at)}</p>
          </div>
        </Link>
        
        <div className="flex items-center space-x-3">
          {/* Follow button - only show for other users' posts if not already following */}
          {!isOwnPost && !isFollowing && (
            <button
              onClick={handleFollow}
              disabled={isFollowLoading}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              title="Follow this user"
            >
              {isFollowLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <UserPlus size={16} />
              )}
              <span>Follow</span>
            </button>
          )}

          {/* Following indicator - show for other users' posts if already following */}
          {!isOwnPost && isFollowing && (
            <button
              onClick={handleFollow}
              disabled={isFollowLoading}
              className="group flex items-center space-x-1 px-3 py-1 rounded-full bg-green-500 hover:bg-red-500 text-white text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Click to unfollow"
            >
              {isFollowLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <UserCheck size={14} />
              )}
              <span className="group-hover:hidden">Following</span>
              <span className="hidden group-hover:inline">Unfollow</span>
            </button>
          )}

          {/* Edit and Delete buttons for own posts */}
          {isOwnPost && (
            <div className="flex items-center space-x-2">
              {/* Edit button */}
              <button
                onClick={handleStartEdit}
                disabled={isEditing}
                className="text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-1"
                title="Edit this post"
              >
                <Edit3 size={18} />
              </button>
              
              {/* Delete button */}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                title="Delete this post"
              >
                {isDeleting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* XSS Detection Alert */}
      {xssDetected && (
        <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🚨</div>
              <div>
                <div className="text-red-700 font-bold text-lg">XSS Vulnerability Detected!</div>
                <div className="text-red-600 text-sm">Successfully exploited Cross-Site Scripting</div>
              </div>
            </div>
            <button
              onClick={() => setXssDetected(false)}
              className="text-red-400 hover:text-red-600 p-1"
              title="Close notification"
            >
              <X size={20} />
            </button>
          </div>
          
          {xssToken && (
            <div className="bg-white border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-700 font-semibold text-sm">🔑 Vulnerability Token:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(xssToken)
                    alert('Token copied to clipboard!')
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  title="Copy token to clipboard"
                >
                  📋 Copy
                </button>
              </div>
              <div className="font-mono text-sm bg-gray-100 p-3 rounded border break-all select-all">
                {xssToken}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Post Content */}
      <div className="mb-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-base leading-relaxed"
              rows="4"
              placeholder="Edit your post..."
              maxLength="1000"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">
                {editContent.length}/1000 characters
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditPost}
                  disabled={isSaving || !editContent.trim() || editContent.length > 1000}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2 font-medium shadow-md"
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-base leading-relaxed">
            {/* Render XSS content as HTML, but escape basic script tags for display */}
            {post.body && post.body.includes('<script>') && post.body.includes('alert(') ? (
              // Show basic script alerts as escaped text (not executed)
              <span>{post.body}</span>
            ) : (
              // Allow other XSS vectors to execute (for demo purposes)
              <div dangerouslySetInnerHTML={{ __html: post.body || '' }} />
            )}
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="flex items-center space-x-6 py-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`like-button flex items-center space-x-2 transition-all duration-200 hover:scale-105 text-base font-medium ${
            post.user_liked 
              ? 'text-red-500 hover:text-red-600' 
              : 'text-gray-500 hover:text-red-500'
          }`}
          title={post.user_liked ? 'Unlike this post' : 'Like this post'}
        >
          {isLiking ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Heart 
              size={18} 
              className={`transition-all duration-200 heart-hover ${
                post.user_liked 
                  ? 'fill-red-500 text-red-500 liked-heart' 
                  : 'hover:fill-red-100'
              }`}
            />
          )}
          <span className={`text-sm font-semibold ${
            post.user_liked ? 'text-red-500' : 'text-gray-600'
          }`}>
            {post.like_count}
          </span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 text-base font-medium ${
            showComments 
              ? 'text-primary-500 hover:text-primary-600' 
              : 'text-gray-500 hover:text-primary-500'
          }`}
          title={showComments ? 'Hide comments' : 'Show comments'}
        >
          <MessageCircle 
            size={18} 
            className={`transition-all duration-200 ${
              showComments ? 'fill-primary-100' : ''
            }`}
          />
          <span className={`text-sm font-semibold ${
            showComments ? 'text-primary-600' : 'text-gray-600'
          }`}>
            {post.comment_count}
          </span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
          {/* Add Comment Form */}
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex space-x-3">
              <Link to={`/profile/${user?.username}`}>
                <Avatar username={user?.username} size="sm" />
              </Link>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={!comment.trim() || isCommenting}
                    className="btn-gradient px-3 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[42px] shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {isCommenting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {post.comments?.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Link to={`/profile/${comment.author}`}>
                  <Avatar username={comment.author} size="sm" />
                </Link>
                <div className="flex-1">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <Link 
                        to={`/profile/${comment.author}`}
                        className="font-medium text-sm text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        {comment.author}
                      </Link>
                      {comment.author === user?.username && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deletingCommentId === comment.id}
                            className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete this comment"
                          >
                            {deletingCommentId === comment.id ? (
                              <LoadingSpinner size="xs" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    <p 
                      className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: comment.body || '' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                    {formatDate(comment.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default React.memo(PostCard)
