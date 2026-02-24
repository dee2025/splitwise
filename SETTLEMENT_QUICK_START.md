# Settlement System - Quick Start Guide

## 🎯 How Users Can Settle Expenses

### **TL;DR - 4 Simple Steps**

```
1. Click Settlements Tab
2. See suggested settlements (system calculates amounts)
3. Click SETTLE → Choose payment method → Confirm
4. Other person confirms receipt → DONE ✅
```

---

### **Example:**

Went on trip with 2 friends:

- Alice paid ₹3000 for hotel
- You paid ₹1000 for food
- Split everything equally (3 ways)

**Result:** You owe Alice ₹667

**Settlement Card Shows:**

```
You → Alice
₹667
[SETTLE]
```

---

### Step 1: Navigate to Settlements Tab

In any group page, click on the **"Settlements"** tab to access the settlement interface.

### Step 2: View Suggested Settlements

The system automatically calculates the optimal payment flow:

- Shows who owes whom and how much
- Minimizes the number of transactions needed
- Displays as separate settlement cards

### Step 3: Settle a Payment

1. Click the **"Settle"** button on any suggested settlement
2. A mobile-friendly modal opens
3. Choose your payment method:
   - 💵 **Cash** - In-person payment
   - 📱 **UPI** - Digital payment (India)
   - 🏦 **Bank Transfer** - Traditional transfer
   - 💳 **Wallet** - Digital wallet payment

### Step 4: Add Payment Details

- For **Cash**: Just add optional notes (reference)
- For **UPI**: Enter UPI ID and optional transaction reference
- For **Bank**: Enter account holder name, account number, IFSC, bank name
- For **Wallet**: Select provider and enter details

### Step 5: Confirm Payment

Click "Confirm Payment" to send the settlement request. The receiver will get a notification.

### Step 6: Receiver Confirms Receipt

The receiver will see the settlement request and can click "Confirm Receipt" to mark it as complete.

---

## 📊 Settlement Overview Tab

### Quick Stats

- **Transactions Needed** - How many payments must be made
- **Total Amount** - Combined value of all settlements

### Suggested Settlements

Each card shows:

- Who pays and who receives
- Amount to be transferred
- Quick "Settle" button

### Empty State

If everyone is settled, you'll see: "Everyone is all settled up!" ✅

---

## 📜 Settlement History Tab

### View All Settlements

- Filter by status: All, Pending, or Completed
- See dates, amounts, and payment methods
- Track payment history

### Quick Statistics

- **You Owe** - Total amount you need to pay
- **You're Owed** - Total amount others owe you
- **Payment Methods Used** - Breakdown of cash, UPI, bank transfers, etc.

### Settlement Details

Each transaction shows:

- From and to users
- Date of transaction
- Payment method icon
- Status badge (Pending, Confirmed, Completed)
- Any notes added

---

## 💡 Tips for Effective Settlements

### ✅ Best Practices

1. **Settle regularly** - Don't let debts accumulate
2. **Use multiple methods** - Cash for quick payments, bank for large amounts
3. **Add notes** - Include transaction reference for clarity
4. **Confirm quickly** - Don't leave settlements pending
5. **Check history** - Verify past transactions for reference

### ⚠️ Common Scenarios

**Scenario 1: Multiple People Owe You**

- Don't wait for all at once
- Settle with the highest debtor first
- Reduces total outstanding

**Scenario 2: You Owe Multiple People**

- Prioritize based on amount
- Or settle per group
- Keep notes on amounts

**Scenario 3: Partial Payments**

- Create a new settlement for the remainder
- Update notes with "Partial - remaining ₹500"
- Track easily in history

---

## 🔔 Notifications

You'll receive notifications for:

### Settlement Requested

- Someone has requested a settlement from you
- Shows amount and who requested it
- You can confirm receipt

### Payment Received

- Someone confirmed they received your payment
- Settlement is now complete
- Notification via app icon badge

### Settlement Disputed

- If a settlement is marked as disputed
- Someone has flagged an issue
- Contact group members to resolve

---

## ❓ FAQ

**Q: How does the system calculate optimal settlements?**
A: It uses a greedy algorithm to match creditors with debtors, minimizing the total number of transactions needed.

**Q: Can I edit a settlement after creating it?**
A: No, cancel it and create a new one if details are wrong.

**Q: What if someone doesn't confirm receipt?**
A: The settlement stays in "Confirmed" status. You can follow up via group chat.

**Q: Can I settle with someone outside the group?**
A: No, both parties must be members of the group.

**Q: Is there a settlement deadline?**
A: No, but regular settlements help keep the group clear.

**Q: Can I reverse a completed settlement?**
A: Contact group admin - they may manually reverse if needed.

**Q: Does the system support multiple currencies?**
A: Yes, each group has a currency setting (INR, USD, EUR, GBP).

**Q: What payment methods are safest?**
A: Bank transfer with proof. UPI with reference for medium amounts. Cash requires handshake.

**Q: How do I settle a dispute?**
A: Mark as "Disputed" with reason. Group admin will be notified.

---

## 🎓 Example Flow

**Scenario: Trip Cost Settlement**

```
Trip Expenses:
- Accommodation: ₹3000 (paid by Alice)
  Split: 3 ways (Alice, Bob, Charlie)
- Food: ₹1500 (paid by Bob)
  Split: 3 ways equally

Calculations:
- Alice paid: ₹3000, owes: ₹1500
  Net: +₹1500 (gets ₹1500)

- Bob paid: ₹1500, owes: ₹500
  Net: +₹1000 (gets ₹1000)

- Charlie owes: ₹2000 total
  Net: -₹2000 (owes ₹2000)

Optimal Settlements:
1. Charlie → Alice: ₹1500
2. Charlie → Bob: ₹500

(Only 2 transactions needed instead of 4!)
```

---

## 🚀 Getting Started

1. Go to any group
2. Click "Settlements" tab
3. See suggested settlements
4. Click "Settle" on any one
5. Choose payment method
6. Confirm payment
7. Wait for receiver confirmation
8. Done! ✅

---

**Need Help?**

- Check the full documentation: `SETTLEMENT_SYSTEM_DOCS.md`
- Contact your group admin
- Report bugs or suggest features

Happy settling! 🎉
