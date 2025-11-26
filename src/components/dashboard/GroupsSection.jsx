"use client";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Loader2,
  MoreHorizontal,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function GroupsSection() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/groups");
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    setCreatingGroup(true);
    try {
      // This would open a modal or navigate to create group page
      router.push("/groups/create");
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleGroupClick = (groupId) => {
    router.push(`/groups/${groupId}`);
  };

  const getMemberCountText = (members) => {
    const count = members?.length || 0;
    return `${count} member${count !== 1 ? "s" : ""}`;
  };

  const getGroupTypeColor = (group) => {
    // You can customize this based on your group data
    const groupName = group.name?.toLowerCase() || "";
    if (groupName.includes("trip") || groupName.includes("travel")) {
      return "bg-blue-50 text-blue-600 border-blue-200";
    } else if (
      groupName.includes("lunch") ||
      groupName.includes("food") ||
      groupName.includes("dinner")
    ) {
      return "bg-green-50 text-green-600 border-green-200";
    } else if (
      groupName.includes("room") ||
      groupName.includes("home") ||
      groupName.includes("flat")
    ) {
      return "bg-purple-50 text-purple-600 border-purple-200";
    } else if (groupName.includes("office") || groupName.includes("work")) {
      return "bg-orange-50 text-orange-600 border-orange-200";
    } else {
      return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getGroupTypeLabel = (group) => {
    const groupName = group.name?.toLowerCase() || "";
    if (groupName.includes("trip") || groupName.includes("travel"))
      return "Trip";
    if (groupName.includes("lunch") || groupName.includes("food"))
      return "Food";
    if (groupName.includes("room") || groupName.includes("home")) return "Home";
    if (groupName.includes("office") || groupName.includes("work"))
      return "Work";
    return "General";
  };

  const calculateGroupBalance = (group, currentUserId) => {
    // This is a placeholder - you'll need to implement actual balance calculation
    // based on your expense data structure
    return "₹ 0.00";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Groups</h2>
            <p className="text-gray-500 text-sm mt-1">Loading your groups...</p>
          </div>
          <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>

        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-xl">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                  </div>
                </div>
                <div className="w-16 h-6 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recent Groups</h2>
          <p className="text-gray-500 text-sm mt-1">
            {groups.length} group{groups.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex gap-2 ">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateGroup}
            disabled={creatingGroup}
            className="flex items-center gap-2 bg-gray-900 text-sm text-white px-4 py-2 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
           
            All Groups
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateGroup}
            disabled={creatingGroup}
            className="flex items-center gap-2 bg-gray-900 text-sm text-white px-4 py-2 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {creatingGroup ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            
          </motion.button>
        </div>
      </div>

      {/* Groups List */}
      <div className="space-y-3">
        <AnimatePresence>
          {groups.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                No groups yet
              </h3>
              <p className="text-gray-500 text-sm mb-4 max-w-sm mx-auto">
                Create your first group to start splitting expenses with
                friends, family, or colleagues
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateGroup}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium mx-auto"
              >
                <UserPlus size={18} />
                Create Your First Group
              </motion.button>
            </motion.div>
          ) : (
            groups.map((group, index) => (
              <motion.div
                key={group._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                onClick={() => handleGroupClick(group._id)}
                className="
                  group relative
                  flex items-center justify-between p-4
                  bg-white rounded-xl border border-gray-200
                  hover:border-gray-300 hover:shadow-sm
                  cursor-pointer transition-all duration-200
                "
              >
                {/* Left Content */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Group Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getGroupTypeColor(
                      group
                    )}`}
                  >
                    <Users size={20} />
                  </div>

                  {/* Group Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {group.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getGroupTypeColor(
                          group
                        )}`}
                      >
                        {getGroupTypeLabel(group)}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {getMemberCountText(group.members)}
                      {group.description && ` • ${group.description}`}
                    </p>
                  </div>
                </div>

                {/* Right Content */}
                <div className="flex items-center gap-4">
                  {/* Balance */}
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {calculateGroupBalance(group)}
                    </p>
                    <p className="text-gray-400 text-xs">Total balance</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle more options
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal size={16} className="text-gray-500" />
                    </motion.button>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="p-2 text-gray-400 group-hover:text-gray-600 transition-colors"
                    >
                      <ArrowRight size={16} />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Load More Button (if you have pagination) */}
      {groups.length > 0 && groups.length >= 5 && (
        <div className="mt-6 text-center">
          <button className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">
            Load more groups
          </button>
        </div>
      )}
    </div>
  );
}
