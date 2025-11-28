// components/dashboard/groups/GroupsPage.js
"use client";

import CreateGroupForm from "@/components/dashboard/groups/CreateGroupForm";
import DashboardLayout from "@/components/DashboardLayout";
import GroupCard from "@/components/dashboard/groups/all/GroupCard";
import GroupSettingsModal from "@/components/dashboard/groups/all/GroupSettingsModal";
import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { Loader2, Plus, Search, UserPlus, Users } from "lucide-react";
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
        group._id === updatedGroup._id ? updatedGroup : group
      )
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-6 border-2 border-gray-400 bg-white shadow-sketch">
          <Loader2 className="w-8 h-8 animate-spin text-black mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-400 rounded focus:outline-none focus:border-black transition-all duration-150 text-sm shadow-sketch-sm"
                />
              </div>

              <button
                onClick={() => setShowCreateGroup(true)}
                className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded border-2 border-black hover:bg-gray-800 transition-all duration-150 font-medium shadow-sketch-sm"
              >
                <Plus size={18} />
                <span>New Group</span>
              </button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto mt-4 pb-1">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "archived", label: "Archived" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`
                  flex-shrink-0 px-3 py-1.5 rounded border-2 text-sm font-medium transition-all duration-150 whitespace-nowrap shadow-sketch-sm
                  ${
                    activeFilter === filter.key
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-400 hover:border-gray-600"
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <GroupsLoadingState />
        ) : filteredGroups.length === 0 ? (
          <EmptyGroupsState 
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            onCreateGroup={() => setShowCreateGroup(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
      </div>
    </DashboardLayout>
  );
}

// Loading State Component
function GroupsLoadingState() {
  return (
    <div className="flex justify-center items-center py-20 border-2 border-dashed border-gray-400 rounded-lg bg-white">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-black mx-auto mb-4" />
        <p className="text-gray-700 font-medium">Loading groups...</p>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyGroupsState({ searchQuery, activeFilter, onCreateGroup }) {
  return (
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
        <button
          onClick={onCreateGroup}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded border-2 border-black hover:bg-gray-800 transition-all duration-150 font-medium mx-auto shadow-sketch-sm"
        >
          <UserPlus size={18} />
          Create Group
        </button>
      )}
    </div>
  );
}