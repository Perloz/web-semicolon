import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft,
  Award,
  Target,
  BookOpen,
  TrendingUp,
  Download
} from 'lucide-react'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'

const TestPage = () => {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  
  // Core state
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [selectedOptions, setSelectedOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Test state
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  
  // Results state
  const [score, setScore] = useState(null)
  const [categoryScores, setCategoryScores] = useState({})
  const [detailedResults, setDetailedResults] = useState([])

  // Load saved answers when question changes
  useEffect(() => {
    if (testStarted && !testCompleted && questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex]
      if (currentQuestion && userAnswers[currentQuestion.id]) {
        setSelectedOptions([...userAnswers[currentQuestion.id]])
      } else {
        setSelectedOptions([])
      }
    }
  }, [currentQuestionIndex, testStarted, testCompleted, questions, userAnswers])

  // Fetch questions on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchQuestions()
  }, [isAuthenticated, navigate])

  const fetchQuestions = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await api.get('/api/test')
      
      if (response.data.questions && Array.isArray(response.data.questions)) {
        setQuestions(response.data.questions)
        
        // Initialize user answers object
        const initialAnswers = {}
        response.data.questions.forEach(q => {
          initialAnswers[q.id] = []
        })
        setUserAnswers(initialAnswers)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching test questions:', error)
      setError(error.response?.data?.error || 'Failed to load test questions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const startTest = () => {
    setTestStarted(true)
    setStartTime(new Date())
    setCurrentQuestionIndex(0)
    setSelectedOptions([])
  }

  const resetTest = () => {
    setTestStarted(false)
    setTestCompleted(false)
    setCurrentQuestionIndex(0)
    setStartTime(null)
    setEndTime(null)
    setScore(null)
    setCategoryScores({})
    setDetailedResults([])
    setSelectedOptions([])
    
    // Reset user answers
    const resetAnswers = {}
    questions.forEach(q => {
      resetAnswers[q.id] = []
    })
    setUserAnswers(resetAnswers)
  }

  const handleOptionSelect = (optionIndex) => {
    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion || optionIndex < 0 || optionIndex >= currentQuestion.options.length) {
      console.error('Invalid option selection:', { optionIndex, currentQuestion })
      return
    }

    const newSelected = [...selectedOptions]
    const optionIndexInSelected = newSelected.indexOf(optionIndex)
    
    if (optionIndexInSelected > -1) {
      // Remove if already selected
      newSelected.splice(optionIndexInSelected, 1)
    } else {
      // Add if not selected
      newSelected.push(optionIndex)
    }
    
    setSelectedOptions(newSelected)
  }

  const submitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) {
      console.error('No current question available for submission')
      return
    }

    // Validate that we have at least one answer
    if (selectedOptions.length === 0) {
      console.warn('No answer selected for question:', currentQuestion.id)
      return
    }

    // Save current answer with sorted array for consistency
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: [...selectedOptions].sort((a, b) => a - b)
    }))

    // Move to next question or complete test
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      
      // Load answers for next question if they exist
      const nextQuestion = questions[nextIndex]
      if (nextQuestion && userAnswers[nextQuestion.id]) {
        setSelectedOptions([...userAnswers[nextQuestion.id]])
      } else {
        setSelectedOptions([]) // Reset for next question
      }
    } else {
      completeTest()
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Save current selections first
      const currentQuestion = questions[currentQuestionIndex]
      if (currentQuestion) {
        setUserAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: [...selectedOptions]
        }))
      }

      // Go to previous question
      const prevIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(prevIndex)
      
      // Load previous answers
      const prevQuestion = questions[prevIndex]
      if (prevQuestion) {
        setSelectedOptions(userAnswers[prevQuestion.id] || [])
      }
    }
  }

  const completeTest = () => {
    setEndTime(new Date())
    calculateResults()
    setTestCompleted(true)
  }

  const calculateResults = () => {
    if (!questions.length) {
      console.error('No questions available for result calculation')
      return
    }

    let totalCorrect = 0
    const categoryCorrect = { XSS: 0, SQLi: 0, IDOR: 0 }
    const categoryTotal = { XSS: 0, SQLi: 0, IDOR: 0 }
    const results = []

    questions.forEach(question => {
      const userAnswer = userAnswers[question.id] || []
      const correctAnswer = question.correct_answer || []
      
      // Check if user answer matches correct answer exactly
      const isCorrect = 
        userAnswer.length === correctAnswer.length &&
        userAnswer.every(ans => correctAnswer.includes(ans)) &&
        correctAnswer.every(ans => userAnswer.includes(ans))

      if (isCorrect) {
        totalCorrect++
        if (categoryCorrect.hasOwnProperty(question.type)) {
          categoryCorrect[question.type]++
        }
      }
      
      if (categoryTotal.hasOwnProperty(question.type)) {
        categoryTotal[question.type]++
      }
      
      results.push({
        questionId: question.id,
        question: question.question,
        type: question.type,
        userAnswer,
        correctAnswer,
        options: question.options,
        isCorrect
      })
    })

    setScore({
      correct: totalCorrect,
      total: questions.length,
      percentage: questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0
    })

    setCategoryScores({
      XSS: {
        correct: categoryCorrect.XSS,
        total: categoryTotal.XSS,
        percentage: categoryTotal.XSS > 0 ? Math.round((categoryCorrect.XSS / categoryTotal.XSS) * 100) : 0
      },
      SQLi: {
        correct: categoryCorrect.SQLi,
        total: categoryTotal.SQLi,
        percentage: categoryTotal.SQLi > 0 ? Math.round((categoryCorrect.SQLi / categoryTotal.SQLi) * 100) : 0
      },
      IDOR: {
        correct: categoryCorrect.IDOR,
        total: categoryTotal.IDOR,
        percentage: categoryTotal.IDOR > 0 ? Math.round((categoryCorrect.IDOR / categoryTotal.IDOR) * 100) : 0
      }
    })

    setDetailedResults(results)
  }

  const getTimeTaken = () => {
    if (!startTime || !endTime) return '0:00'
    const timeDiff = Math.floor((endTime - startTime) / 1000)
    const minutes = Math.floor(timeDiff / 60)
    const seconds = timeDiff % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100 border-green-200'
    if (percentage >= 60) return 'bg-yellow-100 border-yellow-200'
    return 'bg-red-100 border-red-200'
  }

  const generatePDF = () => {
    try {
      // Validate that we have results to generate PDF
      if (!score || !categoryScores || !detailedResults || detailedResults.length === 0) {
        alert('No test results available to generate PDF. Please complete the test first.')
        return
      }

      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank')
      
      if (!printWindow) {
        alert('Pop-up blocked! Please allow pop-ups for this site to download the PDF.')
        return
      }

      const currentDate = new Date().toLocaleDateString()
      const currentTime = new Date().toLocaleTimeString()
      
      // Safely get performance analysis
      const categoryEntries = Object.entries(categoryScores)
      const strongestArea = categoryEntries.length > 0 
        ? categoryEntries.reduce((a, b) => a[1].percentage > b[1].percentage ? a : b)
        : ['N/A', { percentage: 0 }]
      const weakestArea = categoryEntries.length > 0
        ? categoryEntries.reduce((a, b) => a[1].percentage < b[1].percentage ? a : b)
        : ['N/A', { percentage: 0 }]
      
      // Generate HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Cybersecurity Test Results - ${user?.username || 'Student'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #4F46E5;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #4F46E5;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #666;
              margin: 5px 0;
            }
            .score-card {
              background: #f8f9fa;
              border: 2px solid #e9ecef;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .score-card.excellent {
              background: #d4edda;
              border-color: #c3e6cb;
              color: #155724;
            }
            .score-card.good {
              background: #fff3cd;
              border-color: #ffeaa7;
              color: #856404;
            }
            .score-card.poor {
              background: #f8d7da;
              border-color: #f5c6cb;
              color: #721c24;
            }
            .overall-score {
              font-size: 36px;
              font-weight: bold;
              margin: 10px 0;
            }
            .percentage {
              font-size: 24px;
              font-weight: bold;
            }
            .categories {
              display: flex;
              justify-content: space-around;
              margin: 30px 0;
              flex-wrap: wrap;
            }
            .category {
              background: #fff;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 15px;
              margin: 10px;
              min-width: 200px;
              text-align: center;
            }
            .category h3 {
              margin: 0 0 10px 0;
              color: #4F46E5;
            }
            .category-score {
              font-size: 20px;
              font-weight: bold;
              margin: 5px 0;
            }
            .performance-summary {
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .performance-summary h3 {
              color: #4F46E5;
              margin-top: 0;
            }
            .performance-item {
              margin: 10px 0;
            }
            .details {
              margin-top: 30px;
            }
            .details table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            .details th, .details td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .details th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .correct {
              background-color: #d4edda;
              color: #155724;
            }
            .incorrect {
              background-color: #f8d7da;
              color: #721c24;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              border-top: 1px solid #ddd;
              padding-top: 20px;
              color: #666;
              font-size: 14px;
            }
            @media print {
              body {
                padding: 10px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🛡️ Cybersecurity Knowledge Test Results</h1>
            <p><strong>Student:</strong> ${user?.username || 'Student'}</p>
            <p><strong>Date:</strong> ${currentDate} at ${currentTime}</p>
            <p><strong>Test Duration:</strong> ${getTimeTaken()}</p>
          </div>

          <div class="score-card ${score.percentage >= 80 ? 'excellent' : score.percentage >= 60 ? 'good' : 'poor'}">
            <h2>Overall Performance</h2>
            <div class="overall-score">${score.correct}/${score.total}</div>
            <div class="percentage">${score.percentage}%</div>
            <p>
              ${score.percentage >= 80 
                ? 'Excellent! Outstanding knowledge of cybersecurity concepts.' 
                : score.percentage >= 60 
                  ? 'Good performance! Some areas could use improvement.' 
                  : 'Needs improvement. Consider reviewing the cybersecurity fundamentals.'}
            </p>
          </div>

          <div class="categories">
            ${Object.entries(categoryScores).map(([category, scores]) => `
              <div class="category">
                <h3>${category}</h3>
                <div class="category-score">${scores.correct}/${scores.total}</div>
                <div>${scores.percentage}%</div>
                <p><small>${category === 'XSS' ? 'Cross-Site Scripting' : category === 'SQLi' ? 'SQL Injection' : 'Insecure Direct Object References'}</small></p>
              </div>
            `).join('')}
          </div>

          <div class="performance-summary">
            <h3>Performance Analysis</h3>
            <div class="performance-item">
              <strong>Strongest Area:</strong> ${strongestArea[0]} (${strongestArea[1].percentage}%)
            </div>
            <div class="performance-item">
              <strong>Area for Improvement:</strong> ${weakestArea[0]} (${weakestArea[1].percentage}%)
            </div>
            <div class="performance-item">
              <strong>Overall Grade:</strong> 
              ${score.percentage >= 90 ? 'A (Excellent)' : 
                score.percentage >= 80 ? 'B (Good)' : 
                score.percentage >= 70 ? 'C (Satisfactory)' : 
                score.percentage >= 60 ? 'D (Needs Improvement)' : 'F (Requires Study)'}
            </div>
          </div>

          <div class="details">
            <h3>Detailed Results by Category</h3>
            
            ${['XSS', 'SQLi', 'IDOR'].map(category => {
              const categoryQuestions = detailedResults.filter(q => q.type === category)
              const categoryCorrect = categoryQuestions.filter(q => q.isCorrect).length
              
              return `
                <h4>${category} Questions (${categoryCorrect}/${categoryQuestions.length} correct)</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Q#</th>
                      <th>Question</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${categoryQuestions.map((result, index) => `
                      <tr class="${result.isCorrect ? 'correct' : 'incorrect'}">
                        <td>${index + 1}</td>
                        <td>${result.question}</td>
                        <td>${result.isCorrect ? '✅ Correct' : '❌ Incorrect'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              `
            }).join('')}
          </div>

          <div class="footer">
            <p><strong>Semicolon Academy</strong> - Cybersecurity Knowledge Assessment</p>
            <p>This certificate validates the completion of a comprehensive cybersecurity knowledge test covering XSS, SQL Injection, and IDOR vulnerabilities.</p>
            <p>Generated on ${currentDate} at ${currentTime}</p>
          </div>
        </body>
        </html>
      `

      // Write content to new window
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          // Don't automatically close to allow user to save as PDF
          // printWindow.close()
        }, 500)
      }

    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading test questions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <XCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Test</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchQuestions}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {!testStarted ? (
          // Pre-test screen
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="text-white" size={40} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Cybersecurity Knowledge Test
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Test your knowledge with 36 multiple-choice questions covering XSS, SQL Injection, and IDOR vulnerabilities.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Target className="text-blue-600 mb-3" size={24} />
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">XSS (Cross-Site Scripting)</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">12 questions covering XSS attack vectors, prevention techniques, and security measures.</p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                  <Target className="text-green-600 mb-3" size={24} />
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">SQL Injection</h3>
                  <p className="text-sm text-green-600 dark:text-green-400">12 questions about SQL injection techniques, detection, and prevention methods.</p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                  <Target className="text-purple-600 mb-3" size={24} />
                  <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">IDOR</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">12 questions on Insecure Direct Object References and access control.</p>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-8">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3">📋 Test Instructions</h3>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-2">
                  <li>• This test contains 36 multiple-choice questions</li>
                  <li>• Some questions may have multiple correct answers</li>
                  <li>• You can navigate back to previous questions to change answers</li>
                  <li>• Take your time - there's no time limit</li>
                  <li>• Click "Start Test" when you're ready to begin</li>
                </ul>
              </div>

              <div className="text-center">
                <button
                  onClick={startTest}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
                >
                  Start Test
                </button>
              </div>
            </div>
          </div>
        ) : testCompleted ? (
          // Results screen
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${getScoreBgColor(score.percentage)}`}>
                  <Award className={`${getScoreColor(score.percentage)}`} size={40} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Test Completed!
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Here are your results for the cybersecurity knowledge test.
                </p>
              </div>

              {/* Overall Score */}
              <div className={`p-6 rounded-lg border-2 mb-8 ${getScoreBgColor(score.percentage)}`}>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Overall Score</h2>
                  <div className={`text-4xl font-bold ${getScoreColor(score.percentage)} mb-2`}>
                    {score.correct}/{score.total}
                  </div>
                  <div className={`text-xl ${getScoreColor(score.percentage)}`}>
                    {score.percentage}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Time taken: {getTimeTaken()}
                  </p>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {Object.entries(categoryScores).map(([category, scores]) => (
                  <div key={category} className={`p-6 rounded-lg border ${getScoreBgColor(scores.percentage)}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {category}
                      <span className="block text-sm font-normal text-gray-600 dark:text-gray-400">
                        {category === 'XSS' ? 'Cross-Site Scripting' : 
                         category === 'SQLi' ? 'SQL Injection' : 
                         'Insecure Direct Object References'}
                      </span>
                    </h3>
                    <div className={`text-2xl font-bold ${getScoreColor(scores.percentage)} mb-1`}>
                      {scores.correct}/{scores.total}
                    </div>
                    <div className={`text-lg ${getScoreColor(scores.percentage)}`}>
                      {scores.percentage}%
                    </div>
                  </div>
                ))}
              </div>

              {/* Performance Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Summary</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Strongest Area:</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {Object.entries(categoryScores).reduce((a, b) => 
                        categoryScores[a[0]].percentage > categoryScores[b[0]].percentage ? a : b
                      )[0]} ({Math.max(...Object.values(categoryScores).map(s => s.percentage))}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Area for Improvement:</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {Object.entries(categoryScores).reduce((a, b) => 
                        categoryScores[a[0]].percentage < categoryScores[b[0]].percentage ? a : b
                      )[0]} ({Math.min(...Object.values(categoryScores).map(s => s.percentage))}%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={generatePDF}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  title="Click to open print dialog - choose 'Save as PDF' to download your results"
                >
                  <Download size={20} />
                  <span>Download PDF Report</span>
                </button>
                
                <button
                  onClick={resetTest}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <RotateCcw size={20} />
                  <span>Retake Test</span>
                </button>
                
                <button
                  onClick={() => navigate('/feed')}
                  className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span>Back to Feed</span>
                </button>
              </div>
              
              {/* PDF Download Instructions */}
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  💡 <strong>Tip:</strong> Click "Download PDF Report" then choose "Save as PDF" in the print dialog to save your results.
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Test in progress
          <div className="max-w-4xl mx-auto">
            {/* Progress Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {questions[currentQuestionIndex]?.type}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Progress: {questions.length > 0 ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100) : 0}%
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            {questions[currentQuestionIndex] && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {questions[currentQuestionIndex].question}
                  </h2>
                  
                  <div className="space-y-3">
                    {questions[currentQuestionIndex].options.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          selectedOptions.includes(index)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedOptions.includes(index)}
                          onChange={() => handleOptionSelect(index)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-3"
                        />
                        <span className="text-gray-900 dark:text-white">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    <ArrowLeft size={20} />
                    <span>Previous</span>
                  </button>

                  <div className="flex space-x-4">
                    <button
                      onClick={submitAnswer}
                      disabled={selectedOptions.length === 0}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                      <span>
                        {currentQuestionIndex === questions.length - 1 ? 'Complete Test' : 'Next Question'}
                      </span>
                      {currentQuestionIndex !== questions.length - 1 && <ArrowRight size={20} />}
                      {currentQuestionIndex === questions.length - 1 && <CheckCircle size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TestPage
