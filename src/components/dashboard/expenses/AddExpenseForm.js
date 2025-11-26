// components/expenses/AddExpenseForm.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, IndianRupee, Calendar, Tag, Users, Divide } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function AddExpenseForm({ group, onClose, onExpenseAdded }) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    category: "other"
  });
  
  const [splitType, setSplitType] = useState("equal"); // "equal", "unequal", "percentage"
  const [splitBetween, setSplitBetween] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Initialize split between all members equally
    if (group?.members) {
      const initialSplit = group.members.map(member => ({
        userId: member.userId?._id || member.userId,
        name: member.name,
        amount: 0,
        percentage: 100 / group.members.length
      }));
      setSplitBetween(initialSplit);
    }
  }, [group]);

  const handleAmountChange = (amount) => {
    setFormData(prev => ({ ...prev, amount }));
    
    if (splitType === "equal" && group?.members) {
      const equalAmount = amount / group.members.length;
      setSplitBetween(prev => 
        prev.map(member => ({
          ...member,
          amount: equalAmount
        }))
      );
    }
  };

  const handleMemberAmountChange = (memberId, amount) => {
    setSplitBetween(prev =>
      prev.map(member =>
        member.userId === memberId
          ? { ...member, amount: parseFloat(amount) || 0 }
          : member
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description.trim() || !formData.amount || splitBetween.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    const totalSplit = splitBetween.reduce((sum, member) => sum + (member.amount || 0), 0);
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
        splitBetween: splitBetween.map(member => ({
          userId: member.userId,
          amount: member.amount,
          percentage: member.percentage
        }))
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 border-black shadow-sketch-xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add Expense</h2>
                <p className="text-gray-600">Add expense to {group?.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What was this expense for?"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>

            {/* Amount and Date */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                >
                  <option value="food">Food & Dining</option>
                  <option value="travel">Travel</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="shopping">Shopping</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Split Between */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Split Between
              </label>
              
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setSplitType("equal")}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    splitType === "equal" 
                      ? "border-black bg-black text-white" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Divide className="w-4 h-4 inline mr-2" />
                  Equal
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType("unequal")}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    splitType === "unequal" 
                      ? "border-black bg-black text-white" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <IndianRupee className="w-4 h-4 inline mr-2" />
                  Unequal
                </button>
              </div>

              <div className="space-y-3">
                {splitBetween.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{member.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{group.currency}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={member.amount || 0}
                        onChange={(e) => handleMemberAmountChange(member.userId, e.target.value)}
                        disabled={splitType === "equal"}
                        className="w-24 p-2 border border-gray-300 rounded focus:outline-none focus:border-black disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-black hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium border-2 border-black shadow-sketch"
            >
              {isSubmitting ? "Adding Expense..." : "Add Expense"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}