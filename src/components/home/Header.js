"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50"
    >
      {/* Logo */}
      <Link
        href="/"
        className="text-xl sm:text-2xl font-bold tracking-tight hover:scale-105 transition-transform"
      >
        Split
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Wise
        </span>
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden sm:flex items-center gap-4 md:gap-6">
        <Link
          href="/login"
          className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
        >
          Get Started
        </Link>
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 p-4 flex flex-col gap-3 sm:hidden"
        >
          <Link
            href="/login"
            className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2"
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold text-center"
            onClick={() => setIsOpen(false)}
          >
            Get Started
          </Link>
        </motion.nav>
      )}
    </motion.header>
  );
}
