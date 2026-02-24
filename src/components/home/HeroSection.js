"use client";

import { motion } from "framer-motion";
import { ArrowRight, Receipt, Sparkles, Users } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white via-blue-50/20 to-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col justify-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 mb-6 w-fit"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              The smarter way to split expenses
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-4 sm:mb-6"
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
            className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-md"
          >
            Keep your friendships intact. Split expenses fairly, track who owes
            what, and settle up instantly—all in one beautiful app.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto"
          >
            <Link
              href="/signup"
              className="group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 font-semibold"
            >
              <span>Start for Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/login"
              className="group flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 font-semibold"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-10 sm:mt-12 pt-10 sm:pt-12 border-t border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">10K+ Users</p>
                <p className="text-xs text-gray-500">Trusted worldwide</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">₹1M+</p>
                <p className="text-xs text-gray-500">Settled annually</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Interactive Card Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="hidden lg:flex justify-center items-center"
        >
          <div className="relative w-full max-w-sm">
            {/* Background Card */}
            <motion.div
              animate={{ rotate: -2 }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-200 to-purple-200 shadow-2xl"
            />

            {/* Main Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="relative rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold">GT</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                      Goa Getaway
                    </h3>
                    <p className="text-xs text-gray-500">
                      4 friends • ₹9,200 total
                    </p>
                  </div>
                </div>
              </div>

              {/* Expense List */}
              <div className="p-4 sm:p-6 space-y-3">
                {[
                  { name: "Villa Booking", amount: "₹4,500", person: "You" },
                  { name: "Groceries", amount: "₹2,800", person: "Sarah" },
                  { name: "Activities", amount: "₹1,900", person: "Amit" },
                ].map((expense, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/30 hover:from-blue-50 hover:to-purple-50/30 transition-all"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        By {expense.person}
                      </p>
                      <p className="text-xs text-gray-500">{expense.name}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {expense.amount}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-6 bg-gradient-to-t from-blue-50/50 to-white border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">
                    You are owed
                  </span>
                  <span className="font-bold text-lg text-green-600">
                    ₹2,300
                  </span>
                </div>
                <p className="text-xs text-blue-600 font-medium">
                  ✓ All settled up!
                </p>
              </div>
            </motion.div>

            {/* Floating Badges */}
            <motion.div
              animate={{ y: [-10, 10], rotate: [0, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -bottom-8 -left-8 w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center text-white font-bold text-2xl"
            >
              ✓
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
