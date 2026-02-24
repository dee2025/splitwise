# Settlement System - Quick Reference Guide

## 🎯 The Complete Workflow (Simple Version)

### Before Trip

```
Group Creator creates group → Invites members
```

### During Trip (Ongoing)

```
All Members:
├─ Add expenses as you go
├─ See running balances
└─ Settlement tab LOCKED (shows "Trip still ongoing")
```

### End of Trip

```
Group Creator:
├─ Clicks [END TRIP] button
├─ Trip status changes to COMPLETED
└─ All members get notification
   "Trip Ended! Time to settle up 🎉"

What Happens Behind Scenes:
├─ All expenses frozen (can't add more)
├─ Final balances calculated
└─ Notification sent to all members
```

### Settlement Phase

```
Group Members see Settlement Tab:
├─ Summary of who owes what
├─ Total amount owed to receiver
└─ [SETTLE PAYMENT] button

Click [SETTLE]:
├─ Step 1: View balance & confirm amount
├─ Step 2: Choose payment method (Cash/UPI/Bank/etc)
├─ Step 3: Add proof (OPTIONAL - you can skip)
└─ Step 4: Confirm & DONE!

Receiver:
├─ Gets notification of payment
├─ Reviews payment details
├─ Clicks [CONFIRM RECEIPT]
└─ Settlement marked PAID ✅
```

---

## 📱 UI Flows

### Group Header - Trip Ongoing

```
┌────────────────────────────────────────┐
│  Group Name                        [End Trip]
│  Group Description                 [Add Expense]
│                                        │
│  Trip Status: Ongoing (blue badge)     │
│  Total Expenses: ₹5000                 │
│  Members: 4                            │
│  Active Expenses: 8                    │
└────────────────────────────────────────┘

Buttons:
• [END TRIP] - Only if you're group creator
• [ADD EXPENSE] - Always enabled while trip ongoing
```

### Group Header - Trip Completed

```
┌────────────────────────────────────────┐
│  Group Name
│  Group Description                 [Add Expense DISABLED]
│
│  Trip Status: Ended (green badge)
│  Total Expenses: ₹5000
│  Members: 4
│  Active Expenses: 8
└────────────────────────────────────────┘

Buttons:
• [END TRIP] - Hidden (already ended)
• [ADD EXPENSE] - DISABLED (grayed out)
```

### Settlement Tab - Trip Ongoing

```
┌────────────────────────────────────────┐
│  ⏰ Trip is still ongoing              │
│                                        │
│  Settlements will be available once   │
│  the trip is ended. Click the "End    │
│  Trip" button to complete and start   │
│  settling up.                         │
│                                        │
│  ℹ️  You can finish the trip using   │
│      the "End Trip" button at top     │
└────────────────────────────────────────┘
```

### Settlement Tab - Trip Completed

```
┌────────────────────────────────────────┐
│         YOU OWE ₹5000                  │
│                                        │
│  PAY TO:                               │
│  □ Alice: ₹3000                        │
│  □ Bob: ₹2000                          │
│                                        │
│  [SETTLE PAYMENT]    [VIEW HISTORY]    │
└────────────────────────────────────────┘
```

### Settlement Modal - Step 1 (Summary)

```
┌────────────────────────────────────────┐
│  Trip Settlement                       │
│  ✅ Trip: Goa Vacation (Completed)    │
│                                        │
│  YOUR BALANCE:                         │
│  ┌──────────────────────────────────┐ │
│  │ You Owe: ₹5000                   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  BREAKDOWN:                            │
│  • Alice: ₹3000  [SETTLE]              │
│  • Bob: ₹2000    [SETTLE]              │
│                                        │
│  [CONFIRM] or [CANCEL]                 │
└────────────────────────────────────────┘
```

### Settlement Modal - Step 2 (Payment Method)

```
┌────────────────────────────────────────┐
│  Paying to: Alice                      │
│  Amount: ₹3000                         │
│                                        │
│  SELECT PAYMENT METHOD:                │
│  ○ 💵 Cash                             │
│  ⊙ 📱 UPI (pre-selected)               │
│  ○ 🏦 Bank Transfer                    │
│  ○ 💳 Wallet/App                       │
│                                        │
│  PROOF (Optional):                     │
│  [Enter Transaction ID or URL]         │
│                                        │
│  NOTES (Optional):                     │
│  [e.g., Bank transfer on 23 Feb]       │
│                                        │
│  [SEND] or [BACK]                      │
└────────────────────────────────────────┘
```

### Settlement Modal - Step 3 (Done)

```
┌────────────────────────────────────────┐
│  ✅ SENT!                              │
│                                        │
│  Settlement request sent to Alice      │
│                                        │
│  Amount: ₹3000                         │
│  Method: UPI                           │
│  Status: Pending ⏳                    │
│                                        │
│  She'll confirm once she verifies      │
│  the payment.                          │
│                                        │
│  [DONE]                                │
└────────────────────────────────────────┘
```

### Receiver View - Pending Settlement

```
┌────────────────────────────────────────┐
│  SETTLEMENT RECEIVED ✉️                │
│                                        │
│  From: You                             │
│  Amount: ₹3000                         │
│  Method: UPI                           │
│  Proof: TXN_ID_123456                  │
│                                        │
│  Status: PENDING ⏳                    │
│                                        │
│  [CONFIRM RECEIPT] [DECLINE]           │
└────────────────────────────────────────┘
```

### Receiver View - Confirmed

```
┌────────────────────────────────────────┐
│  SETTLEMENT CONFIRMED ✅               │
│                                        │
│  From: You                             │
│  Amount: ₹3000                         │
│  Method: UPI                           │
│  Proof: TXN_ID_123456                  │
│                                        │
│  Status: PAID ✅                       │
│  Confirmed on: 23 Feb 2026, 3:45 PM   │
│                                        │
│  Notification sent to You              │
└────────────────────────────────────────┘
```

---

## 🔑 Key Rules

### What CAN Happen:

✅ Create group and add expenses anytime  
✅ View balances anytime (trip ongoing or completed)  
✅ Add members anytime  
✅ End trip (creator only)  
✅ Settle after trip ends  
✅ Upload proof (optional)  
✅ Confirm/decline settlements

### What CANNOT Happen:

❌ Cannot end trip (not group creator)  
❌ Cannot add expenses after trip ends  
❌ Cannot settle while trip is ongoing  
❌ Cannot force others to pay  
❌ Cannot edit past settlements

---

## 📊 Status Meanings

| Status        | Means                      | What's Next           |
| ------------- | -------------------------- | --------------------- |
| **PENDING**   | Payment request sent       | Receiver must confirm |
| **PAID**      | Payment confirmed          | ✅ Done!              |
| **CANCELLED** | Payment rejected/cancelled | Can send new request  |

---

## 🎨 Visual Status Indicators

```
Trip Status:
• 🔵 ONGOING (blue) - Trip in progress, expenses can be added
• 🟢 COMPLETED (green) - Trip ended, ready to settle

Settlement Status:
• ⏳ PENDING (gray) - Waiting for receiver confirmation
• ✅ PAID (green) - Payment confirmed
• ❌ CANCELLED (red) - Payment was cancelled
```

---

## 💡 Common Scenarios

### Scenario 1: Simple Cash Settlement

```
You paid ₹2000 for group lunch
Group ends trip
You owe Bob ₹2000 back
You click [SETTLE]
Select [💵 CASH]
Send settlement
Bob clicks [CONFIRM RECEIPT]
Done! ✅
```

### Scenario 2: Digital Payment with Proof

```
You owe Alice ₹1500
Click [SETTLE]
Select [📱 UPI]
Enter proof: "9876543210" (UPI ref)
Send to Alice
Alice sees UPI ID in notification
Alice confirms: "Yes, received ₹1500"
Done! ✅
```

### Scenario 3: Multiple Settlements

```
You owe:
1. Alice ₹2000 → Settle
2. Bob ₹1500 → Settle
3. Charlie ₹500 → Settle
Total: ₹4000

Can settle each separately OR combine
System calculates optimal path automatically
```

---

## ⚙️ API Endpoints (For Developers)

```
GET /api/settlements/calculate-final?groupId=xxx
→ Get settlement amounts for all users

POST /api/settlements/create-final
→ Create new settlement request
  Body: { groupId, toUserId, totalAmount, method, proof?, notes? }

PUT /api/settlements/mark-paid
→ Confirm payment received
  Body: { settlementId, proof?, notes? }

PUT /api/groups/complete-trip
→ End trip and freeze expenses
  Body: { groupId }
```

---

## 🚨 Error Messages & Solutions

```
❌ "Trip is not completed yet"
   → Solution: Creator must click "End Trip" first

❌ "You don't have permission"
   → Solution: Only group creator can end trip

❌ "User not found in this group"
   → Solution: Can only settle with group members

❌ "Settlement amount mismatch"
   → Solution: Settlement amount must match calculated balance

❌ "Network error"
   → Solution: Check connection and try again
```

---

## 📝 Checklist Before Settling

- [x] Trip has been ended
- [x] All expenses have been added
- [x] Balance amounts look correct
- [x] You have payment method ready
- [x] Receiver's contact info saved
- [x] (Optional) Have proof/reference ready

---

## 🎯 Success Criteria

Settlement is complete when:

1. ✅ Settlement created (status = PENDING)
2. ✅ Receiver confirms (status = PAID)
3. ✅ Both see "Confirmed" message
4. ✅ System records in history
5. ✅ Notification sent to payer

---

## 📞 Support Scenarios

**Q: Can I settle before trip ends?**
A: No. Trip must be ended first. Only the group creator can end the trip.

**Q: Is proof required?**
A: No! Proof is completely optional. You can settle without any proof.

**Q: Can I edit my payment after sending?**
A: Not directly. You'd need to cancel and resend.

**Q: What if receiver doesn't confirm?**
A: It stays in PENDING. You can send a reminder or contact them directly.

**Q: Can multiple people settle to one person?**
A: Yes! Each settlement is independent. You can settle at any time.

**Q: What if I settle the wrong amount?**
A: Cancel it and create a new one with correct amount.

---

**Remember:** Settlement is just confirming payment happened. It's optional but recommended to keep track! 📊
