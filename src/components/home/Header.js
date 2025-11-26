"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Header() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full px-8 py-5 flex items-center justify-between border-b-2 border-gray-400 border-dashed"
    >
      <Link href="/" className="text-2xl font-bold tracking-tight hover:scale-105 transition-transform">
        Split<span className="text-gray-600">Wise</span>
      </Link>
      
      <nav className="flex items-center gap-6">
        <Link 
          href="/login" 
          className="text-gray-700 hover:text-black border-b border-dotted border-gray-400 pb-1 transition-colors"
        >
          Login
        </Link>
        <Link 
          href="/signup" 
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition border-2 border-black shadow-sketch"
        >
          Create Account
        </Link>
      </nav>
    </motion.header>
  );
}