"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { ArrowRight, Receipt } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ICONS = {
  food: "🍕",
  travel: "✈️",
  entertainment: "🎬",
  shopping: "🛍️",
  accommodation: "🏠",
  other: "📋",
};

const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(n);

const fmtDate = (d) => {
  const date = new Date(d);
  const diffDays = Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export default function RecentExpenses({ compact = false }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const limit = compact ? 6 : 10;

  useEffect(() => {
    axios
      .get("/api/expenses")
      .then((res) => setExpenses(res.data.expenses || []))
      .catch(() => toast.error("Failed to load expenses"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="bg-slate-800 rounded-2xl border border-white/6 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-bold text-slate-100 tracking-tight">
            Activity
          </h2>
          {!loading && expenses.length > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/8 text-slate-400">
              {expenses.length}
            </span>
          )}
        </div>
        <Link
          href="/dashboard/expenses"
          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors"
        >
          See all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="h-px bg-white/6 mx-5" />

      {/* Loading skeleton */}
      {loading && (
        <div className="p-5 space-y-4">
          {[1, 2, 3].map((x) => (
            <div key={x} className="flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 bg-white/5 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-white/5 rounded-full w-28" />
                <div className="h-2.5 bg-white/4 rounded-full w-16" />
              </div>
              <div className="h-4 bg-white/5 rounded-full w-14" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && expenses.length === 0 && (
        <div className="py-14 px-5 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
            <Receipt className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-sm font-semibold text-slate-200 mb-1">
            No activity yet
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Add an expense to get started
          </p>
        </div>
      )}

      {/* Rows */}
      {!loading && expenses.length > 0 && (
        <div>
          {expenses.slice(0, limit).map((exp, i) => {
            const icon = ICONS[exp.category] ?? ICONS.other;
            const payer =
              exp.paidBy?.fullName?.split(" ")[0] ??
              exp.paidBy?.username ??
              null;

            return (
              <motion.button
                key={exp._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => router.push("/dashboard/expenses")}
                className="w-full flex items-center gap-3.5 px-5 py-3 hover:bg-white/4 transition-colors text-left group"
              >
                <div className="w-9 h-9 bg-white/6 group-hover:bg-white/10 rounded-xl flex items-center justify-center text-sm shrink-0 transition-colors">
                  {icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate leading-tight group-hover:text-slate-100 transition-colors">
                    {exp.description}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {fmtDate(exp.date)}
                    {payer ? ` · ${payer}` : ""}
                  </p>
                </div>

                <p className="text-sm font-bold text-slate-200 shrink-0">
                  {fmtINR(exp.amount)}
                </p>
              </motion.button>
            );
          })}

          {expenses.length > limit && (
            <div className="px-5 py-3.5 border-t border-white/6">
              <Link
                href="/dashboard/expenses"
                className="text-xs font-semibold text-slate-500 hover:text-indigo-400 transition-colors"
              >
                +{expenses.length - limit} more expenses
              </Link>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
