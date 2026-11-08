import React, { useState } from 'react'
import { Shield, Lock, CheckCircle, AlertTriangle, Target, Key, RotateCcw, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useVulnerabilities } from '../context/VulnerabilityContext'
import { api } from '../utils/api'

const AssignmentCard = () => {
  const { vulnerabilities, unlockVulnerability, resetVulnerabilities } = useVulnerabilities()
  const [tokenInput, setTokenInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  
  React.useEffect(() => {
    if (vulnerabilities.vuln1) {
      setTokenInput('')
    }
  }, [vulnerabilities.vuln1])

  const vulnerabilityData = [
    {
      id: 'vuln1',
      title: 'IDOR Vulnerability',
      description: 'Insecure Direct Object Reference - Access other users\' data',
      unlocked: vulnerabilities.vuln1
    },
    {
      id: 'vuln2',
      title: 'XSS Vulnerability',
      description: 'Cross-Site Scripting - Execute malicious scripts',
      unlocked: vulnerabilities.vuln2
    },
    {
      id: 'vuln3',
      title: 'SQL Injection Vulnerability',
      description: 'SQL Injection - Manipulate database queries',
      unlocked: vulnerabilities.vuln3
    }
  ]

  const unlockedCount = Object.values(vulnerabilities).filter(Boolean).length

  const handleTokenSubmit = async (e) => {
    e.preventDefault()
    if (!tokenInput.trim()) return

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // Determine token type based on token prefix
      let tokenType = 'IDOR' // default
      if (tokenInput.trim().startsWith('XSS_TOKEN_')) {
        tokenType = 'XSS'
      } else if (tokenInput.trim().startsWith('IDOR_TOKEN_')) {
        tokenType = 'IDOR'
      } else if (tokenInput.trim().startsWith('SQLI_TOKEN_')) {
        tokenType = 'SQLI'
      }

      const response = await api.post('/api/submit_token', {
        token: tokenInput.trim(),
        token_type: tokenType
      })

      if (response.data.is_correct) {
        if (tokenType === 'IDOR') {
          unlockVulnerability('vuln1')
          setSubmitMessage('🎉 Correct! IDOR vulnerability unlocked!')
        } else if (tokenType === 'XSS') {
          unlockVulnerability('vuln2')
          setSubmitMessage('🎉 Correct! XSS vulnerability unlocked!')
        } else if (tokenType === 'SQLI') {
          unlockVulnerability('vuln3')
          setSubmitMessage('🎉 Correct! SQL Injection vulnerability unlocked!')
        }
        setTokenInput('')
      } else {
        setSubmitMessage(`❌ Invalid ${tokenType} token. Try again!`)
      }
    } catch (error) {
      console.error('Error submitting token:', error)
      setSubmitMessage('❌ Error submitting token. Please try again.')
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitMessage(''), 3000)
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all vulnerability progress? This cannot be undone.')) {
      resetVulnerabilities()
      setTokenInput('')
      setSubmitMessage('')
    }
  }

  return (
    <div className="card-modern p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
          <Shield className="text-white" size={20} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1">
          Security Challenge
        </h3>
        <button
          onClick={handleReset}
          className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-md transition-colors"
          title="Reset all progress"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Test your cybersecurity skills by discovering vulnerabilities in this web application.
        </p>
        
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="text-red-600 dark:text-red-400" size={16} />
            <span className="font-semibold text-red-800 dark:text-red-300 text-sm">
              Mission Objectives
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {unlockedCount} of 3 Vulnerabilities Found
              </span>
              <div className="flex space-x-1">
                {vulnerabilityData.map((vuln, index) => (
                  <div 
                    key={vuln.id}
                    className={`w-2 h-2 rounded-full ${
                      vuln.unlocked 
                        ? 'bg-green-400' 
                        : 'bg-red-400'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {vulnerabilityData.map((vuln, index) => (
            <div 
              key={vuln.id}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                vuln.unlocked 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-gray-50 dark:bg-gray-800'
              }`}
            >
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${
                vuln.unlocked 
                  ? 'bg-green-500 dark:bg-green-600' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                {vuln.unlocked ? (
                  <CheckCircle size={12} className="text-white" />
                ) : (
                  <Lock size={12} className="text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  vuln.unlocked 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-gray-800 dark:text-gray-200'
                }`}>
                  {vuln.title}
                </p>
                <p className={`text-xs transition-colors duration-300 ${
                  vuln.unlocked 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {vuln.unlocked ? 'Vulnerability found! 🎉' : vuln.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="text-blue-600 dark:text-blue-400" size={14} />
            <span className="font-medium text-blue-800 dark:text-blue-300 text-xs">
              How it Works
            </span>
          </div>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Explore the application thoroughly</li>
            <li>• Discover security vulnerabilities</li>
            <li>• Get flags when vulnerabilities are found</li>
            <li>• Use flags to unlock corresponding quizzes</li>
          </ul>
        </div>

        {/* Token Submission Section */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-2 mb-3">
            <Key className="text-yellow-600 dark:text-yellow-400" size={16} />
            <span className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm">
              Submit Vulnerability Token
            </span>
          </div>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
            Submit tokens you discover from exploiting vulnerabilities (IDOR_TOKEN_*, XSS_TOKEN_*, or SQLI_TOKEN_*)
          </p>
          <form onSubmit={handleTokenSubmit} className="space-y-3">
            <div>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Enter IDOR_TOKEN_ or XSS_TOKEN_ here..."
                className="w-full px-3 py-2 text-sm border border-yellow-300 dark:border-yellow-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isSubmitting || !tokenInput.trim()}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Token'}
              </button>
              {submitMessage && (
                <span className="text-sm font-medium">
                  {submitMessage}
                </span>
              )}
              {(vulnerabilities.vuln1 || vulnerabilities.vuln2 || vulnerabilities.vuln3) && !submitMessage && (
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  🎉 {vulnerabilities.vuln1 ? 'IDOR' : ''} {vulnerabilities.vuln2 ? 'XSS' : ''} {vulnerabilities.vuln3 ? 'SQLI' : ''} vulnerability solved!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Test Knowledge Button */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <BookOpen className="text-blue-600 dark:text-blue-400" size={20} />
              <span className="font-semibold text-blue-800 dark:text-blue-300">
                Test Your Knowledge
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
              Ready to test your cybersecurity skills? Take our comprehensive quiz covering XSS, SQL Injection, and IDOR vulnerabilities.
            </p>
            <Link
              to="/test"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <BookOpen size={16} />
              <span>Take Knowledge Test</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignmentCard
