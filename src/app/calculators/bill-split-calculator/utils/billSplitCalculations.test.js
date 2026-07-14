import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateAdjustedBill,
  calculateEqualSplit,
  calculatePercentageSplit,
  calculateSharesSplit,
  calculateCustomSplit,
  getSplitTotalPaise,
  rupeesToPaise,
} from "./billSplitCalculations.js";
import { validateCalculatorState } from "./billSplitValidation.js";
import {
  BILL_SPLIT_DRAFT_KEY,
  buildCalculatorDraft,
  clearBillSplitDraft,
  loadBillSplitDraft,
  saveBillSplitDraft,
} from "./billSplitStorage.js";

const people = [
  { id: "p1", name: "You", percentage: 50, shares: 1, customAmount: 1500 },
  { id: "p2", name: "Rahul", percentage: 30, shares: 2, customAmount: 900 },
  { id: "p3", name: "Priya", percentage: 20, shares: 3, customAmount: 600 },
];

test("equal split distributes paise rounding exactly", () => {
  const rows = calculateEqualSplit(rupeesToPaise(1000), people);

  assert.deepEqual(
    rows.map((row) => row.amount),
    [333.34, 333.33, 333.33],
  );
  assert.equal(getSplitTotalPaise(rows), rupeesToPaise(1000));
});

test("adjusted bill includes GST, tip and discount", () => {
  const adjusted = calculateAdjustedBill({
    originalAmount: 2000,
    taxPercentage: 5,
    tipPercentage: 10,
    discountAmount: 100,
  });

  assert.equal(adjusted.taxAmount, 100);
  assert.equal(adjusted.tipAmount, 200);
  assert.equal(adjusted.discountAmount, 100);
  assert.equal(adjusted.finalAmount, 2200);
});

test("percentage split matches expected amounts", () => {
  const rows = calculatePercentageSplit(rupeesToPaise(3000), people);

  assert.deepEqual(
    rows.map((row) => row.amount),
    [1500, 900, 600],
  );
  assert.equal(getSplitTotalPaise(rows), rupeesToPaise(3000));
});

test("shares split uses weighted portions", () => {
  const rows = calculateSharesSplit(rupeesToPaise(600), people);

  assert.deepEqual(
    rows.map((row) => row.amount),
    [100, 200, 300],
  );
});

test("custom amount validation requires an exact final bill match", () => {
  const adjusted = calculateAdjustedBill({ originalAmount: 3000 });
  const validRows = calculateCustomSplit(adjusted.finalPaise, people);
  const invalidRows = calculateCustomSplit(adjusted.finalPaise, [
    ...people.slice(0, 2),
    { id: "p3", name: "Priya", customAmount: 700 },
  ]);

  assert.equal(
    validateCalculatorState({
      billAmount: 3000,
      adjustedBill: adjusted,
      participants: people,
      splitMethod: "custom",
      splitRows: validRows,
    }).isValid,
    true,
  );
  assert.equal(
    validateCalculatorState({
      billAmount: 3000,
      adjustedBill: adjusted,
      participants: people,
      splitMethod: "custom",
      splitRows: invalidRows,
    }).isValid,
    false,
  );
});

test("invalid percentage total is rejected", () => {
  const adjusted = calculateAdjustedBill({ originalAmount: 1000 });
  const participants = people.map((person) => ({ ...person, percentage: 25 }));
  const rows = calculatePercentageSplit(adjusted.finalPaise, participants);

  const validation = validateCalculatorState({
    billAmount: 1000,
    adjustedBill: adjusted,
    participants,
    splitMethod: "percentage",
    splitRows: rows,
  });

  assert.equal(validation.isValid, false);
  assert.match(validation.errors.join(" "), /100%/);
});

test("participant addition and removal recalculates equal split", () => {
  const twoPeople = people.slice(0, 2);
  const threePeople = people;

  assert.deepEqual(
    calculateEqualSplit(rupeesToPaise(1000), twoPeople).map((row) => row.amount),
    [500, 500],
  );
  assert.deepEqual(
    calculateEqualSplit(rupeesToPaise(1000), threePeople).map((row) => row.amount),
    [333.34, 333.33, 333.33],
  );
});

test("restores versioned calculator state from session storage", () => {
  const store = new Map();
  global.window = {
    sessionStorage: {
      getItem: (key) => store.get(key) || null,
      setItem: (key, value) => store.set(key, value),
      removeItem: (key) => store.delete(key),
    },
  };

  saveBillSplitDraft({ source: "bill-split-calculator", expenseTitle: "Dinner" });
  const restored = loadBillSplitDraft();

  assert.equal(restored.expenseTitle, "Dinner");
  assert.equal(store.has(BILL_SPLIT_DRAFT_KEY), true);

  clearBillSplitDraft();
  assert.equal(loadBillSplitDraft(), null);
  delete global.window;
});

test("builds dashboard handoff payload", () => {
  const adjusted = calculateAdjustedBill({
    originalAmount: 2000,
    taxPercentage: 5,
    tipPercentage: 10,
    discountAmount: 100,
  });
  const rows = calculateEqualSplit(adjusted.finalPaise, people.slice(0, 2));
  const draft = buildCalculatorDraft({
    billName: "Dinner at Social",
    billAmount: "2000",
    adjustments: {
      taxPercentage: 5,
      tipPercentage: 10,
      serviceChargePercentage: 0,
    },
    adjustedBill: adjusted,
    splitMethod: "equal",
    participants: people.slice(0, 2),
    splitRows: rows,
  });

  assert.equal(draft.source, "bill-split-calculator");
  assert.equal(draft.expenseTitle, "Dinner at Social");
  assert.equal(draft.finalAmount, 2200);
  assert.equal(draft.participants[0].calculatedAmount, 1100);
});
