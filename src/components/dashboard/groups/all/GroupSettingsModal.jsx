// components/dashboard/groups/GroupSettingsModal.js
"use client";

import {
  GROUP_TYPE_OPTIONS,
  getGroupTypeConfig,
  normalizeGroupType,
} from "@/utils/groupUtils";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Edit,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
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
    image: group.image || "",
    type: normalizeGroupType(group.type),
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const groupTypeConfig = getGroupTypeConfig({ type: editForm.type });

  const handleImageUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "groups");

    setIsUploadingImage(true);
    try {
      const res = await axios.post("/api/uploads/image", formData);
      setEditForm((prev) => ({ ...prev, image: res.data.path }));
      toast.success("Group image uploaded");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-slate-800 rounded-2xl border border-white/8 shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-white/8 pb-3">
              <h3 className="text-lg font-bold text-slate-100">
                Group Settings
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Edit Group Form */}
            <form onSubmit={handleUpdateGroup} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Group Image
                </label>
                <div className="grid grid-cols-[72px_1fr] gap-3 rounded-lg border border-white/8 bg-slate-900/60 p-3">
                  <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-slate-700/50">
                    <img
                      src={editForm.image || groupTypeConfig.image}
                      alt="Group preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-indigo-500/35 bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500">
                      {isUploadingImage ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      {isUploadingImage ? "Uploading" : "Upload image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        disabled={isUploadingImage}
                        onChange={(event) => {
                          handleImageUpload(event.target.files?.[0]);
                          event.target.value = "";
                        }}
                      />
                    </label>
                    {editForm.image && (
                      <button
                        type="button"
                        onClick={() => setEditForm((prev) => ({ ...prev, image: "" }))}
                        className="ml-2 text-xs font-semibold text-slate-400 hover:text-rose-300"
                      >
                        Remove
                      </button>
                    )}
                    <p className="truncate text-xs text-slate-500">
                      {editForm.image
                        ? editForm.image
                        : `${groupTypeConfig.label} fallback image is active`}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Group Category
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {GROUP_TYPE_OPTIONS.map((type) => {
                    const Icon = type.icon;
                    const selected = editForm.type === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() =>
                          setEditForm((prev) => ({ ...prev, type: type.id }))
                        }
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                          selected
                            ? "border-indigo-500/50 bg-indigo-600/20"
                            : "border-white/8 bg-slate-900/60 hover:bg-slate-700/40"
                        }`}
                      >
                        <img
                          src={type.image}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded-lg object-cover"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-100">
                            {type.label}
                          </span>
                        </span>
                        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
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
                  className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-white/10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
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
                  className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-white/10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg border border-indigo-500 hover:bg-indigo-500 transition-all duration-150 font-medium"
              >
                <Edit size={16} />
                Update Group
              </button>
            </form>

            {/* Danger Zone */}
            <div className="border-t border-white/8 pt-4">
              <h4 className="font-medium text-rose-400 mb-3">Danger Zone</h4>
              <button
                onClick={handleDeleteGroup}
                className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg border border-rose-500 hover:bg-rose-500 transition-all duration-150 font-medium w-full justify-center"
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
