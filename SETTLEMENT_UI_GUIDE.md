# Settlement UI - Step-by-Step Visual Guide

## 📚 Understanding the Settlement Flow

### **The Problem We're Solving**

Let's say you went on a trip with 3 friends:

| Person  | Paid          | Owes Split        |
| ------- | ------------- | ----------------- |
| Alice   | ₹3000 (Hotel) | ₹1000 (her share) |
| Bob     | ₹1500 (Food)  | ₹500 (his share)  |
| Charlie | ₹0            | ₹1500 (his share) |

**Net Balances:**

- Alice: +₹2000 (will receive ₹2000)
- Bob: +₹1000 (will receive ₹1000)
- Charlie: -₹3000 (owes ₹3000)

**Who should pay whom?**

- Charlie pays Alice ₹2000
- Charlie pays Bob ₹1000

---

## 🎯 Settlement Tab - Overview Tab

### **Screen 1: View Suggested Settlements**

```
┌─────────────────────────────────┐
│  SETTLEMENTS                    │
├─────────────────────────────────┤
│                                 │
│  📊 Summary Cards:              │
│  ┌───────────────────────────┐  │
│  │ Transactions: 2           │  │
│  │ Total Amount: ₹3000       │  │
│  └───────────────────────────┘  │
│                                 │
│  💰 Suggested Settlements:      │
│                                 │
│  Settlement #1:                 │
│  ┌─────────────────────────────┐│
│  │ Charlie → Alice             ││
│  │ Amount: ₹2000              ││
│  │              [SETTLE BTN]   ││
│  └─────────────────────────────┘│
│                                 │
│  Settlement #2:                 │
│  ┌─────────────────────────────┐│
│  │ Charlie → Bob               ││
│  │ Amount: ₹1000              ││
│  │              [SETTLE BTN]   ││
│  └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

### **What Each Card Shows:**

- **FROM → TO**: Who pays whom
- **Amount**: Exact amount to transfer
- **SETTLE Button**: Click to start payment process

---

## 🎬 Settlement Modal - The Payment Wizard

### **Step 1: Click SETTLE on Any Settlement Card**

When you click the SETTLE button, a modal opens with the settlement details auto-filled:

```
┌─────────────────────────────────┐
│  ✖ Settlement                   │
├─────────────────────────────────┤
│                                 │
│  Settlement Details:            │
│  ┌─────────────────────────────┐│
│  │ From: Charlie              ││
│  │ To: Alice                  ││
│  │ Amount: ₹2000              ││
│  └─────────────────────────────┘│
│                                 │
│  Payment Method Selection:      │
│  ┌─────────────────────────────┐│
│  │ 💵 Cash    │  📱 UPI       ││
│  │ 🏦 Bank    │  💳 Wallet    ││
│  └─────────────────────────────┘│
│                                 │
│  Notes (Optional):              │
│  ┌─────────────────────────────┐│
│  │ Add reference or details    ││
│  └─────────────────────────────┘│
│                                 │
│  [CONTINUE]  [CANCEL]           │
│                                 │
└─────────────────────────────────┘
```

---

### **Step 2: Choose Payment Method**

#### **Option A: Cash Payment**

```
┌─────────────────────────────────┐
│  ✖ Settlement                   │
├─────────────────────────────────┤
│                                 │
│  Settlement Details:            │
│  From: Charlie → To: Alice      │
│  Amount: ₹2000                  │
│                                 │
│  ✅ Method: CASH (Selected)     │
│                                 │
│  Notes (Optional):              │
│  ┌─────────────────────────────┐│
│  │ E.g., "Paid cash on 23 Feb" ││
│  └─────────────────────────────┘│
│                                 │
│  What happens next:             │
│  ✓ You send request to Alice    │
│  ✓ Alice gets notification      │
│  ✓ Alice confirms receipt       │
│  ✓ Payment complete!            │
│                                 │
│  [CONFIRM PAYMENT]  [CANCEL]    │
│                                 │
└─────────────────────────────────┘
```

#### **Option B: UPI Payment**

```
┌─────────────────────────────────┐
│  ✖ Settlement                   │
├─────────────────────────────────┤
│                                 │
│  Settlement Details:            │
│  From: Charlie → To: Alice      │
│  Amount: ₹2000                  │
│                                 │
│  ✅ Method: UPI (Selected)      │
│                                 │
│  UPI ID (Required):             │
│  ┌─────────────────────────────┐│
│  │ alice@okhdfcbank           ││
│  └─────────────────────────────┘│
│                                 │
│  Transaction Reference (Opt):   │
│  ┌─────────────────────────────┐│
│  │ TXN#123456789              ││
│  └─────────────────────────────┘│
│                                 │
│  [CONFIRM PAYMENT]  [CANCEL]    │
│                                 │
└─────────────────────────────────┘
```

#### **Option C: Bank Transfer**

```
┌─────────────────────────────────┐
│  ✖ Settlement                   │
├─────────────────────────────────┤
│                                 │
│  Settlement Details:            │
│  From: Charlie → To: Alice      │
│  Amount: ₹2000                  │
│                                 │
│  ✅ Method: BANK TRANSFER       │
│                                 │
│  Account Holder Name (Req):     │
│  ┌─────────────────────────────┐│
│  │ Alice Singh                ││
│  └─────────────────────────────┘│
│                                 │
│  Account Number (Required):     │
│  ┌─────────────────────────────┐│
│  │ 1234567890123456           ││
│  └─────────────────────────────┘│
│                                 │
│  Bank Name (Required):          │
│  ┌─────────────────────────────┐│
│  │ HDFC Bank                  ││
│  └─────────────────────────────┘│
│                                 │
│  IFSC Code (Required):          │
│  ┌─────────────────────────────┐│
│  │ HDFC0001234                ││
│  └─────────────────────────────┘│
│                                 │
│  [CONFIRM PAYMENT]  [CANCEL]    │
│                                 │
└─────────────────────────────────┘
```

---

### **Step 3: Click "Confirm Payment"**

```
┌─────────────────────────────────┐
│  ✔ Settlement Confirmed!        │
├─────────────────────────────────┤
│                                 │
│           ✅ Success!           │
│                                 │
│  Settlement Details:            │
│  From: Charlie → Alice          │
│  Amount: ₹2000 via UPI          │
│                                 │
│  📱 Notification sent to:       │
│  ➜ Alice                        │
│                                 │
│  Next Step:                     │
│  ⏳ Alice will confirm receipt   │
│     When she confirms, the      │
│     settlement is complete! ✔   │
│                                 │
│  [DONE]                         │
│                                 │
└─────────────────────────────────┘
```

---

## 🔔 What Happens Next?

### **Alice Receives Notification**

```
📲 Notification:
─────────────────────────────────
"Charlie has requested ₹2000
settlement via UPI"

[View Details]
```

### **Alice Confirm Receipt in Settlement Tab**

```
Settlement Tab:
┌─────────────────────────────────┐
│  SETTLEMENTS                    │
├─────────────────────────────────┤
│                                 │
│  📋 Pending Confirmations:      │
│                                 │
│  Charlie → Alice ₹2000          │
│  Method: UPI                    │
│  Date: 23 Feb 2026              │
│                                 │
│  [CONFIRM RECEIPT] [CANCEL]     │
│                                 │
└─────────────────────────────────┘
```

### **Alice Clicks "CONFIRM RECEIPT"**

```
✅ Settlement Complete!

Who paid: Charlie
Who received: Alice
Amount: ₹2000
Payment Method: UPI

Status: COMPLETED ✔

Charlie gets notified that Alice
confirmed receiving the payment.
```

---

## 📊 History Tab - Track Everything

After settlements are completed, you can see them in the **History Tab**:

```
┌─────────────────────────────────┐
│  SETTLEMENTS → HISTORY           │
├─────────────────────────────────┤
│                                 │
│  Statistics:                    │
│  You Owe: ₹0                    │
│  You Get: ₹2000                 │
│                                 │
│  Filter: [ALL] [PENDING] [DONE] │
│                                 │
│  ✅ COMPLETED PAYMENTS:         │
│                                 │
│  Charlie → Alice               │
│  ₹2000 via UPI                 │
│  23 Feb 2026                    │
│  Status: Completed ✔            │
│                                 │
│  Charlie → Alice               │
│  ₹1000 via Cash                │
│  22 Feb 2026                    │
│  Status: Completed ✔            │
│                                 │
└─────────────────────────────────┘
```

---

## 🎯 Real-World Scenario: Complete Example

### **Initial State: Trip Expenses**

**Group: "Goa Trip 2026"**

```
Expenses Added:
1. Hotel ₹3000 (Paid by Alice, split 3 ways)
   - Alice owes: ₹1000
   - Bob owes: ₹1000
   - Charlie owes: ₹1000

2. Food ₹1500 (Paid by Bob, split 3 ways)
   - Alice owes: ₹500
   - Bob owes: ₹500
   - Charlie owes: ₹500

Total Owed:
- Alice: +₹2000 (receives)
- Bob: +₹1000 (receives)
- Charlie: -₹3000 (pays)
```

---

### **Step-by-Step Settlement**

#### **1️⃣ Charlie Views Settlements Tab**

```
SETTLEMENTS TAB OPENS
↓
System Calculates: "Optimal Settlements Needed"
↓
Shows 2 Suggested Settlements:
  • Charlie → Alice: ₹2000
  • Charlie → Bob: ₹1000
```

#### **2️⃣ Charlie Clicks Settle on First Transaction**

```
Charlie → Alice ₹2000

[SETTLE] ← Click Here
↓
Settlement Modal Opens
↓
Modal Shows:
  From: Charlie
  To: Alice
  Amount: ₹2000
```

#### **3️⃣ Charlie Selects Payment Method**

```
Choose Method:
- 💵 Cash       ← Charlie chooses this
- 📱 UPI
- 🏦 Bank Transfer
- 💳 Wallet

Next Step: Enter Payment Details
```

#### **4️⃣ Charlie Adds Notes (Optional)**

```
Notes Field:
"Paid via cash at hotel"

Then:
[CONFIRM PAYMENT] Button
```

#### **5️⃣ Settlement Request Sent**

```
✅ Success!

Notification Sent to: Alice

What Alice sees:
📲 "Charlie sent you a settlement
    request for ₹2000"
```

#### **6️⃣ Alice Gets Notification**

```
Alice opens app
↓
Sees notification
↓
Goes to Settlements Tab
↓
Sees:
  "Charlie → Alice: ₹2000"
  Status: PENDING

[CONFIRM RECEIPT] ← Click to complete
```

#### **7️⃣ Alice Confirms Receipt**

```
Alice clicks: [CONFIRM RECEIPT]
↓
Settlement Status Changes: COMPLETED ✔
↓
Alice's notification: "✔ Payment confirmed"
↓
Charlie's notification: "✔ Alice confirmed payment"
```

#### **8️⃣ View in Settlement History**

```
Settlement History:
✅ Charlie → Alice: ₹2000 (Cash)
   Completed on 23 Feb 2026

✅ Charlie → Bob: ₹1000 (UPI)
   Completed on 23 Feb 2026

💰 You Owe: ₹0
💰 You're Owed: ₹0
```

---

## ⚡ Quick Reference Guide

### **When to Use Each Method**

| Method     | Best For            | Steps                                    |
| ---------- | ------------------- | ---------------------------------------- |
| **Cash**   | Friends together    | Pay in person, Confirm receipt           |
| **UPI**    | Quick digital       | Enter UPI ID, send link, confirm         |
| **Bank**   | Formal transfers    | Enter account details, transfer, confirm |
| **Wallet** | Digital convenience | Select provider, transfer quickly        |

---

### **Status Meanings**

| Status        | Meaning               | What's Next                |
| ------------- | --------------------- | -------------------------- |
| **PENDING**   | Request sent, waiting | Receiver confirms receipt  |
| **CONFIRMED** | Payer sent payment    | Receiver confirms received |
| **COMPLETED** | Both confirmed        | ✅ Settlement done!        |
| **CANCELLED** | Settlement removed    | Create new one if needed   |

---

## 🤔 Common Questions

### **Q: How do I know HOW MUCH to settle?**

**A:** The system calculates it automatically! Look at the suggested settlements - amounts are predetermined based on expense splits.

---

### **Q: Can I change the amount?**

**A:** No. Each settlement card shows the exact amount calculated from expenses. If wrong, cancel and check expense splits.

---

### **Q: What if I don't settle?**

**A:** Settlement stays PENDING. Everyone can see you owe/are owed. Settle when convenient using suggested amounts.

---

### **Q: Do I have to use the exact amount?**

**A:** Yes. Settlement amounts = automatic calculation from shared expenses. Trustable and consistent.

---

### **Q: What if I pay wrong amount?**

**A:** Create a NEW settlement card for the difference. Amount shown is computed, can't be changed individually.

---

### **Q: How many people can settle?**

**A:** All group members. Each person settles their portion automatically.

---

## 🎥 Video-Like Flow

```
Trip with 4 friends
    ↓
Expenses divided automatically
    ↓
Settlement Tab Shows:
  "Alice owes Bob ₹500"
  "Charlie owes Alice ₹1000"
  "Dave owes Bob ₹300"
    ↓
Each person clicks "SETTLE" on their cards
    ↓
Chooses payment method
    ↓
Confirms payment
    ↓
Receiver confirms receipt
    ↓
Everything shows as ✅ DONE
    ↓
Friends see complete settlement history
```

---

## ✅ Simple Checklist

- [ ] Go to Settlements tab
- [ ] See suggested settlements with amounts
- [ ] Click SETTLE on any card
- [ ] Choose payment method
- [ ] Add details/notes
- [ ] Click CONFIRM PAYMENT
- [ ] Other person gets notification
- [ ] Other person confirms receipt
- [ ] Settlement shows as COMPLETED
- [ ] View history anytime

---

**Key Takeaway:**
You don't calculate amounts - the system does! Just click SETTLE, choose how to pay, and follow the wizard. Simple! ✨
