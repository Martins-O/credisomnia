'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Wallet, 
  Award, 
  TrendingUp, 
  Shield,
  ChevronRight,
  CheckCircle 
} from 'lucide-react'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
}

const onboardingSteps = [
  {
    id: 1,
    title: 'Welcome to CrediSom',
    description: 'Build your on-chain credit score and access better DeFi rates',
    icon: Award,
    action: 'Get Started'
  },
  {
    id: 2,
    title: 'Connect Your Wallet',
    description: 'Link your Web3 wallet to start building your credit profile',
    icon: Wallet,
    action: 'Connect Now'
  },
  {
    id: 3,
    title: 'Mint Your Credit NFT',
    description: 'Create your soulbound NFT that represents your credit history',
    icon: Shield,
    action: 'Mint NFT'
  },
  {
    id: 4,
    title: 'Start Building Credit',
    description: 'Deposit into savings or take a loan to begin establishing your score',
    icon: TrendingUp,
    action: 'Explore Dashboard'
  }
]

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setCompletedSteps([])
    }
  }, [isOpen])

  const handleNextStep = () => {
    setCompletedSteps(prev => [...prev, onboardingSteps[currentStep].id])
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
      localStorage.setItem('credisomOnboardingCompleted', 'true')
    }
  }

  const handleSkip = () => {
    onClose()
    localStorage.setItem('credisomOnboardingCompleted', 'true')
  }

  if (!isOpen) return null

  const step = onboardingSteps[currentStep]
  const StepIcon = step.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Progress Bar */}
            <div className="flex space-x-2 mb-4">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    index <= currentStep 
                      ? 'bg-white' 
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            <div className="text-sm opacity-90 mb-2">
              Step {currentStep + 1} of {onboardingSteps.length}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <StepIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {step.title}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleNextStep}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors min-h-[44px] flex items-center justify-center touch-manipulation"
              >
                <span>{step.action}</span>
                {currentStep < onboardingSteps.length - 1 ? (
                  <ChevronRight className="w-4 h-4 ml-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 ml-2" />
                )}
              </button>

              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium py-3 px-4 rounded-lg transition-colors min-h-[44px] flex items-center justify-center touch-manipulation"
                >
                  Back
                </button>
              )}

              <button
                onClick={handleSkip}
                className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm py-2 transition-colors min-h-[36px] flex items-center justify-center touch-manipulation"
              >
                Skip tutorial
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}