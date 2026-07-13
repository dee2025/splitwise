// components/dashboard/groups/GroupCard.js
"use client";

import { getGroupTypeConfig } from "@/utils/groupUtils";
import { motion } from "framer-motion";
import { ArrowRight, Crown, Settings, Users } from "lucide-react";

function getDisplayName(member) {
  return (
    member?.fullName ||
    member?.userId?.fullName ||
    member?.name ||
    member?.userId?.name ||
    member?.username ||
    member?.userId?.username ||
    "Unknown User"
  );
}

function getNormalizedId(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "object") {
    if (value._id) return String(value._id);
    if (value.id) return String(value.id);
    if (value.userId) return getNormalizedId(value.userId);
  }
  return "";
}

function formatMoney(value) {
  return `INR ${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "No date";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(member) {
  return (
    getDisplayName(member)
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
}

export default function GroupCard({
  group,
  index,
  onClick,
  onSettingsClick,
  currentUser,
}) {
  const memberCount = group.members?.length || 0;
  const totalExpenses = Number(group.totalExpenses || 0);
  const createdDate = formatDate(group.createdAt);

  const config = getGroupTypeConfig(group);
  const IconComponent = config.icon;

  const currentUserId = getNormalizedId(currentUser);
  const isAdmin = group.members?.some((member) => {
    const memberId = getNormalizedId(member?.userId || member);
    return memberId === currentUserId && member.role === "admin";
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-xl border border-white/8 bg-slate-900 transition-colors hover:border-indigo-500/35 hover:bg-slate-800/70"
    >
      <div className="flex h-full flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {group.image ? (
              <img
                src={group.image}
                alt={group.name}
                className="h-12 w-12 shrink-0 rounded-lg border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
                <IconComponent className="h-6 w-6 text-indigo-300" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h3 className="max-w-full truncate text-base font-bold text-slate-50">
                  {group.name}
                </h3>
                {/* {isAdmin && (
                  <div className="flex">
                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                      <Crown className="h-3 w-3" />
                      Admin
                    </span>
                    <span className="font-semibold text-emerald-300">
                      {formatMoney(totalExpenses)}
                    </span>
                  </div>
                )} */}
              </div>

              {/* <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-md border border-white/8 bg-slate-800 px-2 py-0.5 font-semibold text-indigo-200">
                  {config.label}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {createdDate}
                </span>
                <span className="font-semibold text-emerald-300">
                  {formatMoney(totalExpenses)}
                </span>
              </div> */}
            </div>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="shrink-0 rounded-lg border border-white/8 bg-slate-800 p-2 text-slate-300 transition-colors hover:border-indigo-500/35 hover:bg-slate-700 hover:text-indigo-200"
              onClick={onSettingsClick}
              title="Group settings"
            >
              <Settings size={16} />
            </button>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex -space-x-2">
              {group.members?.slice(0, 4).map((member, idx) => (
                <div
                  key={member._id || `${getDisplayName(member)}-${idx}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-700 text-xs font-bold text-slate-100"
                  title={getDisplayName(member)}
                >
                  {getInitials(member)}
                </div>
              ))}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-300">
                <Users className="mr-1 inline h-3.5 w-3.5 text-sky-300" />
                {memberCount > 0
                  ? `${memberCount} member${memberCount === 1 ? "" : "s"}`
                  : "No members"}
              </p>
              {memberCount > 4 && (
                <p className="text-xs text-slate-500">
                  +{memberCount - 4} more
                </p>
              )}
            </div>
          </div>

          <div className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/8 bg-slate-800 px-3 py-2 text-xs font-semibold text-indigo-200 transition-colors group-hover:border-indigo-500/35 group-hover:bg-indigo-500/10">
            Open
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
