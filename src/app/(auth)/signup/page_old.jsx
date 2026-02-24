"use client";

import axios from "axios";
import { motion } from "framer-motion";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toastr from "toastr";

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({
    available: null,
    message: "",
    valid: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle blur events for validation
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    validateField(name, form[name]);
  };

  // Field validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "fullName":
        if (!value.trim()) {
          newErrors.fullName = "Full name is required";
        } else if (value.trim().length < 2) {
          newErrors.fullName = "Full name must be at least 2 characters";
        } else {
          delete newErrors.fullName;
        }
        break;

      case "email":
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;

      case "contact":
        if (!value.trim()) {
          newErrors.contact = "Contact number is required";
        } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ""))) {
          newErrors.contact = "Please enter a valid contact number";
        } else {
          delete newErrors.contact;
        }
        break;

      case "password":
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = "Include uppercase, lowercase, and numbers";
        } else {
          delete newErrors.password;
        }
        break;

      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (value !== form.password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
  };

  // Username live check with debouncing
  useEffect(() => {
    const checkUsername = async () => {
      if (form.username.trim().length > 0) {
        setCheckingUsername(true);
        try {
          const res = await axios.post("/api/auth/check-username", {
            username: form.username,
          });
          setUsernameStatus(res.data);
        } catch (error) {
          setUsernameStatus({
            available: false,
            message: "Error checking username",
            valid: false,
          });
        }
        setCheckingUsername(false);
      } else {
        setUsernameStatus({ available: null, message: "", valid: false });
      }
    };

    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [form.username]);

  // Validate username on blur
  useEffect(() => {
    if (touched.username) {
      if (!form.username.trim()) {
        setErrors((prev) => ({ ...prev, username: "Username is required" }));
      } else if (!usernameStatus.valid) {
        setErrors((prev) => ({ ...prev, username: usernameStatus.message }));
      } else {
        setErrors((prev) => ({ ...prev, username: "" }));
      }
    }
  }, [form.username, usernameStatus, touched.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched = Object.keys(form).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate all fields
    Object.keys(form).forEach((key) => {
      validateField(key, form[key]);
    });

    // Check if username is valid and available
    if (!usernameStatus.valid || usernameStatus.available === false) {
      setErrors((prev) => ({
        ...prev,
        username: usernameStatus.message || "Please choose a valid username",
      }));
      setIsSubmitting(false);
      return;
    }

    // Check if there are any errors
    if (Object.keys(errors).some((key) => errors[key])) {
      toastr.error("Please fix the errors before submitting");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await axios.post("/api/auth/signup", form);

      if (res.status === 201) {
        toastr.success(res.data.message || "Account created successfully!");
        // Reset form
        setForm({
          fullName: "",
          username: "",
          email: "",
          contact: "",
          password: "",
          confirmPassword: "",
        });
        setErrors({});
        setTouched({});
        setUsernameStatus({ available: null, message: "", valid: false });

        // Redirect to login page after successful signup
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toastr.error(error.response.data.error || "Please fix the form errors");
      } else {
        toastr.error(
          error.response?.data?.message || "Signup failed. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClasses =
      "w-full border-2 p-3 rounded-lg focus:outline-none transition-colors shadow-sm pl-12 ";

    if (errors[fieldName]) {
      return baseClasses + "border-red-500 focus:border-red-500 bg-red-50";
    }

    if (touched[fieldName] && !errors[fieldName]) {
      return (
        baseClasses + "border-green-500 focus:border-green-500 bg-green-50"
      );
    }

    return baseClasses + "border-gray-300 focus:border-black";
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold">
              Split<span className="text-gray-600">Wise</span>
            </h1>
          </Link>
          <p className="text-gray-600 mt-2">
            Join thousands splitting bills effortlessly
          </p>
        </motion.div>

        {/* Signup Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-2xl border-2 border-black shadow-sketch-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-center border-b-2 border-dashed border-gray-400 pb-4">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  className={getInputClassName("fullName")}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={form.fullName}
                  required
                />
              </div>
              {errors.fullName && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <X size={12} /> {errors.fullName}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  className={getInputClassName("username")}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={form.username}
                  required
                />
                {form.username.length > 0 && (
                  <div className="absolute right-3 top-3">
                    {checkingUsername ? (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    ) : usernameStatus.available === true ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : usernameStatus.available === false ? (
                      <X className="w-5 h-5 text-red-600" />
                    ) : null}
                  </div>
                )}
              </div>
              {form.username.length > 0 && (
                <p
                  className={`text-xs mt-1 flex items-center gap-1 ${
                    usernameStatus.available === true
                      ? "text-green-600"
                      : usernameStatus.available === false
                        ? "text-red-600"
                        : "text-gray-500"
                  }`}
                >
                  {checkingUsername ? (
                    <>Checking availability...</>
                  ) : (
                    <>{usernameStatus.message}</>
                  )}
                </p>
              )}
              {errors.username && !form.username && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <X size={12} /> {errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  className={getInputClassName("email")}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={form.email}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <X size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="tel"
                  name="contact"
                  placeholder="+91 12345 67890"
                  className={getInputClassName("contact")}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={form.contact}
                  required
                />
              </div>
              {errors.contact && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <X size={12} /> {errors.contact}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a strong password"
                  className={getInputClassName("password")}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={form.password}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 hover:text-black transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <X size={12} /> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className={getInputClassName("confirmPassword")}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={form.confirmPassword}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 hover:text-black transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <X size={12} /> {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={
                isSubmitting || Object.keys(errors).some((key) => errors[key])
              }
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-all border-2 border-black shadow-sketch disabled:opacity-50 disabled:cursor-not-allowed font-medium mt-6"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center border-t-2 border-dashed border-gray-300 pt-6">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-black font-semibold hover:text-gray-700 underline underline-offset-2 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-gray-500 text-sm mt-8"
        >
          By creating an account, you agree to our Terms and Privacy Policy
        </motion.p>
      </div>
    </div>
  );
}
