// components/dashboard/groups/GroupCard.js
"use client";

import { getGroupDisplayImage } from "@/utils/groupUtils";
import { motion } from "framer-motion";
import { ArrowRight, Settings, Users } from "lucide-react";

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
  const amount = Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
  return `\u20B9${amount}`;
}

export default function GroupCard({
  group,
  index,
  onClick,
  onSettingsClick,
  currentUser,
  balance = 0,
}) {
  const memberCount = group.members?.length || 0;
  const totalExpenses = Number(group.totalExpenses || 0);
  const displayImage = getGroupDisplayImage(group);
  const roundedBalance = Math.round(Number(balance || 0));
  const isSettled = Math.abs(roundedBalance) <= 0;
  const balanceTone = isSettled
    ? "text-emerald-300"
    : roundedBalance > 0
      ? "text-emerald-300"
      : "text-rose-300";
  const balanceText = isSettled
    ? "Settled up"
    : roundedBalance > 0
      ? `You are owed ${formatMoney(roundedBalance)}`
      : `You owe ${formatMoney(Math.abs(roundedBalance))}`;

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
      className="group cursor-pointer overflow-hidden rounded-2xl border border-white/8 bg-slate-900 transition-colors hover:border-indigo-500/35 hover:bg-slate-800/70"
    >
      <div className="flex items-center gap-3 p-3.5 sm:p-4">
        <img
          src={displayImage}
          alt={group.name}
          className="h-12 w-12 shrink-0 rounded-2xl border border-white/10 object-cover sm:h-14 sm:w-14"
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-slate-50 sm:text-base">
            {group.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-500">
            <Users className="h-3.5 w-3.5 text-sky-300" />
            {memberCount} member{memberCount === 1 ? "" : "s"}
          </p>
          <p className={`mt-1 truncate text-xs font-bold sm:text-sm ${balanceTone}`}>
            {balanceText}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="text-right">
            <p className="text-[11px] font-semibold text-slate-500">
              Total Expenses
            </p>
            <p className="mt-1 text-sm font-bold text-slate-100 sm:text-base">
              {formatMoney(totalExpenses)}
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="rounded-xl border border-white/8 bg-slate-800 p-2 text-slate-400 transition-colors hover:border-indigo-500/35 hover:bg-slate-700 hover:text-indigo-200"
              onClick={onSettingsClick}
              title="Group settings"
            >
              <Settings size={15} />
            </button>
          )}

          <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-300" />
        </div>
      </div>
    </motion.article>
  );
}
