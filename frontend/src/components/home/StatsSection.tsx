'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Award, Activity, Shield } from 'lucide-react';

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

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Active Users",
    description: "Building credit scores",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: DollarSign,
    value: "$50M+",
    label: "Total Value Locked",
    description: "Across all protocols",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Award,
    value: "25,000+",
    label: "Credit NFTs",
    description: "Minted and active",
    color: "from-purple-500 to-indigo-500"
  },
  {
    icon: TrendingUp,
    value: "98.5%",
    label: "Uptime",
    description: "Network reliability",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Activity,
    value: "15M+",
    label: "Transactions",
    description: "Processed successfully",
    color: "from-red-500 to-pink-500"
  },
  {
    icon: Shield,
    value: "100%",
    label: "Security Score",
    description: "Audit coverage",
    color: "from-teal-500 to-blue-500"
  }
];

export function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-800 dark:text-primary-200 text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4 mr-2" />
              Platform Statistics
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Trusted by the
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                DeFi Community
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join a growing ecosystem of users building their financial reputation on-chain 
              with Credisomnia's innovative credit scoring platform.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 transform-gpu"
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl mb-6 shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>

                {/* Stats Content */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.description}
                  </div>
                </div>

                {/* Progress bar effect */}
                <div className="mt-6 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full bg-gradient-to-r ${stat.color}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Info Cards */}
          <motion.div
            variants={itemVariants}
            className="mt-16 grid md:grid-cols-2 gap-8"
          >
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Growing Fast</h3>
              <p className="text-primary-100 mb-4">
                Our platform is experiencing exponential growth with new users joining daily 
                to build their DeFi credit scores.
              </p>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-primary-200">Daily signups</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-sm text-primary-200">User retention</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Network Effects
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                As more protocols integrate with Credisomnia, your credit score becomes 
                more valuable across the entire DeFi ecosystem.
              </p>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">25+</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Protocol partners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Chain integrations</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}