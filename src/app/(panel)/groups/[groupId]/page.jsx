"use client";

import AddExpenseForm from "@/components/dashboard/expenses/AddExpenseForm";
import DashboardLayout from "@/components/DashboardLayout";
import axios from "axios";
import {
  ArrowLeft,
  Bell,
  Calendar,
  IndianRupee,
  MoreHorizontal,
  Plus,
  Users,
  UserPlus,
  BarChart3,
  Activity,
  Settings,
  Share2
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("expenses");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Group not found</p>
          <button
            onClick={() => router.push("/groups")}
            className="text-gray-900 hover:text-gray-700 font-medium transition-colors"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/groups")}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
              {group.description && (
                <p className="text-gray-600 text-lg">{group.description}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium"
              >
                <Plus size={18} />
                Add Expense
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <MoreHorizontal size={18} className="text-gray-600" />
              </motion.button>
            </div>
          </div>

          {/* Group Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Expenses",
                value: `${group.currency === "INR" ? "₹" : "$"}${(group.totalExpenses || 0).toLocaleString()}`,
                icon: IndianRupee,
                color: "text-blue-600"
              },
              {
                label: "Members",
                value: group.members?.length || 0,
                icon: Users,
                color: "text-green-600"
              },
              {
                label: "Active Expenses",
                value: expenses.filter((e) => !e.isSettled).length,
                icon: Activity,
                color: "text-orange-600"
              },
              {
                label: "Currency",
                value: group.currency,
                icon: BarChart3,
                color: "text-purple-600"
              }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                      <IconComponent size={20} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-gray-600 text-sm">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: "expenses", label: "Expenses", icon: IndianRupee, count: expenses.length },
                { id: "members", label: "Members", icon: Users, count: group.members?.length },
                { id: "balances", label: "Balances", icon: BarChart3 },
                { id: "activity", label: "Activity", icon: Activity },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <IconComponent size={16} />
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs font-medium">
                        {tab.count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </nav>
          </div>
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
            <ExpensesTab expenses={expenses} group={group} onRefresh={fetchGroupData} />
          )}

          {activeTab === "members" && (
            <MembersTab members={group.members} group={group} onRefresh={fetchGroupData} />
          )}

          {activeTab === "balances" && <BalancesTab group={group} expenses={expenses} />}

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
  if (expenses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <IndianRupee className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">No expenses yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Start by adding your first expense to track shared costs in this group
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
            whileHover={{ y: -2 }}
            className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-gray-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {expense.description}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        Paid by {expense.paidBy?.fullName || 'Unknown'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(expense.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {group.currency === "INR" ? "₹" : "$"}
                    {expense.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
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
            whileHover={{ y: -2 }}
            className="flex items-center justify-between p-5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center text-white font-medium text-lg">
                {member.name?.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">
                  {member.name}
                </h4>
                <p className="text-gray-600 text-sm truncate">
                  {member.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                member.role === "admin"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-gray-50 text-gray-700 border border-gray-200"
              }`}>
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
      className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50"
    >
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <BarChart3 className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">Balance Overview</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        View who owes whom and track settlements in the group
      </p>
      <div className="text-sm text-gray-500">
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
      className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50"
    >
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Activity className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">Group Activity</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Track all activities, expenses, and member actions in this group
      </p>
      <div className="text-sm text-gray-500">
        Activity feed will show recent actions and updates
      </div>
    </motion.div>
  );
}