// components/groups/CreateGroupForm.js
"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const GROUP_TYPES = [
  { id: "trip", label: "✈️ Trip", description: "Vacation or travel" },
  {
    id: "home",
    label: "🏠 Home",
    description: "Roommates & shared living",
  },
  {
    id: "couple",
    label: "💑 Couple",
    description: "Joint expenses",
  },
  { id: "other", label: "➕ Other", description: "Friends, events, etc" },
];

export default function CreateGroupForm({ onClose }) {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: type selection, 2: name input
  const [selectedType, setSelectedType] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    setStep(2);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/groups", {
        name: groupName.trim(),
        type: selectedType,
        currency: "INR",
      });

      toast.success("Group created! Add members to get started.");
      onClose?.();
      router.push(`/groups/${res.data.group._id}`);
    } catch (error) {
      console.error("Group creation error:", error);
      toast.error(error.response?.data?.error || "Failed to create group");
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
        className="bg-slate-800 w-full sm:max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/6 my-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-b from-slate-700 to-slate-800 px-6 py-6 border-b border-white/6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-xl font-bold text-slate-100">
                Create New Group
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {step === 1 ? "Choose a group type" : "Enter group details"}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors -mr-2"
            >
              <X className="w-5 h-5 text-slate-400" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4">
          {step === 1 ? (
            // Step 1: Type Selection
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {GROUP_TYPES.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTypeSelect(type.id)}
                  className="w-full p-4 rounded-xl border border-white/8 bg-slate-700/30 hover:bg-slate-700/50 hover:border-white/12 transition-all duration-200 text-left group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-100 text-base">
                        {type.label}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            // Step 2: Name & Description Input
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Back Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setStep(1);
                  setSelectedType(null);
                }}
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 -ml-1 transition-colors"
              >
                ← Back
              </motion.button>

              {/* Group Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder={`e.g., ${
                    selectedType === "trip"
                      ? "Bali Trip"
                      : selectedType === "home"
                        ? "Apartment 4B"
                        : selectedType === "couple"
                          ? "Sarah & Mike"
                          : "Movie Night"
                  }`}
                  autoFocus
                  onKeyPress={(e) => {
                    if (
                      e.key === "Enter" &&
                      !isSubmitting &&
                      groupName.trim()
                    ) {
                      handleCreate();
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-white/8 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Info Tip */}
              <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-xl p-3">
                <p className="text-xs text-indigo-300 font-medium">
                  💡 You can invite members after creating the group
                </p>
              </div>
            </motion.div>
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
          {step === 2 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              disabled={isSubmitting || !groupName.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
