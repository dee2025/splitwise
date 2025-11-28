"use client";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Home,
  MapPin,
  Plus,
  UserPlus,
  Users,
  Utensils,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CreateGroupForm from "./groups/CreateGroupForm";

export default function GroupsSection() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
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

  const handleGroupCreated = (newGroup) => {
    setGroups((prev) => [newGroup, ...prev]);
    setShowCreateGroup(false);
    toast.success("Group created successfully!");
  };

  const getGroupTypeConfig = (group) => {
    const groupName = group.name?.toLowerCase() || "";

    if (groupName.includes("trip") || groupName.includes("travel")) {
      return {
        icon: MapPin,
        label: "Trip",
        border: "border-blue-400",
      };
    } else if (
      groupName.includes("lunch") ||
      groupName.includes("food") ||
      groupName.includes("dinner")
    ) {
      return {
        icon: Utensils,
        label: "Food",
        border: "border-green-400",
      };
    } else if (
      groupName.includes("room") ||
      groupName.includes("home") ||
      groupName.includes("flat")
    ) {
      return {
        icon: Home,
        label: "Home",
        border: "border-purple-400",
      };
    } else if (groupName.includes("office") || groupName.includes("work")) {
      return {
        icon: Briefcase,
        label: "Work",
        border: "border-orange-400",
      };
    } else {
      return {
        icon: Users,
        label: "General",
        border: "border-gray-400",
      };
    }
  };

  const calculateGroupBalance = (group) => {
    // Mock balance calculation - positive (green) or negative (red)
    const mockBalance = Math.random() > 0.5 ? 1250 : -750;
    return {
      amount: `₹ ${Math.abs(mockBalance).toLocaleString()}`,
      isPositive: mockBalance >= 0,
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-400 p-5 shadow-sketch">
        <div className="flex items-center justify-between mb-6 border-b-2 border-dashed border-gray-300 pb-4">
          <div>
            <div className="h-6 bg-gray-300 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded border-2 border-gray-300">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-gray-300 rounded border-2"></div>
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
    <div className="bg-white rounded-lg border-2 border-gray-400 p-5 shadow-sketch">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b-2 border-dashed border-gray-300 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b-2 border-black pb-1 inline-block">
            Your Groups
          </h2>
          <p className="text-gray-600 text-sm mt-2">
            {groups.length} active group{groups.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ y: 1 }}
            onClick={() => router.push("/groups")}
            className="flex items-center gap-2 bg-white text-gray-700 text-sm px-3 py-2 rounded border-2 border-gray-400 hover:border-black transition-all duration-150 font-medium shadow-sketch-sm"
          >
            View All
            <ArrowRight size={14} />
          </motion.button>

          {/* <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ y: 1 }}
            onClick={handleCreateGroup}
            disabled={creatingGroup}
            className="flex items-center gap-1 bg-black text-white text-sm px-3 py-2 rounded border-2 border-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 font-medium shadow-sketch-sm"
          >
            {creatingGroup ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            New
          </motion.button> */}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ y: 1 }}
            onClick={() => setShowCreateGroup(true)}
            className="flex items-center justify-center gap-2 bg-black text-white px-4 sm:px-4 py-2 rounded border-2 border-black hover:bg-gray-800 transition-all duration-150 font-medium shadow-sketch-sm w-full sm:w-auto"
          >
            <Plus size={20} />
            <span>New Group</span>
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
              className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg"
            >
              <div className="w-16 h-16 border-2 border-gray-400 rounded-lg flex items-center justify-center mx-auto mb-4 bg-gray-50">
                <Users size={24} className="text-gray-500" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">No groups yet</h3>
              <p className="text-gray-600 text-sm mb-4 max-w-sm mx-auto">
                Create your first group to start splitting expenses
              </p>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ y: 1 }}
                onClick={handleCreateGroup}
                className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded border-2 border-black hover:bg-gray-800 transition-all duration-150 font-medium mx-auto shadow-sketch-sm"
              >
                <UserPlus size={16} />
                Create First Group
              </motion.button>
            </motion.div>
          ) : (
            groups.slice(0, 5).map((group, index) => {
              const config = getGroupTypeConfig(group);
              const memberCount = group.members?.length || 0;
              const balance = calculateGroupBalance(group);

              return (
                <motion.div
                  key={group._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -1 }}
                  onClick={() => router.push(`/groups/${group._id}`)}
                  className="
                    group relative
                    flex items-center justify-between p-4
                    bg-white rounded border-2 border-gray-300
                    hover:border-gray-500 hover:shadow-sketch-sm
                    cursor-pointer transition-all duration-150
                  "
                >
                  {/* Left Content */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Group Icon */}
                    <div
                      className={`w-12 h-12 rounded border-2 bg-white flex items-center justify-center ${config.border}`}
                    >
                      <config.icon size={20} className="text-gray-700" />
                    </div>

                    {/* Group Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate text-sm">
                          {group.name}
                        </h3>
                        <span className="px-2 py-1 rounded text-xs font-medium border border-gray-400 bg-gray-100">
                          {config.label}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs">
                        {memberCount} member{memberCount !== 1 ? "s" : ""}
                        {group.description && ` • ${group.description}`}
                      </p>
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="flex items-center gap-3">
                    {/* Balance */}
                    <div className="text-right">
                      <p
                        className={`font-bold text-sm ${
                          balance.isPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {balance.amount}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {balance.isPositive ? "You get" : "You owe"}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="p-1 border border-gray-400 rounded group-hover:border-black transition-colors">
                      <ArrowRight
                        size={14}
                        className="text-gray-600 group-hover:text-black"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* View All Groups Button */}
      {groups.length > 2 && (
        <div className="mt-4 text-center border-t-2 border-dashed border-gray-300 pt-4">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ y: 1 }}
            onClick={() => router.push("/groups")}
            className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors duration-150 flex items-center gap-1 mx-auto"
          >
            View all {groups.length} groups
            <ArrowRight size={14} />
          </motion.button>
        </div>
      )}

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateGroup && (
          <CreateGroupForm
            onClose={() => setShowCreateGroup(false)}
            onGroupCreated={handleGroupCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
