import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { generateToken, setTokenCookie } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/mailer";

// Generate unique username from fullName
async function generateUniqueUsername(fullName) {
  // Create base username from fullName: remove spaces, lowercase, keep only alphanumeric + underscore
  const baseUsername = fullName
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 15); // Leave room for random suffix

  if (!baseUsername) {
    // Fallback if name has no valid characters
    return `user_${Date.now()}`;
  }

  // Check if base username exists
  let finalUsername = baseUsername;
  let counter = 1;

  while (await User.findOne({ username: finalUsername }).select("_id")) {
    finalUsername = `${baseUsername}_${counter}`;
    counter++;
  }

  return finalUsername;
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { fullName, email, password, confirmPassword } = body;

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

    // Check if email already exists
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

    // Generate unique username
    const generatedUsername = await generateUniqueUsername(normalizedFullName);

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      fullName: normalizedFullName,
      username: generatedUsername,
      email: normalizedEmail,
      contact: "",
      password: hashedPassword,
    });

    // Generate JWT token
    const token = generateToken({
      userId: newUser._id,
      email: newUser.email
    });

    // Remove password from response
    const userResponse = {
      id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      contact: newUser.contact,
      createdAt: newUser.createdAt,
    };

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Account created successfully!",
      user: userResponse,
    }, { status: 201 });

    // Set HTTP-only cookie
    setTokenCookie(response, token);

    // Send welcome email in background (non-blocking — never fails the signup)
    sendWelcomeEmail({
      to: newUser.email,
      fullName: newUser.fullName,
      username: newUser.username,
    }).catch((err) => console.error("Welcome email failed:", err.message));

    return response;

  } catch (error) {
    console.error("Signup error:", error);

    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      const duplicateMessages = {
        username: "Username is already taken",
        email: "Email is already registered",
        contact: "Phone number is already registered",
      };

      return NextResponse.json(
        {
          success: false,
          error: duplicateMessages[duplicateField] || "Duplicate value not allowed",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ 
      success: false,
      error: "Internal server error",
      message: "Something went wrong. Please try again later."
    }, { status: 500 });
  }
}