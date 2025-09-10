'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Rocket, 
  Star, 
  TrendingUp,
  Award,
  Shield,
  Zap
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const benefits = [
  { icon: TrendingUp, text: "Dynamic credit scoring" },
  { icon: Award, text: "Soulbound NFT identity" },
  { icon: Shield, text: "Bank-grade security" },
  { icon: Zap, text: "Real-time updates" }
];

export function CTASection() {
  const { isConnected } = useAccount();

  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/5 rounded-full animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white/5 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-10 right-10 w-12 h-12 bg-white/10 rounded-full animate-pulse animation-delay-3000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Launch Your DeFi Journey
          </motion.div>

          {/* Main Heading */}
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Ready to Build Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
              On-Chain Credit?
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Join the future of decentralized finance. Build your credit score, unlock better rates, 
            and establish your reputation across the entire DeFi ecosystem.
          </motion.p>

          {/* Benefits Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-4xl mx-auto"
          >
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-primary-100 bg-white/10 backdrop-blur-sm rounded-lg p-3"
              >
                <benefit.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12"
          >
            {isConnected ? (
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-4 bg-white text-primary-700 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-h-[44px] touch-manipulation"
                >
                  Open Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </motion.button>
              </Link>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1">
                <ConnectButton />
              </div>
            )}

            <Link href="/docs">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:border-white/50 hover:bg-white/10 transition-all duration-300 min-h-[44px] touch-manipulation"
              >
                Learn More
                <Star className="ml-2 w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              { number: "10,000+", label: "Users Building Credit" },
              { number: "$50M+", label: "Total Value Locked" },
              { number: "98.5%", label: "Network Uptime" }
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-primary-100 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-20 fill-current text-white dark:text-gray-900"
        >
          <path d="M0,60 C150,100 350,0 600,60 C850,120 950,20 1200,60 L1200,120 L0,120 Z"></path>
        </svg>
      </div>
    </section>
  );
}