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
  Filter,
  MoreHorizontal,
  UserPlus,
  Settings
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

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Groups</h1>
              <p className="text-gray-600 text-lg">
                Manage your expense sharing groups
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateGroup(true)}
              className="flex items-center gap-3 bg-gray-900 text-white px-6 py-3.5 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium shadow-sm"
            >
              <Plus size={20} />
              Create Group
            </motion.button>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="flex gap-2">
            {["all", "active", "archived"].map((filter) => (
              <motion.button
                key={filter}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveFilter(filter)}
                className={`
                  px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200
                  ${activeFilter === filter
                    ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }
                `}
              >
                {filter === "all" && "All Groups"}
                {filter === "active" && "Active"}
                {filter === "archived" && "Archived"}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Groups Grid */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-20"
          >
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your groups...</p>
            </div>
          </motion.div>
        ) : filteredGroups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {searchQuery || activeFilter !== "all" ? "No groups found" : "No groups yet"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery || activeFilter !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "Create your first group to start sharing expenses with others."
              }
            </p>
            {(!searchQuery && activeFilter === "all") && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateGroup(true)}
                className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium mx-auto"
              >
                <UserPlus size={18} />
                Create First Group
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
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
          </motion.div>
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
    </DashboardLayout>
  );
}

function GroupCard({ group, index, onClick }) {
  const memberCount = group.members?.length || 0;
  const totalExpenses = group.totalExpenses || 0;
  const createdDate = new Date(group.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg mb-2 truncate">
              {group.name}
            </h3>
            {group.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {group.description}
              </p>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 ml-4 group-hover:bg-gray-200 transition-colors">
            <Users className="w-5 h-5 text-gray-600" />
          </div>
        </div>

        {/* Privacy and Date */}
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            group.privacy === 'private' 
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {group.privacy === 'private' ? 'Private' : 'Public'}
          </span>
          <span className="text-gray-500 text-xs flex items-center gap-1">
            <Calendar size={12} />
            Created {createdDate}
          </span>
        </div>
      </div>

      {/* Card Stats */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{memberCount}</p>
            <p className="text-gray-600 text-xs">Members</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {group.currency === 'INR' ? '₹' : '$'}{totalExpenses.toLocaleString()}
            </p>
            <p className="text-gray-600 text-xs">Total</p>
          </div>
        </div>

        {/* Members Preview */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {group.members?.slice(0, 4).map((member, memberIndex) => (
              <div
                key={memberIndex}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-white flex items-center justify-center text-xs font-medium text-white shadow-sm"
                title={member.name}
              >
                {member.name?.charAt(0).toUpperCase()}
              </div>
            ))}
            {memberCount > 4 && (
              <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-700 shadow-sm">
                +{memberCount - 4}
              </div>
            )}
          </div>
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="p-2 text-gray-400 group-hover:text-gray-600 transition-colors"
          >
            <ArrowRight size={16} />
          </motion.div>
        </div>
      </div>

      {/* Hover Effect Line */}
      <div className="w-0 group-hover:w-full h-0.5 bg-gray-900 transition-all duration-300" />
    </motion.div>
  );
}