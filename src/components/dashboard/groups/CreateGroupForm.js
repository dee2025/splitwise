// components/groups/CreateGroupForm.js
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  X, 
  Plus, 
  Mail, 
  UserPlus, 
  Loader2,
  Shield,
  Globe,
  Lock
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function CreateGroupForm({ onClose, onGroupCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    currency: "INR",
    privacy: "private"
  });
  
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomUser, setShowCustomUser] = useState(false);
  const [customUser, setCustomUser] = useState({
    name: "",
    email: "",
    contact: ""
  });

  const searchRef = useRef(null);

  // Search users by username, email, or contact
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await axios.get(`/api/users/search?q=${encodeURIComponent(query)}`);
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

  // Add member from search results
  const addMember = (user) => {
    if (!members.find(m => m.id === user.id)) {
      setMembers(prev => [...prev, { ...user, type: 'registered' }]);
      setSearchQuery("");
      setSearchResults([]);
      toast.success(`Added ${user.name}`);
    }
  };

  // Remove member
  const removeMember = (memberId) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  // Add custom user
  const addCustomUser = () => {
    if (!customUser.name.trim()) {
      toast.error("Please enter a name for the custom user");
      return;
    }

    const newCustomUser = {
      id: `custom-${Date.now()}`,
      name: customUser.name,
      email: customUser.email || null,
      contact: customUser.contact || null,
      type: 'custom'
    };

    setMembers(prev => [...prev, newCustomUser]);
    setCustomUser({ name: "", email: "", contact: "" });
    setShowCustomUser(false);
    toast.success(`Added ${customUser.name}`);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (members.length === 0) {
      toast.error("Please add at least one member to the group");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/groups", {
        ...formData,
        members: members.map(m => ({
          userId: m.type === 'registered' ? m.id : null,
          name: m.name,
          email: m.email,
          contact: m.contact,
          type: m.type
        }))
      });

      toast.success("Group created successfully!");
      onGroupCreated?.(res.data.group);
      onClose?.();
    } catch (error) {
      console.error("Group creation error:", error);
      toast.error(error.response?.data?.error || "Failed to create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 border-black shadow-sketch-xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create New Group</h2>
                <p className="text-gray-600">Start splitting expenses with friends</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Group Details */}
          <div className="space-y-6">
            {/* Group Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Goa Trip, Roommates, Office Lunch"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What's this group for?"
                rows={3}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
              />
            </div>

            {/* Settings */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>

              {/* Privacy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Privacy
                </label>
                <select
                  value={formData.privacy}
                  onChange={(e) => setFormData(prev => ({ ...prev, privacy: e.target.value }))}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                >
                  <option value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Private
                    </div>
                  </option>
                  <option value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Public
                    </div>
                  </option>
                </select>
              </div>
            </div>

            {/* Members Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Group Members *
              </label>

              {/* Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name, email, or contact..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-3 w-5 h-5 text-gray-400 animate-spin" />
                )}
              </div>

              {/* Search Results */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 border border-gray-200 rounded-lg bg-white shadow-lg overflow-hidden"
                  >
                    {searchResults.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => addMember(user)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">
                              {user.email} • {user.contact}
                            </p>
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-gray-400" />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add Custom User Button */}
              {!showCustomUser && (
                <button
                  type="button"
                  onClick={() => setShowCustomUser(true)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                >
                  <UserPlus className="w-4 h-4" />
                  Add custom user (not on SplitWise)
                </button>
              )}

              {/* Custom User Form */}
              <AnimatePresence>
                {showCustomUser && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 mb-4"
                  >
                    <div className="grid gap-3">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={customUser.name}
                        onChange={(e) => setCustomUser(prev => ({ ...prev, name: e.target.value }))}
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      />
                      <input
                        type="email"
                        placeholder="Email (optional)"
                        value={customUser.email}
                        onChange={(e) => setCustomUser(prev => ({ ...prev, email: e.target.value }))}
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      />
                      <input
                        type="tel"
                        placeholder="Contact (optional)"
                        value={customUser.contact}
                        onChange={(e) => setCustomUser(prev => ({ ...prev, contact: e.target.value }))}
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={addCustomUser}
                          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                        >
                          Add User
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCustomUser(false)}
                          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected Members */}
              <div className="space-y-2">
                {members.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.name}
                          {member.type === 'custom' && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              External
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {member.email && `${member.email} • `}
                          {member.contact}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-black hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium border-2 border-black shadow-sketch"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Group...
                </div>
              ) : (
                "Create Group"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}