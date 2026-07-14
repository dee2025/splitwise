"use client";

import {
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  IndianRupee,
  Plus,
  RefreshCw,
  Share2,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  buildPlainTextSummary,
  calculateAdjustedBill,
  calculateEqualSplit,
  calculateSplit,
  getSplitTotalPaise,
  rupeesToPaise,
  SPLIT_METHODS,
} from "../utils/billSplitCalculations.js";
import {
  buildCalculatorDraft,
  clearBillSplitDraft,
  loadBillSplitDraft,
  saveBillSplitDraft,
} from "../utils/billSplitStorage.js";
import {
  MAX_PARTICIPANTS,
  validateCalculatorState,
} from "../utils/billSplitValidation.js";
import { formatIndianCurrency, formatPaiseAsIndianCurrency } from "../utils/formatCurrency.js";

const splitMethodLabels = {
  equal: "Equal",
  percentage: "Percentage",
  shares: "Shares",
  custom: "Custom amount",
};

const defaultParticipants = [
  {
    id: "person-1",
    name: "You",
    percentage: 50,
    shares: 1,
    customAmount: "",
  },
  {
    id: "person-2",
    name: "Person 2",
    percentage: 50,
    shares: 1,
    customAmount: "",
  },
];

function initials(name, index) {
  const fallback = index === 0 ? "You" : `Person ${index + 1}`;
  const words = (name?.trim() || fallback).split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function sanitizeNumberInput(value) {
  if (value === "") return "";
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) return "";
  return value;
}

function inputClass(hasError = false) {
  return `w-full rounded-xl border px-3.5 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-transparent focus:ring-2 ${
    hasError
      ? "border-rose-500/40 bg-rose-500/10 focus:ring-rose-500"
      : "border-white/8 bg-slate-700/50 focus:ring-indigo-500"
  }`;
}

function helperTextClass(tone = "default") {
  if (tone === "error") return "mt-1.5 text-xs leading-5 text-rose-300";
  if (tone === "success") return "mt-1.5 text-xs leading-5 text-emerald-300";
  return "mt-1.5 text-xs leading-5 text-slate-500";
}

function getStateFromDraft(draft) {
  const saved = draft?.calculatorState;
  if (saved) return saved;

  if (draft?.source !== "bill-split-calculator") return null;

  return {
    billAmount: String(draft.billAmount || draft.originalAmount || ""),
    billName: draft.expenseTitle || "",
    adjustments: {
      taxPercentage: String(draft.taxPercentage || ""),
      tipPercentage: String(draft.tipPercentage || ""),
      serviceChargePercentage: String(draft.serviceChargePercentage || ""),
      discountAmount: String(draft.discountAmount || ""),
    },
    splitMethod: draft.splitMethod || SPLIT_METHODS.EQUAL,
    participants: (draft.participants || defaultParticipants).map((participant, index) => ({
      id: participant.id || `person-${index + 1}`,
      name: participant.name || (index === 0 ? "You" : `Person ${index + 1}`),
      percentage: draft.splitMethod === "percentage" ? participant.value : 0,
      shares: draft.splitMethod === "shares" ? participant.value : 1,
      customAmount: draft.splitMethod === "custom" ? participant.value : "",
    })),
  };
}

export default function BillSplitCalculator() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useSelector((state) => state.auth);

  const [billAmount, setBillAmount] = useState("");
  const [billName, setBillName] = useState("");
  const [adjustments, setAdjustments] = useState({
    taxPercentage: "",
    tipPercentage: "",
    serviceChargePercentage: "",
    discountAmount: "",
  });
  const [participants, setParticipants] = useState(defaultParticipants);
  const [splitMethod, setSplitMethod] = useState(SPLIT_METHODS.EQUAL);
  const [hydrated, setHydrated] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const adjustedBill = useMemo(
    () =>
      calculateAdjustedBill({
        originalAmount: billAmount,
        taxPercentage: adjustments.taxPercentage,
        tipPercentage: adjustments.tipPercentage,
        serviceChargePercentage: adjustments.serviceChargePercentage,
        discountAmount: adjustments.discountAmount,
      }),
    [adjustments, billAmount],
  );

  const splitRows = useMemo(
    () => calculateSplit(adjustedBill.finalPaise, splitMethod, participants),
    [adjustedBill.finalPaise, participants, splitMethod],
  );

  const validation = useMemo(
    () =>
      validateCalculatorState({
        billAmount,
        adjustedBill,
        participants,
        splitMethod,
        splitRows,
      }),
    [adjustedBill, billAmount, participants, splitMethod, splitRows],
  );

  const percentageTotal = useMemo(
    () => participants.reduce((sum, participant) => sum + Number(participant.percentage || 0), 0),
    [participants],
  );

  const shareTotal = useMemo(
    () => participants.reduce((sum, participant) => sum + Number(participant.shares || 0), 0),
    [participants],
  );

  const customAssignedPaise = useMemo(() => getSplitTotalPaise(splitRows), [splitRows]);
  const hasMeaningfulData = Boolean(
    billAmount ||
      billName.trim() ||
      Object.values(adjustments).some(Boolean) ||
      splitMethod !== SPLIT_METHODS.EQUAL ||
      participants.length !== 2 ||
      participants.some((person, index) => person.name !== defaultParticipants[index]?.name),
  );
  const canCalculate = adjustedBill.finalPaise > 0 && rupeesToPaise(billAmount) > 0;
  const canSave = canCalculate && validation.isValid && !authLoading;

  const calculatorState = useMemo(
    () => ({
      billAmount,
      billName,
      adjustments,
      participants,
      splitMethod,
    }),
    [adjustments, billAmount, billName, participants, splitMethod],
  );

  const draftPayload = useMemo(
    () => ({
      ...buildCalculatorDraft({
        billName,
        billAmount,
        adjustments,
        adjustedBill,
        splitMethod,
        participants,
        splitRows,
      }),
      calculatorState,
    }),
    [
      adjustedBill,
      adjustments,
      billAmount,
      billName,
      calculatorState,
      participants,
      splitMethod,
      splitRows,
    ],
  );

  const summaryText = useMemo(
    () =>
      buildPlainTextSummary({
        billName,
        finalPaise: adjustedBill.finalPaise,
        participants,
        splitRows,
        formatCurrency: formatIndianCurrency,
      }),
    [adjustedBill.finalPaise, billName, participants, splitRows],
  );

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      const draft = loadBillSplitDraft();
      const restored = getStateFromDraft(draft);
      if (restored) {
        setBillAmount(restored.billAmount || "");
        setBillName(restored.billName || "");
        setAdjustments({
          taxPercentage: restored.adjustments?.taxPercentage || "",
          tipPercentage: restored.adjustments?.tipPercentage || "",
          serviceChargePercentage: restored.adjustments?.serviceChargePercentage || "",
          discountAmount: restored.adjustments?.discountAmount || "",
        });
        setParticipants(
          restored.participants?.length >= 2
            ? restored.participants.slice(0, MAX_PARTICIPANTS)
            : defaultParticipants,
        );
        setSplitMethod(restored.splitMethod || SPLIT_METHODS.EQUAL);
      }
      setShareSupported(Boolean(navigator.share));
      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !hasMeaningfulData) return;
    saveBillSplitDraft({
      source: "bill-split-calculator",
      expenseTitle: billName?.trim() || "Shared bill",
      calculatorState,
    });
  }, [billName, calculatorState, hasMeaningfulData, hydrated]);

  const updateParticipant = (id, updates) => {
    setParticipants((current) =>
      current.map((participant) =>
        participant.id === id ? { ...participant, ...updates } : participant,
      ),
    );
  };

  const addParticipant = () => {
    setParticipants((current) => {
      if (current.length >= MAX_PARTICIPANTS) return current;
      const nextNumber = current.length + 1;
      return [
        ...current,
        {
          id: `person-${Date.now()}`,
          name: `Person ${nextNumber}`,
          percentage: 0,
          shares: 1,
          customAmount: "",
        },
      ];
    });
  };

  const removeParticipant = (id) => {
    setParticipants((current) => {
      if (current.length <= 2) return current;
      return current.filter((participant) => participant.id !== id);
    });
  };

  const splitPercentagesEqually = () => {
    setParticipants((current) => {
      const basisPoints = 10000;
      const base = Math.floor(basisPoints / current.length);
      let remainder = basisPoints - base * current.length;

      return current.map((participant) => {
        const extra = remainder > 0 ? 1 : 0;
        remainder -= extra;
        return {
          ...participant,
          percentage: Number(((base + extra) / 100).toFixed(2)),
        };
      });
    });
  };

  const divideRemainingEqually = () => {
    setParticipants((current) => {
      const rows = calculateEqualSplit(adjustedBill.finalPaise, current);
      return current.map((participant, index) => ({
        ...participant,
        customAmount: rows[index]?.amount || 0,
      }));
    });
  };

  const resetCalculator = () => {
    setBillAmount("");
    setBillName("");
    setAdjustments({
      taxPercentage: "",
      tipPercentage: "",
      serviceChargePercentage: "",
      discountAmount: "",
    });
    setParticipants(defaultParticipants);
    setSplitMethod(SPLIT_METHODS.EQUAL);
    setShowResetConfirm(false);
    clearBillSplitDraft();
  };

  const persistAndGoToDashboard = () => {
    if (!canSave) return;
    saveBillSplitDraft(draftPayload);
    const redirect = "/groups?calculatorDraft=1";

    if (isAuthenticated) {
      router.push(redirect);
      return;
    }

    router.push(`/signup?redirect=${encodeURIComponent(redirect)}`);
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopyStatus("Split summary copied");
      toast.success("Split summary copied");
    } catch {
      toast.error("Unable to copy summary");
    }
  };

  const shareSummary = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: billName?.trim() || "MoneySplit bill split",
        text: summaryText,
      });
    } catch (error) {
      if (error?.name !== "AbortError") {
        toast.error("Sharing is not available right now");
      }
    }
  };

  return (
    <>
      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1.38fr)_minmax(340px,1fr)] lg:items-start">
          <div className="space-y-5">
            <Card title="Bill details">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label htmlFor="bill-amount" className="mb-1.5 block text-sm font-semibold text-slate-200">
                    Bill amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                      ₹
                    </span>
                    <input
                      id="bill-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={billAmount}
                      onChange={(event) => setBillAmount(sanitizeNumberInput(event.target.value))}
                      placeholder="Enter total bill amount"
                      aria-describedby="bill-amount-help"
                      className={`${inputClass(!billAmount && validation.errors.length > 0)} pl-8`}
                    />
                  </div>
                  <p id="bill-amount-help" className={helperTextClass()}>
                    Add the amount before tax, tip or discount.
                  </p>
                </div>

                <div>
                  <label htmlFor="bill-name" className="mb-1.5 block text-sm font-semibold text-slate-200">
                    Bill name <span className="text-slate-500">(optional)</span>
                  </label>
                  <input
                    id="bill-name"
                    type="text"
                    value={billName}
                    onChange={(event) => setBillName(event.target.value)}
                    placeholder="Dinner at Social"
                    className={inputClass()}
                  />
                  <p className={helperTextClass()}>
                    This becomes the expense title when you save it.
                  </p>
                </div>
              </div>

              <details className="group mt-5 rounded-2xl border border-white/8 bg-slate-900/70 p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <span className="text-sm font-bold text-slate-100">
                    Add tax, tip or discount
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <AdjustmentInput
                    label="Tax or GST"
                    suffix="%"
                    value={adjustments.taxPercentage}
                    onChange={(value) => setAdjustments((prev) => ({ ...prev, taxPercentage: value }))}
                  />
                  <AdjustmentInput
                    label="Tip"
                    suffix="%"
                    value={adjustments.tipPercentage}
                    onChange={(value) => setAdjustments((prev) => ({ ...prev, tipPercentage: value }))}
                  />
                  <AdjustmentInput
                    label="Service charge"
                    suffix="%"
                    value={adjustments.serviceChargePercentage}
                    onChange={(value) =>
                      setAdjustments((prev) => ({ ...prev, serviceChargePercentage: value }))
                    }
                  />
                  <AdjustmentInput
                    label="Discount amount"
                    prefix="₹"
                    value={adjustments.discountAmount}
                    onChange={(value) => setAdjustments((prev) => ({ ...prev, discountAmount: value }))}
                  />
                </div>

                <div className="mt-4 rounded-xl border border-white/8 bg-slate-950/50 p-3 text-sm">
                  <BreakdownRow label="Original bill" value={adjustedBill.originalPaise} />
                  <BreakdownRow label="Tax" value={adjustedBill.taxPaise} />
                  <BreakdownRow label="Tip" value={adjustedBill.tipPaise} />
                  <BreakdownRow label="Service charge" value={adjustedBill.serviceChargePaise} />
                  <BreakdownRow label="Discount" value={-adjustedBill.discountPaise} />
                  <div className="mt-2 flex items-center justify-between border-t border-white/8 pt-2 font-bold text-slate-100">
                    <span>Final amount to split</span>
                    <span>{formatPaiseAsIndianCurrency(adjustedBill.finalPaise)}</span>
                  </div>
                </div>
              </details>
            </Card>

            <Card title="Who is splitting the bill?">
              <div className="space-y-3">
                {participants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className="grid gap-3 rounded-2xl border border-white/8 bg-slate-900/70 p-3 sm:grid-cols-[auto_1fr_auto]"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={participant.name} index={index} />
                      <div className="min-w-0 sm:hidden">
                        <p className="text-xs text-slate-500">Share</p>
                        <p className="font-bold text-slate-100">
                          {canCalculate
                            ? formatIndianCurrency(splitRows[index]?.amount || 0)
                            : "Pending"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label htmlFor={`participant-${participant.id}`} className="sr-only">
                        Participant name
                      </label>
                      <input
                        id={`participant-${participant.id}`}
                        value={participant.name}
                        onChange={(event) => updateParticipant(participant.id, { name: event.target.value })}
                        placeholder={index === 0 ? "You" : `Person ${index + 1}`}
                        className={inputClass(!participant.name.trim())}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <div className="hidden text-right sm:block">
                        <p className="text-xs text-slate-500">Share</p>
                        <p className="font-bold text-slate-100">
                          {canCalculate
                            ? formatIndianCurrency(splitRows[index]?.amount || 0)
                            : "Pending"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeParticipant(participant.id)}
                        disabled={participants.length <= 2}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/8 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Remove ${participant.name || `person ${index + 1}`}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addParticipant}
                disabled={participants.length >= MAX_PARTICIPANTS}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add another person
              </button>
            </Card>

            <Card title="Split method">
              <div role="radiogroup" aria-label="Split method" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Object.entries(splitMethodLabels).map(([method, label]) => (
                  <button
                    key={method}
                    type="button"
                    role="radio"
                    aria-checked={splitMethod === method}
                    onClick={() => setSplitMethod(method)}
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      splitMethod === method
                        ? "border-indigo-500/50 bg-indigo-600 text-white"
                        : "border-white/8 bg-slate-900 text-slate-300 hover:border-white/14"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                {splitMethod === SPLIT_METHODS.EQUAL && (
                  <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-200">
                    MoneySplit divides the final amount equally and assigns any remaining paise so the total stays exact.
                  </p>
                )}

                {splitMethod === SPLIT_METHODS.PERCENTAGE && (
                  <SplitValueList
                    participants={participants}
                    label="Percentage"
                    suffix="%"
                    field="percentage"
                    onChange={updateParticipant}
                    helper={
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className={helperTextClass(Math.abs(percentageTotal - 100) < 0.001 ? "success" : "error")}>
                          Total: {percentageTotal.toFixed(2).replace(/\.00$/, "")}% of 100%
                        </p>
                        <button
                          type="button"
                          onClick={splitPercentagesEqually}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-300 hover:text-indigo-200"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Split percentages equally
                        </button>
                      </div>
                    }
                  />
                )}

                {splitMethod === SPLIT_METHODS.SHARES && (
                  <SplitValueList
                    participants={participants}
                    label="Shares"
                    field="shares"
                    min="0"
                    step="0.5"
                    onChange={updateParticipant}
                    helper={
                      <p className={helperTextClass(shareTotal > 0 ? "success" : "error")}>
                        Total shares: {shareTotal || 0}
                      </p>
                    }
                  />
                )}

                {splitMethod === SPLIT_METHODS.CUSTOM && (
                  <SplitValueList
                    participants={participants}
                    label="Custom amount"
                    prefix="₹"
                    field="customAmount"
                    onChange={updateParticipant}
                    helper={
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p
                          className={helperTextClass(
                            customAssignedPaise === adjustedBill.finalPaise ? "success" : "error",
                          )}
                        >
                          Assigned: {formatPaiseAsIndianCurrency(customAssignedPaise)} ·{" "}
                          {customAssignedPaise <= adjustedBill.finalPaise ? "Remaining" : "Over"}:{" "}
                          {formatPaiseAsIndianCurrency(Math.abs(adjustedBill.finalPaise - customAssignedPaise))}
                        </p>
                        <button
                          type="button"
                          onClick={divideRemainingEqually}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-300 hover:text-indigo-200"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Divide remaining equally
                        </button>
                      </div>
                    }
                  />
                )}
              </div>
            </Card>

            <button
              type="button"
              onClick={() => (hasMeaningfulData ? setShowResetConfirm(true) : resetCalculator())}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-300"
            >
              <RefreshCw className="h-4 w-4" />
              Reset calculator
            </button>
          </div>

          <SplitSummary
            canCalculate={canCalculate}
            adjustedBill={adjustedBill}
            participants={participants}
            splitRows={splitRows}
            splitMethod={splitMethod}
            validation={validation}
            canSave={canSave}
            onSave={persistAndGoToDashboard}
            onCopy={copySummary}
            onShare={shareSupported ? shareSummary : null}
          />
        </div>
      </section>

      {canSave && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/95 px-4 py-3 shadow-2xl backdrop-blur lg:hidden pb-safe">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Total
              </p>
              <p className="truncate text-base font-bold text-slate-100">
                {formatPaiseAsIndianCurrency(adjustedBill.finalPaise)}
              </p>
            </div>
            <button
              type="button"
              onClick={persistAndGoToDashboard}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50"
            >
              Split & Save
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {copyStatus}
      </p>

      {showResetConfirm && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-calculator-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-800 shadow-2xl">
            <div className="border-b border-white/8 px-5 py-4">
              <h2 id="reset-calculator-title" className="text-base font-bold text-slate-100">
                Reset calculator?
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                This clears the bill amount, participants and split settings.
              </p>
            </div>
            <div className="flex gap-2 p-4">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={resetCalculator}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-2xl border border-white/8 bg-slate-800 p-4 shadow-2xl shadow-black/20 sm:p-5">
      <h2 className="mb-4 text-lg font-bold text-slate-100">{title}</h2>
      {children}
    </section>
  );
}

function AdjustmentInput({ label, value, onChange, prefix, suffix }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-400">
        {label}
      </span>
      <span className="relative block">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
            {prefix}
          </span>
        )}
        <input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(sanitizeNumberInput(event.target.value))}
          placeholder="0"
          className={`${inputClass()} ${prefix ? "pl-7" : ""} ${suffix ? "pr-8" : ""}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
            {suffix}
          </span>
        )}
      </span>
    </label>
  );
}

function BreakdownRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1 text-slate-400">
      <span>{label}</span>
      <span>{formatPaiseAsIndianCurrency(value)}</span>
    </div>
  );
}

function Avatar({ name, index }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-400/25 bg-indigo-500/15 text-xs font-bold text-indigo-100">
      {initials(name, index)}
    </span>
  );
}

function SplitValueList({ participants, label, field, onChange, helper, prefix, suffix, min = "0", step = "0.01" }) {
  return (
    <div className="space-y-3">
      {participants.map((participant, index) => (
        <div
          key={participant.id}
          className="grid items-center gap-2 rounded-xl border border-white/8 bg-slate-900/70 p-3 sm:grid-cols-[1fr_180px]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={participant.name} index={index} />
            <span className="truncate text-sm font-semibold text-slate-100">
              {participant.name?.trim() || `Person ${index + 1}`}
            </span>
          </div>
          <label className="relative block">
            <span className="sr-only">
              {label} for {participant.name || `person ${index + 1}`}
            </span>
            {prefix && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                {prefix}
              </span>
            )}
            <input
              type="number"
              min={min}
              step={step}
              inputMode="decimal"
              value={participant[field]}
              onChange={(event) =>
                onChange(participant.id, {
                  [field]: sanitizeNumberInput(event.target.value),
                })
              }
              className={`${inputClass()} ${prefix ? "pl-7" : ""} ${suffix ? "pr-8" : ""}`}
            />
            {suffix && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                {suffix}
              </span>
            )}
          </label>
        </div>
      ))}
      {helper}
    </div>
  );
}

function SplitSummary({
  canCalculate,
  adjustedBill,
  participants,
  splitRows,
  splitMethod,
  validation,
  canSave,
  onSave,
  onCopy,
  onShare,
}) {
  const equalAmount =
    splitMethod === SPLIT_METHODS.EQUAL && splitRows.length > 0
      ? splitRows[0].amount
      : null;
  const assignedPaise = getSplitTotalPaise(splitRows);

  return (
    <aside className="lg:sticky lg:top-24">
      <section className="rounded-2xl border border-white/8 bg-slate-800 p-4 shadow-2xl shadow-black/30 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Split summary</h2>
            <p className="mt-1 text-sm text-slate-500">
              {splitMethodLabels[splitMethod]} split
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-200">
            <Users className="h-3.5 w-3.5" />
            {participants.length}
          </span>
        </div>

        {!canCalculate ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900 px-5 py-10 text-center">
            <IndianRupee className="mx-auto mb-3 h-8 w-8 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">
              Enter a bill amount to see everyone&apos;s share.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-white/8 bg-slate-900 p-4">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Final bill amount</span>
                <span className="font-bold text-slate-100">
                  {formatPaiseAsIndianCurrency(adjustedBill.finalPaise)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
                <span>People</span>
                <span>{participants.length}</span>
              </div>
              {equalAmount !== null && (
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    Equal share
                  </p>
                  <p className="mt-1 text-xl font-bold text-emerald-100">
                    {formatIndianCurrency(equalAmount)} per person
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {splitRows.map((row, index) => (
                <div
                  key={row.participantId || index}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-slate-900/70 px-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={row.name} index={index} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-100">
                        {row.name}
                      </p>
                      {splitMethod !== SPLIT_METHODS.EQUAL && (
                        <p className="text-xs text-slate-500">
                          {splitMethod === SPLIT_METHODS.PERCENTAGE
                            ? `${row.value || 0}%`
                            : splitMethod === SPLIT_METHODS.SHARES
                              ? `${row.value || 0} shares`
                              : "Custom amount"}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-slate-100">
                    {formatIndianCurrency(row.amount)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4 text-sm">
              <span className="text-slate-400">Total assigned</span>
              <span className="font-bold text-slate-100">
                {formatPaiseAsIndianCurrency(assignedPaise)}
              </span>
            </div>
          </>
        )}

        {(validation.errors.length > 0 || validation.warnings.length > 0) && (
          <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/10 p-3" aria-live="polite">
            {[...validation.errors, ...validation.warnings].slice(0, 4).map((message) => (
              <p key={message} className="text-xs leading-5 text-amber-100">
                {message}
              </p>
            ))}
          </div>
        )}

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/60 transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Split & Save in MoneySplit
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="text-center text-xs leading-5 text-slate-500">
            Create a group, save this expense and automatically track who owes whom.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={onCopy}
              disabled={!canCalculate}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Copy className="h-4 w-4" />
              Copy split summary
            </button>
            {onShare && (
              <button
                type="button"
                onClick={onShare}
                disabled={!canCalculate}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Share2 className="h-4 w-4" />
                Share result
              </button>
            )}
          </div>
        </div>

        {canSave && (
          <p className="mt-4 flex items-center gap-2 text-xs text-emerald-300">
            <Check className="h-3.5 w-3.5" />
            Split is valid and ready to save.
          </p>
        )}
      </section>
    </aside>
  );
}
