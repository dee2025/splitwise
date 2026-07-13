"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { getGroupDisplayImage } from "@/utils/groupUtils";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  IndianRupee,
  Plus,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

function getId(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value._id) return String(value._id);
  if (value.id) return String(value.id);
  if (value.userId) return getId(value.userId);
  return "";
}

function formatMoney(value) {
  const amount = Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
  return `\u20B9${amount}`;
}

function firstName(name = "") {
  return name.trim().split(/\s+/)[0] || "there";
}

function initials(name = "") {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getExpenseSide(expense, userId) {
  const payerId = getId(expense.paidBy);
  const mySplit = (expense.splitBetween || []).find((split) => getId(split.userId) === userId);
  const splitAmount = Number(mySplit?.amount || 0);
  const amount = Number(expense.amount || 0);

  if (payerId === userId) {
    return { owed: Math.max(amount - splitAmount, 0), owe: 0 };
  }

  return { owed: 0, owe: splitAmount };
}

function computeBalances(expenses, userId) {
  return expenses.reduce(
    (result, expense) => {
      const side = getExpenseSide(expense, userId);
      result.owed += side.owed;
      result.owe += side.owe;
      return result;
    },
    { owed: 0, owe: 0 },
  );
}

function groupBalance(expenses, userId, groupId) {
  const balances = computeBalances(
    expenses.filter((expense) => getId(expense.groupId) === groupId),
    userId,
  );
  return balances.owed - balances.owe;
}

function GroupAvatar({ group }) {
  return (
    <img
      src={getGroupDisplayImage(group)}
      alt={group.name}
      className="h-12 w-12 rounded-2xl border border-white/10 object-cover"
    />
  );
}

function BalanceMetric({ label, value, detail, tone, icon: Icon }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Icon className={`h-3.5 w-3.5 ${tone}`} />
        {label}
      </div>
      <p className={`truncate text-2xl font-bold ${tone}`}>{formatMoney(value)}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      axios.get("/api/groups"),
      axios.get("/api/expenses"),
      axios.get("/api/users/profile").catch(() => ({ data: { user: null } })),
    ])
      .then(([groupsRes, expensesRes, profileRes]) => {
        if (!mounted) return;
        setGroups(groupsRes.data.groups || []);
        setExpenses(expensesRes.data.expenses || []);
        setProfile(profileRes.data.user || null);
      })
      .catch(() => toast.error("Failed to load home data"))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const userId = getId(user);
  const displayName = profile?.fullName || user?.fullName || "User";

  const summary = useMemo(() => {
    const balances = computeBalances(expenses, userId);
    const net = balances.owed - balances.owe;
    return {
      owed: balances.owed,
      owe: balances.owe,
      net,
      peopleCount: new Set(
        expenses.flatMap((expense) => [
          getId(expense.paidBy),
          ...(expense.splitBetween || []).map((split) => getId(split.userId)),
        ]),
      ).size,
      totalRecorded: expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    };
  }, [expenses, userId]);

  const topGroups = useMemo(() => {
    return groups
      .map((group) => ({
        ...group,
        balance: groupBalance(expenses, userId, group._id),
      }))
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
      .slice(0, 4);
  }, [expenses, groups, userId]);

  const recentExpenses = expenses.slice(0, 4);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-md space-y-5 pb-8 lg:max-w-5xl">
        {/* <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Link href="/home" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-100">
              moneysplit<span className="text-indigo-300">.in</span>
            </span>
          </Link>

          <Link
            href="/notifications"
            className="relative rounded-xl border border-white/8 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400" />
          </Link>
        </motion.header> */}

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="flex items-center gap-3"
        >
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt={displayName}
              className="h-14 w-14 rounded-2xl border border-white/10 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-sm font-bold text-emerald-200">
              {initials(displayName)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-100">
              Hi {firstName(displayName)}
            </h1>
            <p className="text-sm text-slate-500">Let&apos;s settle smartly.</p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="overflow-hidden rounded-2xl border border-white/8 bg-slate-900 shadow-2xl shadow-black/20"
        >
          <div className="flex items-stretch gap-4 p-5">
            {loading ? (
              <>
                <div className="h-20 min-w-0 flex-1 animate-pulse rounded-xl bg-white/5" />
                <div className="w-px shrink-0 bg-white/8" />
                <div className="h-20 min-w-0 flex-1 animate-pulse rounded-xl bg-white/5" />
              </>
            ) : (
              <>
                <BalanceMetric
                  label="You are owed"
                  value={summary.owed}
                  detail={`from ${summary.peopleCount || 0} people`}
                  tone="text-emerald-300"
                  icon={TrendingUp}
                />
                <div className="w-px shrink-0 bg-white/8" />
                <BalanceMetric
                  label="You owe"
                  value={summary.owe}
                  detail={`across ${groups.length} groups`}
                  tone="text-rose-300"
                  icon={TrendingDown}
                />
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.push("/expenses")}
            className="flex w-full items-center justify-between border-t border-white/8 bg-slate-950/45 px-5 py-4 text-left transition-colors hover:bg-slate-800/70"
          >
            <span className="inline-flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                <WalletCards className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-300">Overall balance</span>
                <span className="block text-xs text-slate-500">{formatMoney(summary.totalRecorded)} recorded</span>
              </span>
            </span>
            <span className={`text-lg font-bold ${summary.net >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
              {formatMoney(Math.abs(summary.net))}
            </span>
          </button>
        </motion.section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100">Your Groups</h2>
            <Link href="/groups" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              [0, 1, 2].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-2xl border border-white/8 bg-slate-900" />
              ))
            ) : topGroups.length ? (
              topGroups.map((group, index) => {
                const balance = Number(group.balance || 0);
                const isPositive = balance >= 0;
                return (
                  <motion.button
                    key={group._id}
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.04 }}
                    onClick={() => router.push(`/groups/${group._id}`)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-slate-900 p-3 text-left shadow-lg shadow-black/10 transition-colors hover:border-indigo-500/35 hover:bg-slate-800"
                  >
                    <GroupAvatar group={group} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-100">{group.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {(group.members?.length || 0)} member{(group.members?.length || 0) === 1 ? "" : "s"}
                      </p>
                      <p className={`mt-1 text-xs font-semibold ${isPositive ? "text-emerald-300" : "text-rose-300"}`}>
                        {balance === 0
                          ? "Settled up"
                          : isPositive
                            ? `You are owed ${formatMoney(balance)}`
                            : `You owe ${formatMoney(Math.abs(balance))}`}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-semibold text-slate-500">Total Expenses</p>
                      <p className="mt-1 text-sm font-bold text-slate-200">
                        {formatMoney(group.totalExpenses)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-500" />
                  </motion.button>
                );
              })
            ) : (
              <div className="rounded-2xl border border-white/8 bg-slate-900 p-6 text-center">
                <Users className="mx-auto mb-3 h-8 w-8 text-slate-500" />
                <p className="text-sm font-semibold text-slate-200">No groups yet</p>
                <p className="mt-1 text-xs text-slate-500">Create a group to start splitting expenses.</p>
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/8 bg-slate-900 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-100">Recent Activity</h2>
              <Link href="/expenses" className="text-xs font-semibold text-indigo-300 hover:text-indigo-200">
                See all
              </Link>
            </div>
            <div className="space-y-3">
              {recentExpenses.length ? (
                recentExpenses.map((expense) => (
                  <div key={expense._id} className="flex items-center gap-3 rounded-xl bg-slate-950/70 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                      <ReceiptText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-200">{expense.description}</p>
                      <p className="text-xs text-slate-500">{formatDate(expense.date)}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-200">{formatMoney(expense.amount)}</p>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-slate-500">No expense activity yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/8 bg-slate-900 p-4">
            <h2 className="mb-4 text-sm font-bold text-slate-100">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/groups" className="rounded-xl border border-white/8 bg-slate-950/70 p-4 hover:bg-slate-800">
                <Users className="mb-3 h-5 w-5 text-indigo-300" />
                <p className="text-sm font-bold text-slate-100">Groups</p>
                <p className="mt-1 text-xs text-slate-500">{groups.length} active</p>
              </Link>
              <Link href="/expenses" className="rounded-xl border border-white/8 bg-slate-950/70 p-4 hover:bg-slate-800">
                <Plus className="mb-3 h-5 w-5 text-emerald-300" />
                <p className="text-sm font-bold text-slate-100">Add expense</p>
                <p className="mt-1 text-xs text-slate-500">Track a split</p>
              </Link>
              <Link href="/notifications" className="rounded-xl border border-white/8 bg-slate-950/70 p-4 hover:bg-slate-800">
                <Bell className="mb-3 h-5 w-5 text-amber-300" />
                <p className="text-sm font-bold text-slate-100">Alerts</p>
                <p className="mt-1 text-xs text-slate-500">Updates</p>
              </Link>
              <Link href="/profile" className="rounded-xl border border-white/8 bg-slate-950/70 p-4 hover:bg-slate-800">
                <UserRound className="mb-3 h-5 w-5 text-violet-300" />
                <p className="text-sm font-bold text-slate-100">Profile</p>
                <p className="mt-1 text-xs text-slate-500">Account</p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
