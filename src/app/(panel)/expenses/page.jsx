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
  return "₹";
}

function getNormalizedId(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "object") {
    if (value._id) return String(value._id);
    if (value.id) return String(value.id);
  }
  return "";
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

function ExpenseCard({ expense, userId, onClick }) {
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
      className="bg-slate-800 rounded-xl border border-white/6 hover:border-white/12 transition-all duration-200 overflow-hidden group cursor-pointer"
      onClick={onClick}
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

function ExpenseDetailsModal({ expense, userId, onClose }) {
  if (!expense) return null;

  const sym = getCurrencySymbol(expense.groupId?.currency);
  const cat = CATEGORY_CONFIG[expense.category] ?? CATEGORY_CONFIG.other;
  const CatIcon = cat.icon;
  const mySplit = (expense.splitBetween || []).find(
    (s) => getNormalizedId(s.userId) === userId,
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        className="bg-slate-800 rounded-xl border border-white/8 w-full max-w-md overflow-hidden shadow-xl"
      >
        <div className="px-5 py-4 border-b border-white/8 bg-slate-700/30 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider">Expense Details</p>
            <h3 className="text-base font-bold text-slate-100 truncate mt-1">{expense.description}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-white/8 hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Amount</p>
            <p className="text-xl font-bold text-slate-100">
              {sym}
              {Number(expense.amount || 0).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">Group</p>
            <p className="text-xs text-slate-300 text-right truncate">{expense.groupId?.name || "Unknown Group"}</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">Paid By</p>
            <p className="text-xs text-slate-300 text-right">
              {getNormalizedId(expense.paidBy) === userId
                ? "You"
                : expense.paidBy?.fullName || expense.paidBy?.username || "Unknown"}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">Date</p>
            <p className="text-xs text-slate-300 text-right">
              {new Date(expense.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">Category</p>
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold ${cat.badgeBg} ${cat.badgeText}`}>
              <CatIcon className="w-3.5 h-3.5" />
              {cat.label}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">Your Share</p>
            <p className="text-xs text-slate-300 text-right">
              {mySplit
                ? `${sym}${Number(mySplit.amount || 0).toFixed(2)} ${mySplit.settled ? "(settled)" : "(unsettled)"}`
                : "Not part of split"}
            </p>
          </div>

          <div className="pt-1">
            <p className="text-xs text-slate-400 mb-2">Split Details</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto rounded-lg border border-white/8 bg-slate-700/25 p-2">
              {(expense.splitBetween || []).map((s, idx) => {
                const splitUserId = getNormalizedId(s.userId);
                const name =
                  splitUserId === userId
                    ? "You"
                    : s.userId?.fullName || s.userId?.username || `Member ${idx + 1}`;

                return (
                  <div
                    key={`${splitUserId}-${idx}`}
                    className="flex items-center justify-between text-xs bg-slate-700/40 border border-white/8 rounded-lg px-2.5 py-2"
                  >
                    <span className="text-slate-300 truncate mr-2">{name}</span>
                    <span className="text-slate-200 font-semibold">
                      {sym}
                      {Number(s.amount || 0).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-white/8 bg-slate-700/30">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ExpenseFilterModal({
  open,
  draftCategory,
  setDraftCategory,
  draftGroup,
  setDraftGroup,
  uniqueGroups,
  onApply,
  onReset,
  onClose,
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          className="bg-slate-800 rounded-xl border border-white/8 w-full max-w-sm overflow-hidden shadow-xl"
        >
          <div className="px-5 py-4 border-b border-white/8 bg-slate-700/30 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100">Filter Expenses</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-white/8 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Group</label>
              <select
                value={draftGroup}
                onChange={(e) => setDraftGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-700/50 border border-white/8 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all" className="bg-slate-800">All Groups</option>
                {uniqueGroups.map((g) => (
                  <option key={g.id} value={g.id} className="bg-slate-800">
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={draftCategory}
                onChange={(e) => setDraftCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-700/50 border border-white/8 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all" className="bg-slate-800">All Categories</option>
                <option value="food" className="bg-slate-800">Food & Dining</option>
                <option value="travel" className="bg-slate-800">Travel</option>
                <option value="accommodation" className="bg-slate-800">Accommodation</option>
                <option value="shopping" className="bg-slate-800">Shopping</option>
                <option value="entertainment" className="bg-slate-800">Entertainment</option>
                <option value="other" className="bg-slate-800">Other</option>
              </select>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-white/8 bg-slate-700/30 flex items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              className="flex-1 px-3 py-2.5 rounded-lg bg-white/8 text-slate-200 text-sm font-semibold hover:bg-white/12 transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onApply}
              className="flex-1 px-3 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
            >
              Apply
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ExpensesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [draftCategory, setDraftCategory] = useState("all");
  const [draftGroup, setDraftGroup] = useState("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

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
      if (categoryFilter !== "all" && exp.category !== categoryFilter)
        return false;
      if (groupFilter !== "all" && exp.groupId?._id !== groupFilter)
        return false;
      return true;
    });
  }, [expenses, categoryFilter, groupFilter]);

  const isFiltered = categoryFilter !== "all" || groupFilter !== "all";

  const clearFilters = () => {
    setCategoryFilter("all");
    setGroupFilter("all");
    setDraftCategory("all");
    setDraftGroup("all");
    setShowFilterModal(false);
  };

  const openFilterModal = () => {
    setDraftCategory(categoryFilter);
    setDraftGroup(groupFilter);
    setShowFilterModal(true);
  };

  const applyFilters = () => {
    setCategoryFilter(draftCategory);
    setGroupFilter(draftGroup);
    setShowFilterModal(false);
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
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-1">
                All Expenses
              </h1>
              <p className="text-slate-400 text-sm">
                Track and manage all your expenses across groups
              </p>
            </div>
            {!loading && expenses.length > 0 && (
              <button
                type="button"
                onClick={openFilterModal}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-white/8 text-slate-200 hover:bg-slate-700/50 transition-colors text-sm font-semibold"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && (
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
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
                className="bg-slate-800 rounded-xl p-2.5 sm:p-4 border border-white/6 flex items-center justify-between min-w-0"
              >
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-wide sm:tracking-wider mb-1 truncate">
                    {label}
                  </p>
                  <p className={`text-base sm:text-2xl font-bold ${color} truncate`}>
                    {value}
                  </p>
                </div>
                <div className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl ${iconBg} shrink-0 ml-2`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && expenses.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-white/6 p-3 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-200">{filteredExpenses.length}</span> of <span className="font-semibold text-slate-200">{expenses.length}</span> expenses
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-indigo-300 hover:text-indigo-200 font-semibold"
              >
                Clear filters
              </button>
            )}
          </div>
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
                  <ExpenseCard
                    expense={exp}
                    userId={getNormalizedId(user)}
                    onClick={() => setSelectedExpense(exp)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <ExpenseFilterModal
          open={showFilterModal}
          draftCategory={draftCategory}
          setDraftCategory={setDraftCategory}
          draftGroup={draftGroup}
          setDraftGroup={setDraftGroup}
          uniqueGroups={uniqueGroups}
          onApply={applyFilters}
          onReset={clearFilters}
          onClose={() => setShowFilterModal(false)}
        />

        <AnimatePresence>
          {selectedExpense && (
            <ExpenseDetailsModal
              expense={selectedExpense}
              userId={getNormalizedId(user)}
              onClose={() => setSelectedExpense(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
