"use client";

import { motion, useInView } from "framer-motion";
import { BarChart3, CheckCircle2, Plus, Users } from "lucide-react";
import { useRef } from "react";

const steps = [
  {
    number: 1,
    icon: Plus,
    title: "Create a Group",
    description:
      "Start by creating a group for your expense category—a trip, flat, event, or anything.",
  },
  {
    number: 2,
    icon: Users,
    title: "Add Members",
    description:
      "Invite friends or roommates. Everyone gets added to track expenses transparently.",
  },
  {
    number: 3,
    icon: BarChart3,
    title: "Log Expenses",
    description:
      "When someone pays for something, log it. The app calculates fair splits automatically.",
  },
  {
    number: 4,
    icon: CheckCircle2,
    title: "Settle Up",
    description:
      "See who owes whom, settle with minimal transactions, and move on with your life.",
  },
];

export default function LandingSolution() {
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
            THE SOLUTION
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Simple. Fair. Automatic.
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A straightforward way to track shared expenses and settle debts
            fairly, without the stress.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="relative"
              >
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-1 bg-gradient-to-r from-indigo-200 to-indigo-100"></div>
                )}

                <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-8 rounded-xl border border-indigo-100 relative z-10">
                  {/* Step number background */}
                  <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center mb-4">
                    <span className="text-sm font-bold text-indigo-700">
                      {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
