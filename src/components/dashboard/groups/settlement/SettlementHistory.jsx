"use client";

import axios from "axios";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Loader,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/**
 * Settlement History - Show all past settlements
 * Mobile-first design with filtering and tabs
 */
export default function SettlementHistory({ groupId }) {
  const [loading, setLoading] = useState(false);
  const [settlements, setSettlements] = useState([]);
  const [filter, setFilter] = useState("all"); // all, pending, completed
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (groupId) {
      fetchSettlements();
    }
  }, [groupId]);

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/api/settlements/summary?groupId=${groupId}`,
      );
      setSettlements(data.settlements);
      setSummary(data.summary);
    } catch (err) {
      console.error("Error fetching settlements:", err);
      toast.error("Failed to load settlement history");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSettlements = () => {
    if (filter === "pending") {
      return settlements.filter((s) =>
        ["pending", "confirmed"].includes(s.status),
      );
    } else if (filter === "completed") {
      return settlements.filter((s) => s.status === "completed");
    }
    return settlements;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      disputed: "bg-orange-100 text-orange-800",
    };

    const icons = {
      pending: <Clock className="w-3 h-3" />,
      confirmed: <Clock className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      cancelled: <AlertCircle className="w-3 h-3" />,
      disputed: <AlertCircle className="w-3 h-3" />,
    };

    const labels = {
      pending: "Pending",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",
      disputed: "Disputed",
    };

    return (
      <div
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {icons[status]}
        <span>{labels[status]}</span>
      </div>
    );
  };

  const getMethodIcon = (method) => {
    const icons = {
      cash: "💵",
      upi: "📱",
      bank_transfer: "🏦",
      wallet: "💳",
      other: "💸",
    };
    return icons[method] || "💸";
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "short",
      month: "short",
      year: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const filteredSettlements = getFilteredSettlements();

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-gray-600 mb-1">You Owe</p>
            <p className="text-base md:text-lg font-bold text-blue-600">
              ₹{summary.userOweAmount.toFixed(2)}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <p className="text-xs text-gray-600 mb-1">You're Owed</p>
            <p className="text-base md:text-lg font-bold text-green-600">
              ₹{summary.userGetAmount.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 md:gap-3">
        {["all", "pending", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? "All" : f === "pending" ? "Pending" : "Completed"}
            {f === "all" && ` (${settlements.length})`}
            {f === "pending" &&
              ` (${settlements.filter((s) => ["pending", "confirmed"].includes(s.status)).length})`}
            {f === "completed" &&
              ` (${settlements.filter((s) => s.status === "completed").length})`}
          </button>
        ))}
      </div>

      {/* Settlement List */}
      <div className="space-y-2">
        {filteredSettlements.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No settlements found</p>
          </div>
        ) : (
          filteredSettlements.map((settlement) => (
            <div
              key={settlement._id}
              className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {settlement.fromUser?.fullName ||
                        settlement.fromUser?.username}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {settlement.toUser?.fullName ||
                        settlement.toUser?.username}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(settlement.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm text-gray-600">
                        {getMethodIcon(settlement.method)}
                      </span>
                      <span className="text-xs text-gray-600 capitalize">
                        {settlement.method.replace("_", " ")}
                      </span>
                      {settlement.notes && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-600 truncate">
                            {settlement.notes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-base md:text-lg font-bold text-gray-900">
                    ₹{settlement.amount.toFixed(2)}
                  </span>
                  {getStatusBadge(settlement.status)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Method Breakdown */}
      {summary?.breakdown.byMethod &&
        Object.keys(summary.breakdown.byMethod).length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
              Payment Methods Used
            </h3>
            <div className="space-y-2">
              {Object.entries(summary.breakdown.byMethod).map(
                ([method, data]) => (
                  <div
                    key={method}
                    className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getMethodIcon(method)}</span>
                      <span className="text-sm text-gray-600 capitalize">
                        {method.replace("_", " ")}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{data.amount.toFixed(2)} ({data.count})
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
    </div>
  );
}
