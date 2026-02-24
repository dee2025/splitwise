"use client";

import axios from "axios";
import { Calendar, CheckCircle, Loader, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/**
 * Final Settlement Component - After Trip Completion
 * Simple, clean, minimal workflow
 */
export default function FinalSettlementModal({
  isOpen,
  onClose,
  groupId,
  group,
}) {
  const [step, setStep] = useState("summary"); // summary -> payment -> confirmation -> done
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [method, setMethod] = useState("cash");
  const [proof, setProof] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen && groupId) {
      fetchBalances();
    }
  }, [isOpen, groupId]);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/api/settlements/calculate-final?groupId=${groupId}`,
      );
      setBalances(data);

      // Prepare settlements
      if (data.currentUser.owesAmount > 0) {
        // User owes money - find who to pay
        const debtors = data.allBalances.filter((b) => b.balance < 0);
        const tempSettlements = [];

        // Simple: each balance determines payment
        data.allBalances.forEach((person) => {
          if (person.id !== data.currentUser.id && person.balance > 0) {
            // This person is owed, calculate amount
            tempSettlements.push({
              toUser: person,
              fromUser: data.currentUser,
              amount:
                person.balance > data.currentUser.owesAmount
                  ? data.currentUser.owesAmount
                  : person.balance,
            });
          }
        });

        setSettlements(tempSettlements);
      }
    } catch (err) {
      console.error("Error fetching balances:", err);
      toast.error("Failed to load settlement balances");
    } finally {
      setLoading(false);
    }
  };

  const handleSettleClick = (settlement) => {
    setSelectedSettlement(settlement);
    setStep("payment");
  };

  const handleConfirmPayment = async () => {
    if (!selectedSettlement) {
      toast.error("Invalid settlement");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(`/api/settlements/create-final`, {
        groupId,
        toUserId: selectedSettlement.toUser.id,
        totalAmount: selectedSettlement.amount,
        method,
        paymentDetails: method !== "cash" ? { method } : undefined,
        proof: proof || undefined,
        notes: notes || undefined,
      });

      toast.success("Settlement request sent! ✅");
      setStep("done");
      setSettlements((prev) => prev.filter((s) => s !== selectedSettlement));
    } catch (err) {
      console.error("Settlement error:", err);
      toast.error(err.response?.data?.error || "Failed to create settlement");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("summary");
    setSelectedSettlement(null);
    setMethod("cash");
    setProof("");
    setNotes("");
    onClose();
  };

  if (!isOpen) return null;

  if (loading && !balances) {
    return (
      <>
        <div className="fixed inset-0 bg-black/40 z-40" onClick={handleClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600 font-medium">Loading balances...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
        <div className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Trip Settlement</h2>
            <button onClick={handleClose} className="p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* STEP 1: Summary */}
            {step === "summary" && balances && (
              <div className="space-y-4">
                {/* Trip Info */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <p className="text-xs text-gray-600 flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    Trip: {group?.name}
                  </p>
                  <p className="font-semibold text-gray-900">
                    Status: Completed ✔
                  </p>
                </div>

                {/* Your Balance */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Your Balance</h3>
                  {balances.currentUser.owesAmount > 0 ? (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                      <p className="text-sm text-gray-600 mb-1">You Owe</p>
                      <p className="text-3xl font-bold text-red-600">
                        ₹{balances.currentUser.owesAmount.toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                      <p className="text-sm text-gray-600 mb-1">You're Owed</p>
                      <p className="text-3xl font-bold text-green-600">
                        ₹{balances.currentUser.isOwedAmount.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Settlement Breakdown */}
                {settlements.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Pay To:</h3>
                    {settlements.map((s, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {s.toUser.name}
                          </p>
                          <p className="text-xs text-gray-500">Amount due</p>
                        </div>
                        <p className="font-bold text-lg text-gray-900">
                          ₹{s.amount.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {settlements.length === 0 &&
                  balances.currentUser.owesAmount === 0 && (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-green-700">
                        All Settled! ✅
                      </p>
                    </div>
                  )}
              </div>
            )}

            {/* STEP 2: Payment Method */}
            {step === "payment" && selectedSettlement && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Pay to</p>
                  <p className="font-bold text-lg text-gray-900">
                    {selectedSettlement.toUser.name}
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    ₹{selectedSettlement.amount.toFixed(2)}
                  </p>
                </div>

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "cash", label: "💵 Cash" },
                      { id: "upi", label: "📱 UPI" },
                      { id: "bank_transfer", label: "🏦 Bank" },
                      { id: "wallet", label: "💳 Wallet" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMethod(m.id)}
                        className={`p-3 rounded-lg border-2 font-medium text-sm transition-all ${
                          method === m.id
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-white text-gray-700"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Proof (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Payment Proof{" "}
                    <span className="text-gray-400 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    value={proof}
                    onChange={(e) => setProof(e.target.value)}
                    placeholder="Screenshot URL or transaction ID..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />
                </div>

                {/* Notes (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Notes{" "}
                    <span className="text-gray-400 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., 'Transferred via bank'"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Done */}
            {step === "done" && (
              <div className="text-center space-y-4 py-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
                    <CheckCircle className="w-16 h-16 text-green-600 relative" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Settlement Sent! ✅
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedSettlement?.toUser.name} received your settlement
                    request. They'll confirm receipt when they verify the
                    payment.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 space-y-2">
            {step === "summary" && settlements.length > 0 && (
              <button
                onClick={() => handleSettleClick(settlements[0])}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Settle Payment
              </button>
            )}

            {step === "payment" && (
              <>
                <button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Settlement"
                  )}
                </button>
                <button
                  onClick={() => setStep("summary")}
                  className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors"
                >
                  Back
                </button>
              </>
            )}

            {step === "done" && (
              <button
                onClick={handleClose}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
