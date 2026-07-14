export const BILL_SPLIT_DRAFT_VERSION = 1;
export const BILL_SPLIT_DRAFT_KEY = "moneysplit:bill-calculator-draft:v1";

function getSessionStorage() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage || null;
}

export function saveBillSplitDraft(draft) {
  const storage = getSessionStorage();
  if (!storage) return false;

  try {
    storage.setItem(
      BILL_SPLIT_DRAFT_KEY,
      JSON.stringify({
        version: BILL_SPLIT_DRAFT_VERSION,
        savedAt: new Date().toISOString(),
        ...draft,
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export function loadBillSplitDraft() {
  const storage = getSessionStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(BILL_SPLIT_DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed?.version !== BILL_SPLIT_DRAFT_VERSION) {
      storage.removeItem(BILL_SPLIT_DRAFT_KEY);
      return null;
    }

    return parsed;
  } catch {
    storage.removeItem(BILL_SPLIT_DRAFT_KEY);
    return null;
  }
}

export function clearBillSplitDraft() {
  const storage = getSessionStorage();
  if (!storage) return;
  storage.removeItem(BILL_SPLIT_DRAFT_KEY);
}

export function buildCalculatorDraft({
  billName,
  billAmount,
  adjustments,
  adjustedBill,
  splitMethod,
  participants,
  splitRows,
}) {
  return {
    source: "bill-split-calculator",
    expenseTitle: billName?.trim() || "Shared bill",
    originalAmount: adjustedBill.originalAmount,
    taxPercentage: Number(adjustments.taxPercentage || 0),
    taxAmount: adjustedBill.taxAmount,
    tipPercentage: Number(adjustments.tipPercentage || 0),
    tipAmount: adjustedBill.tipAmount,
    serviceChargePercentage: Number(adjustments.serviceChargePercentage || 0),
    serviceChargeAmount: adjustedBill.serviceChargeAmount,
    discountAmount: adjustedBill.discountAmount,
    finalAmount: adjustedBill.finalAmount,
    billAmount,
    splitMethod,
    participants: participants.map((participant, index) => {
      const splitRow = splitRows[index];
      return {
        id: participant.id,
        name: participant.name?.trim() || `Person ${index + 1}`,
        value:
          splitMethod === "percentage"
            ? Number(participant.percentage || 0)
            : splitMethod === "shares"
              ? Number(participant.shares || 0)
              : splitMethod === "custom"
                ? Number(participant.customAmount || 0)
                : 1,
        calculatedAmount: splitRow?.amount || 0,
      };
    }),
  };
}
