"use client";

import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingHero() {
  // Stagger animation for text elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-40 left-20 w-96 h-96 bg-slate-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-5xl mx-auto w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6"
          >
            Stop fighting about{" "}
            <span className="text-indigo-600">who owes what</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto"
          >
            Split expenses with confidence. Track shared costs instantly, settle
            up fairly, and keep friendships intact.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              href="/signup"
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition-all hover:shadow-lg hover:shadow-indigo-600/30 w-full sm:w-auto"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="flex items-center justify-center gap-2 px-8 py-4 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:border-slate-400 hover:bg-slate-50 transition-all w-full sm:w-auto">
              <Download className="w-5 h-5" />
              Download App
            </button>
          </motion.div>

          {/* Trust indicator */}
          <motion.p variants={itemVariants} className="text-sm text-slate-500">
            ✓ No credit card required • Works on Web & Mobile • Used by 50k+
            people
          </motion.p>

          {/* Visual placeholder - Dashboard mockup */}
          <motion.div variants={itemVariants} className="mt-20 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
              <div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-slate-400 font-semibold">
                  <Image
                    src="/dashboard.png"
                    alt="Dashboard Mockup"
                    // width={800}
                    // height={450}
                    className="object-cover"
                    fill
                  />
                </div>
              </div>
            </div>

            {/* Floating card accent */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-slate-200 hidden lg:block"
            >
              <p className="text-sm font-semibold text-slate-900">
                You paid ₹500
              </p>
              <p className="text-xs text-slate-500">Split between 4 people</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
