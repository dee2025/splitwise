// components/dashboard/groups/GroupCard.js
"use client";

import { getGroupTypeConfig } from "@/utils/groupUtils";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Settings } from "lucide-react";

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
    year: "numeric",
  });

  const config = getGroupTypeConfig(group);
  const IconComponent = config.icon;

  // Check if current user is admin
  const isAdmin = group.members?.some(member => {
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
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-lg border-2 border-gray-400 hover:border-gray-600 hover:shadow-sketch-hover transition-all duration-150 overflow-hidden relative"
    >
      {/* Settings Button */}
      {isAdmin && (
        <button
          className="absolute top-4 right-4 p-1.5 bg-white border border-gray-400 rounded z-10 shadow-sketch-sm hover:border-black transition-colors"
          onClick={onSettingsClick}
        >
          <Settings size={14} className="text-gray-600" />
        </button>
      )}

      {/* Corner accents */}
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>

      {/* Card Content */}
      <div className="p-4">
        {/* Header with icon and name */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`w-12 h-12 rounded border-2 bg-white flex items-center justify-center ${config.border} flex-shrink-0`}
            >
              <IconComponent className="w-5 h-5 text-gray-700" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base truncate">
                {group.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 rounded text-xs font-medium border border-gray-400 bg-white">
                  {config.label}
                </span>
                <span className="text-gray-400 text-xs">•</span>
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <Calendar size={10} />
                  {createdDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {group.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 border-l-2 border-gray-300 pl-2">
            {group.description}
          </p>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-center p-2 bg-gray-50 rounded border border-gray-300">
            <p className="text-lg font-bold text-gray-900">{memberCount}</p>
            <p className="text-gray-500 text-xs">Members</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded border border-gray-300">
            <p className="text-lg font-bold text-gray-900">
              ₹{totalExpenses?.toLocaleString() || "0"}
            </p>
            <p className="text-gray-500 text-xs">Total</p>
          </div>
        </div>

        {/* Members and CTA */}
        <div className="flex items-center justify-between pt-3 border-t-2 border-dashed border-gray-300">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {group.members?.slice(0, 3).map((member, index) => (
                <div
                  key={member._id || index}
                  className="w-6 h-6 rounded-full bg-gray-400 border border-white flex items-center justify-center text-xs font-medium text-white shadow-sm"
                  title={member.name || member.fullName}
                >
                  {(member.name || member.fullName)?.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            {memberCount > 3 && (
              <span className="text-gray-500 text-xs">
                +{memberCount - 3}
              </span>
            )}
          </div>

          <div className="p-1 border border-gray-400 rounded group-hover:border-black transition-colors">
            <ArrowRight
              size={14}
              className="text-gray-600 group-hover:text-black"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}