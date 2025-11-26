"use client";

import { loginSuccess } from "@/redux/slices/authSlice";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, form[name]);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "email":
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Invalid email address";
        } else {
          delete newErrors.email;
        }
        break;

      case "password":
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  };

// app/login/page.js - Update the handleLogin function
const handleLogin = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const res = await axios.post("/api/auth/login", form);
    
    if (res.data.success) {
      dispatch(loginSuccess({ 
        user: res.data.user 
      }));
      
      toast.success(res.data.message || "Login successful");
      
      // Wait a bit for the cookie to be set, then redirect
      setTimeout(() => {
        console.log('🔄 Redirecting to dashboard after login');
        // Use window.location.href for a full page reload to ensure middleware runs
        window.location.href = "/dashboard";
      }, 500);
    }
  } catch (err) {
    const errorMessage = err.response?.data?.error || "Login failed";
    toast.error(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

  const getInputClassName = (fieldName) => {
    const baseClasses = "w-full border-2 p-3 rounded-lg focus:outline-none transition-colors shadow-sm pl-12 ";
    
    if (errors[fieldName]) {
      return baseClasses + "border-red-500 focus:border-red-500 bg-red-50";
    }
    
    if (touched[fieldName] && !errors[fieldName] && form[fieldName]) {
      return baseClasses + "border-green-500 focus:border-green-500 bg-green-50";
    }
    
    return baseClasses + "border-gray-300 focus:border-black";
  };

  // Show loading while checking authentication
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-black" />
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

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
            Welcome back! Sign in to your account
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-2xl border-2 border-black shadow-sketch-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-center border-b-2 border-dashed border-gray-400 pb-4">
            Sign In
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
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
                  {errors.email}
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
                  placeholder="Enter your password"
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
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-black hover:text-gray-700 underline underline-offset-2 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-all border-2 border-black shadow-sketch disabled:opacity-50 disabled:cursor-not-allowed font-medium mt-2 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center border-t-2 border-dashed border-gray-300 pt-6">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-black font-semibold hover:text-gray-700 underline underline-offset-2 transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>

          {/* Demo Credentials Hint */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-xs text-gray-600 text-center">
              <strong>Demo:</strong> Use your registered email and password to sign in
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}