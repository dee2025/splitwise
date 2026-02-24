"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import DashboardLayout from "@/components/DashboardLayout";
import AddExpenseModal from "@/components/dashboard/AddExpenseModal";
import GroupsSection from "@/components/dashboard/GroupsSection";
import RecentExpenses from "@/components/dashboard/RecentExpences";
import StatsCards from "@/components/dashboard/StatsCards";
import CreateGroupForm from "@/components/dashboard/groups/CreateGroupForm";

export default function Dashboard() {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const router = useRouter();

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupsKey, setGroupsKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated && !loading) router.push("/login");
  }, [isAuthenticated, loading, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
      </div>
    );
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.fullName?.split(" ")[0] || "there";

  const handleGroupCreated = () => {
    setShowCreateGroup(false);
    setGroupsKey((k) => k + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-8">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 pt-1"
        >
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">
              {greeting()}, {firstName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Your expense overview
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/8 text-slate-300 rounded-xl text-xs font-semibold hover:bg-white/10 hover:text-slate-100 hover:border-white/15 transition-all"
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">New Group</span>
            </button>

            <button
              onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-950/60"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              Add Expense
            </button>
          </div>
        </motion.div>

        {/* ── Balance + Stats ── */}
        <StatsCards />

        {/* ── Groups + Activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <GroupsSection
              key={groupsKey}
              onCreateGroup={() => setShowCreateGroup(true)}
            />
          </div>
          <div className="lg:col-span-2">
            <RecentExpenses compact />
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showAddExpense && (
          <AddExpenseModal onClose={() => setShowAddExpense(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateGroup && (
          <CreateGroupForm
            onClose={() => setShowCreateGroup(false)}
            onGroupCreated={handleGroupCreated}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
