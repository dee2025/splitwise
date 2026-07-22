"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  FileText,
  HandCoins,
  Shield,
  TrendingDown,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: Users,
    title: "Smart Groups",
    desc: "Create groups for trips, roommates, or events. Everyone added in seconds with a link.",
    accent: "text-sky-700",
    accentBg: "bg-sky-50 border-sky-100",
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
    desc: "Expenses split instantly, equally or custom. Zero mental math, ever.",
    accent: "text-violet-700",
    accentBg: "bg-violet-50 border-violet-100",
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
    accent: "text-emerald-700",
    accentBg: "bg-emerald-50 border-emerald-100",
    details: [
      "Real-time balance updates",
      "Visual balance charts",
      "Transaction history",
      "Detailed breakdowns",
    ],
  },
  {
    icon: FileText,
    title: "Expense History",
    desc: "Review every group expense, payer, participant, and split from one clear timeline.",
    accent: "text-indigo-700",
    accentBg: "bg-indigo-50 border-indigo-100",
    details: [
      "Date-wise activity timeline",
      "Expense detail views",
      "PDF activity reports",
      "Clear split records",
    ],
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Works smoothly on mobile and keeps expense creation focused.",
    accent: "text-amber-700",
    accentBg: "bg-amber-50 border-amber-100",
    details: [
      "Instant calculations",
      "Mobile-first screens",
      "Fast group switching",
      "Low-friction expense entry",
    ],
  },
  {
    icon: Shield,
    title: "Private & Secure",
    desc: "Your account and group records are handled with careful access controls.",
    accent: "text-rose-700",
    accentBg: "bg-rose-50 border-rose-100",
    details: [
      "Verified user accounts",
      "Private group data",
      "No data selling",
      "Clear deletion controls",
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
    desc: "Get notified when expenses are added to your groups.",
  },
];

const COMPARISON_ROWS = [
  { feature: "Instant Group Creation", money: true, others: false },
  { feature: "Auto-Split Calculation", money: true, others: true },
  { feature: "Invite Links", money: true, others: false },
  { feature: "Activity Timeline", money: true, others: false },
  { feature: "Detailed Split Records", money: true, others: true },
  { feature: "Account Deletion Controls", money: true, others: false },
];

export function FeaturesPageClient() {
  return (
    <>
      <section className="bg-slate-50 px-5 pb-16 pt-16 sm:px-8 sm:pb-20 lg:pt-20">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-5 flex items-center justify-center gap-2">
              <span className="h-px w-6 bg-indigo-300" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
                Powerful features
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Everything you need to split expenses clearly.
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              From simple bill splits to complex group trips, Money Split keeps shared expenses organized,
              searchable, and easy to settle.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
          >
            Core features
          </motion.h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06, duration: 0.45 }}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition-colors hover:border-indigo-200"
                >
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-lg border ${feature.accentBg}`}>
                    <Icon className={`h-6 w-6 ${feature.accent}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-950">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{feature.desc}</p>
                  <ul className="mt-5 space-y-2">
                    {feature.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className={`h-4 w-4 ${feature.accent}`} />
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

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
          >
            More tools for shared clarity
          </motion.h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {ADDITIONAL_FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06, duration: 0.45 }}
                  className="rounded-lg border border-slate-200 bg-white p-6"
                >
                  <Icon className="mb-4 h-7 w-7 text-indigo-700" />
                  <h3 className="text-lg font-bold text-slate-950">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Why choose Money Split?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Compare the core controls people need for reliable group expense tracking.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.08)]"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-indigo-700">Money Split</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-500">Basic tools</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.feature} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        <CheckCircle className="mx-auto h-5 w-5 text-emerald-600" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.others ? (
                          <CheckCircle className="mx-auto h-5 w-5 text-slate-400" />
                        ) : (
                          <span className="mx-auto block h-1 w-5 rounded-full bg-slate-300" />
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

      <section className="bg-slate-50 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Ready to split smarter?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Start using Money Split today and keep every shared expense clear from the first bill.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                Learn more
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
