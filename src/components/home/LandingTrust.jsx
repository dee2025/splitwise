"use client";

import { motion, useInView } from "framer-motion";
import { Calculator, Eye, Shield, Zap } from "lucide-react";
import { useRef } from "react";

const trustPoints = [
  {
    icon: Calculator,
    title: "Mathematically Accurate",
    description:
      "Every calculation is verified. Fair splits handled correctly every time. No rounding errors, no confusion.",
  },
  {
    icon: Shield,
    title: "Your Data is Safe",
    description:
      "End-to-end encryption protects your information. We never share or sell your data to anyone.",
  },
  {
    icon: Zap,
    title: "No Hidden Charges",
    description:
      "Completely free to use. No surprise fees, no premium tiers for basic features. Ever.",
  },
  {
    icon: Eye,
    title: "Designed for Clarity",
    description:
      "Every number is transparent. You see exactly what you paid, what you owe, and why.",
  },
];

export default function LandingTrust() {
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
          <p className="text-sm font-semibold text-indigo-600 mb-3">
            WHAT TO TRUST
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Built on trust and transparency
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            With money involved, accuracy and honesty matter. We take both
            seriously.
          </p>
        </motion.div>

        {/* Trust points grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {trustPoints.map((point, idx) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white p-8 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {point.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {point.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional trust indicators */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-100 rounded-xl p-8 text-center"
        >
          <p className="text-slate-700 text-lg mb-6">
            Used by over 50,000 people worldwide to manage shared expenses
            responsibly
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <span>Regular Audits</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
