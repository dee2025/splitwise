"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Users, Receipt, Shield, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-24 lg:py-32">
      {/* Left Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl mx-auto text-center mb-12 lg:mb-0"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 mb-6 sm:mb-8"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-700">Smart expense splitting made easy</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6"
        >
          <span className="block">Shared trips,</span>
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
          >
            Zero stress
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed mt-4 sm:mt-6 mb-6 sm:mb-8 max-w-2xl mx-auto"
        >
          Keep your friendships intact. Split expenses fairly, track who owes what, and settle up instantly—all in one beautiful app.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center w-full"
        >
          <Link 
            href="/signup"
            className="w-full sm:w-auto group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
          >
            <span>Start for Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link 
            href="/login"
            className="w-full sm:w-auto group flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 font-semibold"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Right Visual */}
      <HeroVisual />
    </section>
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative"
    >
      {/* Main Card Container */}
      <div className="relative w-[380px] h-[480px]">
        
        {/* Background Gradient Card */}
        <motion.div
          initial={{ rotate: -2 }}
          animate={{ rotate: 2 }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 shadow-2xl"
        />
        
        {/* Main White Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="absolute top-6 left-6 w-full h-full rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Card Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Goa Trip 2024</h3>
                <p className="text-sm text-gray-500">5 friends • ₹12,450 total</p>
              </div>
            </div>
          </div>

          {/* Expense List */}
          <div className="p-6 space-y-4">
            {[
              { name: "Beachside Dinner", amount: "₹2,800", person: "You", status: "paid" },
              { name: "Hotel Stay", amount: "₹6,000", person: "Amit", status: "pending" },
              { name: "Car Rental", amount: "₹3,650", person: "Priya", status: "settled" }
            ].map((expense, index) => (
              <motion.div
                key={expense.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{expense.name}</p>
                  <p className="text-sm text-gray-500">by {expense.person}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{expense.amount}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    expense.status === 'paid' 
                      ? 'bg-green-100 text-green-700'
                      : expense.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {expense.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white to-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Balance</span>
              <span className="font-bold text-lg text-gray-900">₹0.00</span>
            </div>
            <p className="text-xs text-green-600 mt-1">All settled up! 🎉</p>
          </div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute -top-4 -right-4 w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-2xl"
        >
          <Receipt className="w-8 h-8 text-white" />
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          className="absolute -bottom-6 -left-6 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-200 flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-700">Live updates</span>
        </motion.div>
      </div>
    </motion.div>
  );
}