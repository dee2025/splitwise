"use client";

import { motion, useInView } from "framer-motion";
import {
  Award,
  Lock,
  Smartphone,
  TrendingDown,
  Users,
  Zap,
} from "lucide-react";
import { useRef } from "react";

const features = [
  {
    icon: Users,
    title: "Group Expenses",
    description:
      "Create unlimited groups for different scenarios. Each group keeps expenses organized and separate.",
  },
  {
    icon: TrendingDown,
    title: "Fair Bill Splitting",
    description:
      "Automatic calculation ensures everyone pays exactly their fair share, with customizable split options.",
  },
  {
    icon: Zap,
    title: "Real-Time Balances",
    description:
      "See who owes whom instantly. No more confusion. Balances update automatically with every expense.",
  },
  {
    icon: Award,
    title: "Simple Settlements",
    description:
      "Get suggested settlement plans. Pay with minimal transactions. Everyone knows exactly what to do.",
  },
  {
    icon: Smartphone,
    title: "Web & Mobile Apps",
    description:
      "Seamless experience across devices. Add expenses on the go, settle on web. Works for everyone.",
  },
  {
    icon: Lock,
    title: "Privacy & Security",
    description:
      "Your data is encrypted. We never share information. Clear pricing with no hidden charges.",
  },
];

export default function LandingFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-indigo-600 mb-3">FEATURES</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Everything you need to manage shared expenses
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Built for clarity, designed for simplicity.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white p-8 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
