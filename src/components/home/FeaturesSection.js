"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Lock,
  Receipt,
  TrendingDown,
  Users,
  Zap,
} from "lucide-react";          

const features = [
  {
    title: "Smart Group Creation",
    desc: "Create trips in seconds. Add friends instantly and start tracking expenses together.",
    icon: Users,
    gradient: "from-blue-600 to-blue-400",
  },
  {
    title: "Auto Split Calculation",
    desc: "Let AI handle the math. Expenses auto-split equally or customize each share.",
    icon: TrendingDown,
    gradient: "from-purple-600 to-purple-400",
  },
  {
    title: "Instant Settlements",
    desc: "One-click settlement requests. See exactly who owes what, crystal clear.",
    icon: Receipt,
    gradient: "from-pink-600 to-pink-400",
  },
  {
    title: "Lightning Fast",
    desc: "Blazingly fast. Works offline. Syncs instantly when back online.",
    icon: Zap,
    gradient: "from-orange-600 to-orange-400",
  },
  {
    title: "Super Secure",
    desc: "Bank-level encryption. Your data and payments are always protected.",
    icon: Lock,
    gradient: "from-green-600 to-green-400",
  },
  {
    title: "Detailed Analytics",
    desc: "See trends, analyze spending, and understand group finances at a glance.",
    icon: BarChart3,
    gradient: "from-indigo-600 to-indigo-400",
  },
];

export default function FeaturesSection() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-16 sm:py-20 md:py-28 lg:py-32 bg-gradient-to-b from-white via-purple-50/10 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6"
          >
            <span className="block mb-2">Why choose</span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SplitWise
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Everything you need to manage shared expenses. Powerful, simple, and
            beautiful.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group relative p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
