"use client";

import axios from "axios";
import {
  CheckCircle,
  ChevronLeft,
  DollarSign,
  Loader,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/**
 * Settlement Modal - Main component for settlement flow
 * Mobile-first with bottom sheet style for mobile
 */
export default function SettlementModal({
  isOpen,
  onClose,
  settlement,
  groupId,
}) {
  const [step, setStep] = useState("method"); // method -> payment -> confirmation -> receipt
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(settlement?.amount || "");
  const [method, setMethod] = useState("cash");
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    reference: "",
  });
  const [notes, setNotes] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (settlement) {
      setAmount(settlement.amount);
    }
  }, [settlement]);

  const resetForm = () => {
    setStep("method");
    setAmount(settlement?.amount || "");
    setMethod("cash");
    setNotes("");
    setPaymentDetails({
      upiId: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      reference: "",
    });
    setCompleted(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!settlement) {
      toast.error("Invalid settlement data");
      return;
    }

    try {
      setLoading(true);

      // Create settlement
      const response = await axios.post(`/api/settlements/verify`, {
        settlementId: settlement._id,
        action: "confirm",
        method,
        paymentDetails: method !== "cash" ? paymentDetails : undefined,
        notes,
      });

      toast.success("Settlement confirmed!");
      setCompleted(true);
      setStep("receipt");
    } catch (err) {
      console.error("Settlement error:", err);
      toast.error(err.response?.data?.error || "Failed to create settlement");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const paymentMethods = [
    { id: "cash", label: "Cash", icon: "💵" },
    { id: "upi", label: "UPI", icon: "📱" },
    { id: "bank_transfer", label: "Bank Transfer", icon: "🏦" },
    { id: "wallet", label: "Wallet", icon: "💳" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal - Mobile Bottom Sheet Style */}
      <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
        <div className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step !== "method" && (
                <button
                  onClick={() =>
                    setStep(step === "payment" ? "method" : "payment")
                  }
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <h2 className="text-base md:text-lg font-bold text-gray-900">
                Settlement
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 md:px-6 py-4 md:py-6 space-y-4">
            {/* Settlement Details */}
            {settlement && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>
                      From:{" "}
                      <span className="font-medium text-gray-900">
                        {settlement.fromUser?.fullName}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>
                      To:{" "}
                      <span className="font-medium text-gray-900">
                        {settlement.toUser?.fullName}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm md:text-base font-bold text-gray-900 pt-2 border-t border-blue-100">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span>₹{amount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Method Selection */}
            {step === "method" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {paymentMethods.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setMethod(m.id);
                          setStep("payment");
                        }}
                        className={`p-3 md:p-4 rounded-xl border-2 transition-all font-medium text-xs md:text-sm flex flex-col items-center gap-2 ${
                          method === m.id
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-xl md:text-2xl">{m.icon}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any payment reference or notes..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
              </div>
            )}

            {/* Step: Payment Details */}
            {step === "payment" && (
              <div className="space-y-4">
                {method === "cash" && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-700">
                      <p className="font-medium">Payment in cash</p>
                      <p className="text-xs mt-1">
                        Click "Confirm" when payment is made
                      </p>
                    </div>
                  </div>
                )}

                {method === "upi" && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="UPI ID (e.g., name@bank)"
                      value={paymentDetails.upiId}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          upiId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Transaction Reference (Optional)"
                      value={paymentDetails.reference}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          reference: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {method === "bank_transfer" && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Account Holder Name"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Account Number"
                      value={paymentDetails.accountNumber}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          accountNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Bank Name"
                      value={paymentDetails.bankName}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          bankName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="IFSC Code"
                      value={paymentDetails.ifscCode}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          ifscCode: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Receipt / Success */}
            {step === "receipt" && completed && (
              <div className="text-center space-y-4 py-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
                    <CheckCircle className="w-16 h-16 text-green-600 relative" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Settlement Confirmed!
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    ₹{amount} settlement has been marked as confirmed
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 space-y-2">
            {!completed && step === "payment" && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full px-4 py-3 md:py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </button>
            )}
            {step === "method" && (
              <button
                onClick={() => setStep("payment")}
                className="w-full px-4 py-3 md:py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Continue
              </button>
            )}
            {completed && (
              <button
                onClick={handleClose}
                className="w-full px-4 py-3 md:py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Done
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-full px-4 py-3 md:py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
