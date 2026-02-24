"use client";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  IndianRupee,
  Loader2,
  Plus,
  Tag,
  Users,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const CATEGORY_OPTIONS = [
  { value: "food", label: "Food & Dining" },
  { value: "travel", label: "Travel" },
  { value: "accommodation", label: "Accommodation" },
  { value: "shopping", label: "Shopping" },
  { value: "entertainment", label: "Entertainment" },
  { value: "utilities", label: "Utilities" },
  { value: "other", label: "Other" },
];

function normalizeMember(member) {
  const userId =
    member?.userId?._id || member?.userId || member?._id || member?.id || "";

  const name =
    member?.name ||
    member?.fullName ||
    member?.userId?.fullName ||
    member?.userId?.username ||
    "Unknown";

  return {
    userId: String(userId),
    name,
  };
}

function buildEqualSplit(amount, userIds) {
  const total = Number(amount);
  if (!total || total <= 0 || userIds.length === 0) return [];

  const base = Math.floor((total * 100) / userIds.length);
  let remainder = Math.round(total * 100) - base * userIds.length;

  return userIds.map((userId) => {
    const extra = remainder > 0 ? 1 : 0;
    if (remainder > 0) remainder -= 1;

    const amountInRupees = (base + extra) / 100;

    return {
      userId,
      amount: amountInRupees,
      percentage: Number((100 / userIds.length).toFixed(2)),
    };
  });
}

export default function GlobalAddExpenseModal() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "other",
    paidBy: "",
  });
  const [splitType, setSplitType] = useState("equal");
  const [paidTo, setPaidTo] = useState([]);
  const [customSplitAmounts, setCustomSplitAmounts] = useState({});

  const shouldHideLauncher = pathname === "/login" || pathname === "/signup";

  const selectedGroup = useMemo(
    () => groups.find((group) => group._id === selectedGroupId),
    [groups, selectedGroupId],
  );

  const members = useMemo(() => {
    if (!selectedGroup?.members?.length) return [];
    return selectedGroup.members
      .map(normalizeMember)
      .filter((member) => member.userId);
  }, [selectedGroup]);

  const splitBetween = useMemo(() => {
    if (splitType === "custom") {
      const amountNumber = Number(formData.amount);
      return paidTo.map((userId) => {
        const memberAmount = Number(customSplitAmounts[userId] || 0);
        return {
          userId,
          amount: memberAmount,
          percentage:
            amountNumber > 0
              ? Number(((memberAmount / amountNumber) * 100).toFixed(2))
              : 0,
        };
      });
    }

    return buildEqualSplit(formData.amount, paidTo);
  }, [formData.amount, paidTo, splitType, customSplitAmounts]);

  const resetState = () => {
    setStep(1);
    setSelectedGroupId("");
    setFormData({
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      category: "other",
      paidBy: "",
    });
    setSplitType("equal");
    setPaidTo([]);
    setCustomSplitAmounts({});
  };

  const closeModal = () => {
    setIsOpen(false);
    resetState();
  };

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const res = await axios.get("/api/groups");
      setGroups(res.data?.groups || []);
    } catch {
      toast.error("Failed to load groups");
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    fetchGroups();
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    const handler = (event) => {
      const preselectedGroupId = event?.detail?.groupId;
      setIsOpen(true);
      setStep(1);
      setSelectedGroupId(preselectedGroupId || "");
    };

    window.addEventListener("splitzy:open-add-expense", handler);
    return () => window.removeEventListener("splitzy:open-add-expense", handler);
  }, []);

  useEffect(() => {
    if (!members.length) {
      setPaidTo([]);
      setCustomSplitAmounts({});
      setFormData((prev) => ({ ...prev, paidBy: "" }));
      return;
    }

    const memberIds = members.map((member) => member.userId);
    setPaidTo(memberIds);
    const equalSplit = buildEqualSplit(formData.amount, memberIds);
    const nextCustomSplit = {};
    equalSplit.forEach((item) => {
      nextCustomSplit[item.userId] = item.amount;
    });
    setCustomSplitAmounts(nextCustomSplit);

    setFormData((prev) => {
      const paidByStillValid = memberIds.includes(prev.paidBy);
      return {
        ...prev,
        paidBy: paidByStillValid ? prev.paidBy : memberIds[0],
      };
    });
  }, [members]);

  useEffect(() => {
    if (splitType !== "custom" || paidTo.length === 0) return;

    setCustomSplitAmounts((prev) => {
      const next = { ...prev };
      const existingTotal = paidTo.reduce(
        (sum, userId) => sum + Number(next[userId] || 0),
        0,
      );

      if (existingTotal <= 0) {
        const equalSplit = buildEqualSplit(formData.amount, paidTo);
        equalSplit.forEach((item) => {
          next[item.userId] = item.amount;
        });
      }

      return next;
    });
  }, [splitType, paidTo, formData.amount]);

  const handleTogglePaidTo = (memberId) => {
    setPaidTo((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId);
      }
      return [...prev, memberId];
    });

    setCustomSplitAmounts((prev) => {
      if (prev[memberId] !== undefined) return prev;
      return { ...prev, [memberId]: 0 };
    });
  };

  const handleCustomAmountChange = (memberId, value) => {
    setCustomSplitAmounts((prev) => ({
      ...prev,
      [memberId]: value === "" ? "" : Number(value),
    }));
  };

  const handleNextFromGroupStep = () => {
    if (!selectedGroupId) {
      toast.error("Please select a group first");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGroupId) {
      toast.error("Please select a group");
      setStep(1);
      return;
    }

    if (!formData.description.trim() || !formData.amount || !formData.paidBy) {
      toast.error("Please fill all required fields");
      return;
    }

    if (paidTo.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }

    const amountNumber = Number(formData.amount);
    if (!amountNumber || amountNumber <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if (splitBetween.length === 0) {
      toast.error("Invalid split setup");
      return;
    }

    if (splitType === "custom") {
      const hasInvalidAmount = splitBetween.some(
        (item) => !Number.isFinite(item.amount) || item.amount <= 0,
      );
      if (hasInvalidAmount) {
        toast.error("Custom split amounts must be greater than 0");
        return;
      }

      const customTotal = splitBetween.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      );

      if (Math.abs(customTotal - amountNumber) > 0.01) {
        toast.error("Custom split total must match expense amount");
        return;
      }
    }

    setSubmitting(true);
    try {
      await axios.post("/api/expenses", {
        description: formData.description.trim(),
        amount: amountNumber,
        date: formData.date,
        category: formData.category,
        groupId: selectedGroupId,
        paidBy: formData.paidBy,
        paidTo,
        splitBetween,
      });

      toast.success("Expense added successfully");
      closeModal();
      router.refresh();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated || shouldHideLauncher) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-4 sm:right-6 bottom-24 sm:bottom-6 z-40 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-950/50 border border-indigo-500/50 p-3.5 transition-colors"
        aria-label="Add expense"
      >
        <Plus className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="relative w-full sm:max-w-2xl bg-slate-800 border border-white/8 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[92vh]"
            >
              <div className="sticky top-0 z-10 bg-slate-800 border-b border-white/8 px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-100">
                    Add Expense
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Step {step} of 2
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/8 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {step === 1 ? (
                <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(92vh-78px)]">
                  <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                    <Users className="w-4 h-4" />
                    Select a group first
                  </div>

                  {loadingGroups ? (
                    <div className="py-10 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                    </div>
                  ) : groups.length === 0 ? (
                    <div className="border border-white/8 bg-white/4 rounded-xl p-4 text-center">
                      <p className="text-slate-300 text-sm">No groups found</p>
                      <p className="text-slate-500 text-xs mt-1">
                        Create a group first to add expenses.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {groups.map((group) => {
                        const active = selectedGroupId === group._id;
                        return (
                          <button
                            key={group._id}
                            type="button"
                            onClick={() => setSelectedGroupId(group._id)}
                            className={`w-full text-left rounded-xl border p-3.5 transition-all ${
                              active
                                ? "bg-indigo-600/20 border-indigo-500/50"
                                : "bg-white/4 border-white/8 hover:border-white/15"
                            }`}
                          >
                            <p className="text-sm font-semibold text-slate-100">
                              {group.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {(group.members?.length || 0) === 1
                                ? "1 member"
                                : `${group.members?.length || 0} members`}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleNextFromGroupStep}
                      disabled={!selectedGroupId || loadingGroups || groups.length === 0}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="p-5 space-y-4 overflow-y-auto max-h-[calc(92vh-78px)]"
                >
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="What was this expense for?"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-700/50 border border-white/8 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                        Amount *
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                          placeholder="0.00"
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-700/50 border border-white/8 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                        Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-700/50 border border-white/8 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                        Paid By *
                      </label>
                      <select
                        value={formData.paidBy}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, paidBy: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-700/50 border border-white/8 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Select member</option>
                        {members.map((member) => (
                          <option key={member.userId} value={member.userId}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                        Category
                      </label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              category: e.target.value,
                            }))
                          }
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-700/50 border border-white/8 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                        >
                          {CATEGORY_OPTIONS.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Split Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSplitType("equal")}
                        className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          splitType === "equal"
                            ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                            : "bg-white/4 border-white/8 text-slate-300 hover:border-white/15"
                        }`}
                      >
                        Equal
                      </button>
                      <button
                        type="button"
                        onClick={() => setSplitType("custom")}
                        className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          splitType === "custom"
                            ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                            : "bg-white/4 border-white/8 text-slate-300 hover:border-white/15"
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Split Between *
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {members.map((member) => {
                        const selected = paidTo.includes(member.userId);
                        return (
                          <button
                            key={member.userId}
                            type="button"
                            onClick={() => handleTogglePaidTo(member.userId)}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                              selected
                                ? "bg-indigo-600/20 border-indigo-500/40"
                                : "bg-white/4 border-white/8 hover:border-white/15"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded border flex items-center justify-center ${
                                selected
                                  ? "bg-indigo-600 border-indigo-600"
                                  : "border-white/20"
                              }`}
                            >
                              {selected && <Check className="w-3 h-3 text-white" />}
                            </span>
                            <span className="text-sm text-slate-100 font-medium">
                              {member.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {splitType === "custom" && paidTo.length > 0 && (
                      <div className="mt-3 space-y-2.5">
                        {members
                          .filter((member) => paidTo.includes(member.userId))
                          .map((member) => (
                            <div
                              key={`custom-${member.userId}`}
                              className="flex items-center gap-2"
                            >
                              <span className="text-xs text-slate-400 w-28 truncate">
                                {member.name}
                              </span>
                              <div className="relative flex-1">
                                <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={customSplitAmounts[member.userId] ?? ""}
                                  onChange={(e) =>
                                    handleCustomAmountChange(
                                      member.userId,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full pl-8 pr-2.5 py-2 rounded-lg bg-slate-700/50 border border-white/8 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {splitType === "equal" && Number(formData.amount) > 0 && paidTo.length > 0 && (
                      <p className="text-xs text-slate-500 mt-2">
                        Equal split: ₹{(Number(formData.amount) / paidTo.length).toFixed(2)} per selected member
                      </p>
                    )}

                    {splitType === "custom" && Number(formData.amount) > 0 && paidTo.length > 0 && (
                      <p className="text-xs text-slate-500 mt-2">
                        Custom total: ₹
                        {splitBetween
                          .reduce((sum, item) => sum + Number(item.amount || 0), 0)
                          .toFixed(2)}
                        {" / "}₹{Number(formData.amount).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 bg-white/5 border border-white/8 hover:bg-white/8 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {submitting ? "Creating..." : "Create Expense"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
