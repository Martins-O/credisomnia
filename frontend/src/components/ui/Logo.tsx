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

  // CrediSom Logo Icon - Professional financial technology design
  const LogoIcon = ({ className: iconClassName }: { className?: string }) => (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={iconClassName}
    >
      {/* Outer ring - represents security and trust */}
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="url(#logoGradient)"
        stroke="url(#logoBorder)"
        strokeWidth="2"
      />
      
      {/* Inner shield shape - credit protection */}
      <path
        d="M20 6 L28 10 L28 22 C28 26 24 30 20 34 C16 30 12 26 12 22 L12 10 L20 6 Z"
        fill="rgba(255,255,255,0.15)"
        stroke="#ffffff"
        strokeWidth="1.5"
        className="dark:stroke-blue-200"
      />
      
      {/* Central "CS" monogram */}
      <g className="font-bold">
        {/* Letter C */}
        <path
          d="M15 16 C15 14, 16 13, 17.5 13 C18.5 13, 19 13.5, 19 13.5"
          stroke="#ffffff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          className="dark:stroke-green-300"
        />
        <path
          d="M15 20 C15 22, 16 23, 17.5 23 C18.5 23, 19 22.5, 19 22.5"
          stroke="#ffffff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          className="dark:stroke-green-300"
        />
        
        {/* Letter S */}
        <path
          d="M21 15 C21 14, 22 13, 23 13 C24 13, 25 14, 25 15 C25 16, 24 16.5, 23 17 C22 17.5, 21 18, 21 19 C21 20, 22 21, 23 21 C24 21, 25 20, 25 20"
          stroke="#ffffff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          className="dark:stroke-blue-300"
        />
      </g>
      
      {/* Credit score indicator arcs */}
      <path
        d="M8 20 A12 12 0 0 1 32 20"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2"
        fill="none"
        strokeDasharray="2 2"
      />
      <path
        d="M10 24 A8 8 0 0 1 30 24"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="1 2"
      />
      
      {/* Blockchain network dots */}
      <circle cx="32" cy="12" r="1.5" fill="#ffffff" opacity="0.8" className="dark:fill-purple-300" />
      <circle cx="32" cy="28" r="1.5" fill="#ffffff" opacity="0.8" className="dark:fill-purple-300" />
      <circle cx="8" cy="12" r="1.5" fill="#ffffff" opacity="0.8" className="dark:fill-purple-300" />
      <circle cx="8" cy="28" r="1.5" fill="#ffffff" opacity="0.8" className="dark:fill-purple-300" />
      
      <defs>
        {/* Enhanced gradient - more professional color scheme */}
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="30%" stopColor="#7c3aed" />
          <stop offset="70%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        
        {/* Border gradient */}
        <linearGradient id="logoBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>
      
      {/* Enhanced dark mode styles */}
      <style>{`
        .dark svg #logoGradient stop:first-child {
          stop-color: #312e81;
        }
        .dark svg #logoGradient stop:nth-child(2) {
          stop-color: #581c87;
        }
        .dark svg #logoGradient stop:nth-child(3) {
          stop-color: #0f172a;
        }
        .dark svg #logoGradient stop:last-child {
          stop-color: #1e293b;
        }
        .dark svg #logoBorder stop:first-child {
          stop-color: #818cf8;
        }
        .dark svg #logoBorder stop:nth-child(2) {
          stop-color: #a78bfa;
        }
        .dark svg #logoBorder stop:last-child {
          stop-color: #64748b;
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
        <span className={`font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-slate-700 dark:from-indigo-400 dark:via-purple-400 dark:to-slate-300 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          CrediSom
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
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-purple-600 via-blue-600 to-emerald-600 rounded-lg flex items-center justify-center font-bold text-white ${className}`}>
      CS
    </div>
  );
}