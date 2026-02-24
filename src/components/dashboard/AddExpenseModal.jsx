"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AddExpenseModal({ onClose, selectedGroup }) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    group: selectedGroup || "",
    paidBy: "me",
    notes: "",
  });
  const [groups, setGroups] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios
      .get("/api/groups")
      .then((res) => setGroups(res.data.groups || []))
      .catch(() => {});
  }, []);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("/api/expenses", form);
      toast.success("Expense added!");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full px-3.5 py-2.5 bg-slate-700/50 border border-white/8 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Sheet */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative bg-slate-800 border border-white/8 rounded-t-2xl sm:rounded-2xl w-full sm:w-[420px] max-h-[92vh] overflow-y-auto shadow-2xl"
      >
        {/* Modal header */}
        <div className="sticky top-0 bg-slate-800 border-b border-white/6 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-base font-bold text-slate-100">Add Expense</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/8 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* What for */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              What for?
            </label>
            <input
              type="text"
              value={form.title}
              onChange={set("title")}
              placeholder="e.g. Dinner, Hotel, Fuel"
              required
              className={inputCls}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">
                ₹
              </span>
              <input
                type="number"
                value={form.amount}
                onChange={set("amount")}
                placeholder="0"
                min="1"
                step="1"
                required
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>

          {/* Group */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Group
            </label>
            <select
              value={form.group}
              onChange={set("group")}
              required
              className={`${inputCls} appearance-none`}
            >
              <option value="" className="bg-slate-800">
                Select group
              </option>
              {groups.map((g) => (
                <option key={g._id} value={g._id} className="bg-slate-800">
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Paid by */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Paid by
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "me", label: "Me" },
                { value: "other", label: "Someone else" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, paidBy: value }))}
                  className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    form.paidBy === value
                      ? "border-indigo-500 bg-indigo-600/20 text-indigo-300"
                      : "border-white/8 bg-white/4 text-slate-400 hover:text-slate-200 hover:border-white/15"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Notes&nbsp;
              <span className="normal-case font-normal text-slate-600">
                (optional)
              </span>
            </label>
            <textarea
              value={form.notes}
              onChange={set("notes")}
              placeholder="Any extra details..."
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-400 bg-white/5 border border-white/8 rounded-lg hover:text-slate-200 hover:bg-white/8 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-950/40"
            >
              {submitting ? "Adding…" : "Add Expense"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
