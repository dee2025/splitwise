"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { Calendar, Check, IndianRupee, Loader2, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AddExpenseForm({ group, onClose, onExpenseAdded }) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "other",
    paidBy: "",
  });

  const [splitType, setSplitType] = useState("equal");
  const [splitBetween, setSplitBetween] = useState([]);
  const [paidTo, setPaidTo] = useState([]); // Track who the expense is split to
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (group?.members && group.members.length > 0) {
      const initialSplit = group.members.map((member) => ({
        userId: member.userId?._id || member.userId,
        name: member.name,
        amount: 0,
        percentage: 100 / group.members.length,
      }));
      setSplitBetween(initialSplit);
      // By default, all members are included in the split
      setPaidTo(initialSplit.map((m) => m.userId));
      if (!formData.paidBy && initialSplit.length > 0) {
        setFormData((prev) => ({ ...prev, paidBy: initialSplit[0].userId }));
      }
    }
  }, [group]);

  const handleAmountChange = (amount) => {
    setFormData((prev) => ({ ...prev, amount }));

    if (splitType === "equal" && paidTo.length > 0 && amount) {
      const equalAmount = parseFloat(amount) / paidTo.length;
      setSplitBetween((prev) =>
        prev.map((member) =>
          paidTo.includes(member.userId)
            ? { ...member, amount: Math.round(equalAmount * 100) / 100 }
            : { ...member, amount: 0 },
        ),
      );
    }
  };

  const togglePaidTo = (memberId) => {
    setPaidTo((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });

    // Recalculate amounts if equal split is selected
    if (splitType === "equal" && formData.amount) {
      const newPaidTo = paidTo.includes(memberId)
        ? paidTo.filter((id) => id !== memberId)
        : [...paidTo, memberId];

      if (newPaidTo.length > 0) {
        const equalAmount = parseFloat(formData.amount) / newPaidTo.length;
        setSplitBetween((prev) =>
          prev.map((member) =>
            newPaidTo.includes(member.userId)
              ? { ...member, amount: Math.round(equalAmount * 100) / 100 }
              : { ...member, amount: 0 },
          ),
        );
      }
    }
  };

  const handleMemberAmountChange = (memberId, amount) => {
    setSplitBetween((prev) =>
      prev.map((member) =>
        member.userId === memberId
          ? { ...member, amount: parseFloat(amount) || 0 }
          : member,
      ),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description.trim() || !formData.amount || !formData.paidBy) {
      toast.error("Please fill all required fields");
      return;
    }

    if (paidTo.length === 0) {
      toast.error("Please select at least one member to split with");
      return;
    }

    // Only calculate split for selected members
    const selectedMembers = splitBetween.filter((m) =>
      paidTo.includes(m.userId),
    );
    const totalSplit = selectedMembers.reduce(
      (sum, member) => sum + (member.amount || 0),
      0,
    );
    if (Math.abs(totalSplit - parseFloat(formData.amount)) > 0.01) {
      toast.error("Split amounts must equal the total amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/expenses", {
        ...formData,
        amount: parseFloat(formData.amount),
        groupId: group._id,
        paidTo: paidTo, // Add the paidTo list
        splitBetween: selectedMembers.map((member) => ({
          userId: member.userId,
          amount: member.amount,
          percentage: member.percentage,
        })),
      });

      toast.success("Expense added successfully!");
      onExpenseAdded?.(res.data.expense);
      onClose?.();
    } catch (error) {
      console.error("Expense creation error:", error);
      toast.error(error.response?.data?.error || "Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 pb-20 sm:pb-0 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        className="bg-slate-800 w-full sm:max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/6 my-auto max-h-[85vh] sm:max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-b from-slate-700 to-slate-800 px-6 py-6 border-b border-white/6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-xl font-bold text-slate-100">
                Add Expense
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {group?.name || "Add to group"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors -mr-2"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(85vh-200px)] sm:max-h-[calc(90vh-200px)] space-y-4"
        >
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="What was this expense for?"
              className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-white/8 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Paid By *
            </label>
            <select
              value={formData.paidBy}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, paidBy: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-white/8 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Select member</option>
              {splitBetween.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Paid To - Select who gets split */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Paid To (Split Between) *
            </label>
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {splitBetween.map((member) => (
                <button
                  key={member.userId}
                  type="button"
                  onClick={() => togglePaidTo(member.userId)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    paidTo.includes(member.userId)
                      ? "bg-indigo-600/20 border-indigo-600/40"
                      : "bg-slate-700/50 border-white/8 hover:border-white/12"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      paidTo.includes(member.userId)
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-white/20"
                    }`}
                  >
                    {paidTo.includes(member.userId) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-100">
                    {member.name || "Unknown"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount and Date */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Amount *
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-700/50 border border-white/8 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-700/50 border border-white/8 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Category
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-700/50 border border-white/8 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="food">Food & Dining</option>
                <option value="travel">Travel</option>
                <option value="accommodation">Accommodation</option>
                <option value="shopping">Shopping</option>
                <option value="entertainment">Entertainment</option>
                <option value="utilities">Utilities</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Split Type Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Split Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSplitType("equal");
                  if (formData.amount && paidTo.length > 0) {
                    const equalAmount =
                      parseFloat(formData.amount) / paidTo.length;
                    setSplitBetween((prev) =>
                      prev.map((member) =>
                        paidTo.includes(member.userId)
                          ? {
                              ...member,
                              amount: Math.round(equalAmount * 100) / 100,
                            }
                          : { ...member, amount: 0 },
                      ),
                    );
                  }
                }}
                className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                  splitType === "equal"
                    ? "bg-indigo-600/20 border-indigo-600/40 text-indigo-300"
                    : "bg-slate-700/50 border-white/8 text-slate-400 hover:border-white/12"
                }`}
              >
                Equal Split
              </button>
              <button
                type="button"
                onClick={() => setSplitType("unequal")}
                className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                  splitType === "unequal"
                    ? "bg-indigo-600/20 border-indigo-600/40 text-indigo-300"
                    : "bg-slate-700/50 border-white/8 text-slate-400 hover:border-white/12"
                }`}
              >
                Custom Split
              </button>
            </div>
          </div>

          {/* Split Between */}
          <div className="pt-2">
            <p className="text-sm font-semibold text-slate-300 mb-3">
              Split Between
            </p>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {splitBetween
                .filter((member) => paidTo.includes(member.userId))
                .map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-white/8"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-sm font-semibold border border-indigo-600/40">
                        {(member.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-100">
                        {member.name || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        value={member.amount || 0}
                        onChange={(e) =>
                          handleMemberAmountChange(
                            member.userId,
                            e.target.value,
                          )
                        }
                        disabled={splitType === "equal"}
                        className="w-20 px-2 py-1 text-sm rounded bg-slate-600/30 border border-white/8 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/6 bg-slate-700/50 -mx-6 -mb-6 px-6 py-4 flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-white/8 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Expense"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
