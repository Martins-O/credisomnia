'use client'

import React from 'react'
import { formatError, logError, getErrorSuggestions } from '@/lib/utils/errorHandling'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    logError(error, 'ErrorBoundary')
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
    
    this.setState({ errorInfo })
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.retry} />
      }

      // Default error UI
      return <DefaultErrorFallback error={this.state.error} retry={this.retry} />
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error: Error
  retry: () => void
}

function DefaultErrorFallback({ error, retry }: DefaultErrorFallbackProps) {
  const formattedError = formatError(error)
  const suggestions = getErrorSuggestions(formattedError)

  return (
    <div className="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center p-8 max-w-md">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {formattedError.title}
        </h2>
        <p className="text-gray-600 mb-4">
          {formattedError.message}
        </p>
        
        {suggestions.length > 0 && (
          <div className="text-left bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-blue-900 mb-2">Try this:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={retry}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 font-medium"
          >
            Refresh Page
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Developer Info
            </summary>
            <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

// Hook for handling async errors in functional components
export function useErrorHandler() {
  const handleError = React.useCallback((error: unknown) => {
    logError(error, 'useErrorHandler')
    
    // You can integrate with error reporting services here
    // For now, we'll just throw the error to trigger the error boundary
    throw error
  }, [])

  return handleError
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Specialized error boundary for async operations
export function AsyncErrorBoundary({ 
  children, 
  onError 
}: { 
  children: React.ReactNode
  onError?: (error: Error) => void 
}) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logError(error, 'AsyncErrorBoundary')
        onError?.(error)
      }}
      fallback={({ error, retry }) => (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Something went wrong
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {formatError(error).message}
              </p>
              <div className="mt-4">
                <button
                  onClick={retry}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

// Component for handling Web3 specific errors
export function Web3ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error) => {
        logError(error, 'Web3ErrorBoundary')
      }}
      fallback={({ error, retry }) => {
        const formattedError = formatError(error)
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-center">
              <div className="text-yellow-500 text-4xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                {formattedError.title}
              </h3>
              <p className="text-yellow-700 mb-4">
                {formattedError.message}
              </p>
              {formattedError.type === 'network' && (
                <p className="text-sm text-yellow-600 mb-4">
                  This seems to be a network-related issue. Please check your wallet connection and try again.
                </p>
              )}
              <div className="space-x-3">
                <button
                  onClick={retry}
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 font-medium"
                >
                  Retry
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="border border-yellow-300 text-yellow-700 px-4 py-2 rounded hover:bg-yellow-100 font-medium"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        )
      }}
    >
      {children}
    </ErrorBoundary>
  )
}