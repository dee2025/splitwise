import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  splitBetween: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    amount: Number,
    percentage: Number,
    settled: {
      type: Boolean,
      default: false
    }
  }],
  category: {
    type: String,
    enum: ["food", "travel", "accommodation", "shopping", "entertainment", "other"],
    default: "other"
  },
  isSettled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.models.Expense || mongoose.model("Expense", expenseSchema);