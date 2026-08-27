import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { AccountProvider } from './context/AccountContext'
import { ToastProvider } from './context/ToastContext'
import { BookmarksProvider } from './context/BookmarksContext'
import { ProgressProvider } from './context/ProgressContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { queryClient } from './lib/queryClient'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <MotionConfig reducedMotion="user">
            <ThemeProvider>
              <AuthProvider>
                <AccountProvider>
                  <ToastProvider>
                    <BookmarksProvider>
                      <ProgressProvider>
                        <App />
                      </ProgressProvider>
                    </BookmarksProvider>
                  </ToastProvider>
                </AccountProvider>
              </AuthProvider>
            </ThemeProvider>
          </MotionConfig>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
