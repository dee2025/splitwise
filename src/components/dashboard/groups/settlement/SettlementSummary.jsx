"use client";

import axios from "axios";
import { CheckCircle, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/**
 * Settlement Summary - Shows who owes whom in a group
 * Mobile-first responsive design
 */
export default function SettlementSummary({ groupId, onSettleClick }) {
  const [loading, setLoading] = useState(false);
  const [settlements, setSettlements] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (groupId) {
      fetchSettlementData();
    }
  }, [groupId]);

  const fetchSettlementData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/api/settlements/calculate?groupId=${groupId}`,
      );
      setSettlements(data.settlements);
      setSummary(data.summary);
    } catch (err) {
      console.error("Error fetching settlements:", err);
      toast.error("Failed to load settlements");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!summary || settlements.length === 0) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 md:p-6 rounded-lg md:rounded-2xl border border-green-200 mb-4">
        <div className="flex items-center gap-2 text-sm md:text-base">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-green-700 font-medium">
            Everyone is all settled up!
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Summary Card */}
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div>
            <p className="text-xs md:text-sm text-gray-600">
              Transactions Needed
            </p>
            <p className="text-lg md:text-2xl font-bold text-gray-900">
              {summary.totalSettlements}
            </p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-600">Total Amount</p>
            <p className="text-lg md:text-2xl font-bold text-blue-600">
              ₹{summary.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Settlement Transactions */}
      <div className="space-y-2">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 px-1">
          Suggested Settlements
        </h3>
        {settlements.map((settlement, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg md:rounded-lg shadow-sm border border-gray-100 p-3 md:p-4 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs md:text-sm font-medium text-gray-900 truncate">
                {settlement.fromUser?.fullName || settlement.fromUser?.username}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">pays</div>
              <div className="text-xs md:text-sm font-medium text-gray-900 truncate">
                {settlement.toUser?.fullName || settlement.toUser?.username}
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 ml-2 flex-shrink-0">
              <span className="text-base md:text-lg font-bold text-gray-900">
                ₹{settlement.amount.toFixed(2)}
              </span>
              <button
                onClick={() => onSettleClick?.(settlement)}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors"
              >
                Settle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
