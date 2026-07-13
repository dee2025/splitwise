import mongoose from "mongoose";
import { generateGroupInviteToken } from "@/lib/groupInvites";

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
    image: {
      type: String,
      trim: true,
      default: "",
    },
    currency: {
      type: String,
      default: "INR",
      enum: ["INR"],
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
    inviteToken: {
      type: String,
      default: generateGroupInviteToken,
      unique: true,
      sparse: true,
      index: true,
    },
    inviteEnabled: {
      type: Boolean,
      default: true,
    },
    inviteUpdatedAt: {
      type: Date,
      default: Date.now,
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

groupSchema.pre("validate", function (next) {
  this.currency = "INR";
  if (!this.inviteToken) {
    this.inviteToken = generateGroupInviteToken();
  }
  if (!this.inviteUpdatedAt) {
    this.inviteUpdatedAt = new Date();
  }
  next();
});

export default mongoose.models.Group || mongoose.model("Group", groupSchema);
