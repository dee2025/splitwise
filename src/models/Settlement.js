// models/Settlement.js
import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    // Trip/Group Info
    tripStatus: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
    tripEndDate: Date,

    // Settlement - Who Owes Whom
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      min: 0,
    },

    // Simplified Status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "completed",
        "paid",
        "cancelled",
        "disputed",
      ],
      default: "pending",
    },

    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SettlementBatch",
    },

    // Payment Details (OPTIONAL)
    method: {
      type: String,
      enum: ["cash", "upi", "bank_transfer", "wallet"],
      default: "cash",
    },
    paymentDetails: {
      upiId: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      reference: String,
    },

    // Payment Proof (OPTIONAL)
    proof: {
      type: String, // Image URL
      uploadedAt: Date,
    },

    // Timeline
    createdAt: {
      type: Date,
      default: Date.now,
    },
    confirmedAt: Date,
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    completedAt: Date,
    paidAt: Date,
    requestedAt: Date,
    isDisputed: {
      type: Boolean,
      default: false,
    },
    disputeReason: String,
    disputedAt: Date,
    disputedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    proofUploadedAt: Date,
    proofUploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: String,
  },
  {
    timestamps: true,
    indexes: [
      { groupId: 1, tripStatus: 1 },
      { fromUser: 1, toUser: 1, status: 1 },
    ],
  },
);

settlementSchema.pre("validate", function (next) {
  if ((this.amount === undefined || this.amount === null) && this.totalAmount) {
    this.amount = this.totalAmount;
  }

  if (
    (this.totalAmount === undefined || this.totalAmount === null) &&
    this.amount !== undefined &&
    this.amount !== null
  ) {
    this.totalAmount = this.amount;
  }

  if (this.status === "paid") {
    this.status = "completed";
  }

  next();
});

export default mongoose.models.Settlement ||
  mongoose.model("Settlement", settlementSchema);
