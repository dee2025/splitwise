"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed,
  Plane,
  Music,
  ShoppingBag,
  Plug,
  Receipt,
  User,
  Calendar,
  Loader2,
  Plus,
} from "lucide-react";
import axios from "axios";
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
      router.push(`/groups/${expense.groupId.$oid}/expenses/${expense._id.$oid}`);
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
    const cls = "w-5 h-5 text-white";
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

  const catColor = (category) => {
    switch (category) {
      case "food":
        return "bg-orange-500";
      case "travel":
        return "bg-blue-500";
      case "entertainment":
        return "bg-purple-500";
      case "shopping":
        return "bg-pink-500";
      case "utilities":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">Recent Expenses</h2>

        <button
          onClick={() => router.push("/expenses/create")}
          className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((x) => (
            <div
              key={x}
              className="p-4 bg-white border rounded-xl shadow-sm animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {expenses.map((exp) => (
              <motion.div
                key={exp._id.$oid}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-white border rounded-xl shadow-sm cursor-pointer"
                onClick={() => handleClick(exp)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${catColor(
                      exp.category
                    )}`}
                  >
                    {getCategoryIcon(exp.category)}
                  </div>

                  <div className="flex-1">
                    <p className="text-base font-medium text-gray-900">
                      {exp.description}
                    </p>

                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(exp.date)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <User className="w-4 h-4" />
                      <span>Paid by: {exp.paidBy?.$oid?.slice(-4)}</span>
                    </div>
                  </div>

                  <p className="text-lg font-semibold text-gray-900">
                    {formatAmount(exp.amount)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
