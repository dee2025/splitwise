import { connectDB } from "@/lib/db";
import { applyEmailVerificationOtp } from "@/lib/emailVerification";
import { sendVerificationEmail } from "@/lib/mailer";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { generateUniqueUsername } from "@/lib/username";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const limit = rateLimit(req, {
      keyPrefix: "signup",
      limit: 8,
      windowMs: 60 * 1000,
    });
    if (limit.limited) {
      return rateLimitResponse("Too many signup attempts. Please wait and try again.", limit);
    }

    await connectDB();
    const body = await req.json();

    const { fullName, email, password } = body;

    const normalizedFullName = fullName?.trim() || "";
    const normalizedEmail = email?.toLowerCase().trim() || "";

    const errors = {};

    if (!normalizedFullName) {
      errors.fullName = "Full name is required";
    } else if (normalizedFullName.length < 2) {
      errors.fullName = "Full name must be at least 2 characters";
    }

    if (!normalizedEmail) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      errors.password = "Password must include letters and numbers";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors,
        },
        { status: 400 },
      );
    }

    const existingEmail = await User.findOne({ email: normalizedEmail }).select("_id");
    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is already registered",
          errors: { email: "Email already registered" },
        },
        { status: 409 },
      );
    }

    const generatedUsername = await generateUniqueUsername(normalizedFullName);
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      fullName: normalizedFullName,
      username: generatedUsername,
      email: normalizedEmail,
      contact: "",
      password: hashedPassword,
      authProvider: "local",
      emailVerified: false,
      emailVerifiedAt: null,
    });
    const verification = applyEmailVerificationOtp(newUser);
    newUser.googleId = undefined;
    await newUser.save();

    const userResponse = {
      id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      contact: newUser.contact,
      avatar: newUser.avatar,
      emailVerified: newUser.emailVerified,
      createdAt: newUser.createdAt,
    };

    sendVerificationEmail({
      to: newUser.email,
      fullName: newUser.fullName,
      otp: verification.otp,
    }).catch((err) => console.error("Verification email failed:", err.message));

    return NextResponse.json(
      {
        success: true,
        requiresEmailVerification: true,
        message: "Account created. Enter the OTP sent to your email to activate your account.",
        user: userResponse,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);

    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      const duplicateMessages = {
        username: "Username is already taken",
        email: "Email is already registered",
        contact: "Phone number is already registered",
        googleId: "Could not create account. Please try again.",
      };

      return NextResponse.json(
        {
          success: false,
          error: duplicateMessages[duplicateField] || "Duplicate value not allowed",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 },
    );
  }
}
