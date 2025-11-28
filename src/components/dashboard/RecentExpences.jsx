"use client";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Music,
  Plane,
  Plug,
  Plus,
  Receipt,
  ShoppingBag,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function RecentExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/expenses");
      setExpenses(res.data.expenses || []);
    } catch (err) {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (expense) => {
    if (expense.groupId?.$oid) {
      router.push(
        `/groups/${expense.groupId.$oid}/expenses/${expense._id.$oid}`
      );
    } else {
      router.push(`/expenses/${expense._id.$oid}`);
    }
  };

  const formatAmount = (amt) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amt);

  const formatDate = (dateObj) => {
    const date = new Date(dateObj.$date);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const getCategoryIcon = (category) => {
    const cls = "w-4 h-4";
    switch (category) {
      case "food":
        return <UtensilsCrossed className={cls} />;
      case "travel":
        return <Plane className={cls} />;
      case "entertainment":
        return <Music className={cls} />;
      case "shopping":
        return <ShoppingBag className={cls} />;
      case "utilities":
        return <Plug className={cls} />;
      default:
        return <Receipt className={cls} />;
    }
  };

  const catBorderColor = (category) => {
    switch (category) {
      case "food":
        return "border-orange-500";
      case "travel":
        return "border-blue-500";
      case "entertainment":
        return "border-purple-500";
      case "shopping":
        return "border-pink-500";
      case "utilities":
        return "border-green-500";
      default:
        return "border-gray-500";
    }
  };

  const catTextColor = (category) => {
    switch (category) {
      case "food":
        return "text-orange-600";
      case "travel":
        return "text-blue-600";
      case "entertainment":
        return "text-purple-600";
      case "shopping":
        return "text-pink-600";
      case "utilities":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-400 p-5 shadow-sketch">
      {/* Header */}
      <div>
        <motion.div
          whileHover={{ y: -1 }}
          whileTap={{ y: 1 }}
          className="flex items-center gap-2 text-gray-800 hover:text-gray-900  text-xl font-bold transition-colors duration-150 cursor-pointer mb-6 border-b-2 border-dashed border-gray-300 pb-2"
        >
          Recent Expenses
          <ArrowRight size={14} />
        </motion.div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((x) => (
            <div
              key={x}
              className="p-4 bg-gray-100 rounded border-2 border-gray-300 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded border-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg"
              >
                <div className="w-16 h-16 border-2 border-gray-400 rounded-lg flex items-center justify-center mx-auto mb-4 bg-gray-50">
                  <Receipt size={24} className="text-gray-500" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  No expenses yet
                </h3>
                <p className="text-gray-600 text-sm mb-4 max-w-sm mx-auto">
                  Start tracking your shared expenses
                </p>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 1 }}
                  onClick={() => router.push("/expenses/create")}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded border-2 border-black hover:bg-gray-800 transition-all duration-150 font-medium mx-auto shadow-sketch-sm"
                >
                  <Plus size={16} />
                  Add First Expense
                </motion.button>
              </motion.div>
            ) : (
              expenses.map((exp) => (
                <motion.div
                  key={exp._id.$oid}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ y: -1 }}
                  className="
                    group relative
                    p-4 bg-white rounded border-2 border-gray-300
                    hover:border-gray-500 hover:shadow-sketch-sm
                    cursor-pointer transition-all duration-150
                  "
                  onClick={() => handleClick(exp)}
                >
                  <div className="flex items-center gap-3">
                    {/* Category Icon */}
                    <div
                      className={`w-10 h-10 rounded border-2 bg-white flex items-center justify-center ${catBorderColor(
                        exp.category
                      )}`}
                    >
                      {getCategoryIcon(exp.category)}
                    </div>

                    {/* Expense Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {exp.description}
                        </p>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium border ${catBorderColor(
                            exp.category
                          )} ${catTextColor(exp.category)} bg-white`}
                        >
                          {exp.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(exp.date)}</span>
                        </div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>
                            Paid by {exp.paidBy?.$oid?.slice(-4) || "You"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Amount and Arrow */}
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-gray-900">
                        {formatAmount(exp.amount)}
                      </p>
                      <div className="p-1 border border-gray-400 rounded group-hover:border-black transition-colors">
                        <ArrowRight
                          size={12}
                          className="text-gray-600 group-hover:text-black"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Corner accents */}
                  <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.div>
              ))
            )}
          </div>
        </AnimatePresence>
      )}

      {/* View All Expenses Button */}
      {expenses.length > 5 && (
        <div className="mt-4 text-center border-t-2 border-dashed border-gray-300 pt-4">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ y: 1 }}
            onClick={() => router.push("/expenses")}
            className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors duration-150 flex items-center gap-1 mx-auto"
          >
            View all {expenses.length} expenses
            <ArrowRight size={14} />
          </motion.button>
        </div>
      )}
    </div>
  );
}
