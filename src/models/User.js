import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    contact: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      required: function requiredPassword() {
        return this.authProvider === "local";
      },
      minlength: 6,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
