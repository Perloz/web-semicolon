import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Sun, Moon, BookOpen, Bug, MessageSquare, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Avatar from './Avatar'
import UserSearch from './UserSearch'

const Navbar = ({ showAuthButtons = true }) => {
  const { user, logout, isAuthenticated } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Link to={isAuthenticated ? "/bugs" : "/"} className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Semicolon Academy Logo" 
                className="w-8 h-8 rounded-lg"
                onError={(e) => {
                  // Fallback to semicolon if logo not found
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                <span className="text-white font-bold text-lg">;</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                Semicolon Academy
              </span>
            </Link>
          </div>

          {/* Center Search - Only show when authenticated */}
          {isAuthenticated && (
            <div className="flex-1 max-w-md mx-8">
              <UserSearch placeholder="Search users..." />
            </div>
          )}

          {/* Navigation Items */}
          {showAuthButtons && (
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  {/* Bugs Education Link */}
                  <Link
                    to="/bugs"
                    className="group relative flex items-center justify-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Learn about Web Vulnerabilities"
                  >
                    <Bug size={20} />
                    <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Bugs
                    </span>
                  </Link>

                  {/* Feed Link */}
                  <Link
                    to="/feed"
                    className="group relative flex items-center justify-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="View Social Feed"
                  >
                    <MessageSquare size={20} />
                    <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Feed
                    </span>
                  </Link>

                  {/* Community Leaderboard Link */}
                  <Link
                    to="/leaderboard"
                    className="group relative flex items-center justify-center p-3 rounded-lg text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                    title="Community Leaders"
                  >
                    <Trophy size={20} />
                    <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Leaderboard
                    </span>
                  </Link>

                  {/* Test Link */}
                  <Link
                    to="/test"
                    className="group relative flex items-center justify-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Take the Cybersecurity Test"
                  >
                    <BookOpen size={20} />
                    <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Test
                    </span>
                  </Link>

                  {/* Theme Toggle Button */}
                  <button
                    onClick={toggleTheme}
                    className="group relative flex items-center justify-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {isDark ? 'Light mode' : 'Dark mode'}
                    </span>
                  </button>

                  {/* Profile Button */}
                  <Link 
                    to={`/profile/${user.username}`}
                    className="group relative flex items-center justify-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Avatar username={user.username} size="sm" />
                    <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Profile
                    </span>
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="group relative flex items-center justify-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LogOut size={20} />
                    <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Logout
                    </span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="btn-gradient text-white px-6 py-2 rounded-lg font-medium transition-all"
                >
                  Login
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default React.memo(Navbar)
