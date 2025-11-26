"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function StatsCards() {
  const stats = [
    {
      title: "Total Balance",
      value: "₹ 0.00",
      desc: "Across all groups",
      color: "text-gray-900",
      icon: DollarSign,
    },
    {
      title: "You Owe",
      value: "₹ 0.00",
      desc: "To settle",
      color: "text-red-600",
      icon: TrendingDown,
    },
    {
      title: "You Are Owed",
      value: "₹ 0.00",
      desc: "To receive",
      color: "text-green-600",
      icon: TrendingUp,
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="
              bg-white p-5 rounded-xl
              border border-gray-100
              shadow-xs
              hover:border-gray-200
              transition-all duration-200
            "
          >
            <div className="flex items-center gap-4">
              <IconComponent 
                size={24} 
                className={stat.color} 
              />
              
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  {stat.title}
                </p>
                <h2 className={`text-xl font-semibold ${stat.color}`}>
                  {stat.value}
                </h2>
                <p className="text-gray-400 text-xs mt-1">
                  {stat.desc}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}