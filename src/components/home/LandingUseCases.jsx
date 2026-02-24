"use client";

import { motion, useInView } from "framer-motion";
import { Gift, Home, Plane, Users } from "lucide-react";
import { useRef } from "react";

const useCases = [
  {
    icon: Plane,
    title: "Group Trips",
    subtitle: "Vacations & Travel",
    description:
      "One person books the Airbnb, another pays for food, someone else handles transport. Automatically tracks who paid what and who owes whom. No more post-trip arguments.",
    highlights: ["Hotels", "Food", "Activities", "Transport"],
  },
  {
    icon: Home,
    title: "Flat or Rent Sharing",
    subtitle: "Roommates & Shared Living",
    description:
      "Rent, utilities, shared groceries—everything goes into one place. Monthly settlements become straightforward. Everyone knows their balance.",
    highlights: ["Rent", "Utilities", "Groceries", "Maintenance"],
  },
  {
    icon: Users,
    title: "Friend Groups",
    subtitle: "Dinners & Hangouts",
    description:
      "No one likes having money conversations with friends. Log who paid for meals, movies, or happy hour. Settle up fairly without awkwardness.",
    highlights: ["Meals", "Movies", "Events", "Drinks"],
  },
  {
    icon: Gift,
    title: "Events & Celebrations",
    subtitle: "Group Activities",
    description:
      "Organizing a birthday celebration, wedding, or event? Track expenses from everyone, split costs fairly, and settle without the hassle.",
    highlights: ["Decorations", "Gifts", "Catering", "Rentals"],
  },
];

export default function LandingUseCases() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05,
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
            USE CASES
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Works for any shared expense scenario
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Whether planned or spontaneous, group or recurring—Splitwise handles
            it all.
          </p>
        </motion.div>

        {/* Use case cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {useCases.map((useCase, idx) => {
            const Icon = useCase.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-8 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {useCase.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500">
                      {useCase.subtitle}
                    </p>
                  </div>
                </div>

                <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                  {useCase.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {useCase.highlights.map((highlight, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
