"use client";

import CreateGroupForm from "@/components/dashboard/groups/CreateGroupForm";
import DashboardLayout from "@/components/DashboardLayout";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Home,
  Loader2,
  MapPin,
  Plus,
  Search,
  UserPlus,
  Users,
  Utensils,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

export default function GroupsPage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const router = useRouter();

  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchGroups();
  }, [isAuthenticated, router]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/groups");
      setGroups(res.data.groups || []);
      setFilteredGroups(res.data.groups || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  // Filter groups based on search and filter
  useEffect(() => {
    let filtered = groups;

    if (searchQuery) {
      filtered = filtered.filter(
        (group) =>
          group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilter === "active") {
      filtered = filtered.filter((group) => group.isActive);
    } else if (activeFilter === "archived") {
      filtered = filtered.filter((group) => !group.isActive);
    }

    setFilteredGroups(filtered);
  }, [searchQuery, activeFilter, groups]);

  const handleGroupClick = (groupId) => {
    router.push(`/groups/${groupId}`);
  };

  const handleGroupCreated = (newGroup) => {
    setGroups((prev) => [newGroup, ...prev]);
    setShowCreateGroup(false);
    toast.success("Group created successfully!");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center border-2 border-black">
        <div className="text-center p-6 border-2 border-gray-400 bg-white shadow-sketch">
          <Loader2 className="w-8 h-8 animate-spin text-black mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className=" mx-auto ">
        {/* Header */}
        <div className="mb-8 border-b-2 border-dashed border-gray-300 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 border-b-2 border-black pb-1 inline-block">
                Your Groups
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                {groups.length} {groups.length === 1 ? "group" : "groups"} total
              </p>
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ y: 1 }}
                onClick={() => setShowCreateGroup(true)}
                className="flex items-center justify-center gap-2 bg-black text-white px-4 sm:px-6 py-3 rounded border-2 border-black hover:bg-gray-800 transition-all duration-150 font-medium shadow-sketch-sm w-full sm:w-auto"
              >
                <Plus size={20} />
                <span>New Group</span>
              </motion.button>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-400 rounded focus:outline-none focus:border-black transition-all duration-150 text-base shadow-sketch-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        {/* <div className="mb-8 space-y-4 flex w-full"> */}
        {/* Search Bar */}
        {/* <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-400 rounded focus:outline-none focus:border-black transition-all duration-150 text-base shadow-sketch-sm"
            />
          </div> */}

        {/* Filter Chips */}
        {/* <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "archived", label: "Archived" },
            ].map((filter) => (
              <motion.button
                key={filter.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter.key)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded border-2 text-sm font-medium transition-all duration-150 whitespace-nowrap shadow-sketch-sm
                  ${
                    activeFilter === filter.key
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-400 hover:border-gray-600"
                  }
                `}
              >
                {filter.label}
              </motion.button>
            ))}
          </div> */}
        {/* </div> */}

        {/* Groups Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20 border-2 border-dashed border-gray-400 rounded-lg bg-white">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-black mx-auto mb-4" />
              <p className="text-gray-700 font-medium">Loading groups...</p>
            </div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-400 rounded-lg bg-white shadow-sketch">
            <div className="w-16 h-16 border-2 border-gray-400 rounded-lg flex items-center justify-center mx-auto mb-4 bg-gray-50">
              <Users className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 border-b-2 border-black pb-1 inline-block">
              {searchQuery || activeFilter !== "all"
                ? "No groups found"
                : "No groups yet"}
            </h3>
            <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
              {searchQuery || activeFilter !== "all"
                ? "Try adjusting your search or filter."
                : "Create your first group to start sharing expenses."}
            </p>
            {!searchQuery && activeFilter === "all" && (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ y: 1 }}
                onClick={() => setShowCreateGroup(true)}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded border-2 border-black hover:bg-gray-800 transition-all duration-150 font-medium mx-auto shadow-sketch-sm"
              >
                <UserPlus size={18} />
                Create Group
              </motion.button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence>
              {filteredGroups.map((group, index) => (
                <GroupCard
                  key={group._id}
                  group={group}
                  index={index}
                  onClick={() => handleGroupClick(group._id)}
                />
              ))}
            </AnimatePresence>
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

        {/* Floating Action Button for Mobile */}
        {/* <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCreateGroup(true)}
          className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-black text-white rounded border-2 border-black flex items-center justify-center shadow-sketch z-50"
        >
          <Plus size={24} />
        </motion.button> */}
      </div>
    </DashboardLayout>
  );
}

function GroupCard({ group, index, onClick }) {
  const memberCount = group.members?.length || 0;
  const totalExpenses = group.totalExpenses || 0;
  const createdDate = new Date(group.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const getGroupTypeConfig = (group) => {
    const groupName = group.name?.toLowerCase() || "";

    if (groupName.includes("trip") || groupName.includes("travel")) {
      return {
        icon: MapPin,
        label: "Trip",
        border: "border-blue-500",
      };
    } else if (
      groupName.includes("lunch") ||
      groupName.includes("food") ||
      groupName.includes("dinner")
    ) {
      return {
        icon: Utensils,
        label: "Food",
        border: "border-green-500",
      };
    } else if (
      groupName.includes("room") ||
      groupName.includes("home") ||
      groupName.includes("flat")
    ) {
      return {
        icon: Home,
        label: "Home",
        border: "border-purple-500",
      };
    } else if (groupName.includes("office") || groupName.includes("work")) {
      return {
        icon: Briefcase,
        label: "Work",
        border: "border-orange-500",
      };
    } else {
      return {
        icon: Users,
        label: "General",
        border: "border-gray-500",
      };
    }
  };

  const config = getGroupTypeConfig(group);
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-lg border-2 border-gray-400 hover:border-gray-600 hover:shadow-sketch-hover transition-all duration-150 overflow-hidden"
    >
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
              ₹{totalExpenses.toLocaleString()}
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
                  key={index}
                  className="w-6 h-6 rounded-full bg-gray-400 border border-white flex items-center justify-center text-xs font-medium text-white shadow-sm"
                  title={member.name}
                >
                  {member.name?.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            {memberCount > 3 && (
              <span className="text-gray-500 text-xs">+{memberCount - 3}</span>
            )}
          </div>

          <motion.div
            whileHover={{ scale: 1.1 }}
            className="p-1 border border-gray-400 rounded group-hover:border-black transition-colors"
          >
            <ArrowRight
              size={14}
              className="text-gray-600 group-hover:text-black"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
