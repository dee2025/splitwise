"use client";

import AddMembersModal from "@/components/dashboard/groups/AddMembersModal";
import DashboardLayout from "@/components/DashboardLayout";
import { loadBillSplitDraft } from "@/app/calculators/bill-split-calculator/utils/billSplitStorage";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Copy,
  Clock,
  CreditCard,
  Download,
  FileText,
  Flag,
  IndianRupee,
  Loader,
  Mail,
  MessageCircle,
  Music,
  Pencil,
  Plane,
  Plug,
  Plus,
  Receipt,
  RefreshCw,
  Save,
  Share2,
  ShoppingBag,
  Trash2,
  UserPlus,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

function getMemberName(member) {
  return (
    member?.fullName ||
    member?.name ||
    member?.username ||
    member?.userId?.fullName ||
    member?.userId?.name ||
    member?.userId?.username ||
    "Unknown User"
  );
}

function getMemberSecondary(member) {
  return (
    member?.email ||
    member?.userId?.email ||
    member?.contact ||
    member?.userId?.contact ||
    member?.username ||
    member?.userId?.username ||
    "No details available"
  );
}

function getMemberKey(member, idx) {
  return (
    member?._id ||
    member?.userId?._id ||
    member?.userId ||
    member?.email ||
    `${idx}`
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

function round2(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function formatReportDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Unknown Date";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(value) {
  return `INR ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateHeading(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Unknown Date";
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getExpenseDateKey(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "unknown";
  return date.toISOString().slice(0, 10);
}

function getSplitMemberCount(expense) {
  const ids = new Set(
    (expense?.splitBetween || [])
      .map((split) => getNormalizedId(split?.userId))
      .filter(Boolean),
  );
  return ids.size || expense?.splitBetween?.length || 0;
}

function buildMemberLookup(members = [], expenses = []) {
  const lookup = new Map();

  for (const member of members || []) {
    const id = getNormalizedId(member?.userId || member);
    if (!id) continue;
    lookup.set(id, {
      id,
      name: getMemberName(member),
      secondary: getMemberSecondary(member),
    });
  }

  for (const expense of expenses || []) {
    const payerId = getNormalizedId(expense?.paidBy);
    if (payerId && !lookup.has(payerId)) {
      lookup.set(payerId, {
        id: payerId,
        name:
          expense?.paidBy?.fullName ||
          expense?.paidBy?.username ||
          "Unknown User",
        secondary: expense?.paidBy?.email || "Expense payer",
      });
    }

    for (const split of expense?.splitBetween || []) {
      const splitId = getNormalizedId(split?.userId);
      if (splitId && !lookup.has(splitId)) {
        lookup.set(splitId, {
          id: splitId,
          name:
            split?.userId?.fullName ||
            split?.userId?.username ||
            "Unknown User",
          secondary: split?.userId?.email || "Split member",
        });
      }
    }
  }

  return lookup;
}

function buildPayPlan(expenses = [], members = []) {
  const memberLookup = buildMemberLookup(members, expenses);
  const balances = {};

  for (const id of memberLookup.keys()) {
    balances[id] = 0;
  }

  for (const expense of expenses || []) {
    const payerId = getNormalizedId(expense?.paidBy);
    const amount = Number(expense?.amount || 0);
    if (payerId && Number.isFinite(amount)) {
      balances[payerId] = round2((balances[payerId] || 0) + amount);
    }

    for (const split of expense?.splitBetween || []) {
      const splitId = getNormalizedId(split?.userId);
      const splitAmount = Number(split?.amount || 0);
      if (!splitId || !Number.isFinite(splitAmount)) continue;
      balances[splitId] = round2((balances[splitId] || 0) - splitAmount);
    }
  }

  const balanceRows = Array.from(memberLookup.values())
    .map((member) => ({
      ...member,
      balance: round2(balances[member.id] || 0),
    }))
    .sort((a, b) => b.balance - a.balance);

  const creditors = balanceRows
    .filter((member) => member.balance > 0.01)
    .map((member) => ({ ...member, remaining: member.balance }));

  const debtors = balanceRows
    .filter((member) => member.balance < -0.01)
    .map((member) => ({ ...member, remaining: Math.abs(member.balance) }));

  const payments = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = round2(Math.min(debtor.remaining, creditor.remaining));

    if (amount > 0.01) {
      payments.push({
        fromId: debtor.id,
        fromName: debtor.name,
        toId: creditor.id,
        toName: creditor.name,
        amount,
      });
    }

    debtor.remaining = round2(debtor.remaining - amount);
    creditor.remaining = round2(creditor.remaining - amount);

    if (debtor.remaining <= 0.01) debtorIndex += 1;
    if (creditor.remaining <= 0.01) creditorIndex += 1;
  }

  return {
    payments,
    balances: balanceRows,
    totalExpenses: round2(
      expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    ),
  };
}

function groupExpensesByDate(items = []) {
  const groups = new Map();

  for (const item of items) {
    const key = getExpenseDateKey(item?.details?.date || item?.createdAt);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: formatDateHeading(item?.details?.date || item?.createdAt),
        total: 0,
        items: [],
      });
    }

    const group = groups.get(key);
    group.items.push(item);
    group.total = round2(group.total + Number(item.amount || 0));
  }

  return Array.from(groups.values()).sort((a, b) => {
    if (a.key === "unknown") return 1;
    if (b.key === "unknown") return -1;
    return new Date(b.key).getTime() - new Date(a.key).getTime();
  });
}

async function loadImageToDataUrl(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("");
        return;
      }
      ctx.drawImage(image, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => resolve("");
    image.src = src;
  });
}

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandMembers, setExpandMembers] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showInviteShare, setShowInviteShare] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [regeneratingInvite, setRegeneratingInvite] = useState(false);
  const [reportShare, setReportShare] = useState({
    open: false,
    file: null,
    fileName: "",
  });
  const [activeTab, setActiveTab] = useState("activity");
  const [calculatorDraft, setCalculatorDraft] = useState(null);

  const groupId = params.groupId;
  const payPlan = useMemo(
    () => buildPayPlan(expenses, group?.members || []),
    [expenses, group?.members],
  );
  const isCurrentUserAdmin = useMemo(() => {
    const currentUserId = getNormalizedId(user);
    if (!currentUserId || !group?.members?.length) return false;
    return group.members.some(
      (member) => getNormalizedId(member?.userId || member) === currentUserId && member.role === "admin",
    );
  }, [group?.members, user]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchGroupData();
  }, [groupId, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("calculatorDraft") !== "1") return;
    const draft = loadBillSplitDraft();
    if (draft?.source === "bill-split-calculator") {
      setCalculatorDraft(draft);
      toast.success("Calculator draft loaded");
    }
  }, [isAuthenticated]);

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

  const openGlobalAddExpense = (draft = null) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("splitzy:open-add-expense", {
        detail: { groupId: group?._id || groupId, draft },
      }),
    );
  };

  const getInviteUrl = () => {
    if (typeof window === "undefined" || !group?.inviteToken) return "";
    return `${window.location.origin}/groups/join/${group.inviteToken}`;
  };

  const copyInviteLink = async () => {
    const inviteUrl = getInviteUrl();
    if (!inviteUrl) {
      toast.error("Invite link is not available");
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Invite link copied");
    } catch (error) {
      console.error("Copy invite link failed:", error);
      toast.error("Unable to copy invite link");
    }
  };

  const regenerateInviteLink = async () => {
    if (!group?._id) return;
    if (!window.confirm("Regenerate this group invite link? Old shared links will stop working.")) {
      return;
    }

    setRegeneratingInvite(true);
    try {
      const res = await axios.post(`/api/groups/${group._id}/invite/regenerate`);
      setGroup((current) => ({
        ...current,
        inviteToken: res.data.inviteToken,
        inviteUpdatedAt: res.data.inviteUpdatedAt,
        inviteEnabled: true,
      }));
      toast.success("Invite link regenerated");
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to regenerate invite link");
    } finally {
      setRegeneratingInvite(false);
    }
  };

  const handleDownloadActivityPdf = async () => {
    if (!group) return;
    if (!expenses?.length) {
      toast.error("No activity available to export");
      return;
    }

    try {
      setDownloadingPdf(true);

      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const reportDate = new Date();
      const sortedExpenses = [...expenses].sort(
        (a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt),
      );

      const groupedByDate = sortedExpenses.reduce((acc, expense) => {
        const keyDate = new Date(expense.date || expense.createdAt);
        if (Number.isNaN(keyDate.getTime())) return acc;

        const key = keyDate.toISOString().slice(0, 10);
        if (!acc[key]) acc[key] = [];
        acc[key].push(expense);
        return acc;
      }, {});

      const totalExpenseAmount = round2(
        sortedExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
      );

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Page 1: Branded summary/advertisement page
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(24, 22, pageWidth - 48, 112, 12, 12, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("Money Split", 40, 54);

      doc.setFontSize(12);
      doc.setTextColor(224, 231, 255);
      doc.text("Track shared expenses with clarity.", 40, 74);
      doc.setTextColor(203, 213, 225);
      doc.text(
        "Money Split helps friends, roommates, and travel groups record shared costs in one place.",
        40,
        94,
      );
      doc.text(
        "This report gives a complete snapshot of date-wise group expense activity.",
        40,
        110,
      );

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(17);
      doc.text(`${group.name} - Group Activity Report`, 40, 166);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `Generated on ${reportDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        40,
        184,
      );

      autoTable(doc, {
        startY: 198,
        theme: "grid",
        head: [["Overview", "Value"]],
        body: [
          ["Total activities (expenses)", `${sortedExpenses.length}`],
          ["Total amount", `INR ${totalExpenseAmount.toFixed(2)}`],
          ["Total members", `${group.members?.length || 0}`],
        ],
        styles: { fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: [55, 65, 81] },
        columnStyles: {
          0: { cellWidth: 230 },
          1: { cellWidth: 180 },
        },
      });

      let cursorY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 16 : 320;

      doc.setFontSize(10);
      doc.setTextColor(90);
      doc.text("Date-wise activity details start from the next page.", 40, cursorY + 10);

      // Page 2 onward: strictly date-wise sections
      doc.addPage();
      cursorY = 50;

      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text("Date-wise Activity Details", 40, cursorY);
      cursorY += 20;

      const dateKeys = Object.keys(groupedByDate).sort((a, b) => new Date(a) - new Date(b));

      for (const dateKey of dateKeys) {
        const dayExpenses = groupedByDate[dateKey] || [];
        const dayTotal = round2(
          dayExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
        );

        if (cursorY > 670) {
          doc.addPage();
          cursorY = 44;
        }

        doc.setFillColor(241, 245, 249);
        doc.roundedRect(36, cursorY - 14, pageWidth - 72, 24, 6, 6, "F");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(
          `${formatReportDate(dateKey)}   |   Day Total: INR ${dayTotal.toFixed(2)}`,
          44,
          cursorY + 2,
        );

        autoTable(doc, {
          startY: cursorY + 16,
          theme: "grid",
          head: [["#", "Paid By", "Amount", "Split Between"]],
          body: dayExpenses.map((expense, index) => {
            const payerName =
              expense?.paidBy?.fullName ||
              expense?.paidBy?.name ||
              "Unknown";

            const splitNames = (expense?.splitBetween || [])
              .map((split) => {
                const splitId = getNormalizedId(split?.userId);
                return (
                  split?.userId?.fullName ||
                  split?.userId?.name ||
                  splitId ||
                  "Unknown"
                );
              })
              .filter(Boolean)
              .join(", ");

            return [
              `${index + 1}`,
              payerName || "Unknown",
              `INR ${Number(expense.amount || 0).toFixed(2)}`,
              splitNames || "-",
            ];
          }),
          styles: { fontSize: 9, cellPadding: 5, valign: "middle" },
          headStyles: { fillColor: [51, 65, 85] },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          columnStyles: {
            0: { cellWidth: 28 },
            1: { cellWidth: 120 },
            2: { cellWidth: 90 },
            3: { cellWidth: "auto" },
          },
        });

        cursorY = (doc.lastAutoTable?.finalY || cursorY) + 12;
        cursorY += 6;
      }

      const totalPages = doc.getNumberOfPages();
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        doc.setPage(pageNumber);
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(`Prepared for ${group.name} • Money Split`, 40, pageHeight - 18);
        doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 110, pageHeight - 18);
      }

      const safeGroupName = (group.name || "group")
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase();
      const fileName = `${safeGroupName}-activity-report.pdf`;
      const pdfBlob = doc.output("blob");
      const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

      doc.save(fileName);
      setReportShare({
        open: true,
        file: pdfFile,
        fileName,
      });
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setDownloadingPdf(false);
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
        {calculatorDraft && (
          <div className="mb-5 rounded-xl border border-indigo-400/25 bg-indigo-500/10 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-100">
                  Save calculator draft in this group
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  {calculatorDraft.expenseTitle || "Shared bill"} · INR{" "}
                  {Number(calculatorDraft.finalAmount || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  . Add members first if they are not already in this group.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openGlobalAddExpense(calculatorDraft)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                Add expense from draft
              </button>
            </div>
          </div>
        )}

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
                {/* {group.description && (
                  <p className="text-slate-400 text-sm truncate">
                    {group.description}
                  </p>
                )} */}
              </div>

              <div className="shrink-0">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ y: 1 }}
                onClick={handleDownloadActivityPdf}
                disabled={downloadingPdf || expenses.length === 0}
                className="flex items-center gap-2 bg-slate-800 text-slate-100 px-3 py-2.5 rounded-lg border border-white/10 hover:bg-slate-700 transition-all duration-150 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                title="Download activity PDF report"
              >
                {downloadingPdf ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {/* <span>Download PDF</span> */}
              </motion.button>
            </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {isCurrentUserAdmin && (
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 1 }}
                  onClick={() => setShowInviteShare(true)}
                  className="flex items-center gap-1.5 sm:gap-2 bg-slate-800 text-slate-100 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg border border-white/10 hover:bg-slate-700 transition-all duration-150 font-medium text-xs sm:text-sm"
                >
                  <Share2 size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Share Invite</span>
                  <span className="sm:hidden">Share</span>
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
                onClick={openGlobalAddExpense}
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

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full space-y-5"
        >
          <PayPlanPanel
            payPlan={payPlan}
            expenseCount={expenses.length}
            memberCount={group?.members?.length || 0}
          />

          {/* Tabs Section */}
          <div className="bg-slate-800 rounded-xl border border-white/8 overflow-hidden">
            {/* Tab Headers */}
            <div className="grid grid-cols-2 border-b border-white/8">
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
                    onExpenseChanged={async () => {
                      await fetchGroupData();
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
                          key={getMemberKey(member, idx)}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="px-4 py-3 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg border border-white/8 bg-indigo-600/20 flex items-center justify-center text-indigo-300 font-semibold text-sm shrink-0">
                              {getMemberName(member)?.charAt(0).toUpperCase() ||
                                "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-100 truncate">
                                {getMemberName(member)}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {getMemberSecondary(member)}
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
          {showAddMembers && (
            <AddMembersModal
              groupId={groupId}
              onClose={() => setShowAddMembers(false)}
              onMembersAdded={fetchGroupData}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showInviteShare && isCurrentUserAdmin && (
            <GroupInviteShareModal
              inviteUrl={getInviteUrl()}
              groupName={group.name}
              regenerating={regeneratingInvite}
              onCopy={copyInviteLink}
              onRegenerate={regenerateInviteLink}
              onClose={() => setShowInviteShare(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {reportShare.open && (
            <ReportShareModal
              groupName={group.name}
              fileName={reportShare.fileName}
              file={reportShare.file}
              onClose={() =>
                setReportShare({ open: false, file: null, fileName: "" })
              }
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

// ─── Collapsible Expenses Section ─────────────────────────────────────────

function PayPlanPanel({ payPlan, expenseCount, memberCount }) {
  const hasPayments = payPlan.payments.length > 0;

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
      <div className="overflow-hidden rounded-xl border border-white/8 bg-slate-800">
        <div className="border-b border-white/8 bg-slate-700/35 px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-300">
                Who pays whom
              </p>
              <h2 className="mt-1 text-base font-bold text-slate-100">
                Group Pay Plan
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Calculated from recorded expenses and split amounts.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[330px]">
              <div className="rounded-lg border border-white/8 bg-slate-900/45 px-2 py-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  Total
                </p>
                <p className="mt-1 text-xs font-bold text-slate-100 sm:text-sm">
                  {formatMoney(payPlan.totalExpenses)}
                </p>
              </div>
              <div className="rounded-lg border border-white/8 bg-slate-900/45 px-2 py-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  Expenses
                </p>
                <p className="mt-1 text-sm font-bold text-slate-100">
                  {expenseCount}
                </p>
              </div>
              <div className="rounded-lg border border-white/8 bg-slate-900/45 px-2 py-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  Members
                </p>
                <p className="mt-1 text-sm font-bold text-slate-100">
                  {memberCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {!hasPayments ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-10 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              <h3 className="mt-3 text-sm font-bold text-slate-100">
                No payments needed
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-400">
                The recorded expenses are balanced for the current group data.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {payPlan.payments.map((payment, index) => (
                <motion.div
                  key={`${payment.fromId}-${payment.toId}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-xl border border-white/8 bg-slate-900/45 p-3.5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <MemberPill name={payment.fromName} tone="rose" />
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-800">
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </div>
                      <MemberPill name={payment.toName} tone="emerald" />
                    </div>

                    <div className="rounded-lg border border-indigo-500/25 bg-indigo-500/10 px-3 py-2 text-right">
                      <p className="text-[10px] uppercase tracking-wide text-indigo-300">
                        Amount
                      </p>
                      <p className="text-sm font-bold text-indigo-100">
                        {formatMoney(payment.amount)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/8 bg-slate-800">
        <div className="border-b border-white/8 bg-slate-700/35 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-100">Member Balances</h3>
          <p className="mt-1 text-xs text-slate-400">
            Positive means receives, negative means pays.
          </p>
        </div>
        <div className="max-h-[360px] divide-y divide-white/6 overflow-y-auto">
          {payPlan.balances.map((member) => {
            const isNeutral = Math.abs(member.balance) <= 0.01;
            const isPositive = member.balance > 0.01;
            return (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-slate-700 text-xs font-bold text-slate-200">
                    {member.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-100">
                      {member.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {member.secondary}
                    </p>
                  </div>
                </div>

                <div
                  className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-right ${
                    isNeutral
                      ? "border-white/8 bg-slate-700/60 text-slate-300"
                      : isPositive
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide">
                    {isNeutral ? "Even" : isPositive ? "Receives" : "Pays"}
                  </p>
                  <p className="text-xs font-bold">
                    {formatMoney(Math.abs(member.balance))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MemberPill({ name, tone }) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
      : "border-rose-500/25 bg-rose-500/10 text-rose-100";

  return (
    <div className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 py-2 ${toneClass}`}>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-950/35 text-xs font-bold">
        {name?.charAt(0)?.toUpperCase() || "?"}
      </div>
      <p className="truncate text-sm font-semibold">{name || "Unknown"}</p>
    </div>
  );
}

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

// ─── Activity Tab ─────────────────────────────────────────────────────────────

function ActivityTab({ group, expenses = [], currentUser, onExpenseChanged }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [openInEditMode, setOpenInEditMode] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    expenseId: "",
    title: "",
  });

  const currentUserId = getNormalizedId(currentUser);

  useEffect(() => {
    buildTimeline();
  }, [group._id, expenses, currentUser?._id, currentUser?.id]);

  const buildTimeline = async () => {
    try {
      setLoading(true);
      const expenseEvents = (expenses || []).map((expense) => ({
        id: `expense-${expense._id}`,
        type: "expense",
        createdAt: expense.createdAt || expense.date,
        title: expense.description,
        subtitle: `Paid by ${expense.paidBy?.fullName || expense.paidBy?.name || "Unknown"}`,
        amount: Number(expense.amount || 0),
        status: "expense",
        details: {
          category: expense.category || "other",
          paidByName: expense.paidBy?.fullName || expense.paidBy?.name || "Unknown",
          paidById: expense.paidBy?._id || expense.paidBy?.id || expense.paidBy,
          date: expense.date,
          splitBetween: expense.splitBetween || [],
          notes: expense.notes || "",
          expenseId: expense._id,
        },
      }));

      const merged = expenseEvents.sort(
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

  const getExpenseCategoryLabel = (category) =>
    String(category || "other").replace(/^\w/, (char) => char.toUpperCase());

  const canManageItem = (item) => {
    if (item?.type !== "expense") return false;
    if (!item?.details?.expenseId) return false;
    const payerId = getNormalizedId(item?.details?.paidById);
    return Boolean(currentUserId && payerId === currentUserId);
  };

  const requestDeleteFromList = (item, event) => {
    event.stopPropagation();
    const expenseId = item?.details?.expenseId;
    if (!expenseId) return;

    setDeleteConfirm({
      open: true,
      expenseId,
      title: item?.title || "this expense",
    });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ open: false, expenseId: "", title: "" });
  };

  const handleDeleteFromList = async () => {
    if (!deleteConfirm.expenseId) return;

    const deletingId = deleteConfirm.expenseId;

    try {
      setDeletingExpenseId(deletingId);
      await axios.delete(`/api/expenses/${deletingId}`);
      toast.success("Expense deleted");
      await onExpenseChanged?.();
      await buildTimeline();
      closeDeleteConfirm();
    } catch (error) {
      console.error("Expense delete failed:", error);
      toast.error(error.response?.data?.error || "Failed to delete expense");
    } finally {
      setDeletingExpenseId("");
    }
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
          Expenses for this group will appear here.
        </p>
      </motion.div>
    );
  }

  const groupedTimeline = groupExpensesByDate(timeline);

  return (
    <>
      <div className="space-y-6">
        {groupedTimeline.map((section, sectionIndex) => (
          <section key={section.key} className="space-y-2.5">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-slate-900/95 px-3 py-2 backdrop-blur">
              <div className="flex min-w-0 items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-indigo-300" />
                <h3 className="truncate text-sm font-bold text-slate-100">
                  {section.label}
                </h3>
              </div>
              <div className="shrink-0 rounded-md border border-white/8 bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-300">
                {section.items.length} expense
                {section.items.length === 1 ? "" : "s"} - {formatMoney(section.total)}
              </div>
            </div>

            <div className="space-y-2.5">
              {section.items.map((item, itemIndex) => {
                const canManage = canManageItem(item);
                const isDeleting = deletingExpenseId === item?.details?.expenseId;
                const payerId = getNormalizedId(item?.details?.paidById);
                const expensePaidByCurrentUser = payerId === currentUserId;
                const splitCount = getSplitMemberCount({
                  splitBetween: item?.details?.splitBetween || [],
                });
                const amountClass = expensePaidByCurrentUser
                  ? "text-emerald-300"
                  : "text-rose-300";
                const splitLabel =
                  splitCount === 1
                    ? "Split with 1 member"
                    : `Split with ${splitCount} members`;

                return (
                  <motion.div
                    key={item.id || `${section.key}-${itemIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (sectionIndex + itemIndex) * 0.02 }}
                    className="group overflow-hidden rounded-xl border border-white/8 bg-slate-800 transition-colors hover:border-indigo-500/35 hover:bg-slate-700/35"
                  >
                    <div className="flex items-start gap-3 p-3.5">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
                        <Receipt className="h-5 w-5 text-indigo-300" />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenInEditMode(false);
                          setSelectedActivity(item);
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-100">
                              {item.title}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              {item.subtitle}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className={`text-sm font-bold ${amountClass}`}>
                              {formatMoney(item.amount)}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {expensePaidByCurrentUser
                                ? "You paid"
                                : "Group expense"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md border border-white/8 bg-slate-700/70 px-2 py-1 text-[11px] font-semibold text-slate-300">
                            <FileText className="h-3 w-3 text-slate-400" />
                            {getExpenseCategoryLabel(item?.details?.category)}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md border border-white/8 bg-slate-700/70 px-2 py-1 text-[11px] font-semibold text-slate-300">
                            <Users className="h-3 w-3 text-slate-400" />
                            {splitLabel}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md border border-white/8 bg-slate-700/70 px-2 py-1 text-[11px] font-semibold text-slate-300">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {new Date(item.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </button>

                      {canManage && (
                        <button
                          type="button"
                          onClick={(event) => requestDeleteFromList(item, event)}
                          disabled={isDeleting}
                          className="shrink-0 rounded-md border border-rose-500/40 bg-rose-500/15 p-2 text-rose-200 transition-colors hover:bg-rose-500/25 disabled:opacity-60"
                          title="Delete expense"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <AnimatePresence>
        {selectedActivity && (
          <ActivityDetailsModal
            activity={selectedActivity}
            group={group}
            currentUser={currentUser}
            initialEditing={openInEditMode}
            onExpenseChanged={onExpenseChanged}
            onClose={() => {
              setSelectedActivity(null);
              setOpenInEditMode(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm.open && (
          <DeleteExpenseConfirmModal
            title={deleteConfirm.title}
            loading={deletingExpenseId === deleteConfirm.expenseId}
            onCancel={closeDeleteConfirm}
            onConfirm={handleDeleteFromList}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function ActivityDetailsModal({
  activity,
  group,
  currentUser,
  initialEditing = false,
  onClose,
  onExpenseChanged,
}) {
  const isExpense = activity.type === "expense";
  const details = activity.details || {};
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [splitMode, setSplitMode] = useState("equal");
  const [selectedSplitUsers, setSelectedSplitUsers] = useState([]);
  const [customSplitAmounts, setCustomSplitAmounts] = useState({});

  const memberOptions = (group?.members || [])
    .map((member, idx) => {
      const id = getNormalizedId(member?.userId || member);
      if (!id) return null;

      return {
        id,
        name: getMemberName(member) || `Member ${idx + 1}`,
      };
    })
    .filter(Boolean);

  const buildEqualSplit = (memberIds, totalAmount) => {
    if (!Array.isArray(memberIds) || memberIds.length === 0) return [];

    const n = memberIds.length;
    const base = Number((totalAmount / n).toFixed(2));
    const amounts = memberIds.map(() => base);
    const used = amounts.reduce((sum, v) => sum + v, 0);
    const diff = Number((totalAmount - used).toFixed(2));
    amounts[n - 1] = Number((amounts[n - 1] + diff).toFixed(2));

    return memberIds.map((id, idx) => ({ userId: id, amount: amounts[idx] }));
  };

  const [form, setForm] = useState({
    description: activity.title || "",
    amount: Number(activity.amount || 0),
    category: details.category || "other",
    date: details.date
      ? new Date(details.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    paidBy: getNormalizedId(details.paidById),
  });

  useEffect(() => {
    const normalizedSplit = (details.splitBetween || [])
      .map((split) => ({
        userId: getNormalizedId(split?.userId),
        amount: Number(split?.amount || 0),
      }))
      .filter((split) => split.userId);

    const splitIds = normalizedSplit.map((split) => split.userId);
    const splitAmounts = Object.fromEntries(
      normalizedSplit.map((split) => [split.userId, split.amount]),
    );

    const total = Number(activity.amount || 0);
    const average = splitIds.length ? total / splitIds.length : 0;
    const isEqualLike =
      splitIds.length > 0 &&
      normalizedSplit.every(
        (split) => Math.abs(Number(split.amount || 0) - average) <= 0.02,
      );

    setIsEditing(Boolean(initialEditing && activity.type === "expense"));
    setForm({
      description: activity.title || "",
      amount: Number(activity.amount || 0),
      category: details.category || "other",
      date: details.date
        ? new Date(details.date).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      paidBy: getNormalizedId(details.paidById),
    });
    setSelectedSplitUsers(splitIds);
    setCustomSplitAmounts(splitAmounts);
    setSplitMode(isEqualLike ? "equal" : "custom");
  }, [activity.id, activity.type, initialEditing]);

  const currentUserId = getNormalizedId(currentUser);
  const paidById = getNormalizedId(details.paidById);
  const canManageExpense =
    isExpense && !!details.expenseId && currentUserId === paidById;

  const handleSaveExpense = async () => {
    try {
      const amountNumber = Number(form.amount);
      if (!form.description.trim()) {
        toast.error("Description is required");
        return;
      }
      if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
        toast.error("Amount must be greater than 0");
        return;
      }
      if (selectedSplitUsers.length === 0) {
        toast.error("Please select at least one member in split");
        return;
      }

      let splitBetween = [];
      if (splitMode === "equal") {
        splitBetween = buildEqualSplit(selectedSplitUsers, amountNumber);
      } else {
        splitBetween = selectedSplitUsers.map((userId) => ({
          userId,
          amount: Number(customSplitAmounts[userId] || 0),
        }));

        const hasInvalidAmount = splitBetween.some(
          (split) => !Number.isFinite(split.amount) || split.amount <= 0,
        );
        if (hasInvalidAmount) {
          toast.error("Each custom split amount must be greater than 0");
          return;
        }

        const splitTotal = splitBetween.reduce((sum, split) => sum + split.amount, 0);
        if (Math.abs(splitTotal - amountNumber) > 0.01) {
          toast.error("Custom split total must match expense amount");
          return;
        }
      }

      setSaving(true);
      await axios.put(`/api/expenses/${details.expenseId}`, {
        description: form.description.trim(),
        amount: amountNumber,
        category: form.category,
        date: form.date,
        splitBetween,
      });

      toast.success("Expense updated");
      setIsEditing(false);
      await onExpenseChanged?.();
      onClose();
    } catch (error) {
      console.error("Expense update failed:", error);
      toast.error(error.response?.data?.error || "Failed to update expense");
    } finally {
      setSaving(false);
    }
  };

  const statusLabel = "Expense";
  const statusClass = "border-white/20 bg-white/10 text-slate-300";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-24 pt-4 sm:pb-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-slate-800 rounded-t-xl sm:rounded-xl border border-white/8 w-full max-w-md max-h-[calc(100vh-7rem)] sm:max-h-[85vh] overflow-y-auto shadow-xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-slate-700/40">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Expense Details
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
          {isExpense ? (
            <>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Description</p>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  disabled={!isEditing}
                  className="w-full rounded-lg border border-white/12 bg-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Amount</p>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-white/12 bg-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Date</p>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, date: e.target.value }))
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-white/12 bg-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                  <p className="text-xs text-slate-400">Category</p>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-white/12 bg-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="food">Food</option>
                    <option value="travel">Travel</option>
                    <option value="accommodation">Accommodation</option>
                    <option value="shopping">Shopping</option>
                    <option value="entertainment">Entertainment</option>
                      <option value="other">Other</option>
                    </select>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-400">Split Type</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => isEditing && setSplitMode("equal")}
                    disabled={!isEditing}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                      splitMode === "equal"
                        ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-200"
                        : "border-white/12 bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    Equal
                  </button>
                  <button
                    type="button"
                    onClick={() => isEditing && setSplitMode("custom")}
                    disabled={!isEditing}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                      splitMode === "custom"
                        ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-200"
                        : "border-white/12 bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-400">Split Between</p>
                <div className="max-h-44 overflow-y-auto space-y-1.5 rounded-lg border border-white/10 bg-slate-700/30 p-2">
                  {memberOptions.map((member) => {
                    const checked = selectedSplitUsers.includes(member.id);

                    return (
                      <label
                        key={member.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-slate-700/40 px-2.5 py-2"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!isEditing}
                            onChange={() => {
                              setSelectedSplitUsers((prev) => {
                                if (prev.includes(member.id)) {
                                  return prev.filter((id) => id !== member.id);
                                }
                                return [...prev, member.id];
                              });
                            }}
                            className="accent-indigo-500"
                          />
                          <span className="text-xs text-slate-200 truncate">{member.name}</span>
                        </span>

                        {splitMode === "custom" && checked ? (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={customSplitAmounts[member.id] ?? ""}
                            onChange={(e) => {
                              const nextValue = e.target.value;
                              setCustomSplitAmounts((prev) => ({
                                ...prev,
                                [member.id]: nextValue,
                              }));
                            }}
                            disabled={!isEditing}
                            className="w-24 rounded-md border border-white/12 bg-slate-800 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                            placeholder="0.00"
                          />
                        ) : null}
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Amount</p>
              <p className="text-xl font-bold text-slate-100">
                ₹{Number(activity.amount || 0).toFixed(2)}
              </p>
            </div>
          )}

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

          {details.notes ? (
            <div className="pt-1">
              <p className="text-xs text-slate-400 mb-1">Notes</p>
              <p className="text-xs text-slate-300 bg-slate-700/40 border border-white/8 rounded-lg px-3 py-2">
                {details.notes}
              </p>
            </div>
          ) : null}

        </div>

        <div className="px-5 py-3 border-t border-white/8 bg-slate-700/30">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
            >
              Close
            </button>
            {canManageExpense && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2.5 rounded-lg bg-slate-600 text-white text-sm font-semibold hover:bg-slate-500 transition-colors"
              >
                Edit
              </button>
            )}
            {canManageExpense && isEditing && (
              <button
                type="button"
                onClick={handleSaveExpense}
                disabled={saving}
                className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Save size={14} />
                  {saving ? "Saving" : "Save"}
                </span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DeleteExpenseConfirmModal({ title, loading, onCancel, onConfirm }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-slate-800 rounded-t-xl sm:rounded-xl border border-white/8 w-full max-w-sm overflow-hidden shadow-xl"
      >
        <div className="px-5 py-4 border-b border-white/8 bg-slate-700/40">
          <h3 className="text-sm font-bold text-slate-100">Delete Expense</h3>
          <p className="text-xs text-slate-400 mt-1">
            Are you sure you want to delete &quot;{title}&quot;? This action cannot be undone.
          </p>
        </div>

        <div className="px-5 py-3 border-t border-white/8 bg-slate-700/30">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-600 text-white text-sm font-semibold hover:bg-slate-500 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 transition-colors disabled:opacity-60"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GroupInviteShareModal({
  groupName,
  inviteUrl,
  regenerating,
  onCopy,
  onRegenerate,
  onClose,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-800 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">Share Invite</h3>
            <p className="mt-1 text-xs text-slate-400">
              Anyone with this link can join {groupName} after signing in.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-700 hover:text-slate-200"
            aria-label="Close invite sharing"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-400">
              Group invite link
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={inviteUrl || "Invite link unavailable"}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none"
              />
              <button
                type="button"
                onClick={onCopy}
                disabled={!inviteUrl}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Copy size={15} />
                Copy
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onRegenerate}
            disabled={regenerating}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-400/20 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {regenerating ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {regenerating ? "Regenerating..." : "Regenerate link"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ReportShareModal({ groupName, fileName, file, onClose }) {
  const [nativeShareSupported, setNativeShareSupported] = useState(false);

  useEffect(() => {
    setNativeShareSupported(Boolean(typeof navigator !== "undefined" && navigator.share));
  }, []);

  const handleShareNative = async () => {
    try {
      if (!navigator.share || !file) return;

      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        throw new Error("Native file share not supported");
      }

      await navigator.share({
        title: `Money Split report for ${groupName}`,
        text: `Sharing group activity report for ${groupName}`,
        files: [file],
      });
    } catch (error) {
      if (error?.name !== "AbortError") {
        toast.error("Native share is not available on this device");
      }
    }
  };

  const handleShareWhatsApp = () => {
    const text = [
      "Money Split Report",
      `Prepared for: ${groupName}`,
      `File: ${fileName}`,
      "I have downloaded the report and sharing it now.",
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareEmail = () => {
    const subject = `Money Split report - ${groupName}`;
    const body = [
      "Hi,",
      "",
      `Please find the Money Split group report for ${groupName}.`,
      `Report file: ${fileName}`,
      "",
      "Note: Attach the downloaded PDF from your device before sending.",
      "",
      "Regards,",
      "Money Split",
    ].join("\n");
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-800 shadow-2xl"
      >
        <div className="px-5 py-4 border-b border-white/8">
          <h3 className="text-base font-bold text-slate-100">Share Report</h3>
          <p className="text-xs text-slate-400 mt-1">
            PDF downloaded successfully. Share it quickly using one of these actions.
          </p>
        </div>

        <div className="p-5 space-y-3">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full flex items-center gap-2 rounded-lg border border-white/10 bg-slate-700/50 px-4 py-2.5 text-sm text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <MessageCircle size={16} className="text-emerald-400" />
            Share via WhatsApp
          </button>

          <button
            type="button"
            onClick={handleShareEmail}
            className="w-full flex items-center gap-2 rounded-lg border border-white/10 bg-slate-700/50 px-4 py-2.5 text-sm text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <Mail size={16} className="text-sky-400" />
            Share via Email
          </button>

          {nativeShareSupported && (
            <button
              type="button"
              onClick={handleShareNative}
              className="w-full flex items-center gap-2 rounded-lg border border-white/10 bg-slate-700/50 px-4 py-2.5 text-sm text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <Share2 size={16} className="text-indigo-400" />
              Share from device
            </button>
          )}
        </div>

        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
