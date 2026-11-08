import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Store error details in state
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI with proper dark mode support
      return (
        <div className="p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 m-5 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">🚨 Something went wrong!</h2>
          <details className="mb-4">
            <summary className="cursor-pointer text-red-700 dark:text-red-300 font-medium">Error details:</summary>
            <pre className="mt-2 text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap bg-red-100 dark:bg-red-900/40 p-3 rounded border">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo.componentStack}
            </pre>
          </details>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null })
              }}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white border-none rounded cursor-pointer transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white border-none rounded cursor-pointer transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
