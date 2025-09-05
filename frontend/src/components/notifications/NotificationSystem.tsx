'use client'

import { useEffect } from 'react'
import { Transition } from '@headlessui/react'
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useNotificationStore } from '@/lib/store/defi-store'

const iconMap = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
}

const colorMap = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-400',
    title: 'text-green-800',
    description: 'text-green-700',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-400',
    title: 'text-red-800',
    description: 'text-red-700',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-400',
    title: 'text-yellow-800',
    description: 'text-yellow-700',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-400',
    title: 'text-blue-800',
    description: 'text-blue-700',
  },
}

export default function NotificationSystem() {
  const { notifications, removeNotification } = useNotificationStore()

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-sm">
      <div className="space-y-2">
        {notifications.map((notification) => {
          const Icon = iconMap[notification.type]
          const colors = colorMap[notification.type]

          return (
            <Transition
              key={notification.id}
              show={true}
              enter="transform ease-out duration-300 transition"
              enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
              enterTo="translate-y-0 opacity-100 sm:translate-x-0"
              leave="transform ease-in duration-100 transition"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 shadow-lg`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Icon className={`h-5 w-5 ${colors.icon}`} aria-hidden="true" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${colors.title}`}>
                      {notification.title}
                    </p>
                    {notification.description && (
                      <p className={`mt-1 text-sm ${colors.description}`}>
                        {notification.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      className={`${colors.bg} rounded-md inline-flex ${colors.description} hover:${colors.title} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${colors.bg.split('-')[1]}-50 focus:ring-${colors.icon.split('-')[1]}-600`}
                      onClick={() => removeNotification(notification.id)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          )
        })}
      </div>
    </div>
  )
}