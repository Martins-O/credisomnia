'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  X 
} from 'lucide-react'

export type TransactionStatus = 'pending' | 'success' | 'error' | 'idle'

interface TransactionFeedbackProps {
  status: TransactionStatus
  hash?: string
  message?: string
  onClose?: () => void
  explorerUrl?: string
  autoClose?: boolean
  duration?: number
}

export function TransactionFeedback({
  status,
  hash,
  message,
  onClose,
  explorerUrl = 'https://explorer-testnet.somnia.network',
  autoClose = true,
  duration = 5000
}: TransactionFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (status !== 'idle') {
      setIsVisible(true)
    }
  }, [status])

  useEffect(() => {
    if (autoClose && status === 'success' && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [status, isVisible, autoClose, duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (status === 'idle' || !isVisible) return null

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          title: 'Transaction Pending',
          defaultMessage: 'Your transaction is being processed...'
        }
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-600 dark:text-green-400',
          title: 'Transaction Successful',
          defaultMessage: 'Your transaction has been confirmed!'
        }
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-600 dark:text-red-400',
          title: 'Transaction Failed',
          defaultMessage: 'Your transaction could not be completed.'
        }
      default:
        return {
          icon: Clock,
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          iconColor: 'text-gray-600 dark:text-gray-400',
          title: 'Transaction Status',
          defaultMessage: 'Processing...'
        }
    }
  }

  const config = getStatusConfig()
  const StatusIcon = config.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.95 }}
        className={`fixed top-4 right-4 z-50 max-w-sm w-full mx-4 sm:mx-0`}
      >
        <div className={`${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg p-4`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {status === 'pending' ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <StatusIcon className={`w-5 h-5 ${config.iconColor}`} />
                </motion.div>
              ) : (
                <StatusIcon className={`w-5 h-5 ${config.iconColor}`} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-semibold ${config.iconColor}`}>
                {config.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {message || config.defaultMessage}
              </p>

              {hash && (
                <div className="mt-2">
                  <a
                    href={`${explorerUrl}/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center text-xs ${config.iconColor} hover:underline min-h-[32px] touch-manipulation`}
                  >
                    View on Explorer
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-h-[32px] min-w-[32px] flex items-center justify-center touch-manipulation"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Hook for managing transaction feedback
export function useTransactionFeedback() {
  const [feedback, setFeedback] = useState<{
    status: TransactionStatus
    hash?: string
    message?: string
  }>({ status: 'idle' })

  const showPending = (message?: string, hash?: string) => {
    setFeedback({ status: 'pending', message, hash })
  }

  const showSuccess = (message?: string, hash?: string) => {
    setFeedback({ status: 'success', message, hash })
  }

  const showError = (message?: string) => {
    setFeedback({ status: 'error', message })
  }

  const clear = () => {
    setFeedback({ status: 'idle' })
  }

  return {
    feedback,
    showPending,
    showSuccess,
    showError,
    clear
  }
}