"use client";

import { motion, useInView } from "framer-motion";
import { AlertCircle, Brain, DollarSign, MessageCircle } from "lucide-react";
import { useRef } from "react";

const problems = [
  {
    icon: Brain,
    title: "Mental Math Overload",
    description:
      "Trying to remember who paid for what, who owes whom, and the exact amounts gets confusing fast.",
  },
  {
    icon: MessageCircle,
    title: "Awkward Conversations",
    description:
      "Asking friends for money often leads to uncomfortable situations and misunderstandings.",
  },
  {
    icon: DollarSign,
    title: "Missed Expenses",
    description:
      "Forgot to add something? Now the math is wrong and someone might not get paid back correctly.",
  },
  {
    icon: AlertCircle,
    title: "Settlement Headaches",
    description:
      "When it's time to settle up, figuring out the fairest way to split payments becomes a puzzle.",
  },
];

export default function LandingProblem() {
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
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-indigo-600 mb-3">
            THE PROBLEM
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Splitting expenses shouldn't be stressful
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Whether it's a trip with friends, sharing rent, or group dinners,
            tracking shared expenses creates friction. Let's fix that.
          </p>
        </motion.div>

        {/* Problem cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {problems.map((problem, idx) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white p-8 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {problem.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {problem.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
