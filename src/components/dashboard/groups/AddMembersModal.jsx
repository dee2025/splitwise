"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { Loader2, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AddMembersModal({ groupId, onClose, onMembersAdded }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search users
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await axios.get(
          `/api/users/search?q=${encodeURIComponent(searchQuery)}`,
        );
        setSearchResults(res.data.users || []);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleMember = (user) => {
    setSelectedMembers((prev) => {
      const exists = prev.find((m) => m.id === user.id);
      if (exists) {
        return prev.filter((m) => m.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`/api/groups/${groupId}/members`, {
        members: selectedMembers.map((m) => ({
          userId: m.id,
          name: m.fullName,
          email: m.email,
          contact: m.contact,
          type: "registered",
        })),
      });

      console.log("Members added successfully:", response.data);
      toast.success(`Added ${selectedMembers.length} member(s)`);
      onMembersAdded?.();
      onClose?.();
    } catch (error) {
      console.error("Add members error:", error);
      const errorMsg =
        error.response?.data?.error || error.message || "Failed to add members";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 pb-20 sm:pb-0 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        className="bg-slate-800 w-full sm:max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/6 my-auto max-h-[85vh] sm:max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-b from-slate-700 to-slate-800 px-6 py-6 border-b border-white/6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-xl font-bold text-slate-100">
                Add Members
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Invite people to split expenses
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors -mr-2"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)] sm:max-h-[calc(90vh-180px)] space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-700/50 border border-white/8 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-3 w-5 h-5 text-indigo-400 animate-spin" />
            )}
          </div>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-400">
                Selected ({selectedMembers.length})
              </p>
              {selectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-indigo-600/20 border border-indigo-600/40 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-100">
                      {member.fullName}
                    </p>
                    <p className="text-xs text-slate-400">{member.email}</p>
                  </div>
                  <button
                    onClick={() => toggleMember(member)}
                    className="p-1 hover:bg-indigo-600/30 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/6">
              <p className="text-sm font-medium text-slate-400">
                Available users
              </p>
              {searchResults.map((user) => {
                const isSelected = selectedMembers.find(
                  (m) => m.id === user.id,
                );
                return (
                  <motion.button
                    key={user.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleMember(user)}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      isSelected
                        ? "bg-indigo-600/20 border-indigo-600/40"
                        : "bg-slate-700/50 border-white/8 hover:border-white/12 hover:bg-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-100">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600"
                            : "border-white/20"
                        }`}
                      >
                        {isSelected && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
            <div className="text-center py-8">
              <p className="text-slate-500">No users found</p>
            </div>
          )}

          {!searchQuery.trim() && (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">
                Start typing to search for members
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/6 bg-slate-700/50 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-white/8 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddMembers}
            disabled={isSubmitting || selectedMembers.length === 0}
            className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add{" "}
                {selectedMembers.length > 0 && `(${selectedMembers.length})`}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
