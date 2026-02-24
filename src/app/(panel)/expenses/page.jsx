"use client";

import DashboardLayout from "@/components/DashboardLayout";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  BedDouble,
  Calendar,
  Music,
  Plane,
  Receipt,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

// ─── Category config ───────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  food: {
    icon: UtensilsCrossed,
    bgColor: "bg-orange-500/10",
    iconColor: "text-orange-400",
    badgeBg: "bg-orange-500/15",
    badgeText: "text-orange-400",
    label: "Food & Dining",
  },
  travel: {
    icon: Plane,
    bgColor: "bg-sky-500/10",
    iconColor: "text-sky-400",
    badgeBg: "bg-sky-500/15",
    badgeText: "text-sky-400",
    label: "Travel",
  },
  accommodation: {
    icon: BedDouble,
    bgColor: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
    badgeBg: "bg-indigo-500/15",
    badgeText: "text-indigo-400",
    label: "Accommodation",
  },
  shopping: {
    icon: ShoppingBag,
    bgColor: "bg-pink-500/10",
    iconColor: "text-pink-400",
    badgeBg: "bg-pink-500/15",
    badgeText: "text-pink-400",
    label: "Shopping",
  },
  entertainment: {
    icon: Music,
    bgColor: "bg-violet-500/10",
    iconColor: "text-violet-400",
    badgeBg: "bg-violet-500/15",
    badgeText: "text-violet-400",
    label: "Entertainment",
  },
  other: {
    icon: Receipt,
    bgColor: "bg-white/6",
    iconColor: "text-slate-400",
    badgeBg: "bg-white/6",
    badgeText: "text-slate-400",
    label: "Other",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getCurrencySymbol(currency) {
  return { INR: "₹", USD: "$", EUR: "€", GBP: "£" }[currency] ?? "₹";
}

function getUserShare(expense, userId) {
  const split = expense.splitBetween?.find(
    (s) => s.userId?.toString() === userId,
  );
  const isPayer = expense.paidBy?._id?.toString() === userId;

  if (!split) {
    return { type: "unknown", amount: 0, settled: true };
  }

  if (isPayer) {
    return { type: "paid", amount: split.amount, settled: split.settled };
  }

  if (split.settled) {
    return { type: "settled", amount: split.amount, settled: true };
  }

  return { type: "owes", amount: split.amount, settled: false };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-slate-800 rounded-xl border border-white/6 p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-700 rounded w-3/5" />
          <div className="h-3 bg-slate-700/60 rounded w-2/5" />
        </div>
        <div className="space-y-1 text-right shrink-0">
          <div className="h-4 bg-slate-700 rounded w-16" />
          <div className="h-3 bg-slate-700/60 rounded w-12 ml-auto" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-3 bg-slate-700/60 rounded w-24" />
        <div className="h-5 bg-slate-700/60 rounded w-14" />
        <div className="h-5 bg-slate-700/60 rounded w-14" />
        <div className="ml-auto h-6 bg-slate-700 rounded w-20" />
      </div>
    </div>
  );
}

function PersonalShareBadge({ share, currencySymbol }) {
  if (share.type === "paid") {
    return (
      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 shrink-0">
        you paid
      </span>
    );
  }
  if (share.type === "settled") {
    return (
      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
        settled
      </span>
    );
  }
  if (share.type === "owes") {
    return (
      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0">
        you owe {currencySymbol}
        {share.amount.toFixed(2)}
      </span>
    );
  }
  return null;
}

function ExpenseCard({ expense, userId }) {
  const share = getUserShare(expense, userId);
  const cat = CATEGORY_CONFIG[expense.category] ?? CATEGORY_CONFIG.other;
  const CatIcon = cat.icon;
  const sym = getCurrencySymbol(expense.groupId?.currency);
  const isPayer = expense.paidBy?._id?.toString() === userId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-slate-800 rounded-xl border border-white/6 hover:border-white/12 transition-all duration-200 overflow-hidden group"
    >
      {/* Main row */}
      <div className="p-4 flex items-start gap-4">
        {/* Category icon */}
        <div
          className={`w-11 h-11 rounded-xl ${cat.bgColor} flex items-center justify-center shrink-0`}
        >
          <CatIcon className={`w-5 h-5 ${cat.iconColor}`} />
        </div>

        {/* Middle content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h4 className="font-semibold text-slate-100 text-sm">
              {expense.description}
            </h4>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cat.badgeBg} ${cat.badgeText}`}
            >
              {cat.label}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
            <span className="px-2 py-1 bg-white/6 text-slate-400 rounded-lg font-medium">
              {expense.groupId?.name ?? "Unknown Group"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(expense.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        </div>

        {/* Amount and Status */}
        <div className="text-right shrink-0">
          <p className="text-base font-bold text-slate-100 mb-1.5">
            {sym}
            {expense.amount.toLocaleString("en-IN")}
          </p>
          <PersonalShareBadge share={share} currencySymbol={sym} />
        </div>
      </div>

      {/* Footer row */}
      <div className="px-4 py-2.5 bg-white/3 border-t border-white/6 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          Paid by{" "}
          <span className="font-semibold text-slate-300">
            {isPayer ? "you" : (expense.paidBy?.fullName ?? "Unknown")}
          </span>
        </span>
        <span className="text-slate-500">
          Split between {expense.splitBetween?.length ?? 0}{" "}
          {(expense.splitBetween?.length ?? 0) === 1 ? "person" : "people"}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ExpensesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchExpenses();
  }, [isAuthenticated]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/expenses");
      setExpenses(res.data.expenses ?? []);
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    let totalOwed = 0;
    let totalOwedToUser = 0;

    expenses.forEach((exp) => {
      const isPayer = exp.paidBy?._id?.toString() === user.id;
      if (isPayer) {
        (exp.splitBetween ?? []).forEach((s) => {
          if (s.userId?.toString() !== user.id && !s.settled) {
            totalOwedToUser += s.amount ?? 0;
          }
        });
      } else {
        const mine = (exp.splitBetween ?? []).find(
          (s) => s.userId?.toString() === user.id,
        );
        if (mine && !mine.settled) totalOwed += mine.amount ?? 0;
      }
    });

    return {
      totalCount: expenses.length,
      totalOwed: Math.round(totalOwed * 100) / 100,
      totalOwedToUser: Math.round(totalOwedToUser * 100) / 100,
    };
  }, [expenses, user.id]);

  const uniqueGroups = useMemo(() => {
    const seen = new Set();
    const groups = [];
    expenses.forEach((exp) => {
      const gid = exp.groupId?._id;
      if (gid && !seen.has(gid)) {
        seen.add(gid);
        groups.push({ id: gid, name: exp.groupId.name });
      }
    });
    return groups;
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      if (searchQuery.trim()) {
        if (!exp.description?.toLowerCase().includes(searchQuery.toLowerCase()))
          return false;
      }
      if (categoryFilter !== "all" && exp.category !== categoryFilter)
        return false;
      if (groupFilter !== "all" && exp.groupId?._id !== groupFilter)
        return false;
      if (statusFilter !== "all") {
        const mine = (exp.splitBetween ?? []).find(
          (s) => s.userId?.toString() === user.id,
        );
        if (statusFilter === "settled" && !mine?.settled && !exp.isSettled)
          return false;
        if (statusFilter === "unsettled" && (mine?.settled || exp.isSettled))
          return false;
      }
      return true;
    });
  }, [
    expenses,
    searchQuery,
    categoryFilter,
    groupFilter,
    statusFilter,
    user.id,
  ]);

  const isFiltered =
    searchQuery.trim() ||
    categoryFilter !== "all" ||
    groupFilter !== "all" ||
    statusFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setGroupFilter("all");
    setStatusFilter("all");
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-1">
            All Expenses
          </h1>
          <p className="text-slate-400 text-sm">
            Track and manage all your expenses across groups
          </p>
        </div>

        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: "Total Expenses",
                value: stats.totalCount,
                icon: Receipt,
                color: "text-indigo-400",
                iconBg: "bg-indigo-500/10",
              },
              {
                label: "You Owe",
                value: `₹${stats.totalOwed.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
                icon: TrendingDown,
                color: "text-rose-400",
                iconBg: "bg-rose-500/10",
              },
              {
                label: "You'll Receive",
                value: `₹${stats.totalOwedToUser.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
                icon: TrendingUp,
                color: "text-emerald-400",
                iconBg: "bg-emerald-500/10",
              },
            ].map(({ label, value, icon: Icon, color, iconBg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-slate-800 rounded-xl p-4 border border-white/6 flex items-center justify-between"
              >
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    {label}
                  </p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${iconBg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Filters Section */}
        {!loading && expenses.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800 rounded-xl border border-white/6 p-4 space-y-3.5"
          >
            {/* Search + Category + Group */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search expenses..."
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-700/50 border border-white/8 text-slate-100 placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
                  </button>
                )}
              </div>

              {/* Category */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-700/50 border border-white/8 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="all" className="bg-slate-800">
                  All Categories
                </option>
                <option value="food" className="bg-slate-800">
                  Food & Dining
                </option>
                <option value="travel" className="bg-slate-800">
                  Travel
                </option>
                <option value="accommodation" className="bg-slate-800">
                  Accommodation
                </option>
                <option value="shopping" className="bg-slate-800">
                  Shopping
                </option>
                <option value="entertainment" className="bg-slate-800">
                  Entertainment
                </option>
                <option value="other" className="bg-slate-800">
                  Other
                </option>
              </select>

              {/* Group */}
              {uniqueGroups.length > 1 && (
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="px-4 py-2.5 bg-slate-700/50 border border-white/8 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                >
                  <option value="all" className="bg-slate-800">
                    All Groups
                  </option>
                  {uniqueGroups.map((g) => (
                    <option key={g.id} value={g.id} className="bg-slate-800">
                      {g.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex gap-2 flex-wrap">
              {["all", "unsettled", "settled"].map((s) => (
                <motion.button
                  key={s}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3.5 py-1.5 rounded-lg border transition-all text-xs font-semibold ${
                    statusFilter === s
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white/5 text-slate-400 border-white/8 hover:bg-white/8"
                  }`}
                >
                  {s === "all"
                    ? "All"
                    : s === "unsettled"
                      ? "Unsettled"
                      : "Settled"}
                </motion.button>
              ))}
            </div>

            {/* Filter info and clear button */}
            {isFiltered && (
              <div className="flex items-center justify-between pt-2 border-t border-white/6">
                <p className="text-xs text-slate-400">
                  Showing{" "}
                  <span className="font-semibold text-slate-300">
                    {filteredExpenses.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-300">
                    {expenses.length}
                  </span>{" "}
                  expenses
                </p>
                <button
                  onClick={clearFilters}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Content Section */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-slate-800 rounded-2xl border border-white/6"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-2">
              No expenses yet
            </h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mb-6 leading-relaxed">
              Expenses you&apos;re involved in across all your groups will
              appear here.
            </p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition-colors text-sm">
              Create Group
            </button>
          </motion.div>
        ) : filteredExpenses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-slate-800 rounded-2xl border border-white/6"
          >
            <SlidersHorizontal className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-100 mb-1">
              No matches found
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Try adjusting your filters or search query.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-white/8 text-slate-300 rounded-lg font-semibold hover:bg-white/12 transition-colors text-sm"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredExpenses.map((exp, i) => (
                <motion.div
                  key={exp._id}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                >
                  <ExpenseCard expense={exp} userId={user.id} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
