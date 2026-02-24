"use client";

import { motion } from "framer-motion";
import { ChevronRight, Users } from "lucide-react";

export default function ActiveGroups({ onSelectGroup }) {
  const groups = [
    {
      id: 1,
      name: "Chiang Mai Trip",
      icon: "✈️",
      members: 4,
      totalExpense: "$2,450.00",
      yourBalance: "-$150.50",
      status: "owed",
    },
    {
      id: 2,
      name: "Apartment Rent",
      icon: "🏠",
      members: 3,
      totalExpense: "$3,600.00",
      yourBalance: "+$400.00",
      status: "receiving",
    },
    {
      id: 3,
      name: "Weekend Party",
      icon: "🎉",
      members: 8,
      totalExpense: "$850.50",
      yourBalance: "-$25.00",
      status: "owed",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Active Groups</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your shared expenses
          </p>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-600">No active groups yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectGroup(group.id)}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group p-4 sm:p-5"
            >
              <div className="flex items-center gap-4">
                {/* Group Icon */}
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-lg group-hover:bg-gray-200 transition-colors">
                  {group.icon}
                </div>

                {/* Group Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {group.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {group.members} members
                    </span>
                    <span>Total: {group.totalExpense}</span>
                  </div>
                </div>

                {/* Balance Status */}
                <div className="text-right">
                  <p
                    className={`font-semibold text-lg ${
                      group.status === "owed"
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {group.yourBalance}
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      group.status === "owed"
                        ? "text-orange-500"
                        : "text-green-500"
                    }`}
                  >
                    {group.status === "owed" ? "You owe" : "You'll receive"}
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors hidden sm:block" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
