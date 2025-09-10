'use client'

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import { motion, MotionProps } from 'framer-motion'

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
  motionProps?: MotionProps
  ariaLabel?: string
  ariaDescribedBy?: string
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    disabled,
    motionProps,
    ariaLabel,
    ariaDescribedBy,
    onKeyDown,
    ...props 
  }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center',
      'font-medium rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'touch-manipulation'
    ]

    const variantClasses = {
      primary: [
        'bg-blue-600 text-white',
        'hover:bg-blue-700 active:bg-blue-800',
        'focus:ring-blue-500',
        'disabled:hover:bg-blue-600'
      ],
      secondary: [
        'bg-gray-600 text-white',
        'hover:bg-gray-700 active:bg-gray-800',
        'focus:ring-gray-500',
        'disabled:hover:bg-gray-600'
      ],
      outline: [
        'border border-gray-300 bg-white text-gray-700',
        'hover:bg-gray-50 active:bg-gray-100',
        'focus:ring-gray-500',
        'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200',
        'dark:hover:bg-gray-700 dark:active:bg-gray-600'
      ],
      ghost: [
        'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        'active:bg-gray-200 focus:ring-gray-500',
        'dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800',
        'dark:active:bg-gray-700'
      ],
      danger: [
        'bg-red-600 text-white',
        'hover:bg-red-700 active:bg-red-800',
        'focus:ring-red-500',
        'disabled:hover:bg-red-600'
      ]
    }

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-3 text-sm min-h-[44px]',
      lg: 'px-6 py-4 text-base min-h-[48px]'
    }

    const combinedClasses = [
      ...baseClasses,
      ...variantClasses[variant],
      sizeClasses[size],
      className
    ].join(' ')

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Enhanced keyboard accessibility
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (!disabled && !isLoading) {
          event.currentTarget.click()
        }
      }
      onKeyDown?.(event)
    }

    const buttonContent = (
      <>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <span className={`flex items-center space-x-2 ${isLoading ? 'opacity-0' : ''}`}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </span>
      </>
    )

    if (motionProps) {
      const buttonProps = {
        ref,
        className: combinedClasses,
        disabled: disabled || isLoading,
        onKeyDown: handleKeyDown,
        'aria-label': ariaLabel,
        'aria-describedby': ariaDescribedBy,
        'aria-busy': isLoading
      }
      
      return (
        <motion.button
          {...buttonProps}
          {...motionProps}
        >
          {buttonContent}
        </motion.button>
      )
    }

    return (
      <button
        ref={ref}
        className={combinedClasses}
        disabled={disabled || isLoading}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={isLoading}
        {...props}
      >
        {buttonContent}
      </button>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'

// Screen reader only text component
export function ScreenReaderOnly({ children }: { children: ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// Skip link component for keyboard navigation
export function SkipLink({ href, children }: { href: string, children: ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 transition-all"
    >
      {children}
    </a>
  )
}