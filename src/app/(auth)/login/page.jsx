"use client";

import { loginSuccess } from "@/redux/slices/authSlice";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const inputCls = (hasError) =>
  `w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent ${
    hasError
      ? "bg-rose-500/10 border-rose-500/40 text-slate-100 placeholder:text-slate-500 focus:ring-rose-500"
      : "bg-slate-700/50 border-white/8 text-slate-100 placeholder:text-slate-500 focus:ring-indigo-500"
  }`;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    const next = { ...errors };
    if (name === "email") {
      if (!value.trim()) next.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        next.email = "Invalid email address";
      else delete next.email;
    }
    if (name === "password") {
      if (!value) next.password = "Password is required";
      else if (value.length < 6)
        next.password = "Password must be at least 6 characters";
      else delete next.password;
    }
    setErrors(next);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix all errors");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/auth/login", form);
      if (res.data.success) {
        dispatch(loginSuccess({ user: res.data.user }));
        toast.success(res.data.message || "Login successful");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      {/* Back button */}
      <Link
        href="/"
        className="absolute top-5 left-5 flex items-center gap-1.5 text-slate-500 hover:text-slate-200 transition-colors text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Card */}
        <div className="bg-slate-800 border border-white/8 rounded-2xl p-7 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-bold text-slate-100 tracking-tight">
                Split<span className="text-indigo-400">Wise</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-100 mb-1.5">
              Welcome back
            </h1>
            <p className="text-slate-400 text-sm">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="you@example.com"
                  className={inputCls(touched.email && errors.email)}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-rose-400 text-xs mt-1.5">{errors.email}</p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={inputCls(touched.password && errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-rose-400 text-xs mt-1.5">
                  {errors.password}
                </p>
              )}
            </motion.div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 accent-indigo-500 rounded"
                />
                <span className="text-xs text-slate-400">Remember me</span>
              </label>
              <Link
                href="#forgot-password"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-lg shadow-indigo-950/50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/6" />
            <span className="text-xs text-slate-500">New here?</span>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          <p className="text-center text-slate-400 text-sm">
            Create an account{" "}
            <Link
              href="/signup"
              className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
            >
              here
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          By signing in, you agree to our{" "}
          <Link
            href="#terms"
            className="hover:text-slate-400 transition-colors"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="#privacy"
            className="hover:text-slate-400 transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
