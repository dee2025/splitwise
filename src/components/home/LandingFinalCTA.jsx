"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export default function LandingFinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
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
    <section
      ref={ref}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center"
        >
          {/* Main headline */}
          <motion.h2
            variants={itemVariants}
            className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6 leading-tight"
          >
            Ready to split smartly?
          </motion.h2>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Join thousands of friends, roommates, and travelers who've stopped
            arguing about money. Start tracking expenses today.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
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

          {/* Trust indicators */}
          <motion.div
            variants={itemVariants}
            className="space-y-4 text-sm text-slate-600"
          >
            <p>✓ No credit card required to get started</p>
            <p>✓ Completely free. No hidden fees ever.</p>
            <p>✓ Used by over 50,000 people worldwide</p>
          </motion.div>

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="my-12 flex items-center gap-4"
          >
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-sm text-slate-500">
              or continue exploring
            </span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </motion.div>

          {/* Secondary info */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left"
          >
            <div>
              <p className="text-3xl font-bold text-slate-900">50k+</p>
              <p className="text-slate-600 text-sm">Active users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">₹10M+</p>
              <p className="text-slate-600 text-sm">Tracked annually</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">98%</p>
              <p className="text-slate-600 text-sm">Keep using it</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
