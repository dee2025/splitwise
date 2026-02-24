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
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Simplified Status
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
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
    paidAt: Date,
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

export default mongoose.models.Settlement ||
  mongoose.model("Settlement", settlementSchema);
