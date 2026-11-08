import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Users, MessageCircle, Trophy, BookOpen, Code, Target, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const MainPage = () => {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  // No automatic redirect - let logged-in users access the main page too
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Star size={16} className="mr-2" />
              Web Security Training Platform
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Master Web Security
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Through Practice
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Join our interactive learning platform where you can practice web security concepts, 
              connect with peers, and track your progress through hands-on challenges and real-world scenarios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/feed"
                    className="btn-gradient text-white px-8 py-3 rounded-lg font-semibold text-lg inline-flex items-center justify-center space-x-2"
                  >
                    <span>View Feed</span>
                    <ArrowRight size={20} />
                  </Link>
                  <Link
                    to="/test"
                    className="px-8 py-3 border-2 border-blue-200 text-blue-700 rounded-lg font-semibold text-lg hover:border-blue-300 hover:bg-blue-50 transition-colors inline-flex items-center justify-center space-x-2"
                  >
                    <Target size={20} />
                    <span>Take Quiz</span>
                  </Link>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-gradient text-white px-8 py-3 rounded-lg font-semibold text-lg inline-flex items-center justify-center space-x-2"
                  >
                    <span>Start Learning</span>
                    <ArrowRight size={20} />
                  </Link>
                  <button className="px-8 py-3 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold text-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                    Learn More
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Learning Experience
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to master web security concepts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="card-modern p-6 text-center group hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Interactive Content
              </h3>
              <p className="text-gray-600">
                Learn through detailed guides, examples, and hands-on practice exercises
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-modern p-6 text-center group hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Target className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Security Challenges
              </h3>
              <p className="text-gray-600">
                Test your knowledge with practical security challenges and quizzes
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-modern p-6 text-center group hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Community
              </h3>
              <p className="text-gray-600">
                Connect with peers, share knowledge, and learn from others' experiences
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-modern p-6 text-center group hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Progress Tracking
              </h3>
              <p className="text-gray-600">
                Monitor your progress with leaderboards and achievement tracking
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore Platform Features
            </h2>
            <p className="text-xl text-gray-600">
              Discover what makes our learning platform unique
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Social Feed */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <MessageCircle className="text-blue-500 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Social Feed</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Share your learning journey, ask questions, and engage with the community through posts and comments.
              </p>
              <div className="text-sm text-blue-600 font-medium">
                Connect & Share →
              </div>
            </div>

            {/* Knowledge Testing */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <Code className="text-green-500 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Knowledge Testing</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Take interactive quizzes and challenges to test your understanding of security concepts.
              </p>
              <div className="text-sm text-green-600 font-medium">
                Test Skills →
              </div>
            </div>

            {/* Leaderboards */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <Trophy className="text-yellow-500 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Leaderboards</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Track your progress and compete with peers on the community leaderboard.
              </p>
              <div className="text-sm text-yellow-600 font-medium">
                View Rankings →
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Master Web Security?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of learners who are advancing their security skills through practical experience.
          </p>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg inline-flex items-center space-x-2 hover:bg-blue-50 transition-colors"
            >
              <span>Join Now</span>
              <ArrowRight size={20} />
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
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
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                  <span className="text-white font-bold text-lg">;</span>
                </div>
                <span className="text-xl font-semibold">Semicolon Academy</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Empowering developers with practical web security knowledge through interactive learning and community engagement.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Learning Hub</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community Feed</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Knowledge Tests</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Leaderboards</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Security</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Web Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Best Practices</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Hands-on Labs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Resources</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Semicolon Academy. Advancing web security education through practical learning.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainPage
