"use client";

import { motion } from "framer-motion";
import { IndianRupee, Users, Calendar } from "lucide-react";
import { useState } from "react";
import ExpenseDetailsModal from "../expenses/ExpenseDetailsModal";

/*
  Props:
    - expenses: array (Expense documents populated with paidBy and splitBetween.userId)
    - group: group object (for currency)
    - onExpenseUpdated(expense) optional callback when an expense changes
*/
export default function ExpensesTab({ expenses = [], group, onExpenseUpdated }) {
    const [selected, setSelected] = useState(null);

    if (!expenses.length) {
        return (
            <div className="text-center text-gray-500 py-20">
                No expenses added yet.
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {expenses.map((exp) => (
                    <motion.div
                        key={exp._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-5 rounded-xl shadow hover:shadow-lg cursor-pointer"
                        onClick={() => setSelected(exp)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg font-semibold text-gray-900 truncate">
                                    {exp.description}
                                </h2>

                                <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-2">
                                        <Users size={14} />
                                        Paid by {exp.paidBy?.fullName || exp.paidBy?.username || "Unknown"}
                                    </span>

                                    <span>•</span>

                                    <span className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        {new Date(exp.date).toLocaleDateString()}
                                    </span>

                                    <span>•</span>

                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                                        {exp.category || "other"}
                                    </span>
                                </div>

                                {/* split preview */}
                                <div className="mt-3 text-sm text-gray-700 flex flex-wrap gap-2">
                                    {(exp.splitBetween || []).slice(0, 4).map((s) => (
                                        <div key={s.userId?._id || s.userId} className="bg-gray-50 px-2 py-1 rounded text-xs">
                                            {s.userId?.fullName || s.userId?.username || "User"}: {group.currency === "INR" ? "₹" : "$"}{(s.amount).toFixed(2)}
                                            {s.settled ? <span className="ml-2 text-green-600">●</span> : null}
                                        </div>
                                    ))}
                                    {(exp.splitBetween || []).length > 4 && (
                                        <div className="text-xs text-gray-500 self-center">+{(exp.splitBetween || []).length - 4} more</div>
                                    )}
                                </div>
                            </div>

                            <div className="text-right ml-4">
                                <div className="text-lg font-bold text-gray-900 flex items-center gap-1 justify-end">
                                    <IndianRupee size={16} />
                                    {(exp.amount).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    {(exp.isSettled) ? "Settled" : "Open"}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* details modal */}
            {selected && (
                <ExpenseDetailsModal
                    expense={selected}
                    group={group}
                    onClose={() => setSelected(null)}
                    onUpdate={(updated) => {
                        setSelected(updated);
                        onExpenseUpdated?.(updated);
                    }}
                />
            )}
        </>
    );
}
