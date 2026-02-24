// models/SettlementBatch.js
import mongoose from "mongoose";

const settlementBatchSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Batch Details
    name: String,
    description: String,
    totalAmount: {
      type: Number,
      default: 0,
    },
    settlementCount: {
      type: Number,
      default: 0,
    },

    // Status
    status: {
      type: String,
      enum: ["draft", "ready", "processing", "completed", "cancelled"],
      default: "draft",
    },

    // Settlements in this batch
    settlementIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Settlement",
      },
    ],

    // Settlement Breakdown
    settlements: [
      {
        fromUserId: mongoose.Schema.Types.ObjectId,
        toUserId: mongoose.Schema.Types.ObjectId,
        amount: Number,
        status: {
          type: String,
          enum: ["pending", "completed", "cancelled"],
          default: "pending",
        },
      },
    ],

    // Timeline
    createdAt: {
      type: Date,
      default: Date.now,
    },
    scheduledFor: Date,
    processedAt: Date,
    completedAt: Date,

    // Statistics
    stats: {
      totalPending: { type: Number, default: 0 },
      totalCompleted: { type: Number, default: 0 },
      totalCancelled: { type: Number, default: 0 },
      averageResolutionTime: Number,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.SettlementBatch ||
  mongoose.model("SettlementBatch", settlementBatchSchema);
