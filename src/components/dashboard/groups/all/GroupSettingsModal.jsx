// components/dashboard/groups/GroupSettingsModal.js
"use client";

import { getGroupTypeConfig } from "@/utils/groupUtils";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Crown,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function GroupSettingsModal({
  group,
  onClose,
  onGroupUpdated,
  onGroupDeleted,
  currentUser,
}) {
  const [editForm, setEditForm] = useState({
    name: group.name,
    description: group.description || "",
  });
  const [newMemberName, setNewMemberName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const config = getGroupTypeConfig(group);
  const memberCount = group.members?.length || 0;

  // Search users for adding members
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await axios.get(
        `/api/users/search?q=${encodeURIComponent(query)}`
      );
      setSearchResults(res.data.users || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/groups/${group._id}`, editForm);
      onGroupUpdated(res.data.group);
      toast.success("Group updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update group");
    }
  };

  const handleAddMember = async (user) => {
    try {
      const res = await axios.put(`/api/groups/${group._id}`, {
        members: [
          {
            userId: user.id,
            name: user.fullName || user.name,
            email: user.email,
            contact: user.contact,
          },
        ],
      });
      onGroupUpdated(res.data.group);
      setSearchQuery("");
      setSearchResults([]);
      toast.success(`Added ${user.fullName || user.name} to group`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add member");
    }
  };

  const handleAddCustomMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      toast.error("Please enter a name for the member");
      return;
    }

    try {
      const res = await axios.put(`/api/groups/${group._id}`, {
        members: [
          {
            name: newMemberName,
            email: null,
            contact: null,
            type: "custom",
          },
        ],
      });
      onGroupUpdated(res.data.group);
      setNewMemberName("");
      toast.success(`Added ${newMemberName} to group`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add member");
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const res = await axios.put(`/api/groups/${group._id}`, {
        removeMemberId: memberId,
      });
      onGroupUpdated(res.data.group);
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to remove member");
    }
  };

  const handleDeleteGroup = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this group? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.put(`/api/groups/${group._id}`, {
        action: "delete",
      });
      onGroupDeleted(group._id);
      toast.success("Group deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete group");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg border-2 border-gray-400 shadow-sketch w-full max-w-md max-h-[80vh] overflow-y-auto "
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b-2 border-dashed border-gray-300 pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                Group Settings
              </h3>
              <button
                onClick={onClose}
                className="p-1 border border-gray-400 rounded hover:border-black transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Edit Group Form */}
            <form onSubmit={handleUpdateGroup} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded focus:outline-none focus:border-black transition-all duration-150"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded focus:outline-none focus:border-black transition-all duration-150 resize-none"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded border-2 border-black hover:bg-gray-800 transition-all duration-150 font-medium shadow-sketch-sm"
              >
                <Edit size={16} />
                Update Group
              </button>
            </form>

            {/* Add Member Section */}
            <div className="space-y-3 mb-6 p-3 bg-gray-50 rounded border border-gray-300">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <UserPlus size={16} />
                Add Member
              </h4>

              {/* Search for registered users */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search registered users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-400 rounded focus:outline-none focus:border-black transition-all duration-150 text-sm"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 animate-spin" />
                )}
              </div>

              {/* Search Results */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border border-gray-200 rounded bg-white overflow-hidden"
                  >
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleAddMember(user)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium">
                            {(user.fullName || user.name)
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700">
                            {user.fullName || user.name}
                          </span>
                        </div>
                        <Plus size={14} className="text-gray-400" />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add custom member */}
              <form
                onSubmit={handleAddCustomMember}
                className="flex gap-2 mt-2"
              >
                <input
                  type="text"
                  placeholder="Add custom member name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="flex-1 px-3 py-1.5 border-2 border-gray-400 rounded focus:outline-none focus:border-black transition-all duration-150 text-sm"
                />
                <button
                  type="submit"
                  className="bg-black text-white px-3 py-1.5 rounded border-2 border-black hover:bg-gray-800 transition-all duration-150 font-medium text-sm shadow-sketch-sm"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Members List */}
            <div className="space-y-2 mb-6">
              <h4 className="font-medium text-gray-900 mb-3">
                Members ({memberCount})
              </h4>
              {group.members?.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-300"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-xs text-white font-medium">
                      {(member.name || member.fullName)
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700">
                      {member.name || member.fullName}
                    </span>
                    {member.role === "admin" && (
                      <Crown size={12} className="text-yellow-600" />
                    )}
                    {member.type === "custom" && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                        External
                      </span>
                    )}
                  </div>
                  {member.role !== "admin" && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <UserMinus size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Danger Zone */}
            <div className="border-t-2 border-dashed border-gray-300 pt-4">
              <h4 className="font-medium text-red-600 mb-3">Danger Zone</h4>
              <button
                onClick={handleDeleteGroup}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded border-2 border-red-600 hover:bg-red-700 transition-all duration-150 font-medium shadow-sketch-sm w-full justify-center"
              >
                <Trash2 size={16} />
                Delete Group
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
