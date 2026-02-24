# Advanced Settlement System Documentation

## 📋 Overview

This production-level settlement system provides a comprehensive workflow for users to settle expenses within groups. It includes:

- **Intelligent Settlement Calculation** - Optimizes payment flow to minimize transactions
- **Multiple Payment Methods** - Cash, UPI, Bank Transfer, Wallet
- **Verification Workflow** - Confirm sent → Confirm received → Complete
- **Payment Proof Tracking** - Upload and store payment receipts
- **Batch Settlements** - Create multiple settlements at once
- **Settlement History** - Track all past settlements and transactions
- **Real-time Notifications** - Notify users of settlement status changes
- **Mobile-First UI** - Responsive design optimized for mobile devices
- **Dispute Resolution** - Mark settlements as disputed with reasons

---

## 🏗️ Database Schema

### Settlement Model

```javascript
{
  groupId: ObjectId,
  fromUser: ObjectId,
  toUser: ObjectId,
  amount: Number,

  // Payment Details
  method: "cash" | "upi" | "bank_transfer" | "wallet" | "other",
  paymentDetails: {
    upiId: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    reference: String
  },

  // Workflow Status
  status: "pending" | "confirmed" | "processing" | "completed" | "cancelled" | "disputed",
  requestedAt: Date,
  confirmedAt: Date,
  paidAt: Date,
  completedAt: Date,

  // Payment Proof
  proof: String (URL),
  proofUploadedAt: Date,
  proofUploadedBy: ObjectId,

  // Dispute Management
  isDisputed: Boolean,
  disputeReason: String,
  disputedAt: Date,

  // Batch Reference
  batchId: ObjectId,

  // Communication
  notes: String,
  messages: [{ sender, message, timestamp }]
}
```

### SettlementBatch Model

```javascript
{
  groupId: ObjectId,
  createdBy: ObjectId,
  status: "draft" | "ready" | "processing" | "completed" | "cancelled",

  settlementIds: [ObjectId],
  totalAmount: Number,
  settlementCount: Number,

  stats: {
    totalPending: Number,
    totalCompleted: Number,
    totalCancelled: Number,
    averageResolutionTime: Number
  }
}
```

---

## 🔌 API Endpoints

### 1. Calculate Optimal Settlements

```
GET /api/settlements/calculate?groupId=xxx
```

**Response:**

```json
{
  "groupId": "xxx",
  "balances": { "userId": amount, ... },
  "settlements": [
    {
      "from": "userId",
      "to": "userId",
      "amount": 100,
      "fromUser": { user details },
      "toUser": { user details }
    }
  ],
  "summary": {
    "totalSettlements": 3,
    "totalAmount": 500,
    "creditorsCount": 2,
    "debtorsCount": 3
  }
}
```

### 2. Create Batch Settlements

```
POST /api/settlements/batch
Body: {
  "groupId": "xxx",
  "settlements": [
    { "toUserId": "yyy", "amount": 100, "method": "cash", "notes": "..." }
  ]
}
```

### 3. Get Settlement Summary

```
GET /api/settlements/summary?groupId=xxx
```

**Response:**

```json
{
  "summary": {
    "totalSettlements": 10,
    "userOweAmount": 500,
    "userGetAmount": 200,
    "breakdown": {
      "byStatus": { ... },
      "byMethod": { ... },
      "byGroup": { ... }
    }
  },
  "settlements": [ ... ]
}
```

### 4. Verify/Confirm Settlement

```
PUT /api/settlements/verify
Body: {
  "settlementId": "xxx",
  "action": "confirm" | "complete" | "cancel" | "dispute",
  "paymentDetails": { ... },
  "proof": "image_url",
  "reason": "dispute_reason"
}
```

---

## 🎨 Frontend Components

### SettlementTabV2 (Main Component)

Integrates all settlement features with tab-based navigation.

```jsx
<SettlementTabV2 groupId={groupId} onRefresh={handleRefresh} />
```

**Features:**

- Overview tab with settlement suggestions
- History tab with filter and statistics
- Real-time refresh capability

---

## 💡 How Settlement Amounts Are Calculated

### **The Algorithm**

1. **Collect all group expenses**
   - Who paid what
   - Who it was split among

2. **Calculate net balances** for each person
   - If you paid ₹1000 and owe ₹400 back → Net: +₹600
   - If you paid ₹0 and owe ₹500 → Net: -₹500

3. **Match creditors with debtors**
   - Find optimal payments to minimize transactions
   - Use greedy matching algorithm

4. **Generate settlement cards**
   - Show: "You owe Alice ₹500"
   - Amount is AUTO-CALCULATED (no user input needed)

### **Example Walkthrough**

```
Expenses in "Goa Trip" Group:

Expense 1: Hotel ₹3000 (paid by Alice)
- Split among: Alice, Bob, Charlie
- Each owes: ₹1000

Expense 2: Food ₹1500 (paid by Bob)
- Split among: Alice, Bob, Charlie
- Each owes: ₹500

Net Balances:
- Alice: Paid ₹3000, Owes ₹1500 → Net: +₹1500
- Bob: Paid ₹1500, Owes ₹1500 → Net: ₹0
- Charlie: Paid ₹0, Owes ₹2000 → Net: -₹2000

Optimal Settlements:
- Charlie pays Alice: ₹1500
- Charlie pays Bob: ₹500
```

---

### SettlementSummary Component

Shows suggested settlements for the current group.

```jsx
<SettlementSummary
  groupId={groupId}
  onSettleClick={(settlement) => {
    // Show settlement modal
  }}
/>
```

**Features:**

- Loads settlement calculations
- Shows who owes whom
- Settle button for each transaction

---

### SettlementModal Component

Main settlement creation and confirmation flow.

**Steps:**

1. **Method Selection** - Choose payment method (Cash, UPI, Bank, Wallet)
2. **Payment Details** - Add relevant payment information
3. **Confirmation** - Confirm and send settlement request
4. **Receipt** - Show success confirmation

```jsx
<SettlementModal
  isOpen={isOpen}
  onClose={handleClose}
  settlement={selectedSettlement}
  groupId={groupId}
/>
```

---

### SettlementHistory Component

View all settlement transactions with filtering.

**Features:**

- Filter by status (All, Pending, Completed)
- Show user statistics
- Display payment methods breakdown
- Sort by date and amount

```jsx
<SettlementHistory groupId={groupId} />
```

---

## 🔄 Settlement Workflow

### User Journey: Settle an Expense

```
1. User Views Group → Go to "Settlements" Tab
   ↓
2. See Suggested Settlements
   ↓
3. Click "Settle" on a suggested payment
   ↓
4. Settlement Modal Opens
   ├─ Step 1: Select Payment Method
   │  └─ Choices: Cash, UPI, Bank Transfer, Wallet
   │
   ├─ Step 2: Enter Payment Details
   │  └─ Based on method selected
   │     (UPI ID, Account Number, etc.)
   │
   └─ Step 3: Confirm & Send
      └─ Notification sent to receiver
      ↓
5. Receiver Gets Notification
   ├─ Shows settlement request
   ├─ Shows amount and payer
   └─ Option to confirm receipt
      ↓
6. Receiver Confirms Payment
   └─ Can upload payment proof
      ↓
7. Settlement Marked Completed
   └─ Notification sent to payer
```

---

## 📊 Settlement Status Flow

```
PENDING → CONFIRMED → PROCESSING → COMPLETED
   ↓
CANCELLED (can cancel anytime)
   ↓
DISPUTED (for payment issues)
```

### Status Meanings:

- **PENDING**: Settlement request sent, awaiting confirmation
- **CONFIRMED**: Payer confirmed sending payment
- **PROCESSING**: Payment in progress
- **COMPLETED**: Receiver confirmed receiving payment
- **CANCELLED**: Settlement was cancelled by either party
- **DISPUTED**: Payment has been disputed with a reason

---

## 💰 Payment Methods

### 1. Cash

- Direct in-person payment
- No additional details required
- Quickest confirmation

### 2. UPI

- Accept UPI ID
- Track transaction reference
- Real-time verification possible

### 3. Bank Transfer

- Account number, IFSC, bank name
- Most formal method
- Proof through bank statements

### 4. Wallet

- Digital wallet providers
- Quick and easy
- Real-time confirmation available

---

## 📱 Mobile-First Design

### Key Features:

- **Bottom Sheet Modal** - Natural mobile interaction
- **Touch-Friendly Buttons** - Large tap targets (44x44px)
- **Responsive Grid** - Adapts to screen size
- **Optimized Forms** - Single column on mobile
- **Quick Actions** - Fast settlement flow
- **Real-Time Feedback** - Instant confirmations

### Responsive Breakpoints:

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🔐 Security & Validation

### Validation Checks:

1. **User Authentication** - Token verification on all endpoints
2. **Authorization** - Users can only see their settlements
3. **Amount Validation** - Prevent negative or zero amounts
4. **Payment Details** - Validate format of UPI IDs, account numbers, etc.
5. **Status Transitions** - Only allowed status changes

### Dispute Protection:

- Log all settlement changes
- Store payment proof
- Maintain settlement messages
- Track responsible parties

---

## 📈 Performance Optimizations

1. **Settlement Calculation**
   - Greedy algorithm for optimal transactions
   - O(n log n) complexity
   - Minimizes total transactions

2. **Database Indexes**
   - groupId + status
   - fromUser + toUser + status
   - batchId

3. **Caching**
   - Settlement calculations cached per group
   - Invalidate on expense changes
   - Clear on new settlement creation

---

## 🧪 Testing Scenarios

### Test Case 1: Simple Settlement

```
User A owes User B ₹100
→ Create settlement request
→ B clicks "Confirm Receipt"
→ Mark as completed
✓ Settlement complete
```

### Test Case 2: Batch Settlements

```
3 users, 2 expenses
→ Calculate optimal settlements
→ Create batch with 2 transactions
→ Each confirms independently
✓ All completed
```

### Test Case 3: Dispute Resolution

```
Settlement created
→ Payer confirms sending
→ Receiver marks as disputed
→ Admin can review with all details
✓ Dispute logged
```

---

## 🚀 Future Enhancements

1. **Integration with Payment Gateways**
   - Stripe, Razorpay, PayPal
   - Automatic payment processing
   - Real-time verification

2. **Advanced Analytics**
   - Settlement trends
   - Payment method preferences
   - Resolution time analytics

3. **Automated Reminders**
   - Remind pending settlements
   - Follow-up notifications
   - Deadline alerts

4. **Settlement Templates**
   - Save payment details
   - Quick settle with saved methods
   - One-click settlements

5. **Multi-currency Support**
   - Currency conversion
   - Exchange rate tracking
   - International transfers

---

## 📞 Support & Troubleshooting

### Common Issues:

**Settlement not appearing:**

- Check group membership
- Verify user authentication
- Ensure expenses are added

**Payment confirmation stuck:**

- Try refreshing the page
- Check internet connection
- Verify user role (receiver only)

**Batch settlements failed:**

- Ensure all users are group members
- Validate amount format
- Check database connection

---

## 👨‍💻 Developer Guide

### To Add New Payment Method:

1. Update Settlement model enum
2. Add method to SettlementModal paymentMethods
3. Add input fields for method
4. Update API validation
5. Add icon/emoji for display

### To Modify Settlement Algorithm:

1. Edit `/api/settlements/calculate/route.js`
2. Implement new settlement logic
3. Test with various expense scenarios
4. Update documentation

---

**Last Updated:** February 23, 2026
**Version:** 1.0
**Status:** Production Ready
