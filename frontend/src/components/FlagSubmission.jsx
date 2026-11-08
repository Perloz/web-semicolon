import React, { useState } from 'react'
import { Shield, Lock, CheckCircle, Key, RotateCcw, BookOpen, Target, Flag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useVulnerabilities } from '../context/VulnerabilityContext'
import { api } from '../utils/api'

const FlagSubmission = () => {
  const { vulnerabilities, unlockVulnerability, resetVulnerabilities } = useVulnerabilities()
  const [activeFlag, setActiveFlag] = useState(null)
  const [tokenInputs, setTokenInputs] = useState({
    vuln1: '',
    vuln2: '',
    vuln3: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessages, setSubmitMessages] = useState({
    vuln1: '',
    vuln2: '',
    vuln3: ''
  })

  const vulnerabilityData = [
    {
      id: 'vuln1',
      title: 'IDOR Challenge',
      description: 'Find and exploit the Insecure Direct Object Reference vulnerability',
      tokenPrefix: 'IDOR_TOKEN_',
      tokenType: 'IDOR',
      unlocked: vulnerabilities.vuln1,
      bgColor: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'vuln2',
      title: 'XSS Challenge',
      description: 'Discover and exploit the Cross-Site Scripting vulnerability',
      tokenPrefix: 'XSS_TOKEN_',
      tokenType: 'XSS',
      unlocked: vulnerabilities.vuln2,
      bgColor: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      id: 'vuln3',
      title: 'SQLI Challenge',
      description: 'Discover and exploit the SQL Injection vulnerability',
      tokenPrefix: 'SQLI_TOKEN_',
      tokenType: 'SQLI',
      unlocked: vulnerabilities.vuln3,
      locked: false,
      bgColor: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400'
    }
  ]

  const unlockedCount = Object.values(vulnerabilities).filter(Boolean).length

  const handleTokenSubmit = async (vuln) => {
    const token = tokenInputs[vuln.id]
    if (!token.trim() || vuln.locked) return

    setIsSubmitting(true)
    setSubmitMessages(prev => ({ ...prev, [vuln.id]: '' }))

    try {
      const response = await api.post('/api/submit_token', {
        token: token.trim(),
        token_type: vuln.tokenType
      })

      if (response.data.is_correct) {
        unlockVulnerability(vuln.id)
        setSubmitMessages(prev => ({ 
          ...prev, 
          [vuln.id]: `🎉 Correct! ${vuln.tokenType} vulnerability unlocked!` 
        }))
        setTokenInputs(prev => ({ ...prev, [vuln.id]: '' }))
        setActiveFlag(null)
      } else {
        setSubmitMessages(prev => ({ 
          ...prev, 
          [vuln.id]: `❌ Invalid ${vuln.tokenType} token. Try again!` 
        }))
      }
    } catch (error) {
      console.error('Error submitting token:', error)
      setSubmitMessages(prev => ({ 
        ...prev, 
        [vuln.id]: '❌ Error submitting token. Please try again.' 
      }))
    } finally {
      setIsSubmitting(false)
      setTimeout(() => {
        setSubmitMessages(prev => ({ ...prev, [vuln.id]: '' }))
      }, 3000)
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all vulnerability progress? This cannot be undone.')) {
      resetVulnerabilities()
      setTokenInputs({ vuln1: '', vuln2: '', vuln3: '' })
      setSubmitMessages({ vuln1: '', vuln2: '', vuln3: '' })
      setActiveFlag(null)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
            <Shield className="text-white h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Security Challenges
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Submit flags from discovered vulnerabilities
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Progress</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {unlockedCount}/3
            </div>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
            title="Reset all progress"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Challenges Completed
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {unlockedCount} of 3
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(unlockedCount / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Flag Challenges Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {vulnerabilityData.map((vuln) => (
          <div 
            key={vuln.id}
            className={`relative bg-gradient-to-br ${vuln.bgColor} rounded-xl p-6 text-white transition-all duration-300 ${
              vuln.locked ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl hover:scale-105'
            }`}
          >
            {/* Status Icon */}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${vuln.iconBg}`}>
                {vuln.unlocked ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : vuln.locked ? (
                  <Lock className={`h-6 w-6 ${vuln.iconColor}`} />
                ) : (
                  <Flag className={`h-6 w-6 ${vuln.iconColor}`} />
                )}
              </div>
              {vuln.unlocked && (
                <div className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                  SOLVED
                </div>
              )}
            </div>

            {/* Challenge Info */}
            <h3 className="text-xl font-bold mb-2">{vuln.title}</h3>
            <p className="text-white/80 text-sm mb-4">{vuln.description}</p>

            {/* Flag Submission */}
            {!vuln.locked && (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tokenInputs[vuln.id]}
                    onChange={(e) => setTokenInputs(prev => ({ ...prev, [vuln.id]: e.target.value }))}
                    placeholder={`Enter ${vuln.tokenPrefix}...`}
                    className="flex-1 px-3 py-2 text-sm bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
                    disabled={isSubmitting || vuln.unlocked}
                  />
                  <button
                    onClick={() => handleTokenSubmit(vuln)}
                    disabled={isSubmitting || !tokenInputs[vuln.id].trim() || vuln.unlocked}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors border border-white/30"
                  >
                    {isSubmitting ? '...' : 'Submit'}
                  </button>
                </div>
                
                {submitMessages[vuln.id] && (
                  <div className="text-sm font-medium bg-white/20 rounded-lg p-2">
                    {submitMessages[vuln.id]}
                  </div>
                )}
              </div>
            )}

            {vuln.locked && (
              <div className="text-center">
                <Lock className="h-8 w-8 text-white/50 mx-auto mb-2" />
                <p className="text-white/70 text-sm">Coming Soon</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Test Knowledge Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl">
              <BookOpen className="text-blue-600 dark:text-blue-400 h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                Test Your Knowledge
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Ready to test your cybersecurity skills? Take our comprehensive quiz.
              </p>
            </div>
          </div>
          <Link
            to="/test"
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <BookOpen size={18} />
            <span>Take Quiz</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FlagSubmission
