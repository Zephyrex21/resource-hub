import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { BookmarksProvider } from './context/BookmarksContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <MotionConfig reducedMotion="user">
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <BookmarksProvider>
                  <App />
                </BookmarksProvider>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </MotionConfig>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
