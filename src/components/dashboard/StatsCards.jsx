"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function StatsCards() {
  const stats = [
    {
      title: "Total Balance",
      value: "₹ 0.00",
      desc: "Across all groups",
      icon: DollarSign,
      trend: "neutral",
      border: "border-gray-400"
    },
    {
      title: "You Owe",
      value: "₹ 0.00",
      desc: "To settle",
      icon: ArrowUpRight,
      trend: "negative",
      border: "border-red-500"
    },
    {
      title: "You Are Owed",
      value: "₹ 0.00",
      desc: "To receive",
      icon: ArrowDownLeft,
      trend: "positive",
      border: "border-green-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        const isPositive = stat.trend === "positive";
        const isNegative = stat.trend === "negative";
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className={`
              relative p-5 rounded-lg border-2 bg-white
              ${stat.border}
              shadow-sketch
              hover:shadow-sketch-hover
              transition-all duration-200
            `}
          >
            {/* Corner accents */}
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-gray-400"></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-gray-400"></div>
            
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2 uppercase tracking-wide">
                  {stat.title}
                </p>
                <h2 className={`
                  text-2xl font-bold mb-1
                  ${isPositive ? 'text-green-600' : 
                    isNegative ? 'text-red-600' : 
                    'text-gray-900'}
                `}>
                  {stat.value}
                </h2>
                <p className="text-gray-500 text-xs font-medium">
                  {stat.desc}
                </p>
              </div>
              
              <div className={`
                p-2 border-2 rounded-lg
                ${isPositive ? 'border-green-500 bg-green-50' : 
                  isNegative ? 'border-red-500 bg-red-50' : 
                  'border-gray-400 bg-gray-100'}
              `}>
                <IconComponent 
                  size={20} 
                  className={
                    isPositive ? 'text-green-600' : 
                    isNegative ? 'text-red-600' : 
                    'text-gray-600'
                  } 
                />
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 mt-4">
              <div className={`
                w-2 h-2 rounded-full
                ${isPositive ? 'bg-green-500' : 
                  isNegative ? 'bg-red-500' : 
                  'bg-gray-400'}
              `}></div>
              <span className={`
                text-xs font-bold uppercase tracking-wide
                ${isPositive ? 'text-green-600' : 
                  isNegative ? 'text-red-600' : 
                  'text-gray-500'}
              `}>
                {stat.trend === 'positive' ? 'You are owed' : 
                 stat.trend === 'negative' ? 'You owe' : 
                 'All settled'}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}