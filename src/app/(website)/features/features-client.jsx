"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  CheckCircle,
  HandCoins,
  Shield,
  TrendingDown,
  Users,
  Zap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: Users,
    title: "Smart Groups",
    desc: "Create groups for trips, roommates, or events. Everyone added in seconds with a link.",
    accent: "text-sky-400",
    accentBg: "bg-sky-500/10",
    details: [
      "Instant group creation",
      "Shareable invite links",
      "Real-time member updates",
      "Flexible group management",
    ],
  },
  {
    icon: TrendingDown,
    title: "Auto-Split",
    desc: "Expenses split instantly — equally or custom. Zero mental math, ever.",
    accent: "text-violet-400",
    accentBg: "bg-violet-500/10",
    details: [
      "Equal split calculation",
      "Custom split ratios",
      "Percentage-based splits",
      "Automatic recalculation",
    ],
  },
  {
    icon: BarChart3,
    title: "Balance Tracking",
    desc: "Always know who owes who. Balances update live with every new expense.",
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    details: [
      "Real-time balance updates",
      "Visual balance charts",
      "Transaction history",
      "Detailed breakdowns",
    ],
  },
  {
    icon: CheckCircle,
    title: "One-click Settle",
    desc: "Optimal settlement plans with minimum transactions. Everyone pays their fair share.",
    accent: "text-indigo-400",
    accentBg: "bg-indigo-500/10",
    details: [
      "Smart settlement algorithm",
      "Minimum transaction paths",
      "Payment recommendations",
      "Settlement verification",
    ],
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Works offline. Syncs the moment you're back. Blazing speed always.",
    accent: "text-amber-400",
    accentBg: "bg-amber-500/10",
    details: [
      "Instant calculations",
      "Offline functionality",
      "Auto-sync capability",
      "Zero lag experience",
    ],
  },
  {
    icon: Shield,
    title: "Private & Secure",
    desc: "Your data is encrypted and never shared. Clear pricing, no hidden fees.",
    accent: "text-rose-400",
    accentBg: "bg-rose-500/10",
    details: [
      "End-to-end encryption",
      "Private data storage",
      "No data selling",
      "Transparent pricing",
    ],
  },
];

const ADDITIONAL_FEATURES = [
  {
    icon: HandCoins,
    title: "Activity Tracking",
    desc: "See complete history of who added what expense and when it happened.",
  },
  {
    icon: Users,
    title: "Member Management",
    desc: "Add, remove, and manage group members with ease and flexibility.",
  },
  {
    icon: CheckCircle,
    title: "Expense Notifications",
    desc: "Get notified instantly when expenses are added to your groups.",
  },
];

export function FeaturesPageClient() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-4 h-px bg-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.25em]">
                Powerful Features
              </span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-tight mb-6">
              Everything you need to<br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                split expenses
              </span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto mb-10">
              From simple bill splits to complex group trips, Money Split has all the tools you need to manage shared expenses effortlessly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-center mb-16"
          >
            Core Features
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group relative bg-slate-800/50 backdrop-blur-sm border border-white/6 rounded-2xl p-8 hover:border-white/20 hover:bg-slate-800/80 transition-all duration-300"
                >
                  {/* Background Icon */}
                  <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Icon className="w-24 h-24" />
                  </div>

                  {/* Icon Badge */}
                  <div className={`w-14 h-14 ${feature.accentBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${feature.accent}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-slate-100 mb-3 group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed mb-6 group-hover:text-slate-300 transition-colors">
                    {feature.desc}
                  </p>

                  {/* Feature Details */}
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-400">
                        <CheckCircle className={`w-4 h-4 ${feature.accent}`} />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-5 sm:px-8 border-t border-white/6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-center mb-16"
          >
            More Features
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ADDITIONAL_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 rounded-xl p-6 hover:border-indigo-500/30 transition-all group"
                >
                  <Icon className="w-8 h-8 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold text-slate-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-5 sm:px-8 border-t border-white/6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Why Choose Money Split?</h2>
            <p className="text-lg text-slate-400">Compare features and see why we're the smart choice for expense splitting.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-slate-800/50 backdrop-blur border border-white/6 rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/6">
                    <th className="text-left px-6 py-4 font-semibold text-slate-300">Feature</th>
                    <th className="text-center px-6 py-4 font-semibold text-indigo-400">Money Split</th>
                    <th className="text-center px-6 py-4 font-semibold text-slate-400">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Instant Group Creation", money: true, others: false },
                    { feature: "Auto-Split Calculation", money: true, others: true },
                    { feature: "Offline Support", money: true, others: false },
                    { feature: "Receipt Scanning", money: true, others: false },
                    { feature: "Advanced Analytics", money: true, others: false },
                    { feature: "Bank-Level Security", money: true, others: true },
                    { feature: "Multi-Currency Support", money: true, others: false },
                    { feature: "24/7 Support", money: true, others: false },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/6 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-slate-300">{row.feature}</td>
                      <td className="text-center px-6 py-4">
                        {row.money ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : (
                          <div className="w-5 h-5 mx-auto" />
                        )}
                      </td>
                      <td className="text-center px-6 py-4">
                        {row.others ? (
                          <CheckCircle className="w-5 h-5 text-slate-500 mx-auto" />
                        ) : (
                          <div className="w-1 h-6 bg-slate-700 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-5 sm:px-8 border-t border-white/6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to split smarter?
            </h2>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed">
              Start using Money Split today and experience the easiest way to split expenses with friends, roommates, or travel groups.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-950/60"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 px-8 py-4 border border-white/10 text-slate-300 rounded-xl font-semibold hover:bg-white/5 transition-all"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}