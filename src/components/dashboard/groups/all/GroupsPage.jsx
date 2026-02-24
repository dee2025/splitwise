// components/dashboard/groups/GroupsPage.js
"use client";

import GroupCard from "@/components/dashboard/groups/all/GroupCard";
import GroupSettingsModal from "@/components/dashboard/groups/all/GroupSettingsModal";
import CreateGroupForm from "@/components/dashboard/groups/CreateGroupForm";
import DashboardLayout from "@/components/DashboardLayout";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus, Search, Users } from "lucide-react";
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
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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
          group.description?.toLowerCase().includes(searchQuery.toLowerCase()),
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

  const handleSettingsClick = (group, e) => {
    e.stopPropagation();
    setSelectedGroup(group);
    setShowSettingsModal(true);
  };

  const handleGroupCreated = (newGroup) => {
    setGroups((prev) => [newGroup, ...prev]);
    setShowCreateGroup(false);
    toast.success("Group created successfully!");
  };

  const handleGroupUpdated = (updatedGroup) => {
    setGroups((prev) =>
      prev.map((group) =>
        group._id === updatedGroup._id ? updatedGroup : group,
      ),
    );
    setShowSettingsModal(false);
    setSelectedGroup(null);
  };

  const handleGroupDeleted = (groupId) => {
    setGroups((prev) => prev.filter((group) => group._id !== groupId));
    setShowSettingsModal(false);
    setSelectedGroup(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-2xl shadow-black/50"
        >
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-4" />
          <p className="text-slate-200 font-medium">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
              Your Groups
            </h1>
            <p className="text-sm text-slate-400">
              {groups.length} {groups.length === 1 ? "group" : "groups"} total •
              Manage shared expenses
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateGroup(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-sm font-semibold hover:from-indigo-500 hover:to-indigo-400 active:scale-95 transition-all shadow-lg shadow-indigo-950/50 w-full sm:w-auto"
          >
            <Plus size={18} />
            <span>Create Group</span>
          </motion.button>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          {/* <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/8 text-slate-100 placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
            />
          </div> */}

          {/* Status filter */}
          {/* <div className="flex gap-2 overflow-x-auto pb-4">
            {[
              { id: "all", label: "All Groups" },
              { id: "active", label: "Active" },
              { id: "archived", label: "Archived" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-4 py-2 rounded-lg border whitespace-nowrap transition-all text-xs font-semibold ${
                  activeFilter === f.id
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-950/50"
                    : "bg-slate-800/50 border-white/8 text-slate-300 hover:bg-slate-700/30 hover:border-white/12"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div> */}
        </motion.div>
      </div>

      {/* Groups Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <GroupsLoadingState />
        ) : filteredGroups.length === 0 ? (
          <EmptyGroupsState
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            onCreateGroup={() => setShowCreateGroup(true)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <AnimatePresence>
              {filteredGroups.map((group, index) => (
                <GroupCard
                  key={group._id}
                  group={group}
                  index={index}
                  onClick={() => handleGroupClick(group._id)}
                  onSettingsClick={(e) => handleSettingsClick(group, e)}
                  currentUser={user}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateGroup && (
          <CreateGroupForm
            onClose={() => setShowCreateGroup(false)}
            onGroupCreated={handleGroupCreated}
          />
        )}
      </AnimatePresence>

      {/* Group Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && selectedGroup && (
          <GroupSettingsModal
            group={selectedGroup}
            onClose={() => {
              setShowSettingsModal(false);
              setSelectedGroup(null);
            }}
            onGroupUpdated={handleGroupUpdated}
            onGroupDeleted={handleGroupDeleted}
            currentUser={user}
          />
        )}
      </AnimatePresence>
      {/* </div>
      </div> */}
    </DashboardLayout>
  );
}

// Loading State Component
function GroupsLoadingState() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-white/8 p-4 self-start"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-slate-700 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 bg-slate-700 rounded-lg w-32 animate-pulse" />
              <div className="h-3 bg-slate-700 rounded-lg w-24 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="h-8 bg-slate-700 rounded-lg animate-pulse" />
            <div className="h-8 bg-slate-700 rounded-lg animate-pulse" />
          </div>
          <div className="h-8 bg-slate-700 rounded-lg animate-pulse" />
        </motion.div>
      ))}
    </div>
  );
}

// Empty State Component
function EmptyGroupsState({ searchQuery, activeFilter, onCreateGroup }) {
  const isFiltered = searchQuery || activeFilter !== "all";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-16 px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="w-16 h-16 border-2 border-dashed border-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50"
      >
        <Users className="w-8 h-8 text-slate-600" />
      </motion.div>
      <h3 className="text-lg font-bold text-slate-100 mb-2">
        {isFiltered ? "No groups found" : "No groups yet"}
      </h3>
      <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
        {isFiltered ? (
          <>
            Try adjusting your search or{" "}
            <button
              onClick={() => {
                // Reset filters
              }}
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              clear filters
            </button>
          </>
        ) : (
          "Create your first group to start sharing expenses with friends"
        )}
      </p>
      {!isFiltered && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateGroup}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-6 py-3 rounded-xl border border-indigo-500/50 hover:from-indigo-500 hover:to-indigo-400 transition-all font-semibold shadow-lg shadow-indigo-950/50 text-sm"
        >
          <Plus size={18} />
          Create First Group
        </motion.button>
      )}
    </motion.div>
  );
}
