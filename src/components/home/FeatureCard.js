"use client";

import { motion } from "framer-motion";

export default function FeatureCard({ title, desc, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="p-6 rounded-xl border-2 border-black bg-white shadow-sketch hover:shadow-sketch-lg transition-all"
    >
      <div className="text-4xl mb-4 border-2 border-dotted border-gray-400 w-16 h-16 flex items-center justify-center rounded-full">
        {icon}
      </div>
      <h4 className="text-xl font-semibold border-b border-dashed border-gray-400 pb-2">
        {title}
      </h4>
      <p className="text-gray-600 mt-4 text-sm leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
}