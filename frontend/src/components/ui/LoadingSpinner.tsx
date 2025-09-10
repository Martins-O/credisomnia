'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'white' | 'gray'
  text?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'blue', 
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const colorClasses = {
    blue: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} border-2 rounded-full ${colorClasses[color]}`}
      />
      {text && (
        <span className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400`}>
          {text}
        </span>
      )}
    </div>
  )
}

export function LoadingButton({ 
  isLoading, 
  children, 
  className = '',
  disabled,
  ...props 
}: {
  isLoading: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
  [key: string]: any
}) {
  return (
    <button
      {...props}
      disabled={isLoading || disabled}
      className={`relative ${className} ${
        isLoading ? 'cursor-not-allowed' : ''
      }`}
    >
      <span className={isLoading ? 'opacity-50' : ''}>
        {children}
      </span>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
        </div>
      )}
    </button>
  )
}

export function LoadingCard({ 
  children, 
  isLoading, 
  className = '' 
}: {
  children: React.ReactNode
  isLoading: boolean
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      )}
      <div className={isLoading ? 'pointer-events-none' : ''}>
        {children}
      </div>
    </div>
  )
}