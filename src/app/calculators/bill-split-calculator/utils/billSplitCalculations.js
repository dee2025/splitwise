export const SPLIT_METHODS = {
  EQUAL: "equal",
  PERCENTAGE: "percentage",
  SHARES: "shares",
  CUSTOM: "custom",
};

export function rupeesToPaise(value) {
  if (value === "" || value === null || value === undefined) return 0;
  const numberValue =
    typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);

  if (!Number.isFinite(numberValue)) return 0;
  return Math.round(numberValue * 100);
}

export function paiseToRupees(valueInPaise) {
  return Math.round(Number(valueInPaise || 0)) / 100;
}

export function calculatePercentageAmount(basePaise, percentage) {
  const percent = Number(percentage || 0);
  if (!Number.isFinite(percent) || percent <= 0) return 0;
  return Math.round((basePaise * percent) / 100);
}

export function calculateAdjustedBill({
  originalAmount = 0,
  taxPercentage = 0,
  tipPercentage = 0,
  serviceChargePercentage = 0,
  discountAmount = 0,
} = {}) {
  const originalPaise = Math.max(0, rupeesToPaise(originalAmount));
  const taxPaise = calculatePercentageAmount(originalPaise, taxPercentage);
  const tipPaise = calculatePercentageAmount(originalPaise, tipPercentage);
  const serviceChargePaise = calculatePercentageAmount(
    originalPaise,
    serviceChargePercentage,
  );
  const discountPaise = Math.max(0, rupeesToPaise(discountAmount));
  const amountBeforeDiscountPaise =
    originalPaise + taxPaise + tipPaise + serviceChargePaise;
  const finalPaise = Math.max(0, amountBeforeDiscountPaise - discountPaise);

  return {
    originalPaise,
    taxPaise,
    tipPaise,
    serviceChargePaise,
    discountPaise,
    amountBeforeDiscountPaise,
    finalPaise,
    originalAmount: paiseToRupees(originalPaise),
    taxAmount: paiseToRupees(taxPaise),
    tipAmount: paiseToRupees(tipPaise),
    serviceChargeAmount: paiseToRupees(serviceChargePaise),
    discountAmount: paiseToRupees(discountPaise),
    finalAmount: paiseToRupees(finalPaise),
  };
}

function normalizedWeight(value) {
  const numberValue = Number(value || 0);
  if (!Number.isFinite(numberValue) || numberValue <= 0) return 0;
  return numberValue;
}

export function distributeRoundingDifference(totalPaise, weightedItems = []) {
  const total = Math.max(0, Math.round(Number(totalPaise || 0)));
  const items = weightedItems.map((item, index) => ({
    ...item,
    index,
    weight: normalizedWeight(item.weight),
  }));
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

  if (!total || !totalWeight || items.length === 0) {
    return items.map((item) => ({ ...item, amountPaise: 0 }));
  }

  const rows = items.map((item) => {
    const exact = (total * item.weight) / totalWeight;
    const floor = Math.floor(exact);

    return {
      ...item,
      amountPaise: floor,
      fraction: exact - floor,
    };
  });

  let remainder = total - rows.reduce((sum, item) => sum + item.amountPaise, 0);
  const byFraction = [...rows].sort((a, b) => {
    if (b.fraction !== a.fraction) return b.fraction - a.fraction;
    return a.index - b.index;
  });

  for (let index = 0; remainder > 0 && byFraction.length > 0; index += 1) {
    byFraction[index % byFraction.length].amountPaise += 1;
    remainder -= 1;
  }

  return rows
    .map((row) => ({
      ...row,
      amount: paiseToRupees(row.amountPaise),
    }))
    .sort((a, b) => a.index - b.index);
}

function participantName(participant, index) {
  return participant?.name?.trim() || `Person ${index + 1}`;
}

function mapWeightedSplit(finalPaise, participants, getWeight, getValue) {
  return distributeRoundingDifference(
    finalPaise,
    participants.map((participant, index) => ({
      participantId: participant.id,
      name: participantName(participant, index),
      value: getValue ? getValue(participant, index) : getWeight(participant, index),
      weight: getWeight(participant, index),
    })),
  );
}

export function calculateEqualSplit(finalPaise, participants = []) {
  return mapWeightedSplit(finalPaise, participants, () => 1);
}

export function calculatePercentageSplit(finalPaise, participants = []) {
  return mapWeightedSplit(
    finalPaise,
    participants,
    (participant) => Number(participant.percentage || 0),
    (participant) => Number(participant.percentage || 0),
  );
}

export function calculateSharesSplit(finalPaise, participants = []) {
  return mapWeightedSplit(
    finalPaise,
    participants,
    (participant) => Number(participant.shares || 0),
    (participant) => Number(participant.shares || 0),
  );
}

export function calculateCustomSplit(_finalPaise, participants = []) {
  return participants.map((participant, index) => {
    const amountPaise = Math.max(0, rupeesToPaise(participant.customAmount || 0));

    return {
      participantId: participant.id,
      name: participantName(participant, index),
      value: paiseToRupees(amountPaise),
      weight: 0,
      amountPaise,
      amount: paiseToRupees(amountPaise),
      index,
    };
  });
}

export function calculateSplit(finalPaise, splitMethod, participants = []) {
  if (splitMethod === SPLIT_METHODS.PERCENTAGE) {
    return calculatePercentageSplit(finalPaise, participants);
  }

  if (splitMethod === SPLIT_METHODS.SHARES) {
    return calculateSharesSplit(finalPaise, participants);
  }

  if (splitMethod === SPLIT_METHODS.CUSTOM) {
    return calculateCustomSplit(finalPaise, participants);
  }

  return calculateEqualSplit(finalPaise, participants);
}

export function getSplitTotalPaise(splitRows = []) {
  return splitRows.reduce((sum, row) => sum + Math.round(row.amountPaise || 0), 0);
}

export function buildPlainTextSummary({
  billName,
  finalPaise,
  participants = [],
  splitRows = [],
  formatCurrency,
}) {
  const title = billName?.trim() || "MoneySplit bill split";
  const lines = [
    title,
    "",
    `Total bill: ${formatCurrency(paiseToRupees(finalPaise))}`,
    `Split between: ${participants.length} ${
      participants.length === 1 ? "person" : "people"
    }`,
    "",
    ...splitRows.map((row) => `${row.name}: ${formatCurrency(row.amount)}`),
    "",
    "Calculated with MoneySplit.in",
  ];

  return lines.join("\n");
}
