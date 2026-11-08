import React from 'react'
import UserLink from './UserLink'

const SuggestedUsers = () => {
  // Static list of suggested users to avoid API calls and 404 errors
  const suggestedUsers = [
    { username: 'alex_cyber', bio: 'Cybersecurity researcher and penetration tester' },
    { username: 'sarah_dev', bio: 'Full-stack developer passionate about secure coding' },
    { username: 'mike_security', bio: 'Security analyst and vulnerability researcher' },
    { username: 'lisa_hacker', bio: 'Ethical hacker and bug bounty hunter' },
    { username: 'tom_admin', bio: 'System administrator and security enthusiast' }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Suggested Users
      </h3>
      <div className="space-y-3">
        {suggestedUsers.map((user, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.username[0].toUpperCase()}
                </span>
              </div>
              <div>
                <UserLink username={user.username} className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400" />
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
                  {user.bio}
                </p>
              </div>
            </div>
            <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full transition-colors">
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SuggestedUsers
