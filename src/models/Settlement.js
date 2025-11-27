// models/Settlement.js
import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expense"
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending"
  },
  paidAt: Date,
  method: {
    type: String,
    enum: ["cash", "upi", "bank_transfer", "other"],
    default: "cash"
  },
  notes: String
}, {
  timestamps: true
});

export default mongoose.models.Settlement || mongoose.model("Settlement", settlementSchema);