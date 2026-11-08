import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { VulnerabilityProvider } from './context/VulnerabilityContext'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy load pages for better performance
const MainPage = React.lazy(() => import('./pages/MainPage'))
const LoginPage = React.lazy(() => import('./pages/LoginPage'))
const FeedPage = React.lazy(() => import('./pages/FeedPage'))
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'))
const TestPage = React.lazy(() => import('./pages/TestPage'))
const BugsPage = React.lazy(() => import('./pages/BugsPage'))
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage'))

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <VulnerabilityProvider>
            <Router>
            <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
                  <LoadingSpinner size="lg" />
                </div>
              }>
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/bugs" element={<ProtectedRoute><BugsPage /></ProtectedRoute>} />
                  <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
                  <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
                  <Route path="/test" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />
                  <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  {/* Catch-all route - redirect any unknown paths to home */}
                  <Route path="*" element={<MainPage />} />
                </Routes>
              </Suspense>
            </div>
          </Router>
        </VulnerabilityProvider>
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
