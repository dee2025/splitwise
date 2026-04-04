"use client";

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
import { useEffect, useState } from "react";
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

function buildSettlementPlan(expenses = []) {
  const balances = {};

  for (const expense of expenses) {
    const paidById = getNormalizedId(expense?.paidBy?._id || expense?.paidBy);
    const amount = Number(expense?.amount || 0);

    if (paidById && Number.isFinite(amount) && amount > 0) {
      balances[paidById] = round2((balances[paidById] || 0) + amount);
    }

    for (const split of expense?.splitBetween || []) {
      const splitUserId = getNormalizedId(split?.userId);
      const splitAmount = Number(split?.amount || 0);
      if (!splitUserId || !Number.isFinite(splitAmount)) continue;

      balances[splitUserId] = round2((balances[splitUserId] || 0) - splitAmount);
    }
  }

  const creditors = [];
  const debtors = [];

  for (const [userId, amount] of Object.entries(balances)) {
    const normalized = round2(amount);
    if (normalized > 0.01) creditors.push({ userId, amount: normalized });
    if (normalized < -0.01) debtors.push({ userId, amount: Math.abs(normalized) });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const settledAmount = round2(Math.min(debtor.amount, creditor.amount));
    if (settledAmount > 0.01) {
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: settledAmount,
      });
    }

    debtor.amount = round2(debtor.amount - settledAmount);
    creditor.amount = round2(creditor.amount - settledAmount);

    if (debtor.amount <= 0.01) debtorIndex += 1;
    if (creditor.amount <= 0.01) creditorIndex += 1;
  }

  return settlements;
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
  const [completingTrip, setCompletingTrip] = useState(false);
  const [debts, setDebts] = useState([]);
  const [loadingDebts, setLoadingDebts] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [reportShare, setReportShare] = useState({
    open: false,
    file: null,
    fileName: "",
  });
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

  const openGlobalAddExpense = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("splitzy:open-add-expense", {
        detail: { groupId: group?._id || groupId },
      }),
    );
  };

  const handleCompleteTrip = async () => {
    try {
      setCompletingTrip(true);
      const res = await axios.put(`/api/groups/complete-trip`, { groupId });
      setGroup(res.data.group);
      toast.success("Trip completed! Time to settle up!");
      // setActiveTab("settlements");
      setActiveTab("activity");
    } catch (error) {
      console.error("Error completing trip:", error);
      toast.error(error.response?.data?.message || "Failed to complete trip");
    } finally {
      setCompletingTrip(false);
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

      const memberNameMap = new Map();
      for (const member of group?.members || []) {
        const memberId = getNormalizedId(member?.userId || member);
        if (!memberId) continue;
        memberNameMap.set(memberId, getMemberName(member));
      }

      const displayNameFromId = (id) => memberNameMap.get(String(id)) || "Unknown";

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

      const overallDebts =
        debts?.length > 0
          ? debts.map((d) => ({
              fromName: d.fromUser || "Unknown",
              toName: d.toUser || "Unknown",
              amount: Number(d.amount || 0),
            }))
          : buildSettlementPlan(sortedExpenses).map((d) => ({
              fromName: displayNameFromId(d.from),
              toName: displayNameFromId(d.to),
              amount: Number(d.amount || 0),
            }));

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
      doc.text("Split smart. Settle fast. Stay stress free.", 40, 74);
      doc.setTextColor(203, 213, 225);
      doc.text(
        "Money Split helps friends, roommates, and travel groups track shared expenses with full clarity.",
        40,
        94,
      );
      doc.text(
        "This report gives a complete snapshot: overall pending settlements + date-wise activity details.",
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
          ["Pending overall settlements", `${overallDebts.length}`],
        ],
        styles: { fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: [55, 65, 81] },
        columnStyles: {
          0: { cellWidth: 230 },
          1: { cellWidth: 180 },
        },
      });

      let cursorY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 16 : 320;

      doc.setFontSize(13);
      doc.setTextColor(20);
      doc.text("Overall: Who Pays Whom (Till Date)", 40, cursorY);
      cursorY += 8;

      if (!overallDebts.length) {
        doc.setFontSize(10);
        doc.setTextColor(90);
        doc.text("No pending settlements. Everyone is settled up.", 40, cursorY + 14);
        cursorY += 26;
      } else {
        autoTable(doc, {
          startY: cursorY,
          theme: "striped",
          head: [["From", "To", "Amount"]],
          body: overallDebts.map((item) => [
            item.fromName,
            item.toName,
            `INR ${Number(item.amount || 0).toFixed(2)}`,
          ]),
          styles: { fontSize: 10, cellPadding: 6 },
          headStyles: { fillColor: [79, 70, 229] },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        });
        cursorY = (doc.lastAutoTable?.finalY || cursorY) + 16;
      }

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
              displayNameFromId(getNormalizedId(expense?.paidBy));

            const splitNames = (expense?.splitBetween || [])
              .map((split) => {
                const splitId = getNormalizedId(split?.userId);
                return (
                  split?.userId?.fullName ||
                  split?.userId?.name ||
                  displayNameFromId(splitId)
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

        const daySettlements = buildSettlementPlan(dayExpenses);
        const settlementRows = daySettlements.map((settlement) => [
          displayNameFromId(settlement.from),
          displayNameFromId(settlement.to),
          `INR ${Number(settlement.amount || 0).toFixed(2)}`,
        ]);

        autoTable(doc, {
          startY: cursorY,
          theme: "striped",
          head: [["Daily Settlement - From", "To", "Amount"]],
          body:
            settlementRows.length > 0
              ? settlementRows
              : [["No dues", "No dues", "INR 0.00"]],
          styles: { fontSize: 9, cellPadding: 5 },
          headStyles: { fillColor: [5, 150, 105] },
          alternateRowStyles: { fillColor: [240, 253, 244] },
        });

        cursorY = (doc.lastAutoTable?.finalY || cursorY) + 18;
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

            

            {/* <div className="flex items-center gap-2 shrink-0 flex-wrap">
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
                onClick={openGlobalAddExpense}
                disabled={group.tripStatus === "completed"}
                className="flex items-center gap-1.5 sm:gap-2 bg-indigo-600 text-white px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-indigo-600 hover:bg-indigo-500 transition-all duration-150 font-medium text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Plus size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Add</span>
              </motion.button>
            </div> */}
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
              {/* <h2 className="text-lg font-bold text-slate-100 mb-4">
                Who Owes Who
              </h2> */}
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

              {/*
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
              */}
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
                      await fetchDebts();
                    }}
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
  const [netBalance, setNetBalance] = useState(0);
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

      const currentUserId = currentUser?._id?.toString?.() || "";
      const calculatedNet = Number(
        calculateRes.data?.balances?.[currentUserId] || 0,
      );
      setNetBalance(calculatedNet);
    } catch (error) {
      console.error("Settlement fetch error:", error);
      toast.error("Failed to load settlements");
      setSettlements([]);
      setSuggestedSettlements([]);
      setNetBalance(0);
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
  const youOweFromExpenses = netBalance < 0 ? Math.abs(netBalance) : 0;
  const youGetFromExpenses = netBalance > 0 ? netBalance : 0;

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
          <p className="text-xs text-slate-400">You Owe (Net)</p>
          <p className="text-lg font-bold text-rose-400">
            {currencySymbol}
            {Number(youOweFromExpenses || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-700/30 border border-white/8 rounded-lg p-3">
          <p className="text-xs text-slate-400">You Get (Net)</p>
          <p className="text-lg font-bold text-emerald-400">
            {currencySymbol}
            {Number(youGetFromExpenses || 0).toFixed(2)}
          </p>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 px-1">
        Net is calculated from expenses and completed settlements only. Pending requests do not change net balances.
      </p>

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
  const isGroupAdmin = (group?.members || []).some((member) => {
    return (
      getNormalizedId(member?.userId || member) === currentUserId &&
      member?.role === "admin"
    );
  });

  useEffect(() => {
    buildTimeline();
  }, [group._id, expenses, currentUser?._id, currentUser?.id]);

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
          paidById: expense.paidBy?._id || expense.paidBy?.id || expense.paidBy,
          date: expense.date,
          splitBetween: expense.splitBetween || [],
          notes: expense.notes || "",
          expenseId: expense._id,
        },
      }));

      const settlementEvents = settlements.map((settlement) => {
        const fromName = settlement.fromUser?.fullName || settlement.fromUser?.username || "Unknown";
        const toName = settlement.toUser?.fullName || settlement.toUser?.username || "Unknown";
        const currentUserId = getNormalizedId(currentUser);

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

  const canManageItem = (item) => {
    if (item?.type !== "expense") return false;
    if (!item?.details?.expenseId) return false;
    const payerId = getNormalizedId(item?.details?.paidById);
    return Boolean(currentUserId && (payerId === currentUserId || isGroupAdmin));
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
          Expenses and settlements of this group will appear here.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      {/* <p className="text-[11px] text-slate-400 mb-2 px-1">
        Tap any row to view details. Use the action buttons on expense rows to edit or delete quickly.
      </p> */}
      <div className="space-y-2">
        {timeline.map((item, index) => {
          const cfg = getRowConfig(item);
          const canManage = canManageItem(item);
          const isDeleting = deletingExpenseId === item?.details?.expenseId;
          const expensePaidByCurrentUser =
            item?.type === "expense" &&
            getNormalizedId(item?.details?.paidById) === currentUserId;
          const amountClass =
            item?.type === "expense"
              ? expensePaidByCurrentUser
                ? "text-emerald-400"
                : "text-rose-400"
              : "text-indigo-300";

          return (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`w-full text-left flex items-start gap-3 bg-slate-800 p-3 rounded-lg border ${cfg.border} hover:bg-slate-700/40 transition-colors overflow-hidden`}
            >
              <div className="w-7 h-7 rounded border border-white/12 bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                {cfg.icon}
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpenInEditMode(false);
                  setSelectedActivity(item);
                }}
                className="flex-1 min-w-0 text-left"
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <p className="text-sm text-slate-100 truncate flex-1 min-w-0">{item.title}</p>
                
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{item.subtitle}</p>
                <p className={`text-xs mt-1 ${amountClass}`}>₹{Number(item.amount || 0).toFixed(2)}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(item.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </button>

              {canManage && (
                <div className="flex items-center gap-1 shrink-0 self-start">
                  <button
                    type="button"
                    onClick={(event) => requestDeleteFromList(item, event)}
                    disabled={isDeleting}
                    className="px-2 py-1.5 rounded-md border border-rose-500/40 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25 transition-colors disabled:opacity-60"
                    title="Delete expense"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
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
  const [copiedKey, setCopiedKey] = useState("");
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
  const isGroupAdmin = (group?.members || []).some((member) => {
    const memberId = getNormalizedId(member?.userId || member);
    return memberId === currentUserId && member?.role === "admin";
  });
  const canManageExpense =
    isExpense && !!details.expenseId && (currentUserId === paidById || isGroupAdmin);

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
      if (!form.paidBy) {
        toast.error("Please select who paid");
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
        paidBy: form.paidBy,
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
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Paid By</p>
                  <select
                    value={form.paidBy}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, paidBy: e.target.value }))
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-white/12 bg-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select member</option>
                    {memberOptions.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
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

          {!isExpense ? (
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
          ) : null}

          {details.notes ? (
            <div className="pt-1">
              <p className="text-xs text-slate-400 mb-1">Notes</p>
              <p className="text-xs text-slate-300 bg-slate-700/40 border border-white/8 rounded-lg px-3 py-2">
                {details.notes}
              </p>
            </div>
          ) : null}

          {/* {(details.expenseId || details.settlementId) && (
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
          )} */}
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
            Are you sure you want to delete "{title}"? This action cannot be undone.
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
