import {
  getSplitTotalPaise,
  rupeesToPaise,
  SPLIT_METHODS,
} from "./billSplitCalculations.js";

const MAX_PARTICIPANTS = 20;
const MAX_BILL_PAISE = 10000000000;

export { MAX_PARTICIPANTS };

function cleanName(name, index) {
  return name?.trim() || `Person ${index + 1}`;
}

export function getParticipantNameWarnings(participants = []) {
  const warnings = [];
  const seen = new Set();

  participants.forEach((participant, index) => {
    const name = cleanName(participant.name, index);
    if (!participant.name?.trim()) {
      warnings.push(`${name} needs a name before saving.`);
    }

    const key = name.toLowerCase();
    if (seen.has(key)) {
      warnings.push(`${name} appears more than once. Use unique names where possible.`);
    }
    seen.add(key);
  });

  return warnings;
}

export function validateCalculatorState({
  billAmount,
  adjustedBill,
  participants = [],
  splitMethod,
  splitRows = [],
}) {
  const errors = [];
  const warnings = getParticipantNameWarnings(participants);
  const originalPaise = rupeesToPaise(billAmount);
  const finalPaise = adjustedBill?.finalPaise || 0;

  if (billAmount === "" || billAmount === null || billAmount === undefined) {
    errors.push("Enter a bill amount to calculate the split.");
  } else if (originalPaise <= 0) {
    errors.push("Bill amount must be greater than zero.");
  }

  if (originalPaise > MAX_BILL_PAISE) {
    errors.push("Use an amount below ₹10 crore for this calculator.");
  }

  if (participants.length < 2) {
    errors.push("Add at least two people to split the bill.");
  }

  if (participants.length > MAX_PARTICIPANTS) {
    errors.push(`Keep the split to ${MAX_PARTICIPANTS} people or fewer.`);
  }

  if ((adjustedBill?.discountPaise || 0) > (adjustedBill?.amountBeforeDiscountPaise || 0)) {
    errors.push("Discount cannot be greater than the bill plus tax, tip and service charge.");
  }

  if (splitMethod === SPLIT_METHODS.PERCENTAGE) {
    const percentageTotal = participants.reduce(
      (sum, participant) => sum + Number(participant.percentage || 0),
      0,
    );

    if (Math.abs(percentageTotal - 100) > 0.001) {
      errors.push("Percentage split must total exactly 100%.");
    }
  }

  if (splitMethod === SPLIT_METHODS.SHARES) {
    const shareTotal = participants.reduce(
      (sum, participant) => sum + Number(participant.shares || 0),
      0,
    );

    if (shareTotal <= 0) {
      errors.push("Total shares must be greater than zero.");
    }
  }

  if (splitMethod === SPLIT_METHODS.CUSTOM) {
    const assignedPaise = getSplitTotalPaise(splitRows);

    if (assignedPaise !== finalPaise) {
      errors.push("Custom amounts must add up exactly to the final bill.");
    }
  }

  const assignedPaise = getSplitTotalPaise(splitRows);
  if (finalPaise > 0 && splitRows.length > 0 && splitMethod !== SPLIT_METHODS.CUSTOM) {
    if (assignedPaise !== finalPaise) {
      errors.push("Split total does not match the final bill.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
