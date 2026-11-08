import React, { useState } from 'react'
import { Send } from 'lucide-react'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'
import LoadingSpinner from './LoadingSpinner'

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('Post content cannot be empty')
      return
    }

    if (content.length > 1000) {
      setError('Post content cannot exceed 1000 characters')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await api.post('/api/post', {
        body: content.trim()
      })
      setContent('')
      onPostCreated()
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 mb-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex space-x-4">
        <Avatar username={user?.username} size="md" />
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                if (error) setError('')
              }}
              placeholder="What's on your mind?"
              className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base"
              rows={3}
              maxLength={1000}
            />
            
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {content.length}/1000 characters
              </span>
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Send size={16} />
                    <span>Post</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
