import React, { useState, useEffect } from 'react'
import { 
  Shield, AlertTriangle, Code, Database, Lock, Eye, Download, BookOpen, 
  Bug, Zap, Target, ChevronRight, Play, ExternalLink, Copy, Check,
  FileText, Globe, Server, Users, Layers, ArrowRight
} from 'lucide-react'
import { api } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import Navbar from '../components/Navbar'
import FlagSubmission from '../components/FlagSubmission'

const BugsPage = () => {
  const [bugsData, setBugsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeVuln, setActiveVuln] = useState('xss')
  const [activeSection, setActiveSection] = useState('overview')
  const [copiedPayload, setCopiedPayload] = useState(null)

  useEffect(() => {
    fetchBugsEducation()
  }, [])

  const fetchBugsEducation = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/bugs-education')
      setBugsData(response.data)
    } catch (error) {
      console.error('Error fetching bugs education:', error)
      setError('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPayload(index)
      setTimeout(() => setCopiedPayload(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const printCheatSheet = () => {
    const printWindow = window.open('', '_blank')
    const cheatSheetContent = generateCheatSheetHTML()
    printWindow.document.write(cheatSheetContent)
    printWindow.document.close()
    printWindow.print()
  }

  const generateCheatSheetHTML = () => {
    if (!bugsData) return ''

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Security Vulnerabilities Cheat Sheet - Semicolon Academy</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #e11d48; padding-bottom: 20px; }
        .header h1 { color: #e11d48; margin: 0; font-size: 28px; }
        .header p { color: #666; margin: 5px 0; }
        .section { margin-bottom: 30px; page-break-inside: avoid; }
        .section h2 { color: #e11d48; border-bottom: 2px solid #fee2e2; padding-bottom: 8px; }
        .vulnerability-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 15px 0; }
        .payload-item { background: #f8fafc; padding: 12px; border-left: 4px solid #e11d48; border-radius: 4px; margin: 8px 0; }
        .payload-code { font-family: 'Courier New', Consolas, monospace; font-size: 11px; background: #1e293b; color: #e2e8f0; padding: 8px; border-radius: 4px; margin: 5px 0; word-break: break-all; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
        @media print { body { margin: 15px; } .section { break-inside: avoid; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🛡️ Web Security Vulnerabilities Cheat Sheet</h1>
        <p><strong>Semicolon Academy</strong> - Comprehensive Security Reference</p>
        <p>XSS, SQL Injection & IDOR - Essential Payloads and Techniques</p>
        <p><small>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</small></p>
      </div>

      <div class="section">
        <h2>🎯 Cross-Site Scripting (XSS) Payloads</h2>
        <p><strong>Description:</strong> Inject malicious scripts to execute in victim browsers</p>
        <div class="vulnerability-grid">
          ${bugsData.cheatsheets.xss_payloads.map((payload, index) => 
            `<div class="payload-item">
              <strong>${index + 1}.</strong>
              <div class="payload-code">${payload.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>`
          ).join('')}
        </div>
      </div>

      <div class="section">
        <h2>💉 SQL Injection Payloads</h2>
        <p><strong>Description:</strong> Manipulate database queries to extract or modify data</p>
        <div class="vulnerability-grid">
          ${bugsData.cheatsheets.sqli_payloads.map((payload, index) => 
            `<div class="payload-item">
              <strong>${index + 1}.</strong>
              <div class="payload-code">${payload}</div>
            </div>`
          ).join('')}
        </div>
      </div>

      <div class="section">
        <h2>🔓 IDOR (Insecure Direct Object Reference) Techniques</h2>
        <p><strong>Description:</strong> Access unauthorized objects by manipulating references</p>
        ${bugsData.cheatsheets.idor_techniques.map((technique, index) => 
          `<div class="payload-item">
            <strong>${index + 1}.</strong> ${technique}
          </div>`
        ).join('')}
      </div>

      <div class="section">
        <h2>📚 Recommended Practice Resources</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <h3>🧪 Practice Labs:</h3>
            ${bugsData.learning_resources.practice_labs.map(lab => `<div>• ${lab}</div>`).join('')}
          </div>
          <div>
            <h3>🎓 Certifications:</h3>
            ${bugsData.learning_resources.certifications.map(cert => `<div>• ${cert}</div>`).join('')}
          </div>
        </div>
      </div>

      <div class="footer">
        <p><strong>Semicolon Academy</strong> | Web Application Security Training</p>
      </div>
    </body>
    </html>
    `
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Bug className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to Load</h3>
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </>
    )
  }

  if (!bugsData) return null

  const vulnerabilities = Object.values(bugsData.vulnerabilities)
  const currentVuln = bugsData.vulnerabilities[activeVuln]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-2xl shadow-2xl text-white p-8 mb-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                    <Shield className="h-10 w-10" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{bugsData.introduction.title}</h1>
                    <p className="text-blue-100 text-lg">{bugsData.introduction.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold">{bugsData.introduction.stats.covered_in_course}</div>
                    <div className="text-sm text-blue-100">Vulnerabilities</div>
                    <div className="text-xs text-blue-200 mt-1">{bugsData.introduction.stats.estimated_reading_time}</div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-white/20 pt-6">
                <p className="text-xl font-medium mb-4">{bugsData.introduction.subtitle}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-8 w-8 text-yellow-300" />
                      <div>
                        <div className="font-bold text-lg">XSS</div>
                        <div className="text-sm text-blue-100">Cross-Site Scripting</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                    <div className="flex items-center space-x-3">
                      <Database className="h-8 w-8 text-blue-300" />
                      <div>
                        <div className="font-bold text-lg">SQLi</div>
                        <div className="text-sm text-blue-100">SQL Injection</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                    <div className="flex items-center space-x-3">
                      <Lock className="h-8 w-8 text-purple-300" />
                      <div>
                        <div className="font-bold text-lg">IDOR</div>
                        <div className="text-sm text-blue-100">Access Control</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Flag Submission Section */}
          <FlagSubmission />

          {/* Navigation Pills */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8 p-2">
            <div className="flex flex-wrap gap-2">
              {vulnerabilities.map((vuln) => (
                <button
                  key={vuln.id}
                  onClick={() => {
                    setActiveVuln(vuln.id)
                    setActiveSection('overview')
                  }}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    activeVuln === vuln.id
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {vuln.id === 'xss' && <Code className="h-5 w-5" />}
                  {vuln.id === 'sqli' && <Database className="h-5 w-5" />}
                  {vuln.id === 'idor' && <Lock className="h-5 w-5" />}
                  <span className="font-semibold">{vuln.title}</span>
                  {activeVuln === vuln.id && <ChevronRight className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Section Navigation */}
          {currentVuln && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8 p-1">
              <div className="flex flex-wrap gap-1">
                {['overview', 'types', 'prevention', 'payloads'].map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeSection === section
                        ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          {currentVuln && (
            <div className="space-y-8">
              
              {/* Overview Section */}
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  {/* Main Overview Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          {currentVuln.id === 'xss' && <Code className="h-8 w-8 text-yellow-500" />}
                          {currentVuln.id === 'sqli' && <Database className="h-8 w-8 text-blue-500" />}
                          {currentVuln.id === 'idor' && <Lock className="h-8 w-8 text-purple-500" />}
                          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {currentVuln.title}
                          </h2>
                        </div>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                          {currentVuln.description}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {currentVuln.detailed_explanation}
                        </p>
                      </div>
                      <div className="ml-6 text-right">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                          currentVuln.severity === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          currentVuln.severity === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          {currentVuln.severity}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          OWASP Rank #{currentVuln.owasp_rank}
                        </div>
                      </div>
                    </div>

                    {/* How it Works */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Play className="h-5 w-5 text-green-500 mr-2" />
                        How It Works
                      </h3>
                      <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {currentVuln.how_it_works}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Types Section */}
              {activeSection === 'types' && (
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                  {currentVuln.types.map((type, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                            {type.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {type.description}
                          </p>
                          {type.technical_details && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Technical Details</h4>
                              <p className="text-blue-800 dark:text-blue-300 text-sm">
                                {type.technical_details}
                              </p>
                            </div>
                          )}
                          <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-gray-300 mb-2 text-sm">Example:</h4>
                            <code className="text-green-400 text-sm font-mono break-all">
                              {type.example}
                            </code>
                          </div>
                          {type.real_scenario && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-4">
                              <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Real-World Scenario</h4>
                              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                                {type.real_scenario}
                              </p>
                            </div>
                          )}
                          <div className={`text-sm font-medium ${
                            type.risk.includes('Critical') ? 'text-red-600 dark:text-red-400' :
                            type.risk.includes('High') ? 'text-orange-600 dark:text-orange-400' :
                            'text-yellow-600 dark:text-yellow-400'
                          }`}>
                            🎯 Risk Level: {type.risk}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Impact & Prevention */}
              {activeSection === 'prevention' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Impact */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                      <Target className="h-6 w-6 text-red-500 mr-3" />
                      Potential Impact
                    </h3>
                    <div className="space-y-4">
                      {currentVuln.impact.map((item, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prevention */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                      <Shield className="h-6 w-6 text-green-500 mr-3" />
                      Prevention Methods
                    </h3>
                    <div className="space-y-4">
                      {currentVuln.prevention.map((item, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Payloads Section */}
              {activeSection === 'payloads' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                      <FileText className="h-6 w-6 text-purple-500 mr-3" />
                      {currentVuln.id === 'xss' ? 'XSS Payloads' :
                       currentVuln.id === 'sqli' ? 'SQL Injection Payloads' :
                       'IDOR Techniques'}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {currentVuln.id === 'xss' ? bugsData.cheatsheets.xss_payloads.length :
                       currentVuln.id === 'sqli' ? bugsData.cheatsheets.sqli_payloads.length :
                       bugsData.cheatsheets.idor_techniques.length} techniques
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(currentVuln.id === 'xss' ? bugsData.cheatsheets.xss_payloads :
                      currentVuln.id === 'sqli' ? bugsData.cheatsheets.sqli_payloads :
                      bugsData.cheatsheets.idor_techniques).map((payload, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 relative group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              #{index + 1}
                            </div>
                            <code className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                              {payload}
                            </code>
                          </div>
                          <button
                            onClick={() => copyToClipboard(payload, index)}
                            className="ml-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                            title="Copy to clipboard"
                          >
                            {copiedPayload === index ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cheat Sheet Section */}
          <div className="mt-12 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <BookOpen className="h-8 w-8 text-indigo-600 mr-3" />
                  Complete Security Cheat Sheet
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Comprehensive reference guide with all payloads and techniques
                </p>
              </div>
              <button
                onClick={printCheatSheet}
                className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg transform hover:scale-105"
              >
                <Download className="h-5 w-5" />
                <span className="font-medium">Print Cheat Sheet</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* XSS Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Code className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">XSS Payloads</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {bugsData.cheatsheets.xss_payloads.length} payloads
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {bugsData.cheatsheets.xss_payloads.slice(0, 3).map((payload, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-xs font-mono">
                      {payload.length > 50 ? payload.substring(0, 50) + '...' : payload}
                    </div>
                  ))}
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium text-center pt-2">
                    +{bugsData.cheatsheets.xss_payloads.length - 3} more payloads...
                  </div>
                </div>
              </div>

              {/* SQL Injection Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">SQL Injection</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {bugsData.cheatsheets.sqli_payloads.length} payloads
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {bugsData.cheatsheets.sqli_payloads.slice(0, 3).map((payload, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-xs font-mono">
                      {payload}
                    </div>
                  ))}
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium text-center pt-2">
                    +{bugsData.cheatsheets.sqli_payloads.length - 3} more payloads...
                  </div>
                </div>
              </div>

              {/* IDOR Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">IDOR Techniques</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {bugsData.cheatsheets.idor_techniques.length} techniques
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {bugsData.cheatsheets.idor_techniques.slice(0, 3).map((technique, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-xs">
                      {technique.substring(0, 60)}...
                    </div>
                  ))}
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium text-center pt-2">
                    +{bugsData.cheatsheets.idor_techniques.length - 3} more techniques...
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default BugsPage
