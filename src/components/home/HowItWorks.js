"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Plus, Users } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create Your Trip",
    description:
      "Start a group for your trip with a few clicks. Invite friends via link or email—they're instantly in.",
    icon: Users,
    color: "from-blue-600 to-blue-400",
  },
  {
    number: "02",
    title: "Add Expenses",
    description:
      "Record who paid for what. Select who participated. Our smart algorithm handles all the math instantly.",
    icon: Plus,
    color: "from-purple-600 to-purple-400",
  },
  {
    number: "03",
    title: "Settle & Done",
    description:
      "See the settlement summary. Pay with UPI, bank transfer, or cash. One click and you're square with everyone.",
    icon: CheckCircle,
    color: "from-green-600 to-green-400",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-16 sm:py-20 md:py-28 lg:py-32 bg-gradient-to-b from-blue-50/30 via-white to-purple-50/20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to manage shared expenses like a pro. Ready?
              Let's go.
            </p>
          </motion.div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Step Card */}
                <div className="h-full p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
                  {/* Step Number */}
                  <div
                    className={`absolute -top-3 -right-3 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r ${step.color} text-white font-bold text-lg sm:text-xl flex items-center justify-center shadow-lg`}
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-4 sm:mb-6`}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-blue-300" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Feature Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: true }}
          className="p-6 sm:p-8 md:p-10 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                Ready to split smarter?
              </h3>
              <p className="text-blue-100">
                Join thousands of travelers and groups already using SplitWise.
              </p>
            </div>
            <a
              href="/signup"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-1 whitespace-nowrap"
            >
              Start Free →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
