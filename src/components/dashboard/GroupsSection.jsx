"use client";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, Briefcase, Home, MapPin, Plus, Users, Utensils,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const getGroupConfig = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("trip") || n.includes("travel"))
    return { Icon: MapPin, bg: "bg-sky-500/10", color: "text-sky-400" };
  if (n.includes("food") || n.includes("lunch") || n.includes("dinner"))
    return { Icon: Utensils, bg: "bg-emerald-500/10", color: "text-emerald-400" };
  if (n.includes("room") || n.includes("home") || n.includes("flat"))
    return { Icon: Home, bg: "bg-violet-500/10", color: "text-violet-400" };
  if (n.includes("office") || n.includes("work"))
    return { Icon: Briefcase, bg: "bg-amber-500/10", color: "text-amber-400" };
  return { Icon: Users, bg: "bg-indigo-500/10", color: "text-indigo-400" };
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function GroupsSection({ onCreateGroup }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios
      .get("/api/groups")
      .then((res) => setGroups(res.data.groups || []))
      .catch(() => toast.error("Failed to load groups"))
      .finally(() => setLoading(false));
  }, []);

  const visible = groups.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-slate-800 rounded-2xl border border-white/6 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-bold text-slate-100 tracking-tight">Groups</h2>
          {!loading && groups.length > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/8 text-slate-400">
              {groups.length}
            </span>
          )}
        </div>
        <button
          onClick={() => router.push("/dashboard/groups")}
          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors"
        >
          See all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="h-px bg-white/6 mx-5" />

      {/* Loading skeleton */}
      {loading && (
        <div className="p-5 space-y-4">
          {[1, 2, 3].map((x) => (
            <div key={x} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-white/5 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-white/5 rounded-full w-32" />
                <div className="h-2.5 bg-white/4 rounded-full w-20" />
              </div>
              <div className="h-3 bg-white/5 rounded-full w-8" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && groups.length === 0 && (
        <div className="py-14 px-5 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-sm font-semibold text-slate-200 mb-1">No groups yet</p>
          <p className="text-xs text-slate-500 mb-5 max-w-[200px] leading-relaxed">
            Create a group to start splitting expenses with friends
          </p>
          <button
            onClick={onCreateGroup}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Group
          </button>
        </div>
      )}

      {/* Groups list */}
      {!loading && visible.length > 0 && (
        <div>
          <AnimatePresence>
            {visible.map((group, i) => {
              const { Icon, bg, color } = getGroupConfig(group.name);
              const memberCount = group.members?.length || 0;
              const created = group.createdAt ? fmtDate(group.createdAt) : null;

              return (
                <motion.button
                  key={group._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => router.push(`/dashboard/groups/${group._id}`)}
                  className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-white/4 transition-colors group text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon className={`w-4.5 h-4.5 ${color}`} strokeWidth={1.75} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate leading-tight group-hover:text-slate-100 transition-colors">
                      {group.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {memberCount} member{memberCount !== 1 ? "s" : ""}
                      {created ? ` · ${created}` : ""}
                    </p>
                  </div>

                  <ArrowRight
                    className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0"
                    strokeWidth={2}
                  />
                </motion.button>
              );
            })}
          </AnimatePresence>

          {groups.length > 6 && (
            <div className="px-5 py-3.5 border-t border-white/6">
              <button
                onClick={() => router.push("/dashboard/groups")}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-400 transition-colors"
              >
                +{groups.length - 6} more groups
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
