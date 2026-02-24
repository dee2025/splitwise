"use client";

import { loginSuccess } from "@/redux/slices/authSlice";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
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

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    if (name === "username" && value) setUsernameAvailable(null);
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    validateField(name, value);
    if (name === "username" && value) await checkUsernameAvailability(value);
  };

  const validateField = (name, value) => {
    const next = { ...errors };
    switch (name) {
      case "fullName":
        if (!value.trim()) next.fullName = "Full name is required";
        else if (value.trim().length < 2)
          next.fullName = "Must be at least 2 characters";
        else delete next.fullName;
        break;
      case "username":
        if (!value.trim()) next.username = "Username is required";
        else if (!/^[a-zA-Z0-9_]{3,20}$/.test(value))
          next.username = "3-20 chars, letters/numbers/underscores";
        else delete next.username;
        break;
      case "email":
        if (!value.trim()) next.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          next.email = "Invalid email address";
        else delete next.email;
        break;
      case "contact":
        if (!value.trim()) next.contact = "Phone number is required";
        else if (!/^[0-9]{10}$/.test(value.replace(/\D/g, "")))
          next.contact = "Enter a valid 10-digit number";
        else delete next.contact;
        break;
      case "password":
        if (!value) next.password = "Password is required";
        else if (value.length < 6) next.password = "At least 6 characters";
        else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value))
          next.password = "Must contain letters and numbers";
        else delete next.password;
        break;
      case "confirmPassword":
        if (!value) next.confirmPassword = "Please confirm your password";
        else if (value !== form.password)
          next.confirmPassword = "Passwords do not match";
        else delete next.confirmPassword;
        break;
    }
    setErrors(next);
  };

  const checkUsernameAvailability = async (username) => {
    if (!username || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) return;
    try {
      setUsernameChecking(true);
      const res = await axios.post("/api/auth/check-username", { username });
      setUsernameAvailable(res.data.available);
      if (!res.data.available)
        setErrors((p) => ({ ...p, username: "Username already taken" }));
    } catch {
      /* silent */
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!usernameAvailable) {
      toast.error("Please check username availability");
      return;
    }
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix all errors");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/auth/signup", form);
      if (res.data.success) {
        dispatch(loginSuccess({ user: res.data.user }));
        toast.success(res.data.message || "Account created successfully");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed");
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

  const fields = [
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      placeholder: "John Doe",
      icon: User,
      delay: 0.08,
    },
    {
      name: "username",
      label: "Username",
      type: "text",
      placeholder: "john_doe",
      icon: User,
      delay: 0.12,
      hasCheck: true,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "you@example.com",
      icon: Mail,
      delay: 0.16,
    },
    {
      name: "contact",
      label: "Phone Number",
      type: "tel",
      placeholder: "+91 9876543210",
      icon: Phone,
      delay: 0.2,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "••••••••",
      icon: Lock,
      delay: 0.24,
      isPassword: true,
      showToggle: showPassword,
      setShowToggle: setShowPassword,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      placeholder: "••••••••",
      icon: Lock,
      delay: 0.28,
      isPassword: true,
      showToggle: showConfirmPassword,
      setShowToggle: setShowConfirmPassword,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
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
        <div className="bg-slate-800 border border-white/8 rounded-2xl p-7 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-7">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-bold text-slate-100 tracking-tight">
                Split<span className="text-indigo-400">Wise</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-100 mb-1.5">
              Create account
            </h1>
            <p className="text-slate-400 text-sm">
              Join thousands splitting expenses smarter
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-3.5">
            {fields.map((field) => {
              const IconComponent = field.icon;
              const hasError = touched[field.name] && errors[field.name];
              return (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: field.delay }}
                >
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    {field.label}
                  </label>
                  <div className="relative">
                    <IconComponent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={
                        field.isPassword
                          ? field.showToggle
                            ? "text"
                            : "password"
                          : field.type
                      }
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={field.placeholder}
                      className={inputCls(hasError)}
                    />
                    {field.isPassword ? (
                      <button
                        type="button"
                        onClick={() => field.setShowToggle(!field.showToggle)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {field.showToggle ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    ) : field.hasCheck ? (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {usernameChecking ? (
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                        ) : usernameAvailable ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : usernameAvailable === false ? (
                          <div className="w-4 h-4 rounded-full bg-rose-500" />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  {hasError && (
                    <p className="text-rose-400 text-xs mt-1">
                      {errors[field.name]}
                    </p>
                  )}
                  {field.hasCheck && usernameAvailable && (
                    <p className="text-emerald-400 text-xs mt-1">
                      ✓ Username is available
                    </p>
                  )}
                </motion.div>
              );
            })}

            {/* Submit */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting || !usernameAvailable}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-lg shadow-indigo-950/50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating…</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/6" />
            <span className="text-xs text-slate-500">
              Already have an account?
            </span>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          <p className="text-center text-slate-400 text-sm">
            Sign in{" "}
            <Link
              href="/login"
              className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
            >
              here
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          By creating an account, you agree to our{" "}
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
