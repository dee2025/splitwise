// components/dashboard/groups/GroupsPage.js
"use client";

import GroupCard from "@/components/dashboard/groups/all/GroupCard";
import GroupSettingsModal from "@/components/dashboard/groups/all/GroupSettingsModal";
import CreateGroupForm from "@/components/dashboard/groups/CreateGroupForm";
import DashboardLayout from "@/components/DashboardLayout";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Crown,
  FolderOpen,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  WalletCards,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

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

function getMemberName(member) {
  return (
    member?.fullName ||
    member?.name ||
    member?.username ||
    member?.userId?.fullName ||
    member?.userId?.name ||
    member?.userId?.username ||
    ""
  );
}

function formatMoney(value) {
  return `INR ${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function isGroupAdmin(group, user) {
  const currentUserId = getNormalizedId(user);
  return (group?.members || []).some((member) => {
    const memberId = getNormalizedId(member?.userId || member);
    return memberId === currentUserId && member?.role === "admin";
  });
}

export default function GroupsPage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const router = useRouter();

  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchGroups = async () => {
      try {
        setLoading(true);
        const [groupsRes, expensesRes] = await Promise.all([
          axios.get("/api/groups"),
          axios.get("/api/expenses").catch(() => ({ data: { expenses: [] } })),
        ]);
        setGroups(groupsRes.data.groups || []);
        setExpenses(expensesRes.data.expenses || []);
      } catch (error) {
        console.error("Error fetching groups:", error);
        toast.error("Failed to load groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [isAuthenticated, router]);

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return groups.filter((group) => {
      const matchesSearch =
        !query ||
        group.name?.toLowerCase().includes(query) ||
        group.description?.toLowerCase().includes(query) ||
        (group.members || []).some((member) =>
          getMemberName(member).toLowerCase().includes(query),
        );

      if (!matchesSearch) return false;

      if (activeFilter === "admin") return isGroupAdmin(group, user);
      if (activeFilter === "member") return !isGroupAdmin(group, user);

      return true;
    });
  }, [activeFilter, groups, searchQuery, user]);

  const stats = useMemo(() => {
    const totalExpenses = groups.reduce(
      (sum, group) => sum + Number(group.totalExpenses || 0),
      0,
    );
    const totalMembers = groups.reduce(
      (sum, group) => sum + (group.members?.length || 0),
      0,
    );
    const adminGroups = groups.filter((group) => isGroupAdmin(group, user)).length;

    return {
      totalGroups: groups.length,
      totalMembers,
      totalExpenses,
      adminGroups,
    };
  }, [groups, user]);

  const groupBalances = useMemo(() => {
    const currentUserId = getNormalizedId(user);
    const balances = {};

    for (const expense of expenses) {
      const groupId = getNormalizedId(expense.groupId);
      if (!groupId) continue;

      const payerId = getNormalizedId(expense.paidBy);
      const mySplit = (expense.splitBetween || []).find(
        (split) => getNormalizedId(split.userId) === currentUserId,
      );
      const splitAmount = Number(mySplit?.amount || 0);
      const amount = Number(expense.amount || 0);

      if (payerId === currentUserId) {
        balances[groupId] = (balances[groupId] || 0) + Math.max(amount - splitAmount, 0);
      } else {
        balances[groupId] = (balances[groupId] || 0) - splitAmount;
      }
    }

    return balances;
  }, [expenses, user]);

  const handleGroupClick = (groupId) => {
    router.push(`/groups/${groupId}`);
  };

  const handleSettingsClick = (group, event) => {
    event.stopPropagation();
    if (!isGroupAdmin(group, user)) return;

    setSelectedGroup(group);
    setShowSettingsModal(true);
  };

  const handleGroupCreated = (newGroup) => {
    setGroups((prev) => [newGroup, ...prev]);
    setShowCreateGroup(false);
    toast.success("Group created successfully!");
  };

  const handleGroupUpdated = (updatedGroup) => {
    setGroups((prev) =>
      prev.map((group) =>
        group._id === updatedGroup._id ? updatedGroup : group,
      ),
    );
    setShowSettingsModal(false);
    setSelectedGroup(null);
  };

  const handleGroupDeleted = (groupId) => {
    setGroups((prev) => prev.filter((group) => group._id !== groupId));
    setShowSettingsModal(false);
    setSelectedGroup(null);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-white/10 bg-slate-900 p-8 text-center shadow-2xl shadow-black/50"
        >
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-400" />
          <p className="font-medium text-slate-200">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="min-w-0">
           
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Your Groups
            </h1>
            {/* <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Open a group to add expenses, edit details, invite members, and
              review the latest split summary.
            </p> */}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateGroup(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition-colors hover:bg-indigo-500 sm:w-auto"
          >
            <Plus size={18} />
            <span>Create Group</span>
          </motion.button>
        </motion.div>

        {/* <StatsGrid stats={stats} /> */}

        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by group, description, or member"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-lg border border-white/8 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="inline-flex items-center gap-1 rounded-md border border-white/8 bg-slate-900 px-2.5 py-2 text-xs font-semibold text-slate-400">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              View
            </span>
            {[
              { id: "all", label: "All", count: groups.length },
              { id: "admin", label: "Admin", count: stats.adminGroups },
              {
                id: "member",
                label: "Member",
                count: Math.max(groups.length - stats.adminGroups, 0),
              },
            ].map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  activeFilter === filter.id
                    ? "border-indigo-500/50 bg-indigo-600 text-white"
                    : "border-white/8 bg-slate-900 text-slate-300 hover:border-white/14 hover:bg-slate-800"
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.16 }}
        >
          {loading ? (
            <GroupsLoadingState />
          ) : filteredGroups.length === 0 ? (
            <EmptyGroupsState
              searchQuery={searchQuery}
              activeFilter={activeFilter}
              onClearFilters={clearFilters}
              onCreateGroup={() => setShowCreateGroup(true)}
            />
          ) : (
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3">
              <AnimatePresence>
                {filteredGroups.map((group, index) => (
                  <GroupCard
                    key={group._id}
                    group={group}
                    index={index}
                    onClick={() => handleGroupClick(group._id)}
                    onSettingsClick={(event) =>
                      handleSettingsClick(group, event)
                    }
                    currentUser={user}
                    balance={groupBalances[group._id] || 0}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showCreateGroup && (
          <CreateGroupForm
            onClose={() => setShowCreateGroup(false)}
            onGroupCreated={handleGroupCreated}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettingsModal && selectedGroup && (
          <GroupSettingsModal
            group={selectedGroup}
            onClose={() => {
              setShowSettingsModal(false);
              setSelectedGroup(null);
            }}
            onGroupUpdated={handleGroupUpdated}
            onGroupDeleted={handleGroupDeleted}
            currentUser={user}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

function StatsGrid({ stats }) {
  const cards = [
    {
      label: "Groups",
      value: stats.totalGroups,
      detail: "active workspaces",
      icon: FolderOpen,
      tone: "border-indigo-500/25 bg-indigo-500/10 text-indigo-300",
    },
    {
      label: "Members",
      value: stats.totalMembers,
      detail: "across all groups",
      icon: Users,
      tone: "border-sky-500/25 bg-sky-500/10 text-sky-300",
    },
    {
      label: "Total Spend",
      value: formatMoney(stats.totalExpenses),
      detail: "tracked in groups",
      icon: WalletCards,
      tone: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    },
    {
      label: "Admin",
      value: stats.adminGroups,
      detail: "groups you manage",
      icon: Crown,
      tone: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-xl border border-white/8 bg-slate-900 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                <p className="mt-2 truncate text-2xl font-bold text-slate-100">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{card.detail}</p>
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${card.tone}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GroupsLoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <motion.div
          key={item}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: item * 0.05 }}
          className="rounded-xl border border-white/8 bg-slate-900 p-4"
        >
          <div className="mb-4 flex items-start gap-3">
            <div className="h-12 w-12 animate-pulse rounded-lg bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 animate-pulse rounded bg-slate-800" />
              <div className="h-3 w-48 animate-pulse rounded bg-slate-800" />
            </div>
          </div>
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="h-16 animate-pulse rounded-lg bg-slate-800" />
            <div className="h-16 animate-pulse rounded-lg bg-slate-800" />
            <div className="h-16 animate-pulse rounded-lg bg-slate-800" />
          </div>
          <div className="h-10 animate-pulse rounded-lg bg-slate-800" />
        </motion.div>
      ))}
    </div>
  );
}

function EmptyGroupsState({
  searchQuery,
  activeFilter,
  onClearFilters,
  onCreateGroup,
}) {
  const isFiltered = Boolean(searchQuery || activeFilter !== "all");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-dashed border-white/10 bg-slate-900 px-6 py-14 text-center"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-white/8 bg-slate-800">
        <Users className="h-8 w-8 text-slate-500" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-100">
        {isFiltered ? "No groups found" : "No groups yet"}
      </h3>
      <p className="mx-auto mb-6 max-w-sm text-sm text-slate-400">
        {isFiltered
          ? "Try a different search term or reset the current view."
          : "Create your first group, add members, and start tracking shared expenses."}
      </p>

      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
        {isFiltered && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700"
          >
            Clear filters
          </button>
        )}
        <button
          type="button"
          onClick={onCreateGroup}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          <Plus size={18} />
          Create Group
        </button>
      </div>
    </motion.div>
  );
}
