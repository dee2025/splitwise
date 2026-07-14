"use client";

import axios from "axios";
import { motion } from "framer-motion";
import {
  Copy,
  Link2,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Send,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function getUserDisplayName(user) {
  return user?.fullName || user?.name || user?.username || user?.email || "User";
}

export default function AddMembersModal({
  groupId,
  inviteUrl = "",
  onClose,
  onMembersAdded,
}) {
  const [activeMode, setActiveMode] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customMember, setCustomMember] = useState({
    name: "",
    email: "",
    contact: "",
  });

  useEffect(() => {
    if (activeMode !== "search") return undefined;

    const timer = setTimeout(async () => {
      const query = searchQuery.trim();

      if (!query || !query.includes("@")) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await axios.get(
          `/api/users/search?q=${encodeURIComponent(query)}`,
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
  }, [activeMode, searchQuery]);

  const toggleMember = (user) => {
    setSelectedMembers((prev) => {
      const exists = prev.find((member) => member.id === user.id);
      if (exists) return prev.filter((member) => member.id !== user.id);
      return [...prev, user];
    });
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`/api/groups/${groupId}/members`, {
        members: selectedMembers.map((member) => ({
          userId: member.id,
          name: getUserDisplayName(member),
          email: member.email,
          contact: member.contact,
          type: "registered",
        })),
      });

      toast.success(`Added ${selectedMembers.length} member(s)`);
      onMembersAdded?.();
      onClose?.();
    } catch (error) {
      console.error("Add members error:", error);
      toast.error(
        error.response?.data?.error || error.message || "Failed to add members",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCustomMember = async () => {
    const name = customMember.name.trim();
    const email = customMember.email.trim();
    const contact = customMember.contact.trim();

    if (!name) {
      toast.error("Enter member name");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`/api/groups/${groupId}/members`, {
        members: [
          {
            name,
            email,
            contact,
            type: "custom",
          },
        ],
      });

      toast.success("Temporary member added");
      setCustomMember({ name: "", email: "", contact: "" });
      onMembersAdded?.();
      onClose?.();
    } catch (error) {
      console.error("Add custom member error:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to add temporary member",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteUrl) {
      toast.error("Invite link is not available");
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Invite link copied");
    } catch (error) {
      console.error("Copy invite link failed:", error);
      toast.error("Unable to copy invite link");
    }
  };

  const handleShareInvite = async () => {
    if (!inviteUrl) {
      toast.error("Invite link is not available");
      return;
    }

    if (!navigator.share) {
      await handleCopyInvite();
      return;
    }

    try {
      await navigator.share({
        title: "Join my MoneySplit group",
        text: "Join this MoneySplit group to track shared expenses.",
        url: inviteUrl,
      });
    } catch (error) {
      if (error?.name !== "AbortError") {
        toast.error("Unable to share invite");
      }
    }
  };

  const modeButtonClass = (mode) =>
    `flex min-w-0 items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-bold transition-colors ${
      activeMode === mode
        ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-200 shadow-sm"
        : "border-transparent bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
    }`;

  const submitDisabled =
    activeMode === "invite" ||
    isSubmitting ||
    (activeMode === "search" && selectedMembers.length === 0) ||
    (activeMode === "custom" && !customMember.name.trim());

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 pb-20 sm:pb-0 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        className="bg-slate-800 w-full sm:max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/8 my-auto max-h-[85vh] sm:max-h-[90vh]"
      >
        <div className="bg-slate-900/70 px-6 py-5 border-b border-white/8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-100">
                Add Members
              </h2>
              <p className="text-sm text-slate-400 mt-1 font-medium">
                Invite, search, or add a temporary member
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors -mr-2 text-slate-400 hover:text-slate-100"
              aria-label="Close add members"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(85vh-200px)] sm:max-h-[calc(90vh-180px)] space-y-4">
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/8 bg-slate-900/45 p-1.5">
            <button
              type="button"
              onClick={() => setActiveMode("search")}
              className={modeButtonClass("search")}
            >
              <Search size={14} />
              <span className="truncate">Search</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("invite")}
              className={modeButtonClass("invite")}
            >
              <Link2 size={14} />
              <span className="truncate">Invite</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("custom")}
              className={modeButtonClass("custom")}
            >
              <UserRound size={14} />
              <span className="truncate">Temp</span>
            </button>
          </div>

          {activeMode === "search" && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Enter member email..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/45 border border-white/10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-3 w-5 h-5 text-indigo-400 animate-spin" />
                )}
              </div>

              {selectedMembers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-400">
                    Selected ({selectedMembers.length})
                  </p>
                  {selectedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 p-3 bg-slate-900/45 border border-indigo-500/30 rounded-lg"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-100 truncate">
                          {getUserDisplayName(member)}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {member.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleMember(member)}
                        className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-100"
                        aria-label={`Remove ${getUserDisplayName(member)}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/6">
                  <p className="text-sm font-medium text-slate-400">
                    Available users
                  </p>
                  {searchResults.map((user) => {
                    const isSelected = selectedMembers.find(
                      (member) => member.id === user.id,
                    );

                    return (
                      <motion.button
                        key={user.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => toggleMember(user)}
                        className={`w-full p-3 rounded-lg border transition-all text-left ${
                          isSelected
                            ? "bg-indigo-600/20 border-indigo-600/40"
                            : "bg-slate-900/45 border-white/8 hover:border-white/12 hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-100 truncate">
                              {getUserDisplayName(user)}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {user.email}
                            </p>
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

              {searchQuery.trim().includes("@") &&
                searchQuery.trim() &&
                searchResults.length === 0 &&
                !isSearching && (
                  <div className="text-center py-8">
                    <p className="text-sm font-medium text-slate-500">
                      No users found
                    </p>
                  </div>
                )}

              {!searchQuery.trim().includes("@") && (
                <div className="text-center py-8 rounded-xl border border-white/8 bg-slate-900/30">
                  <p className="text-slate-500 text-sm font-medium">
                    Enter an email address with @ to search
                  </p>
                </div>
              )}
            </>
          )}

          {activeMode === "invite" && (
            <div className="space-y-4 rounded-xl border border-white/8 bg-slate-900/45 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
                  <Link2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Share group invite
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Anyone with this link can join after signing in.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5">
                <p className="break-all text-xs text-slate-300">
                  {inviteUrl || "Invite link is not available"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  disabled={!inviteUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm font-bold text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-50"
                >
                  <Copy size={15} />
                  Copy link
                </button>
                <button
                  type="button"
                  onClick={handleShareInvite}
                  disabled={!inviteUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-600 bg-indigo-600 px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                >
                  <Send size={15} />
                  Share
                </button>
              </div>
            </div>
          )}

          {activeMode === "custom" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-xs font-semibold text-amber-300">
                  Temporary member
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Use this for someone who does not have a MoneySplit account
                  yet. They can still be included in splits.
                </p>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-slate-400">
                  Name
                </span>
                <div className="relative">
                  <UserRound className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={customMember.name}
                    onChange={(event) =>
                      setCustomMember((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Rahul Sharma"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/45 border border-white/10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-slate-400">
                  Email optional
                </span>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={customMember.email}
                    onChange={(event) =>
                      setCustomMember((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    placeholder="rahul@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/45 border border-white/10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-slate-400">
                  Phone optional
                </span>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="tel"
                    value={customMember.contact}
                    onChange={(event) =>
                      setCustomMember((prev) => ({
                        ...prev,
                        contact: event.target.value,
                      }))
                    }
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/45 border border-white/10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </label>
            </div>
          )}
        </div>

        <div className="border-t border-white/8 bg-slate-900/45 px-5 sm:px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={
              activeMode === "custom" ? handleAddCustomMember : handleAddMembers
            }
            disabled={submitDisabled}
            className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/30"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {activeMode === "custom"
                  ? "Add temp"
                  : `Add${selectedMembers.length > 0 ? ` (${selectedMembers.length})` : ""}`}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
