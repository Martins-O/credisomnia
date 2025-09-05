'use client';

import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

export function Logo({ 
  variant = 'full', 
  size = 'md', 
  theme = 'auto',
  className = '' 
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  // Adaptive Logo Icon that responds to dark mode via CSS
  const LogoIcon = ({ className: iconClassName }: { className?: string }) => (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={iconClassName}
    >
      {/* Background circle */}
      <circle
        cx="16"
        cy="16"
        r="15"
        fill="url(#logoGradient)"
        stroke="url(#logoBorder)"
        strokeWidth="2"
      />
      
      {/* Credit score gauge arc */}
      <path
        d="M8 20 C8 12, 24 12, 24 20"
        stroke="#ffffff"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Score indicator needle */}
      <path
        d="M16 20 L20 16"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        className="dark:stroke-green-400"
      />
      
      {/* Central dot */}
      <circle
        cx="16"
        cy="20"
        r="1.5"
        fill="#ffffff"
        className="dark:fill-green-400"
      />
      
      {/* Blockchain dots for network effect */}
      <circle cx="10" cy="12" r="1" fill="#ffffff" opacity="0.7" className="dark:fill-blue-400 dark:opacity-0.8" />
      <circle cx="22" cy="12" r="1" fill="#ffffff" opacity="0.7" className="dark:fill-blue-400 dark:opacity-0.8" />
      <circle cx="16" cy="8" r="1" fill="#ffffff" opacity="0.7" className="dark:fill-blue-400 dark:opacity-0.8" />
      
      {/* Connecting lines for network */}
      <path
        d="M10 12 L16 8 L22 12"
        stroke="#ffffff"
        strokeWidth="0.5"
        opacity="0.5"
        className="dark:stroke-blue-400 dark:opacity-0.6"
      />
      
      <defs>
        {/* Primary gradient - will be overridden by CSS in dark mode */}
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        
        {/* Border gradient */}
        <linearGradient id="logoBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>
      </defs>
      
      {/* Dark mode styles */}
      <style>{`
        .dark svg #logoGradient stop:first-child {
          stop-color: #1e293b;
        }
        .dark svg #logoGradient stop:last-child {
          stop-color: #0f172a;
        }
        .dark svg #logoBorder stop:first-child {
          stop-color: #38bdf8;
        }
        .dark svg #logoBorder stop:last-child {
          stop-color: #0ea5e9;
        }
      `}</style>
    </svg>
  );

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {(variant === 'full' || variant === 'icon') && (
        <LogoIcon className={sizeClasses[size]} />
      )}
      
      {(variant === 'full' || variant === 'text') && (
        <span className={`font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-200 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          Credisomnia
        </span>
      )}
    </div>
  );
}

// Specialized logo variants for common use cases
export function LogoFull(props: Omit<LogoProps, 'variant'>) {
  return <Logo variant="full" {...props} />;
}

export function LogoIcon(props: Omit<LogoProps, 'variant'>) {
  return <Logo variant="icon" {...props} />;
}

export function LogoText(props: Omit<LogoProps, 'variant'>) {
  return <Logo variant="text" {...props} />;
}

// Monogram version for very small spaces
export function LogoMonogram({ size = 'md', className = '' }: Pick<LogoProps, 'size' | 'className'>) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center font-bold text-white ${className}`}>
      C
    </div>
  );
}