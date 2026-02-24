"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function StatsCards() {
  const [data, setData] = useState({ total: 0, count: 0, groups: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/expenses").catch(() => ({ data: { expenses: [] } })),
      axios.get("/api/groups").catch(() => ({ data: { groups: [] } })),
    ]).then(([expRes, grpRes]) => {
      const expenses = expRes.data.expenses || [];
      setData({
        total: expenses.reduce((s, e) => s + (e.amount || 0), 0),
        count: expenses.length,
        groups: (grpRes.data.groups || []).length,
      });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-3">

      {/* ── Hero balance card ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative bg-slate-800 rounded-2xl p-5 sm:p-6 overflow-hidden border border-white/6"
      >
        {/* Glow orbs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-8 w-36 h-36 bg-violet-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-[0.18em] mb-3">
            Net Balance
          </p>

          {loading ? (
            <div className="h-11 w-36 bg-slate-700/60 rounded-xl animate-pulse mb-5" />
          ) : (
            <p className="text-slate-100 text-4xl sm:text-5xl font-bold tracking-tight mb-5">
              ₹0
            </p>
          )}

          <div className="h-px bg-white/6 mb-4" />

          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider mb-1">
                You owe
              </p>
              {loading ? (
                <div className="h-5 w-12 bg-slate-700/60 rounded animate-pulse" />
              ) : (
                <p className="text-slate-100 text-base font-bold">₹0</p>
              )}
            </div>

            <div className="h-8 w-px bg-white/8" />

            <div>
              <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                Owed to you
              </p>
              {loading ? (
                <div className="h-5 w-12 bg-slate-700/60 rounded animate-pulse" />
              ) : (
                <p className="text-slate-100 text-base font-bold">₹0</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Mini stat chips ── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Total Recorded",
            value: fmtINR(data.total),
            sub: `${data.count} transaction${data.count !== 1 ? "s" : ""}`,
            delay: 0.15,
          },
          {
            label: "Active Groups",
            value: String(data.groups),
            sub: "Currently splitting",
            delay: 0.22,
          },
        ].map(({ label, value, sub, delay }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-slate-800 rounded-xl border border-white/6 px-4 py-3.5"
          >
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {label}
            </p>
            {loading ? (
              <div className="h-6 w-20 bg-slate-700/60 rounded animate-pulse mb-1" />
            ) : (
              <p className="text-xl font-bold text-slate-100 leading-none">
                {value}
              </p>
            )}
            <p className="text-[11px] text-slate-500 mt-1.5">{sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
