'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Shield, Award } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export function HeroSection() {
  const { isConnected } = useAccount();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Improved gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-yellow-50/50 dark:from-blue-900/20 dark:to-yellow-900/20"></div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary-300 to-secondary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-primary-400/30 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute bottom-32 right-32 w-12 h-12 bg-secondary-400/30 rounded-full animate-float animation-delay-3000"></div>
        <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-float animation-delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-800 dark:text-primary-200 text-sm font-medium mb-6"
          >
            <Award className="w-4 h-4 mr-2" />
            Revolutionary Credit Scoring on Somnia
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            Your DeFi
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"> Credit Score</span>
            <br />
            Lives On-Chain
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Build your decentralized credit history with soulbound NFTs. 
            Earn better rates, access premium DeFi services, and prove your reputation across protocols.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-12"
          >
            {[
              { icon: TrendingUp, value: "Dynamic", label: "Credit Scoring" },
              { icon: Shield, value: "Soulbound", label: "NFT Identity" },
              { icon: Award, value: "Real-time", label: "Rate Updates" }
            ].map((stat, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full">
                  <stat.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            {isConnected ? (
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-glow-lg transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-secondary-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center">
                    Open Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </span>
                </motion.button>
              </Link>
            ) : (
              <div className="transform hover:scale-105 transition-transform duration-300">
                <ConnectButton />
              </div>
            )}

            <Link href="/docs">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 transform hover:-translate-y-1"
              >
                Learn More
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating elements */}
        <div className="absolute top-1/4 left-10 w-4 h-4 bg-primary-400 rounded-full animate-bounce animation-delay-1000 opacity-60"></div>
        <div className="absolute top-1/3 right-10 w-6 h-6 bg-secondary-400 rounded-full animate-bounce animation-delay-2000 opacity-60"></div>
        <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-primary-300 rounded-full animate-bounce animation-delay-3000 opacity-60"></div>
      </div>
    </section>
  );
}