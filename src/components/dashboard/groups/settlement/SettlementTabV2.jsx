"use client";

import { RefreshCw, TrendingUp } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import SettlementHistory from "./SettlementHistory";
import SettlementModal from "./SettlementModal";
import SettlementSummary from "./SettlementSummary";

/**
 * Main Settlement Tab Component
 * Integrates all settlement features with mobile-first design
 */
export default function SettlementTabV2({ groupId, onRefresh }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleSettleClick = (settlement) => {
    setSelectedSettlement(settlement);
    setIsModalOpen(true);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      onRefresh?.();
      toast.success("Refreshed!");
    } finally {
      setRefreshing(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSettlement(null);
    onRefresh?.();
  };

  return (
    <div className="w-full space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between px-4 md:px-0">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            Settlements
          </h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-600 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg md:rounded-xl border border-gray-200">
        <div className="grid w-full grid-cols-2 p-1 bg-gray-50 border-b border-gray-200 rounded-t-lg md:rounded-t-xl">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 md:py-3 px-4 text-xs md:text-sm font-medium rounded transition-colors ${
              activeTab === "overview"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-2 md:py-3 px-4 text-xs md:text-sm font-medium rounded transition-colors ${
              activeTab === "history"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            History
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-6">
          {activeTab === "overview" && (
            <SettlementSummary
              groupId={groupId}
              onSettleClick={handleSettleClick}
            />
          )}
          {activeTab === "history" && <SettlementHistory groupId={groupId} />}
        </div>
      </div>

      {/* Settlement Modal */}
      <SettlementModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        settlement={selectedSettlement}
        groupId={groupId}
      />
    </div>
  );
}
