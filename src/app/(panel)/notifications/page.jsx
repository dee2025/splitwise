"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCheck,
  Info,
  Trash2,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const TYPE_CONFIG = {
  expense: {
    icon: Wallet,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-l-green-400",
  },
  group: {
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-l-blue-400",
  },
  reminder: {
    icon: Calendar,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-l-orange-400",
  },
  alert: {
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-l-red-400",
  },
  default: {
    icon: Info,
    color: "text-gray-600",
    bg: "bg-gray-100",
    border: "border-l-gray-400",
  },
};

function formatTime(dateString) {
  const date = new Date(dateString);
  const diffH = (Date.now() - date) / 3600000;
  if (diffH < 1) return `${Math.floor(diffH * 60)}m ago`;
  if (diffH < 24) return `${Math.floor(diffH)}h ago`;
  if (diffH < 168) return `${Math.floor(diffH / 24)}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      } else {
        toast.error("Failed to fetch notifications");
      }
    } catch {
      toast.error("Error loading notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
        );
      }
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("All marked as read");
      }
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const deleteSelected = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: Array.from(selected) }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => !selected.has(n._id)));
        setSelected(new Set());
        setShowDeleteConfirm(false);
        toast.success("Deleted successfully");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.isRead;
    if (activeFilter === "read") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-slate-100 tracking-tight mb-1">
                Notifications
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {unreadCount} unread · {notifications.length} total
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-950/60"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>
        </motion.div>

        {/* Filter Pills */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: "all", label: "All" },
            {
              id: "unread",
              label: `Unread${unreadCount ? ` (${unreadCount})` : ""}`,
            },
            { id: "read", label: "Read" },
          ].map((f) => (
            <motion.button
              key={f.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold ${
                activeFilter === f.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-950/60"
                  : "bg-white/5 border-white/8 text-slate-300 hover:bg-white/10 hover:border-white/15"
              }`}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

        {/* Bulk action bar */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between bg-slate-800 text-slate-100 px-4 py-3 rounded-lg border border-white/6"
            >
              <span className="text-sm font-semibold">
                {selected.size} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-600/30 hover:border-red-500/50 transition-all text-xs font-semibold"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {loading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-800 rounded-lg border border-white/6 p-3 animate-pulse"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-700/50 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-slate-800 rounded-lg border border-white/6"
          >
            <div className="w-12 h-12 rounded-lg bg-indigo-600/20 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 mb-1">
              {activeFilter === "all"
                ? "No notifications"
                : `No ${activeFilter} notifications`}
            </h3>
            <p className="text-slate-400 text-xs max-w-xs mx-auto">
              {activeFilter === "all"
                ? "You're all caught up! New notifications will appear here."
                : "Try switching the filter above."}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {filtered.map((n, i) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.default;
                const Icon = cfg.icon;
                const isSelected = selected.has(n._id);

                return (
                  <motion.div
                    key={n._id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -80 }}
                    transition={{
                      duration: 0.18,
                      delay: Math.min(i * 0.03, 0.2),
                    }}
                    whileHover={{ y: -1 }}
                    onClick={() => {
                      if (!n.isRead) markAsRead(n._id);
                    }}
                    className={`group relative bg-slate-800 rounded-lg border transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "border-indigo-500/50 bg-slate-800/80"
                        : !n.isRead
                          ? "border-white/6 hover:border-white/10 hover:bg-slate-700/50"
                          : "border-white/4 hover:border-white/8"
                    }`}
                  >
                    <div className="p-3.5 flex items-start gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(n._id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 w-4 h-4 rounded accent-indigo-600 bg-slate-700/50 border border-white/8 shrink-0 cursor-pointer"
                      />

                      {/* Icon */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-indigo-600/20"
                            : cfg.accentBg || "bg-white/5"
                        }`}
                      >
                        <Icon
                          size={16}
                          className={cfg.color || "text-slate-400"}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p
                            className={`text-sm font-semibold leading-tight ${
                              !n.isRead ? "text-slate-100" : "text-slate-400"
                            }`}
                          >
                            {n.title}
                          </p>
                          <span className="text-xs text-slate-500 whitespace-nowrap font-medium">
                            {formatTime(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        {!n.isRead && (
                          <span className="inline-block mt-1.5 w-1.5 h-1.5 rounded-full bg-black" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Delete confirm modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-4 backdrop-blur-[2px]"
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                className="bg-white rounded-xl border-2 border-black shadow-sketch w-full max-w-sm p-6"
              >
                {/* Corner accents */}
                <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-gray-300 pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-gray-300 pointer-events-none" />

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 border-2 border-red-400 bg-red-50 rounded-lg flex items-center justify-center">
                    <Trash2 size={18} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      Delete Notifications
                    </h3>
                    <p className="text-gray-500 text-xs">
                      This cannot be undone
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="ml-auto p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>

                <p className="text-gray-700 text-sm mb-5">
                  Delete <span className="font-bold">{selected.size}</span>{" "}
                  selected notification{selected.size > 1 ? "s" : ""}?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-400 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={deleteSelected}
                    className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg border-2 border-black hover:bg-gray-800 transition-all text-sm font-medium shadow-sketch-sm"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
