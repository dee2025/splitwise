import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    currency: {
      type: String,
      default: "INR",
      enum: ["INR", "USD", "EUR", "GBP"],
    },
    privacy: {
      type: String,
      default: "private",
      enum: ["private", "public"],
    },
    type: {
      type: String,
      enum: ["trip", "home", "couple", "other"],
      default: "other",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: String,
        email: String,
        contact: String,
        type: {
          type: String,
          enum: ["registered", "custom"],
          default: "registered",
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalExpenses: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Trip Management
    tripStatus: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
    tripEndDate: Date,
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Group || mongoose.model("Group", groupSchema);
