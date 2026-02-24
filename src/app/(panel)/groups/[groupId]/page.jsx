"use client";

import AddExpenseForm from "@/components/dashboard/expenses/AddExpenseForm";
import AddMembersModal from "@/components/dashboard/groups/AddMembersModal";
import DashboardLayout from "@/components/DashboardLayout";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Flag,
  IndianRupee,
  Loader,
  Music,
  Plane,
  Plug,
  Plus,
  Receipt,
  ShoppingBag,
  UserPlus,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandMembers, setExpandMembers] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [completingTrip, setCompletingTrip] = useState(false);
  const [debts, setDebts] = useState([]);
  const [loadingDebts, setLoadingDebts] = useState(true);
  const [activeTab, setActiveTab] = useState("activity"); // "members" | "settlements" | "activity"

  const groupId = params.groupId;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchGroupData();
  }, [groupId, isAuthenticated, router]);

  useEffect(() => {
    if (group) {
      fetchDebts();
    }
  }, [group?._id]);

  const fetchDebts = async () => {
    try {
      setLoadingDebts(true);
      const res = await axios.get(`/api/groups/${group._id}/balances`);
      setDebts(res.data?.debts || []);
    } catch (error) {
      console.error("Error fetching debts:", error);
    } finally {
      setLoadingDebts(false);
    }
  };

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      console.log("📥 Fetching group data for groupId:", groupId);

      // Fetch group data
      const groupRes = await axios.get(`/api/groups/${groupId}`);
      console.log("✅ Group fetched:", groupRes.data.group.name);
      setGroup(groupRes.data.group);

      // Fetch expenses data
      try {
        const expensesRes = await axios.get(`/api/expenses?groupId=${groupId}`);
        console.log(
          "✅ Expenses fetched:",
          expensesRes.data.expenses?.length || 0,
        );
        setExpenses(expensesRes.data.expenses || []);
      } catch (expenseError) {
        console.warn(
          "⚠️ Error fetching expenses (non-critical):",
          expenseError,
        );
        // Don't fail completely if expenses fail to load
        setExpenses([]);
      }
    } catch (error) {
      console.error("❌ Error fetching group data:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to load group data";
      console.error("Error details:", {
        status: error.response?.status,
        message: errorMsg,
        groupId,
      });
      toast.error(errorMsg);
      // Only redirect if it's a 404 (group not found) or 401 (unauthorized)
      if (error.response?.status === 404 || error.response?.status === 401) {
        console.log("⚠️ Redirecting to /groups (403/401 error)");
        setTimeout(() => router.push("/groups"), 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = (newExpense) => {
    setExpenses((prev) => [newExpense, ...prev]);
    if (group) {
      setGroup((prev) => ({
        ...prev,
        totalExpenses: (prev.totalExpenses || 0) + newExpense.amount,
      }));
    }
  };

  const handleCompleteTrip = async () => {
    try {
      setCompletingTrip(true);
      const res = await axios.put(`/api/groups/complete-trip`, { groupId });
      setGroup(res.data.group);
      toast.success("Trip completed! Time to settle up!");
      setActiveTab("settlements");
    } catch (error) {
      console.error("Error completing trip:", error);
      toast.error(error.response?.data?.message || "Failed to complete trip");
    } finally {
      setCompletingTrip(false);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="w-full min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center p-6 border border-white/8 bg-slate-800 shadow-lg rounded-xl">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-100 font-medium">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="w-full min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center p-6 border border-white/8 bg-slate-800 shadow-lg rounded-xl">
          <p className="text-slate-100 font-medium mb-4">Group not found</p>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ y: 1 }}
            onClick={() => router.push("/groups")}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg border border-indigo-600 hover:bg-indigo-500 transition-all duration-150 font-medium mx-auto"
          >
            <ArrowLeft size={16} />
            Back to Groups
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full overflow-x-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className=""
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ y: 1 }}
                onClick={() => router.push("/groups")}
                className="shrink-0 p-2 border border-white/8 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all duration-150"
              >
                <ArrowLeft className="w-5 h-5 text-slate-300" />
              </motion.button>

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-1">
                  {group.name}
                </h1>
                {group.description && (
                  <p className="text-slate-400 text-sm truncate">
                    {group.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {group.tripStatus === "ongoing" &&
                user._id === group.createdBy && (
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 1 }}
                    onClick={handleCompleteTrip}
                    disabled={completingTrip}
                    className="flex items-center gap-2 bg-amber-600 text-white px-3 py-2.5 rounded-lg border border-amber-600 hover:bg-amber-500 transition-all duration-150 font-medium text-sm disabled:opacity-60"
                  >
                    {completingTrip ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <Flag size={16} />
                    )}
                    <span className="hidden sm:inline">End Trip</span>
                    <span className="sm:hidden">End</span>
                  </motion.button>
                )}
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ y: 1 }}
                onClick={() => setShowAddMembers(true)}
                className="flex items-center gap-1.5 sm:gap-2 bg-indigo-600 text-white px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg border border-indigo-600 hover:bg-indigo-500 transition-all duration-150 font-medium text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <UserPlus size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Members</span>
                <span className="sm:hidden">Add</span>
              </motion.button>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ y: 1 }}
                onClick={() => setShowAddExpense(true)}
                disabled={group.tripStatus === "completed"}
                className="flex items-center gap-1.5 sm:gap-2 bg-indigo-600 text-white px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-indigo-600 hover:bg-indigo-500 transition-all duration-150 font-medium text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Plus size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Add</span>
              </motion.button>
            </div>
          </div>

          {/* Group Stats */}
          {/* REMOVED - Keeping page clean and focused */}
        </motion.div>

        {/* Who Owes Who - Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full "
        >
          {/* Who Owes Who Section */}
          {loadingDebts ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : debts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 border border-white/8 rounded-xl bg-slate-800"
            >
              <div className="w-14 h-14 border border-white/8 rounded-lg flex items-center justify-center mx-auto mb-4 bg-slate-700">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">
                All Settled Up! ✓
              </h3>
              <p className="text-slate-400 text-sm">
                No pending payments in this group.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-100 mb-4">
                Who Owes Who
              </h2>
              <div className="space-y-2">
                {debts.map((debt, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-slate-800 rounded-xl border border-white/8 p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* <div className="w-8 h-8 rounded-full border border-white/12 bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300 shrink-0">
                          {debt.fromUser?.charAt(0).toUpperCase()}
                        </div> */}
                        <span className="text-sm  text-slate-100 truncate">
                          {debt.fromUser}
                        </span>
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-slate-500 shrink-0"
                      />
                      <div className="flex items-center gap-2 min-w-0">
                        {/* <div className="w-8 h-8 rounded-full border border-white/12 bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300 shrink-0">
                          {debt.toUser?.charAt(0).toUpperCase()}
                        </div> */}
                        <span className="text-sm  text-slate-100 truncate">
                          {debt.toUser}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-lg font-bold text-emerald-400">
                        ₹{debt.amount.toFixed(0)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs Section */}
          <div className="mt-8 bg-slate-800 rounded-xl border border-white/8 overflow-hidden">
            {/* Tab Headers */}
            <div className="grid grid-cols-3 border-b border-white/8">
             <button
                onClick={() => setActiveTab("activity")}
                className={`min-w-0 py-2.5 px-2 sm:py-3 sm:px-4 font-semibold text-xs sm:text-sm transition-all ${
                  activeTab === "activity"
                    ? "text-indigo-300 border-b-2 border-indigo-500 bg-slate-700/30"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/20"
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2 min-w-0">
                  <Activity size={18} />
                  <span className="truncate">Activity</span>
                </div>
              </button>

              
              <button
                onClick={() => setActiveTab("members")}
                className={`min-w-0 py-2.5 px-2 sm:py-3 sm:px-4 font-semibold text-xs sm:text-sm transition-all ${
                  activeTab === "members"
                    ? "text-indigo-300 border-b-2 border-indigo-500 bg-slate-700/30"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/20"
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2 min-w-0">
                  <Users size={18} />
                  <span className="truncate">Members</span>
                </div>
              </button>
             
             

               <button
                onClick={() => setActiveTab("settlements")}
                className={`min-w-0 py-2.5 px-2 sm:py-3 sm:px-4 font-semibold text-xs sm:text-sm transition-all ${
                  activeTab === "settlements"
                    ? "text-indigo-300 border-b-2 border-indigo-500 bg-slate-700/30"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/20"
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2 min-w-0">
                  <CreditCard size={18} />
                  <span className="truncate">Settlements</span>
                </div>
              </button>
            </div>

            {/* Tab Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="min-h-[300px] max-h-[500px] overflow-y-auto overflow-x-hidden"
            >
              {/* Members Tab */}
              {activeTab === "activity" && (
                <div className="p-4">
                  <ActivityTab
                    group={group}
                    expenses={expenses}
                    currentUser={user}
                  />
                </div>
              )}


                {activeTab === "settlements" && (
                <div className="p-4">
                  <SettlementsTab
                    group={group}
                    currentUser={user}
                    onRefresh={() => {
                      fetchDebts();
                    }}
                  />
                </div>
              )}


              {activeTab === "members" && (
                <div>
                  {!group?.members || group.members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                      <Users size={32} className="text-slate-500 mb-3" />
                      <p className="text-slate-400">No members yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/8">
                      {group.members.map((member, idx) => (
                        <motion.div
                          key={member._id || member.userId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="px-4 py-3 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg border border-white/8 bg-indigo-600/20 flex items-center justify-center text-indigo-300 font-semibold text-sm shrink-0">
                              {member.name?.charAt(0).toUpperCase() ||
                                member.fullName?.charAt(0).toUpperCase() ||
                                "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-100 truncate">
                                {member.name || member.fullName}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {member.email}
                              </p>
                            </div>
                          </div>
                          {member.role && (
                            <span className="text-xs font-medium px-2.5 py-1 bg-indigo-600/20 border border-indigo-600/40 text-indigo-300 rounded shrink-0 ml-2">
                              {member.role}
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            

              
            </motion.div>
          </div>
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {showAddExpense && (
            <AddExpenseForm
              group={group}
              onClose={() => setShowAddExpense(false)}
              onExpenseAdded={handleExpenseAdded}
            />
          )}
          {showAddMembers && (
            <AddMembersModal
              groupId={groupId}
              onClose={() => setShowAddMembers(false)}
              onMembersAdded={fetchGroupData}
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

// ─── Collapsible Expenses Section ─────────────────────────────────────────

function CollapsibleExpensesSection({ expenses }) {
  const [expanded, setExpanded] = useState(false);

  if (expenses.length === 0) return null;

  const recentExpenses = expenses.slice(0, 10);

  return (
    <div className="bg-slate-800 rounded-xl border border-white/8 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-700/50 border-b border-white/8 hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <IndianRupee size={18} className="text-slate-300" />
          <p className="text-sm font-semibold text-slate-100">
            Expenses ({expenses.length})
          </p>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowRight size={16} className="text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="divide-y divide-white/5 max-h-96 overflow-y-auto"
          >
            {recentExpenses.map((expense) => (
              <div key={expense._id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-100 truncate">
                      {expense.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      Paid by {expense.paidBy?.fullName || "Unknown"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-100">
                      ₹{expense.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Collapsible Members Section ─────────────────────────────────────────

function CollapsibleMembersSection({ members, expanded, onToggle }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-white/8 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-700/50 border-b border-white/8 hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users size={18} className="text-slate-300" />
          <p className="text-sm font-semibold text-slate-100">
            Members ({members?.length || 0})
          </p>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowRight size={16} className="text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="divide-y divide-white/5"
          >
            {members?.map((member) => (
              <div
                key={member._id || member.userId}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg border border-white/8 bg-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs shrink-0">
                    {member.fullName?.charAt(0).toUpperCase() ||
                      member.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-100 truncate">
                      {member.fullName || member.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {member.email}
                    </p>
                  </div>
                </div>
                {member.role && (
                  <span className="text-xs font-medium px-2 py-1 bg-slate-700 border border-white/8 text-slate-300 rounded shrink-0">
                    {member.role}
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Expenses Tab ───────────────────────────────────────────────────────────

function ExpensesTab({ expenses, group, onRefresh }) {
  const getCategoryIcon = (category) => {
    const cls = "w-4 h-4";
    switch (category) {
      case "food":
        return <UtensilsCrossed className={cls} />;
      case "travel":
        return <Plane className={cls} />;
      case "entertainment":
        return <Music className={cls} />;
      case "shopping":
        return <ShoppingBag className={cls} />;
      case "utilities":
        return <Plug className={cls} />;
      default:
        return <Receipt className={cls} />;
    }
  };

  const catBorderColor = (category) => {
    switch (category) {
      case "food":
        return "border-orange-500";
      case "travel":
        return "border-blue-500";
      case "entertainment":
        return "border-purple-500";
      case "shopping":
        return "border-pink-500";
      case "utilities":
        return "border-green-500";
      default:
        return "border-gray-500";
    }
  };

  if (expenses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 border border-white/8 rounded-xl bg-slate-800"
      >
        <div className="w-14 h-14 border border-white/8 rounded-lg flex items-center justify-center mx-auto mb-4 bg-slate-700">
          <IndianRupee className="w-6 h-6 text-indigo-400" />
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-2">
          No expenses yet
        </h3>
        <p className="text-slate-400 text-xs mb-4 max-w-md mx-auto">
          Start by adding your first expense to track shared costs
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {expenses.map((expense, index) => (
          <motion.div
            key={expense._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -1 }}
            className="group bg-slate-800 rounded-xl border border-white/8 hover:border-white/12 hover:bg-slate-700/50 transition-all duration-150"
          >
            <div className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center ${catBorderColor(
                      expense.category,
                    )} bg-slate-700 shrink-0`}
                  >
                    {getCategoryIcon(expense.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-100 text-sm truncate">
                        {expense.description}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${catBorderColor(
                          expense.category,
                        )} bg-slate-700 shrink-0 w-fit`}
                      >
                        {expense.category}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1 truncate">
                        <Users size={10} />
                        <span className="truncate">
                          Paid by {expense.paidBy?.fullName || "Unknown"}
                        </span>
                      </span>
                      <div className="hidden sm:block w-1 h-1 bg-slate-600 rounded-full shrink-0"></div>
                      <span className="flex items-center gap-1 shrink-0">
                        <Calendar size={10} />
                        {new Date(expense.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-100">
                    ₹{expense.amount.toLocaleString()}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {expense.splitBetween?.length || 0} people
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Members Tab ─────────────────────────────────────────────────────────────

function MembersTab({ members, group, onRefresh }) {
  return (
    <div className="space-y-3">
      <AnimatePresence>
        {members.map((member, index) => (
          <motion.div
            key={member._id || member.userId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -1 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-800 rounded-xl border border-white/8 hover:border-white/12 transition-all duration-150"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 mb-3 sm:mb-0">
              <div className="w-10 h-10 rounded-lg border border-white/8 bg-slate-700 flex items-center justify-center text-slate-300 font-medium text-sm shrink-0">
                {member.fullName?.charAt(0).toUpperCase() ||
                  member.name?.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-100 text-sm truncate">
                  {member.fullName || member.name}
                </h4>
                <p className="text-slate-400 text-xs truncate">
                  {member.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  member.role === "admin"
                    ? "border-indigo-600/50 text-indigo-300 bg-indigo-600/20"
                    : "border-white/8 text-slate-400 bg-slate-700"
                }`}
              >
                {member.role}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Balances Tab ─────────────────────────────────────────────────────────────

function BalancesTab({ group, currentUser }) {
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDebt, setSelectedDebt] = useState(null);

  useEffect(() => {
    fetchBalances();
  }, [group._id]);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/groups/${group._id}/balances`);
      setBalanceData(res.data);
    } catch (error) {
      console.error("Error fetching balances:", error);
      toast.error("Failed to load balances");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!balanceData) {
    return (
      <div className="text-center py-12 border border-white/8 rounded-xl bg-slate-800">
        <p className="text-slate-400 text-sm">Could not load balance data.</p>
      </div>
    );
  }

  const { balances, debts } = balanceData;
  const currencySymbol = "₹";
  const allSettled = debts.length === 0;

  return (
    <div className="space-y-6">
      {/* Net Balances */}
      <div className="bg-slate-800 rounded-xl border border-white/8 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/8 bg-slate-700/50">
          <h3 className="font-bold text-slate-100 text-sm">Net Balances</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            After all expenses and confirmed payments
          </p>
        </div>
        <div className="divide-y divide-white/5">
          {balances.map((member) => (
            <div
              key={member.userId}
              className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 ${
                member.isCurrentUser ? "bg-slate-700/30" : ""
              }`}
            >
              <div className="flex items-center gap-3 mb-2 sm:mb-0">
                <div className="w-8 h-8 rounded border border-white/8 bg-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs">
                  {member.userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {member.userName}
                    {member.isCurrentUser && (
                      <span className="ml-1.5 text-xs font-normal text-slate-400">
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">{member.userEmail}</p>
                </div>
              </div>
              <div className="text-right sm:text-right">
                {Math.abs(member.balance) < 0.01 ? (
                  <span className="text-xs font-medium text-slate-400 border border-white/8 px-2 py-0.5 rounded">
                    Settled
                  </span>
                ) : member.balance > 0 ? (
                  <div>
                    <p className="text-sm font-bold text-emerald-400">
                      +{currencySymbol}
                      {member.owed.toFixed(2)}
                    </p>
                    <p className="text-xs text-emerald-400/80">gets back</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-red-400">
                      -{currencySymbol}
                      {member.owes.toFixed(2)}
                    </p>
                    <p className="text-xs text-red-400/80">owes</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settlement Plan */}
      <div className="bg-slate-800 rounded-xl border border-white/8 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/8 bg-slate-700/50">
          <h3 className="font-bold text-slate-100 text-sm">Settlement Plan</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {allSettled
              ? "Everyone is fully settled up!"
              : "Optimized payments to clear all debts"}
          </p>
        </div>

        {allSettled ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <div className="w-12 h-12 rounded-full border border-emerald-500/50 bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-emerald-400">
              All settled up!
            </p>
            <p className="text-xs text-slate-400">
              No pending payments in this group.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {debts.map((debt, idx) => {
              const isMyDebt =
                currentUser &&
                debt.fromUserId?.toString() === currentUser._id?.toString();

              return (
                <div
                  key={idx}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 gap-3 ${
                    isMyDebt ? "bg-red-500/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
                      <div className="w-7 h-7 rounded border border-white/8 bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300 shrink-0">
                        {debt.fromUser?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-100 truncate">
                          {isMyDebt ? "You" : debt.fromUser}
                        </p>
                      </div>
                      <ArrowRight
                        size={14}
                        className="text-slate-500 shrink-0"
                      />
                      <div className="w-7 h-7 rounded border border-white/8 bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300 shrink-0">
                        {debt.toUser?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-100 truncate">
                          {debt.toUser}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-sm font-bold text-slate-100 whitespace-nowrap">
                      {currencySymbol}
                      {debt.amount.toFixed(2)}
                    </p>
                    {isMyDebt && (
                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ y: 1 }}
                        onClick={() => setSelectedDebt(debt)}
                        className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg border border-indigo-600 hover:bg-indigo-500 text-xs font-medium transition-all whitespace-nowrap"
                      >
                        <CreditCard size={12} />
                        Pay
                      </motion.button>
                    )}
                  </div>
                </div>
              );
            })}{" "}
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <AnimatePresence>
        {selectedDebt && (
          <RecordPaymentModal
            debt={selectedDebt}
            group={group}
            currencySymbol={currencySymbol}
            onClose={() => setSelectedDebt(null)}
            onSuccess={() => {
              setSelectedDebt(null);
              fetchBalances();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Record Payment Modal ──────────────────────────────────────────────────

function RecordPaymentModal({
  debt,
  group,
  currencySymbol,
  onClose,
  onSuccess,
}) {
  const [method, setMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const methodOptions = [
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axios.post("/api/settlements", {
        groupId: group._id,
        fromUserId: debt.fromUserId,
        toUserId: debt.toUserId,
        amount: debt.amount,
        method,
        notes: notes.trim() || undefined,
      });
      toast.success("Settlement request recorded. Waiting for receiver approval.");
      onSuccess();
    } catch (error) {
      console.error("Payment error:", error);
      if (
        error.response?.status === 409 ||
        error.response?.data?.code === "OPEN_SETTLEMENT_EXISTS"
      ) {
        toast.error(
          "An open settlement already exists for this pair. Check Pending/Waiting sections.",
        );
      } else {
        toast.error(error.response?.data?.error || "Failed to record payment");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-slate-800 rounded-xl border border-white/8 w-full max-w-sm overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-slate-700/50">
          <div>
            <h3 className="font-bold text-slate-100">Record Payment</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {debt.fromUser ? `${debt.fromUser} → ${debt.toUser}` : `Paying ${debt.toUser}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-white/8 hover:bg-slate-700 transition-colors"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Amount display */}
        <div className="px-6 py-4 bg-slate-700/30 border-b border-white/8">
          <p className="text-xs text-slate-400 mb-1">Amount</p>
          <p className="text-3xl font-bold text-slate-100">
            {currencySymbol}
            {debt.amount.toFixed(2)}
          </p>
          <p className="text-xs text-slate-400 mt-1">You → {debt.toUser}</p>
          {debt.fromUser && (
            <p className="text-xs text-slate-400 mt-1">
              {debt.fromUser} → {debt.toUser}
            </p>
          )}
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Payment method */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {methodOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMethod(opt.value)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    method === opt.value
                      ? "border-indigo-600 bg-indigo-600/20 text-indigo-300"
                      : "border-white/8 bg-slate-700 text-slate-400 hover:border-white/12 hover:bg-slate-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Notes{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sent via PhonePe"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-white/8 bg-slate-700 focus:border-indigo-600 focus:outline-none text-sm text-slate-100 placeholder:text-slate-500 resize-none transition-colors"
            />
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ y: 1 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg border border-indigo-600 hover:bg-indigo-500 font-medium text-sm transition-all disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard size={16} />
                Record Payment
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Settlements Tab ──────────────────────────────────────────────────────────

function SettlementsTab({ group, currentUser, onRefresh }) {
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [settlements, setSettlements] = useState([]);
  const [suggestedSettlements, setSuggestedSettlements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedDebt, setSelectedDebt] = useState(null);

  const getUserId = (value) =>
    value?._id?.toString?.() || value?.toString?.() || "";

  const currencySymbol = "₹";

  const fetchSettlementData = async () => {
    try {
      setLoading(true);
      const [summaryRes, calculateRes] = await Promise.all([
        axios.get(`/api/settlements/summary?groupId=${group._id}`),
        axios.get(`/api/settlements/calculate?groupId=${group._id}`),
      ]);

      setSettlements(summaryRes.data?.settlements || []);
      setSummary(summaryRes.data?.summary || null);
      setSuggestedSettlements(calculateRes.data?.settlements || []);
    } catch (error) {
      console.error("Settlement fetch error:", error);
      toast.error("Failed to load settlements");
      setSettlements([]);
      setSuggestedSettlements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (group?._id) {
      fetchSettlementData();
    }
  }, [group?._id]);

  const handleSettlementAction = async (settlement, action) => {
    try {
      setUpdatingId(settlement._id);
      await axios.post("/api/settlements/verify", {
        settlementId: settlement._id,
        action,
      });
      toast.success(
        action === "confirm"
          ? "Marked as payment sent"
          : "Marked as payment received",
      );
      await fetchSettlementData();
    } catch (error) {
      console.error("Settlement action error:", error);
      toast.error(error.response?.data?.error || "Failed to update settlement");
    } finally {
      setUpdatingId("");
    }
  };

  const myId = currentUser?._id?.toString?.() || "";

  const suggestedDebts = suggestedSettlements;

  const pendingAction = settlements.filter((settlement) => {
    const fromId = getUserId(settlement.fromUser);
    const toId = getUserId(settlement.toUser);

    if (settlement.status === "pending" && fromId === myId) return true;
    if (settlement.status === "confirmed" && toId === myId)
      return true;
    return false;
  });

  const waitingForOthers = settlements.filter((settlement) => {
    const fromId = getUserId(settlement.fromUser);
    const toId = getUserId(settlement.toUser);
    return (
      fromId === myId &&
      toId !== myId &&
      settlement.status === "confirmed"
    );
  });

  const historyList = settlements.filter((settlement) =>
    ["completed", "cancelled", "disputed"].includes(settlement.status),
  );

  const openSettlementByPair = settlements.reduce((map, settlement) => {
    if (!["pending", "confirmed"].includes(settlement.status)) {
      return map;
    }

    const fromId = getUserId(settlement.fromUser);
    const toId = getUserId(settlement.toUser);
    const pairKey = `${fromId}-${toId}`;

    if (!map.has(pairKey)) {
      map.set(pairKey, settlement);
    }

    return map;
  }, new Map());

  const suggestedCount = suggestedDebts.length;
  const pendingCount = pendingAction.length;
  const waitingCount = waitingForOthers.length;
  const historyCount = historyList.length;

  const getStatusBadge = (status) => {
    if (status === "completed") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
          Completed
        </span>
      );
    }
    if (status === "confirmed") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold border border-sky-500/30 bg-sky-500/15 text-sky-400">
          Sent
        </span>
      );
    }
    if (status === "cancelled") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold border border-rose-500/30 bg-rose-500/15 text-rose-400">
          Cancelled
        </span>
      );
    }
    if (status === "disputed") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-500/30 bg-amber-500/15 text-amber-400">
          Disputed
        </span>
      );
    }

    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-semibold border border-white/20 bg-white/8 text-slate-300">
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-700/30 border border-white/8 rounded-lg p-3">
          <p className="text-xs text-slate-400">You Owe</p>
          <p className="text-lg font-bold text-rose-400">
            {currencySymbol}
            {Number(summary?.userOweAmount || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-700/30 border border-white/8 rounded-lg p-3">
          <p className="text-xs text-slate-400">You Get</p>
          <p className="text-lg font-bold text-emerald-400">
            {currencySymbol}
            {Number(summary?.userGetAmount || 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-slate-700/20 border border-white/8 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-white/8 bg-slate-700/30">
          <h3 className="text-sm font-bold text-slate-100">Suggested Settlements ({suggestedCount})</h3>
        </div>
        {suggestedDebts.length === 0 ? (
          <p className="px-4 py-4 text-xs text-slate-400">No suggested settlements right now.</p>
        ) : (
          <div className="divide-y divide-white/8">
            {suggestedDebts.map((debt, idx) => (
              <div key={`${getUserId(debt.fromUser)}-${getUserId(debt.toUser)}-${idx}`} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 overflow-hidden">
                {(() => {
                  const fromId = getUserId(debt.fromUser);
                  const toId = getUserId(debt.toUser);
                  const pairKey = `${fromId}-${toId}`;
                  const openSettlement = openSettlementByPair.get(pairKey);
                  const isPending = Boolean(openSettlement);

                  return (
                    <>
                      <div className="min-w-0 w-full sm:w-auto">
                        <p className="text-sm text-slate-100 truncate">
                          {debt.fromUser?.fullName || debt.fromUser?.username || "Member"} → {debt.toUser?.fullName || debt.toUser?.username || "Member"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {isPending
                            ? "Settlement request already raised for this pair"
                            : "Create settlement request for this pair"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
                        <p className="text-sm font-bold text-slate-100">
                          {currencySymbol}
                          {Number(debt.amount || 0).toFixed(2)}
                        </p>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            setSelectedDebt({
                              fromUser: debt.fromUser?.fullName || debt.fromUser?.username || "Member",
                              fromUserId: fromId,
                              toUser: debt.toUser?.fullName || debt.toUser?.username || "Member",
                              toUserId: toId,
                              amount: Number(debt.amount || 0),
                            })
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isPending
                              ? "bg-slate-600 text-slate-300 cursor-not-allowed"
                              : "bg-indigo-600 text-white hover:bg-indigo-500"
                          }`}
                        >
                          {isPending ? "Pending" : "Record"}
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-700/20 border border-white/8 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-white/8 bg-slate-700/30">
          <h3 className="text-sm font-bold text-slate-100">Pending Your Action ({pendingCount})</h3>
        </div>
        {pendingAction.length === 0 ? (
          <p className="px-4 py-4 text-xs text-slate-400">No pending actions for you.</p>
        ) : (
          <div className="divide-y divide-white/8">
            {pendingAction.map((settlement) => {
              const fromId = getUserId(settlement.fromUser);
              const toId = getUserId(settlement.toUser);
              const isPayer = fromId === myId;
              const action = isPayer ? "confirm" : "complete";
              const actionLabel = isPayer ? "Mark Sent" : "Confirm Received";
              const fromName = settlement.fromUser?.fullName || settlement.fromUser?.username || "Unknown";
              const toName = settlement.toUser?.fullName || settlement.toUser?.username || "Unknown";

              return (
                <div key={settlement._id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 overflow-hidden">
                  <div className="min-w-0 w-full sm:w-auto">
                    <p className="text-sm text-slate-100 truncate">
                      {isPayer ? "You" : fromName} → {isPayer ? toName : "You"}
                    </p>
                    <div className="mt-1">{getStatusBadge(settlement.status)}</div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
                    <p className="text-sm font-bold text-slate-100">
                      {currencySymbol}
                      {Number(settlement.amount || 0).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      disabled={updatingId === settlement._id}
                      onClick={() => handleSettlementAction(settlement, action)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-60"
                    >
                      {updatingId === settlement._id ? "Saving..." : actionLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-slate-700/20 border border-white/8 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-white/8 bg-slate-700/30">
          <h3 className="text-sm font-bold text-slate-100">Waiting For Others ({waitingCount})</h3>
        </div>
        {waitingForOthers.length === 0 ? (
          <p className="px-4 py-4 text-xs text-slate-400">Nothing is waiting for others right now.</p>
        ) : (
          <div className="divide-y divide-white/8">
            {waitingForOthers.map((settlement) => {
              const toName =
                settlement.toUser?.fullName || settlement.toUser?.username || "Unknown";

              return (
                <div key={settlement._id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 overflow-hidden">
                  <div className="min-w-0 w-full sm:w-auto">
                    <p className="text-sm text-slate-100 truncate">You → {toName}</p>
                    <div className="mt-1">{getStatusBadge(settlement.status)}</div>
                  </div>
                  <p className="text-sm font-bold text-slate-100 shrink-0">
                    {currencySymbol}
                    {Number(settlement.amount || 0).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-slate-700/20 border border-white/8 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-white/8 bg-slate-700/30">
          <h3 className="text-sm font-bold text-slate-100">History ({historyCount})</h3>
        </div>
        {historyList.length === 0 ? (
          <p className="px-4 py-4 text-xs text-slate-400">No completed or cancelled settlements yet.</p>
        ) : (
          <div className="divide-y divide-white/8">
            {historyList.map((settlement) => {
              const fromName = settlement.fromUser?.fullName || settlement.fromUser?.username || "Unknown";
              const toName = settlement.toUser?.fullName || settlement.toUser?.username || "Unknown";

              return (
                <div key={settlement._id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 overflow-hidden">
                  <div className="min-w-0 w-full sm:w-auto">
                    <p className="text-sm text-slate-100 truncate">
                      {fromName} → {toName}
                    </p>
                    <div className="mt-1">{getStatusBadge(settlement.status)}</div>
                  </div>
                  <p className="text-sm font-bold text-slate-100 shrink-0">
                    {currencySymbol}
                    {Number(settlement.amount || 0).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedDebt && (
          <RecordPaymentModal
            debt={selectedDebt}
            group={group}
            currencySymbol={currencySymbol}
            onClose={() => setSelectedDebt(null)}
            onSuccess={async () => {
              setSelectedDebt(null);
              await fetchSettlementData();
              onRefresh?.();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Activity Tab ─────────────────────────────────────────────────────────────

function ActivityTab({ group, expenses = [], currentUser }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    buildTimeline();
  }, [group._id, expenses, currentUser?._id]);

  const buildTimeline = async () => {
    try {
      setLoading(true);
      const settlementsRes = await axios.get(`/api/settlements?groupId=${group._id}`);
      const settlements = settlementsRes.data?.settlements || [];

      const expenseEvents = (expenses || []).map((expense) => ({
        id: `expense-${expense._id}`,
        type: "expense",
        createdAt: expense.createdAt || expense.date,
        title: expense.description,
        subtitle: `Paid by ${expense.paidBy?.fullName || expense.paidBy?.name || "Unknown"}`,
        amount: Number(expense.amount || 0),
        status: expense.isSettled ? "settled" : "open",
        details: {
          category: expense.category || "other",
          paidByName: expense.paidBy?.fullName || expense.paidBy?.name || "Unknown",
          date: expense.date,
          splitBetween: expense.splitBetween || [],
          notes: expense.notes || "",
          expenseId: expense._id,
        },
      }));

      const settlementEvents = settlements.map((settlement) => {
        const fromName = settlement.fromUser?.fullName || settlement.fromUser?.username || "Unknown";
        const toName = settlement.toUser?.fullName || settlement.toUser?.username || "Unknown";
        const currentUserId = currentUser?._id?.toString?.();

        const normalizedFrom = settlement.fromUser?._id?.toString?.();
        const normalizedTo = settlement.toUser?._id?.toString?.();

        const fromDisplay =
          currentUserId && normalizedFrom === currentUserId ? "You" : fromName;
        const toDisplay =
          currentUserId && normalizedTo === currentUserId ? "You" : toName;

        return {
          id: `settlement-${settlement._id}`,
          type: "settlement",
          createdAt: settlement.updatedAt || settlement.createdAt,
          title: `${fromDisplay} → ${toDisplay}`,
          subtitle: "Settlement",
          amount: Number(settlement.amount || 0),
          status: settlement.status,
          details: {
            fromName,
            toName,
            method: settlement.method || "cash",
            notes: settlement.notes || "",
            requestedAt: settlement.createdAt,
            updatedAt: settlement.updatedAt,
            settlementId: settlement._id,
          },
        };
      });

      const merged = [...expenseEvents, ...settlementEvents].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setTimeline(merged);
    } catch (error) {
      console.error("Error fetching activity:", error);
      toast.error("Failed to load activity timeline");
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  };

  const getRowConfig = (item) => {
    if (item.type === "expense") {
      return {
        icon: <Receipt size={14} className="text-indigo-400" />,
        border: "border-indigo-500/20",
        badge: item.status === "settled" ? "Settled" : "Open",
      };
    }

    return {
      icon: <CreditCard size={14} className="text-emerald-400" />,
      border: "border-emerald-500/20",
      badge: item.status,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 border border-white/8 rounded-lg bg-slate-800"
      >
        <div className="w-14 h-14 border border-white/8 rounded-lg flex items-center justify-center mx-auto mb-4 bg-slate-700">
          <Activity className="w-6 h-6 text-indigo-400" />
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-2 border-b-2 border-indigo-500 pb-1 inline-block">
          No activity yet
        </h3>
        <p className="text-slate-400 text-xs">
          Expenses and settlements of this group will appear here.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {timeline.map((item, index) => {
          const cfg = getRowConfig(item);

          return (
            <motion.button
              key={item.id || index}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => setSelectedActivity(item)}
              className={`w-full text-left flex items-start gap-3 bg-slate-800 p-3 rounded-lg border ${cfg.border} hover:bg-slate-700/40 transition-colors overflow-hidden`}
            >
              <div className="w-7 h-7 rounded border border-white/12 bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <p className="text-sm text-slate-100 truncate flex-1 min-w-0">{item.title}</p>
                  <span className="text-xs font-semibold text-slate-300 px-2 py-0.5 rounded border border-white/12 bg-slate-700/70 capitalize shrink-0">
                    {cfg.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{item.subtitle}</p>
                <p className="text-xs text-indigo-300 mt-1">₹{Number(item.amount || 0).toFixed(2)}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(item.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedActivity && (
          <ActivityDetailsModal
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function ActivityDetailsModal({ activity, onClose }) {
  const isExpense = activity.type === "expense";
  const details = activity.details || {};
  const [copiedKey, setCopiedKey] = useState("");

  const handleCopyId = async (value, label, key) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
      toast.success(`${label} copied`);
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy");
    }
  };

  const statusLabel = isExpense
    ? activity.status === "settled"
      ? "Settled"
      : "Open"
    : activity.status;

  const statusClass =
    activity.status === "completed" || activity.status === "settled"
      ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
      : activity.status === "pending"
        ? "border-white/20 bg-white/10 text-slate-300"
        : activity.status === "confirmed"
          ? "border-sky-500/30 bg-sky-500/15 text-sky-400"
          : "border-white/20 bg-white/10 text-slate-300";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-slate-800 rounded-xl border border-white/8 w-full max-w-md overflow-hidden shadow-xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-slate-700/40">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              {isExpense ? "Expense" : "Settlement"} Details
            </p>
            <h3 className="font-bold text-slate-100 mt-0.5 truncate">
              {activity.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-white/8 hover:bg-slate-700 transition-colors"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Amount</p>
            <p className="text-xl font-bold text-slate-100">
              ₹{Number(activity.amount || 0).toFixed(2)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Status</p>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border capitalize ${statusClass}`}>
              {statusLabel}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">Time</p>
            <p className="text-xs text-slate-300 text-right">
              {new Date(activity.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {isExpense ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">Paid By</p>
                <p className="text-xs text-slate-300 text-right">
                  {details.paidByName || "Unknown"}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">Category</p>
                <p className="text-xs text-slate-300 text-right capitalize">
                  {details.category || "other"}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">Split Count</p>
                <p className="text-xs text-slate-300 text-right">
                  {(details.splitBetween || []).length}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">From</p>
                <p className="text-xs text-slate-300 text-right">
                  {details.fromName || "Unknown"}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">To</p>
                <p className="text-xs text-slate-300 text-right">
                  {details.toName || "Unknown"}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">Method</p>
                <p className="text-xs text-slate-300 text-right capitalize">
                  {(details.method || "cash").replace("_", " ")}
                </p>
              </div>
            </>
          )}

          {details.notes ? (
            <div className="pt-1">
              <p className="text-xs text-slate-400 mb-1">Notes</p>
              <p className="text-xs text-slate-300 bg-slate-700/40 border border-white/8 rounded-lg px-3 py-2">
                {details.notes}
              </p>
            </div>
          ) : null}

          {(details.expenseId || details.settlementId) && (
            <div className="pt-1 space-y-2">
              {details.expenseId && (
                <div className="flex items-center justify-between gap-2 bg-slate-700/30 border border-white/8 rounded-lg px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400">Expense ID</p>
                    <p className="text-xs text-slate-300 truncate">{details.expenseId}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyId(details.expenseId, "Expense ID", "expenseId")
                    }
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors shrink-0 ${
                      copiedKey === "expenseId"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-600 text-slate-200 hover:bg-slate-500"
                    }`}
                  >
                    {copiedKey === "expenseId" ? "Copied" : "Copy"}
                  </button>
                </div>
              )}

              {details.settlementId && (
                <div className="flex items-center justify-between gap-2 bg-slate-700/30 border border-white/8 rounded-lg px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400">Settlement ID</p>
                    <p className="text-xs text-slate-300 truncate">{details.settlementId}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyId(
                        details.settlementId,
                        "Settlement ID",
                        "settlementId",
                      )
                    }
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors shrink-0 ${
                      copiedKey === "settlementId"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-600 text-slate-200 hover:bg-slate-500"
                    }`}
                  >
                    {copiedKey === "settlementId" ? "Copied" : "Copy"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-white/8 bg-slate-700/30">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
