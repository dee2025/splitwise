// components/groups/CreateGroupForm.js
"use client";

import { GROUP_TYPE_OPTIONS, getGroupTypeConfig } from "@/utils/groupUtils";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CreateGroupForm({ onClose, onGroupCreated }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedConfig = selectedType
    ? getGroupTypeConfig({ type: selectedType })
    : null;

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
      });

      toast.success("Group created! Add members to get started.");
      onGroupCreated?.(res.data.group);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 pb-20 backdrop-blur-sm sm:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        className="my-auto max-h-[90vh] w-full overflow-hidden rounded-2xl border border-white/6 bg-slate-800 shadow-2xl sm:max-w-md"
      >
        <div className="border-b border-white/6 bg-gradient-to-b from-slate-700 to-slate-800 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 sm:text-xl">
                Create New Group
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {step === 1 ? "Choose a group category" : "Enter group details"}
              </p>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="-mr-2 rounded-lg p-2 transition-colors hover:bg-slate-700"
              title="Close"
            >
              <X className="h-5 w-5 text-slate-400" />
            </motion.button>
          </div>
        </div>

        <div className="max-h-[calc(90vh-180px)] space-y-4 overflow-y-auto p-6">
          {step === 1 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {GROUP_TYPE_OPTIONS.map((type) => {
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTypeSelect(type.id)}
                    className="group w-full rounded-xl border border-white/8 bg-slate-700/30 p-3 text-left transition-all duration-200 hover:border-white/12 hover:bg-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={type.image}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-xl border border-white/10 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold text-slate-100">
                          {type.label}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {type.description}
                        </p>
                      </div>
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${type.tone}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setStep(1);
                  setSelectedType(null);
                }}
                className="-ml-1 flex items-center gap-1 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Back
              </motion.button>

              {selectedConfig && (
                <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-slate-900/60 p-3">
                  <img
                    src={selectedConfig.image}
                    alt=""
                    className="h-14 w-14 rounded-xl border border-white/10 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-100">
                      {selectedConfig.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {selectedConfig.description}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  placeholder={`e.g., ${selectedConfig?.example || "Group Event"}`}
                  autoFocus
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !isSubmitting &&
                      groupName.trim()
                    ) {
                      handleCreate();
                    }
                  }}
                  className="w-full rounded-xl border border-white/8 bg-slate-700/50 px-4 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="rounded-xl border border-indigo-500/30 bg-indigo-600/20 p-3">
                <p className="text-xs font-medium text-indigo-300">
                  You can invite members after creating the group.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex gap-3 border-t border-white/6 bg-slate-700/50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/8 px-4 py-3 font-semibold text-slate-300 transition-colors hover:bg-slate-700"
          >
            Cancel
          </button>
          {step === 2 && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              disabled={isSubmitting || !groupName.trim()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 font-semibold text-white transition-all hover:from-indigo-500 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
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
