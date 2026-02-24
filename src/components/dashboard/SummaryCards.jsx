"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";

export default function SummaryCards() {
  const cards = [
    {
      label: "Total Balance",
      value: "$1,245.50",
      icon: Wallet,
      gradient: "from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
      trend: "+$125 this month",
      trendColor: "text-green-600",
    },
    {
      label: "You Owe",
      value: "$450.00",
      icon: ArrowUpRight,
      gradient: "from-orange-50 to-orange-100",
      iconColor: "text-orange-600",
      people: "2 groups",
      trendColor: "text-orange-600",
    },
    {
      label: "You'll Receive",
      value: "$1,695.50",
      icon: ArrowDownLeft,
      gradient: "from-green-50 to-green-100",
      iconColor: "text-green-600",
      people: "3 groups",
      trendColor: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${card.gradient} rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center ${card.iconColor}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${card.trendColor} ${
                  card.trendColor === "text-green-600"
                    ? "bg-green-100"
                    : card.trendColor === "text-orange-600"
                      ? "bg-orange-100"
                      : "bg-blue-100"
                }`}
              >
                {card.trend || card.people}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
