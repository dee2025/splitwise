# System Architecture & Data Flow Visualization

## 🏗️ Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Splitwise Settlement System                         │
│                                                                             │
│                            FRONTEND (React)                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Group Page (/groups/[groupId])                                     │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  ┌─ Header ─────────────────────────────────────────────────┐      │   │
│  │  │ [END TRIP] (amber)        [ADD EXPENSE] (black, disabled) │      │   │
│  │  │ 🔵 Trip: ONGOING | 🟢 Trip: COMPLETED                    │      │   │
│  │  └────────────────────────────────────────────────────────────┘      │   │
│  │                                                                      │   │
│  │  ┌─ Stats ──────────────────────────────────────────────────┐      │   │
│  │  │ Total: ₹5000  │ Members: 4 │ Expenses: 8 │ Status: ✓    │      │   │
│  │  └────────────────────────────────────────────────────────────┘      │   │
│  │                                                                      │   │
│  │  ┌─ Tabs ───────────────────────────────────────────────────┐      │   │
│  │  │ Expenses │ Members │ Balances │ [Settlements] │ Activity │      │   │
│  │  └────────────────────────────────────────────────────────────┘      │   │
│  │                                                                      │   │
│  │  ┌─ Settlements Tab ────────────────────────────────────────┐      │   │
│  │  │ IF ONGOING:                    IF COMPLETED:             │      │   │
│  │  │ \"Trip still active...\"         FinalSettlementModal      │      │   │
│  │  │ Wait for creator to end trip   ├─ Step 1: Summary        │      │   │
│  │  │                                ├─ Step 2: Payment Method  │      │   │
│  │  │                                └─ Step 3: Confirmation    │      │   │
│  │  └────────────────────────────────────────────────────────────┘      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                           BACKEND (Node.js APIs)                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  API Routes                                                         │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  1. GET  /api/settlements/calculate-final                          │   │
│  │     Input: groupId                                                 │   │
│  │     Output: { allBalances, currentUser { totalBalance } }         │   │
│  │     Purpose: Calculate who owes whom                              │   │
│  │                                                                    │   │
│  │  2. POST /api/settlements/create-final                            │   │
│  │     Input: { groupId, toUserId, totalAmount, method, proof }     │   │
│  │     Output: { settlement }                                        │   │
│  │     Purpose: Send settlement request                              │   │
│  │     Triggers: Notification to receiver                            │   │
│  │                                                                    │   │
│  │  3. PUT  /api/settlements/mark-paid                               │   │
│  │     Input: { settlementId, proof }                                │   │
│  │     Output: { settlement }                                        │   │
│  │     Purpose: Confirm payment received                             │   │
│  │     Triggers: Notification to payer                               │   │
│  │                                                                    │   │
│  │  4. PUT  /api/groups/complete-trip                                │   │
│  │     Input: { groupId }                                            │   │
│  │     Output: { group updated with tripStatus=completed }           │   │
│  │     Purpose: End trip (freeze expenses, enable settlements)       │   │
│  │     Triggers: Notification to all members                         │   │
│  │     Permissions: Creator only                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                          DATABASE (MongoDB)                                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Collections                                                        │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Groups                     Settlements                             │   │
│  │  ├─ _id                     ├─ _id                                  │   │
│  │  ├─ name                    ├─ groupId (ref)                        │   │
│  │  ├─ members []              ├─ fromUser (ref)                       │   │
│  │  ├─ tripStatus ←────────────├─ toUser (ref)                        │   │
│  │  ├─ tripEndDate ←───────────├─ totalAmount                         │   │
│  │  ├─ totalExpenses           ├─ status: pending|paid|cancelled      │   │
│  │  ├─ createdBy               ├─ method: cash|upi|bank|wallet        │   │
│  │  └─ createdAt               ├─ proof (optional)                     │   │
│  │                             └─ createdAt                            │   │
│  │                                                                    │   │
│  │  Users                      Expenses                               │   │
│  │  ├─ _id                     ├─ _id                                  │   │
│  │  ├─ name                    ├─ groupId (ref)                        │   │
│  │  ├─ email                   ├─ amount                               │   │
│  │  ├─ groups []               ├─ paidBy (ref)                         │   │
│  │  └─ credentials             ├─ splitAmong []                        │   │
│  │                             └─ createdAt                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete User Journey Flow

```
START: Create Trip
│
├─► GROUP CREATION
│   └─ Name, Description, Currency
│   └─ tripStatus: \"ongoing\" ← Set
│
├─► ADD MEMBERS
│   └─ Invite friends/colleagues
│   └─ Each member joins
│
├─► ADD EXPENSES (Loop - During Trip)
│   ├─ Amount, Payer, Category
│   ├─ Split among members
│   ├─ Expense saved
│   ├─ Balances updated
│   └─ [Repeat until trip ends]
│
├─► VIEW BALANCES (Optional - Anytime)
│   ├─ See who owes whom
│   ├─ See running totals
│   └─ [Can settle anytime after trip ends]
│
├─► END TRIP (Creator Only)
│   ├─ Click [END TRIP] button
│   ├─ tripEndDate set ← NEW DATA
│   ├─ tripStatus: \"completed\" ← CHANGED
│   ├─ All expenses frozen
│   ├─ Each user notified
│   └─ Settlements enabled
│
├─► SETTLEMENT CREATION (Now Possible)
│   ├─ User views Settlement tab
│   ├─ Sees \"You owe ₹5000\"
│   ├─ Clicks [SETTLE PAYMENT]
│   ├─ Modal opens (3 steps)
│   ├─ Step 1: Reviews balance
│   ├─ Step 2: Chooses payment method
│   ├─ Step 3: (Optional) adds proof
│   ├─ Sends settlement request
│   ├─ System creates settlement
│   ├─ Receiver notified
│   └─ Status: PENDING
│
├─► RECEIVER CONFIRMATION
│   ├─ Receiver gets notification
│   ├─ Reviews settlement details
│   ├─ Clicks [CONFIRM RECEIPT]
│   ├─ Settlement updated to PAID
│   ├─ Payer notified
│   └─ Email confirmation sent
│
└─► COMPLETE ✅
    └─ Settlement marked PAID
    └─ Shows in history
    └─ Trip can be archived
```

---

## 🎭 Component Interaction Diagram

```
GROUP PAGE [groupId]
│
├─► HEADER
│   ├─ [END TRIP] button
│   │  └─ onClick: handleCompleteTrip()
│   │     ├─ API: PUT /api/groups/complete-trip
│   │     ├─ Update: group.tripStatus = \"completed\"
│   │     ├─ Show: Toast \"Trip completed!\"
│   │     ├─ Switch: activeTab = \"settlements\"
│   │     └─ Re-render: Entire page
│   │
│   └─ [ADD EXPENSE] button
│      └─ Disabled if tripStatus === \"completed\"
│
├─► STATS
│   └─ Trip Status Badge
│      ├─ 🔵 Blue if tripStatus === \"ongoing\"
│      └─ 🟢 Green if tripStatus === \"completed\"
│
└─► TABS
    │
    ├─► EXPENSES TAB
    │   └─ List of all expenses
    │      └─ [ADD EXPENSE] modal
    │
    ├─► MEMBERS TAB
    │   └─ List of group members
    │      └─ [ADD MEMBER] modal
    │
    ├─► BALANCES TAB
    │   └─ Who owes whom
    │      └─ Running totals
    │
    ├─► ⭐ SETTLEMENTS TAB (NEW)
    │   │
    │   ├─ IF tripStatus === \"ongoing\":
    │   │  └─ Show info message
    │   │     \"Trip still active, wait for end\"
    │   │
    │   └─ IF tripStatus === \"completed\":
    │      └─ FinalSettlementModal
    │         ├─ Step 1: SUMMARY
    │         │  ├─ API: GET /api/settlements/calculate-final
    │         │  ├─ Display: Your balance breakdown
    │         │  └─ Button: [PROCEED TO PAYMENT]
    │         │
    │         ├─ Step 2: PAYMENT METHOD
    │         │  ├─ Select: cash|upi|bank_transfer|wallet
    │         │  ├─ Optional: Add proof (URL or TXN ID)
    │         │  ├─ Optional: Add notes
    │         │  └─ Button: [SEND SETTLEMENT]
    │         │
    │         └─ Step 3: CONFIRMATION
    │            ├─ API: POST /api/settlements/create-final
    │            ├─ Show: Success message
    │            ├─ Trigger: Notification to receiver
    │            └─ Button: [DONE]
    │
    └─► ACTIVITY TAB
        └─ Log of all actions
```

---

## 💾 Data Flow - Settlement Creation

```
STEP 1: Calculate Balances
┌──────────────────────────────┐
│ GET /calculate-final         │
│ groupId = \"123\"            │
└─────────────┬────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ Read from Database:          │
│ • All expenses in group      │
│ • All users in group         │
│ • Calculate net per person   │
└─────────────┬────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ Return to Frontend:          │
│ {                            │
│   allBalances: [             │
│     { User: \"Alice\",        │
│       balance: +2000 }       │
│     { User: \"Bob\",          │
│       balance: -1500 }       │
│   ]                          │
│   currentUser: {             │
│     owesAmount: 1500         │
│   }                          │
│ }                            │
└──────────────────────────────┘

STEP 2: Create Settlement
┌──────────────────────────────┐
│ POST /create-final           │
│ Body: {                      │
│   groupId: \"123\",          │
│   toUserId: \"alice_id\",    │
│   totalAmount: 1500,         │
│   method: \"upi\",           │
│   proof: \"TXN123\"          │
│ }                            │
└─────────────┬────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ Validate:                    │
│ • User in group? ✓           │
│ • Amount > 0? ✓              │
│ • Method valid? ✓            │
└─────────────┬────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ Create in Database:          │
│ Settlement {                 │
│   fromUser: \"you\",         │
│   toUser: \"alice\",         │
│   totalAmount: 1500,         │
│   status: \"pending\",       │
│   proof: \"TXN123\"          │
│ }                            │
└─────────────┬────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ Create Notification:         │
│ Send to Alice:               │
│ \"You received ₹1500 from    │
│ [User] via UPI\"             │
└─────────────┬────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ Return Success:              │
│ {                            │
│   message: \"Settlement sent\", │
│   settlement: {...}          │
│ }                            │
└──────────────────────────────┘

STEP 3: Mark as Paid
┌──────────────────────────────┐
│ PUT /mark-paid               │
│ Body: {                      │
│   settlementId: \"set_123\",  │
│   proof: \"receipt_url\"      │
│ }                            │
└─────────────┬────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ Update Database:             │
│ Settlement.status =          │
│   \"paid\"                    │
│ Settlement.proof =           │
│   \"receipt_url\"            │
├──────────────────────────────┤
│ Create Notification:         │
│ Send to Payer:               │
│ \"Alice confirmed ₹1500 from │
│ you. Payment complete!\"     │
└─────────────┬────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ Return Success:              │
│ {                            │
│   message: \"Marked as paid\", │
│   settlement: {...}          │
│ }                            │
└──────────────────────────────┘
```

---

## 🔐 Permissions Matrix

```
┌─────────────────────────────────────────────────────────────┐
│ ACTION               │ GROUP CREATOR │ GROUP MEMBER         │
├─────────────────────────────────────────────────────────────┤
│ Create Group         │ YES (self)    │ NO                   │
│ Add Members          │ YES           │ NO (in admin panel)  │
│ Remove Members       │ YES           │ NO                   │
│ Add Expenses         │ YES¹          │ YES¹                 │
│ Edit Own Expense     │ YES¹          │ YES¹                 │
│ Delete Expense²      │ YES           │ YES (own only)       │
│ End Trip             │ YES (ONLY!)   │ NO                   │
│ View Balances        │ YES           │ YES                  │
│ Create Settlement    │ YES           │ YES                  │
│ Confirm Settlement   │ Only receiver │ Only receiver        │
│ View History         │ YES           │ YES                  │
└─────────────────────────────────────────────────────────────┘

Notes:
¹ Can only add/edit while tripStatus === \"ongoing\"
² Disabled after trip ends
```

---

## 📊 State Management

```
GROUP COMPONENT STATE:
┌──────────────────────────────────────┐
│ const [group, setGroup] = {          │
│   _id: \"group_123\",                │
│   name: \"Goa Trip\",                │
│   tripStatus: \"ongoing\" ← KEY      │
│   tripEndDate: null ← KEY            │
│   totalExpenses: 5000,               │
│   members: [\"alice_id\", ...],      │
│   currency: \"INR\",                 │
│   createdAt: \"2026-02-20T...\",    │
│   createdBy: \"user_id\"             │
│ }                                    │
└──────────────────────────────────────┘

UI STATE BASED ON tripStatus:
┌──────────────────────────────────────┐
│ IF tripStatus === \"ongoing\":       │
│ ├─ [END TRIP] button: VISIBLE       │
│ ├─ [ADD EXPENSE] button: ENABLED    │
│ ├─ Settlements tab: message only    │
│ └─ Expenses: can add/edit            │
│                                      │
│ IF tripStatus === \"completed\":    │
│ ├─ [END TRIP] button: HIDDEN        │
│ ├─ [ADD EXPENSE] button: DISABLED   │
│ ├─ Settlements tab: show modal      │
│ └─ Expenses: read-only              │
└──────────────────────────────────────┘
```

---

## 🎯 API Request/Response Examples

```
1. CALCULATE FINAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET /api/settlements/calculate-final?groupId=group_123

Response 200:
{
  \"groupId\": \"group_123\",
  \"allBalances\": [
    { \"id\": \"user_alice\", \"name\": \"Alice\", \"balance\": 2000 },
    { \"id\": \"user_bob\", \"name\": \"Bob\", \"balance\": -1000 },
    { \"id\": \"user_you\", \"name\": \"You\", \"balance\": -1000 }
  ],
  \"currentUser\": {
    \"id\": \"user_you\",
    \"totalBalance\": -1000,
    \"owesAmount\": 1000,
    \"isOwedAmount\": 0
  }
}

2. CREATE SETTLEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POST /api/settlements/create-final

Body:
{
  \"groupId\": \"group_123\",
  \"toUserId\": \"user_alice\",
  \"totalAmount\": 1000,
  \"method\": \"upi\",
  \"proof\": \"9876543210\",
  \"notes\": \"Sent via UPI\"
}

Response 201:
{
  \"message\": \"Settlement created and notification sent\",
  \"settlement\": {
    \"_id\": \"settlement_456\",
    \"fromUser\": \"user_you\",
    \"toUser\": \"user_alice\",
    \"totalAmount\": 1000,
    \"method\": \"upi\",
    \"proof\": \"9876543210\",
    \"status\": \"pending\",
    \"createdAt\": \"2026-02-23T15:30:00Z\"
  }
}

3. MARK PAID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PUT /api/settlements/mark-paid

Body:
{
  \"settlementId\": \"settlement_456\",
  \"proof\": \"https://imgur.com/receipt.jpg\"
}

Response 200:
{
  \"message\": \"Settlement marked as paid\",
  \"settlement\": {
    \"_id\": \"settlement_456\",
    \"status\": \"paid\",
    \"proof\": \"https://imgur.com/receipt.jpg\",
    \"confirmedAt\": \"2026-02-23T16:45:00Z\"
  }
}

4. COMPLETE TRIP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PUT /api/groups/complete-trip

Body:
{ \"groupId\": \"group_123\" }

Response 200:
{
  \"message\": \"Trip completed successfully\",
  \"group\": {
    \"_id\": \"group_123\",
    \"tripStatus\": \"completed\",
    \"tripEndDate\": \"2026-02-23T17:00:00Z\"
  }
}
```

---

## 📱 Mobile vs Desktop Rendering

```
DESKTOP (> 1024px)
┌──────────────────────────────────────────┐
│ [Back]  Group Name             [End Trip  │
│   Group Description           Add Expense]│
├──────────────────────────────────────────┤
│ [Total] [Members] [Active] [Status]      │
├──────────────────────────────────────────┤
│ Tabs: [Expenses] [Members] [Balances]   │
│       [Settlements] [Activity]            │
├──────────────────────────────────────────┤
│ Content fills full width                  │
│ Modal: 600px width, centered              │
└──────────────────────────────────────────┘

MOBILE (< 640px)
┌───────────────────────────┐
│ [<]      Group Name       │
│   Description             │
├───────────────────────────┤
│ [Total | Members | ...]   │
├───────────────────────────┤
│ ≡ Tabs (horizontal scroll)│
├───────────────────────────┤
│ [End]  [Add] buttons      │
│ (stacked vertically)      │
├───────────────────────────┤
│ Content full width        │
│ Modal: Full screen        │
│ with safe area padding    │
└───────────────────────────┘
```

---

**This architecture ensures:**
✅ Simple, clear data flow  
✅ Single source of truth (MongoDB)  
✅ Scalable API design  
✅ Mobile-first responsive UI  
✅ Clear permission boundaries  
✅ Easy to test & debug
