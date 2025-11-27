"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Plus, 
  Search, 
  Users, 
  Calendar,
  ArrowRight,
  Loader2,
  MoreHorizontal,
  UserPlus,
  Settings,
  IndianRupee,
  DollarSign
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import CreateGroupForm from "@/components/dashboard/groups/CreateGroupForm";

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
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilter === "active") {
      filtered = filtered.filter(group => group.isActive);
    } else if (activeFilter === "archived") {
      filtered = filtered.filter(group => !group.isActive);
    }

    setFilteredGroups(filtered);
  }, [searchQuery, activeFilter, groups]);

  const handleGroupClick = (groupId) => {
    router.push(`/groups/${groupId}`);
  };

  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [newGroup, ...prev]);
    setShowCreateGroup(false);
    toast.success("Group created successfully!");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Simplified */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Groups</h1>
              <p className="text-gray-500 text-sm sm:text-base mt-1">
                {groups.length} {groups.length === 1 ? 'group' : 'groups'}
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateGroup(true)}
              className="flex items-center justify-center gap-2 bg-black text-white px-4 sm:px-6 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium shadow-sm w-full sm:w-auto"
            >
              <Plus size={20} />
              <span>New Group</span>
            </motion.button>
          </div>
        </div>

        {/* Search and Filter - Improved Mobile */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-lg"
            />
          </div>
          
          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "archived", label: "Archived" }
            ].map((filter) => (
              <motion.button
                key={filter.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter.key)}
                className={`
                  flex-shrink-0 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${activeFilter === filter.key
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }
                `}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading groups...</p>
            </div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || activeFilter !== "all" ? "No groups found" : "No groups yet"}
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              {searchQuery || activeFilter !== "all" 
                ? "Try adjusting your search or filter."
                : "Create your first group to start sharing expenses."
              }
            </p>
            {(!searchQuery && activeFilter === "all") && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateGroup(true)}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium mx-auto"
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
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCreateGroup(true)}
          className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg z-50"
        >
          <Plus size={24} />
        </motion.button>
      </div>
    </DashboardLayout>
  );
}

function GroupCard({ group, onClick }) {
  const memberCount = group.members?.length || 0;
  const totalExpenses = group.totalExpenses || 0;
  const createdDate = new Date(group.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden active:scale-95"
    >
      {/* Card Content */}
      <div className="p-5">
        {/* Header with name and privacy */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
              {group.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                group.privacy === 'private' 
                  ? 'bg-purple-50 text-purple-700'
                  : 'bg-blue-50 text-blue-700'
              }`}>
                {group.privacy === 'private' ? 'Private' : 'Public'}
              </span>
              <span className="text-gray-400 text-xs">•</span>
              <span className="text-gray-500 text-xs flex items-center gap-1">
                <Calendar size={12} />
                {createdDate}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 ml-3 group-hover:bg-gray-200 transition-colors">
            <Users className="w-5 h-5 text-gray-600" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-left p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{memberCount}</p>
            <p className="text-gray-500 text-xs">Members</p>
          </div>
          <div className="text-left p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1">
              {group.currency === 'INR' ? (
                <IndianRupee size={16} className="text-gray-600" />
              ) : (
                <DollarSign size={16} className="text-gray-600" />
              )}
              <p className="text-2xl font-bold text-gray-900">
                {totalExpenses.toLocaleString()}
              </p>
            </div>
            <p className="text-gray-500 text-xs">Total</p>
          </div>
        </div>

        {/* Members and CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {group.members?.slice(0, 3).map((member, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-white flex items-center justify-center text-xs font-medium text-white shadow-sm"
                  title={member.name}
                >
                  {member.name?.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            {memberCount > 3 && (
              <span className="text-gray-500 text-sm">+{memberCount - 3}</span>
            )}
          </div>
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="p-2 text-gray-400 group-hover:text-gray-600 transition-colors"
          >
            <ArrowRight size={18} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}