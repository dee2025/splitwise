// components/dashboard/groups/GroupCard.js
"use client";

import { getGroupTypeConfig } from "@/utils/groupUtils";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Settings, TrendingUp } from "lucide-react";

export default function GroupCard({
  group,
  index,
  onClick,
  onSettingsClick,
  currentUser,
}) {
  const memberCount = group.members?.length || 0;
  const totalExpenses = group.totalExpenses || 0;
  const createdDate = new Date(group.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const config = getGroupTypeConfig(group);
  const IconComponent = config.icon;

  // Check if current user is admin
  const isAdmin = group.members?.some((member) => {
    const memberId = member.userId?._id || member.userId;
    const currentUserId = currentUser?._id || currentUser?.id;
    return memberId === currentUserId && member.role === "admin";
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group cursor-pointer bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 rounded-2xl border border-white/8 hover:border-white/15 hover:shadow-xl hover:shadow-indigo-950/40 transition-all duration-300 overflow-hidden relative"
    >
      {/* Settings Button */}
      {isAdmin && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-4 right-4 p-2 bg-slate-700/60 border border-white/8 rounded-lg z-10 shadow-md hover:bg-slate-600 hover:border-white/12 transition-all"
          onClick={onSettingsClick}
        >
          <Settings size={16} className="text-indigo-400" />
        </motion.button>
      )}

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col h-full">
        {/* Header with icon and name */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 rounded-xl border border-white/8 bg-gradient-to-br from-indigo-600/30 to-indigo-500/20 flex items-center justify-center flex-shrink-0 shadow-lg"
            >
              <IconComponent className="w-6 h-6 text-indigo-300" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-50 text-base truncate">
                {group.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="px-2 py-1 rounded-md text-xs font-medium border border-indigo-500/30 bg-indigo-600/20 text-indigo-300">
                  {config.label}
                </span>
                <span className="text-slate-600 text-xs">•</span>
                <span className="text-slate-500 text-xs flex items-center gap-1">
                  <Calendar size={12} />
                  {createdDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {group.description && (
          <p className="text-slate-400 text-sm mb-4 line-clamp-2 border-l-2 border-indigo-500/30 pl-3 text-justify">
            {group.description}
          </p>
        )}

        {/* Quick Stats - Improved */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-3 bg-gradient-to-br from-slate-700/50 to-slate-800/30 rounded-lg border border-white/6 hover:border-white/10 transition-all"
          >
            <p className="text-sm text-slate-400 mb-1">Members</p>
            <p className="text-xl font-bold text-slate-100">{memberCount}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-3 bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 rounded-lg border border-emerald-500/20 hover:border-emerald-500/30 transition-all"
          >
            <p className="text-sm text-slate-400 mb-1 flex items-center gap-1">
              <TrendingUp size={14} className="text-emerald-400" />
              Total
            </p>
            <p className="text-lg font-bold text-emerald-300">
              ₹{totalExpenses?.toLocaleString() || "0"}
            </p>
          </motion.div>
        </div>

        {/* Members and CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-white/6 mt-auto">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex -space-x-2">
              {group.members?.slice(0, 3).map((member, idx) => {
                const initials =
                  (member.name || member.fullName)
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "U";
                return (
                  <motion.div
                    key={member._id || idx}
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-white shadow-sm hover:shadow-lg"
                    title={member.name || member.fullName}
                  >
                    {initials}
                  </motion.div>
                );
              })}
            </div>
            {memberCount > 3 && (
              <span className="text-slate-500 text-xs font-medium">
                +{memberCount - 3} more
              </span>
            )}
          </div>

          <motion.div
            whileHover={{ scale: 1.1, x: 2 }}
            className="p-1.5 border border-white/8 rounded-lg group-hover:border-indigo-500/30 transition-colors bg-white/5 group-hover:bg-indigo-600/20 cursor-pointer"
          >
            <ArrowRight size={16} className="text-indigo-400" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
