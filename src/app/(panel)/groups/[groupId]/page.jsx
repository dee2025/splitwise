"use client";

import AddExpenseForm from "@/components/dashboard/expenses/AddExpenseForm";
import DashboardLayout from "@/components/DashboardLayout";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Calendar,
  IndianRupee,
  Music,
  Plane,
  Plug,
  Plus,
  Receipt,
  ShoppingBag,
  Users,
  UtensilsCrossed,
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
  const [activeTab, setActiveTab] = useState("expenses");
  const [showAddExpense, setShowAddExpense] = useState(false);

  const groupId = params.groupId;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchGroupData();
  }, [groupId, isAuthenticated, router]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const [groupRes, expensesRes] = await Promise.all([
        axios.get(`/api/groups/${groupId}`),
        axios.get(`/api/expenses?groupId=${groupId}`),
      ]);

      setGroup(groupRes.data.group);
      setExpenses(expensesRes.data.expenses || []);
    } catch (error) {
      console.error("Error fetching group data:", error);
      toast.error("Failed to load group data");
      router.push("/groups");
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

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-6 border-2 border-gray-400 bg-white shadow-sketch">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-6 border-2 border-gray-400 bg-white shadow-sketch">
          <p className="text-gray-700 font-medium mb-4">Group not found</p>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ y: 1 }}
            onClick={() => router.push("/groups")}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded border-2 border-black hover:bg-gray-800 transition-all duration-150 font-medium shadow-sketch-sm mx-auto"
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
      <div className="">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className=" "
        >
          <div className="flex sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ y: 1 }}
                onClick={() => router.push("/groups")}
                className="flex-shrink-0 p-2 border-2 border-gray-400 bg-white rounded hover:border-black transition-all duration-150 shadow-sketch-sm"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </motion.button>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 border-b-2 border-black pb-1 inline-block max-w-full truncate">
                  {group.name}
                </h1>
                {group.description && (
                  <p className="text-gray-600 text-sm mt-2 border-l-2 border-gray-300 pl-2 max-w-full truncate">
                    {group.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ y: 1 }}
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded border-2 border-black hover:bg-gray-800 transition-all duration-150 font-medium shadow-sketch-sm text-sm sm:text-base"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Add</span>
              </motion.button>
            </div>
          </div>

          {/* Group Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[
              {
                label: "Total Expenses",
                value: `₹${(group.totalExpenses || 0).toLocaleString()}`,
                icon: IndianRupee,
                border: "border-gray-400",
              },
              {
                label: "Members",
                value: group.members?.length || 0,
                icon: Users,
                border: "border-gray-400",
              },
              {
                label: "Active Expenses",
                value: expenses.filter((e) => !e.isSettled).length,
                icon: Activity,
                border: "border-gray-400",
              },
              {
                label: "Currency",
                value: group.currency,
                icon: BarChart3,
                border: "border-gray-400",
              },
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="bg-white p-3 rounded-lg border-2 border-gray-400 hover:border-gray-600 transition-all duration-150 shadow-sketch-sm"
                >
                  {/* Corner accents */}
                  <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-gray-400"></div>
                  <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-gray-400"></div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 border-2 border-gray-400 bg-white rounded flex-shrink-0">
                      <IconComponent size={16} className="text-gray-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-bold text-gray-900 truncate">
                        {stat.value}
                      </p>
                      <p className="text-gray-600 text-xs truncate">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Navigation Tabs */}
          {/* <div className="w-full overflow-x-auto scrollbar-none"> */}
            <nav className="overflow-x-scroll flex gap-2 pb-1 px-1 ">
              {[
                {
                  id: "expenses",
                  label: "Expenses",
                  icon: IndianRupee,
                  count: expenses.length,
                },
                {
                  id: "members",
                  label: "Members",
                  icon: Users,
                  count: group.members?.length,
                },
                { id: "balances", label: "Balances", icon: BarChart3 },
                { id: "activity", label: "Activity", icon: Activity },
              ].map((tab) => {
                const IconComponent = tab.icon;

                return (
                  <motion.button
                    key={tab.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2
                      shrink-0 transition-all duration-150 whitespace-nowrap
                      ${
                        activeTab === tab.id
                          ? "border-black bg-gray-100 text-black"
                          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                      }
                    `}
                  >
                    <IconComponent size={16} className="shrink-0" />
                    <span className="text-sm">{tab.label}</span>

                    {tab.count !== undefined && (
                      <span className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded border border-gray-400">
                        {tab.count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </nav>
          {/* </div> */}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          {activeTab === "expenses" && (
            <ExpensesTab
              expenses={expenses}
              group={group}
              onRefresh={fetchGroupData}
            />
          )}

          {activeTab === "members" && (
            <MembersTab
              members={group.members}
              group={group}
              onRefresh={fetchGroupData}
            />
          )}

          {activeTab === "balances" && (
            <BalancesTab group={group} expenses={expenses} />
          )}

          {activeTab === "activity" && <ActivityTab group={group} />}
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
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

// Expenses Tab Component
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
        className="text-center py-12 border-2 border-dashed border-gray-400 rounded-lg bg-white shadow-sketch"
      >
        <div className="w-14 h-14 border-2 border-gray-400 rounded-lg flex items-center justify-center mx-auto mb-4 bg-gray-50">
          <IndianRupee className="w-6 h-6 text-gray-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-2 border-b-2 border-black pb-1 inline-block">
          No expenses yet
        </h3>
        <p className="text-gray-600 text-xs mb-4 max-w-md mx-auto">
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
            className="group bg-white rounded-lg border-2 border-gray-400 hover:border-gray-600 hover:shadow-sketch-hover transition-all duration-150 cursor-pointer"
          >
            {/* Corner accents */}
            <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-9 h-9 rounded border-2 bg-white flex items-center justify-center ${catBorderColor(
                      expense.category
                    )} flex-shrink-0`}
                  >
                    {getCategoryIcon(expense.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">
                        {expense.description}
                      </h4>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-medium border ${catBorderColor(
                          expense.category
                        )} bg-white flex-shrink-0`}
                      >
                        {expense.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1 truncate">
                        <Users size={10} />
                        <span className="truncate">
                          Paid by {expense.paidBy?.fullName || "Unknown"}
                        </span>
                      </span>
                      <div className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></div>
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Calendar size={10} />
                        {new Date(expense.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-sm font-bold text-gray-900">
                    ₹{expense.amount.toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-xs">
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

// Members Tab Component
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
            className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-gray-400 hover:border-gray-600 hover:shadow-sketch-hover transition-all duration-150"
          >
            {/* Corner accents */}
            <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded border-2 border-gray-400 bg-gray-200 flex items-center justify-center text-gray-700 font-medium text-sm flex-shrink-0">
                {member.name?.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm truncate">
                  {member.name}
                </h4>
                <p className="text-gray-600 text-xs truncate">{member.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium border ${
                  member.role === "admin"
                    ? "border-blue-500 text-blue-600 bg-white"
                    : "border-gray-400 text-gray-600 bg-white"
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

// Balances Tab Component
function BalancesTab({ group, expenses }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 border-2 border-dashed border-gray-400 rounded-lg bg-white shadow-sketch"
    >
      <div className="w-14 h-14 border-2 border-gray-400 rounded-lg flex items-center justify-center mx-auto mb-4 bg-gray-50">
        <BarChart3 className="w-6 h-6 text-gray-500" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2 border-b-2 border-black pb-1 inline-block">
        Balance Overview
      </h3>
      <p className="text-gray-600 text-xs mb-4 max-w-md mx-auto">
        View who owes whom and track settlements in the group
      </p>
      <div className="text-xs text-gray-500">
        Balance calculations will appear here as you add expenses
      </div>
    </motion.div>
  );
}

// Activity Tab Component
function ActivityTab({ group }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 border-2 border-dashed border-gray-400 rounded-lg bg-white shadow-sketch"
    >
      <div className="w-14 h-14 border-2 border-gray-400 rounded-lg flex items-center justify-center mx-auto mb-4 bg-gray-50">
        <Activity className="w-6 h-6 text-gray-500" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2 border-b-2 border-black pb-1 inline-block">
        Group Activity
      </h3>
      <p className="text-gray-600 text-xs mb-4 max-w-md mx-auto">
        Track all activities, expenses, and member actions
      </p>
      <div className="text-xs text-gray-500">
        Activity feed will show recent actions and updates
      </div>
    </motion.div>
  );
}
