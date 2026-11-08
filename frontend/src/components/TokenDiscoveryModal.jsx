import React, { useState } from 'react'
import { Copy, CheckCircle, X, Shield, Award } from 'lucide-react'

const TokenDiscoveryModal = ({ isOpen, onClose, tokenData }) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !tokenData) return null

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tokenData.token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy token:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = tokenData.token
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getTokenTypeInfo = () => {
    switch (tokenData.type) {
      case 'IDOR':
        return {
          icon: <Shield className="text-red-500" size={24} />,
          title: 'IDOR Vulnerability Token',
          description: 'You discovered an Insecure Direct Object Reference vulnerability!',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        }
      case 'Content Processing':
        return {
          icon: <Award className="text-blue-500" size={24} />,
          title: 'Content Processing Token',
          description: 'You found a content processing feature!',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        }
      default:
        return {
          icon: <Award className="text-green-500" size={24} />,
          title: 'Security Token Discovered',
          description: 'You found a hidden security feature!',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        }
    }
  }

  const tokenInfo = getTokenTypeInfo()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className={`${tokenInfo.bgColor} dark:bg-gray-700 ${tokenInfo.borderColor} dark:border-gray-600 border-b p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {tokenInfo.icon}
              <div>
                <h3 className={`text-lg font-semibold ${tokenInfo.textColor} dark:text-white`}>
                  🎉 Token Discovered!
                </h3>
                <p className={`text-sm ${tokenInfo.textColor} dark:text-gray-300 opacity-80`}>
                  {tokenInfo.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              {tokenInfo.description}
            </p>
            {tokenData.message && (
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                {tokenData.message}
              </p>
            )}
          </div>

          {/* Token Display */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Security Token:
            </label>
            <div className="relative">
              <input
                type="text"
                value={tokenData.token}
                readOnly
                className="w-full p-3 pr-12 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
              />
              <button
                onClick={copyToClipboard}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Copy token"
              >
                {copied ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center">
                <CheckCircle size={14} className="mr-1" />
                Token copied to clipboard!
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">📝 What to do next:</h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
              <li>• Copy the token above</li>
              <li>• Save it for submission</li>
              <li>• Look for more security features</li>
              <li>• Document your findings</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Copy size={16} />
              <span>{copied ? 'Copied!' : 'Copy Token'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenDiscoveryModal
