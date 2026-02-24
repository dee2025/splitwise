"use client";

import { motion, useInView } from "framer-motion";
import { Apple, Download, Globe, Smartphone } from "lucide-react";
import { useRef } from "react";

export default function LandingAppAvailability() {
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
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-indigo-600 mb-3">
            AVAILABLE EVERYWHERE
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Access from any device, anytime
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Work on web, track on mobile. Seamless sync across all your devices.
          </p>
        </motion.div>

        {/* App availability cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Web App */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-8 rounded-xl border border-blue-200"
          >
            <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Web App</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Access Splitwise from any browser. Full features, responsive
              design, works perfectly on desktop and tablet.
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors text-sm">
              Open Web App
            </button>
          </motion.div>

          {/* iOS App */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-neutral-50 to-neutral-100/50 p-8 rounded-xl border border-neutral-200"
          >
            <div className="w-12 h-12 bg-neutral-200 rounded-lg flex items-center justify-center mb-4">
              <Apple className="w-6 h-6 text-neutral-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">iOS App</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Download on the App Store. Log expenses on the go, get
              notifications, sync instantly across devices.
            </p>
            <button className="w-full px-4 py-2 bg-neutral-800 text-white rounded-lg font-semibold hover:bg-neutral-700 transition-colors text-sm flex items-center justify-center gap-2">
              <Apple className="w-4 h-4" />
              App Store
            </button>
          </motion.div>

          {/* Android App */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-green-50 to-green-100/50 p-8 rounded-xl border border-green-200"
          >
            <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Android App
            </h3>
            <p className="text-slate-600 mb-6 text-sm">
              Get it on Google Play. Native app experience optimized for Android
              devices with full functionality.
            </p>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-500 transition-colors text-sm flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Play Store
            </button>
          </motion.div>
        </motion.div>

        {/* Features parity note */}
        <motion.p
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mt-12 text-slate-600 text-sm"
        >
          All features available across web and mobile. Changes sync instantly.
        </motion.p>
      </div>
    </section>
  );
}
