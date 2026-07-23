"use client";

import { loginSuccess } from "@/redux/slices/authSlice";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Send,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const inputCls = (hasError) =>
  `w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent ${
    hasError
      ? "bg-rose-50 border-rose-300 text-slate-950 placeholder:text-slate-400 focus:ring-rose-500"
      : "bg-white border-slate-300 text-slate-950 placeholder:text-slate-400 focus:ring-indigo-500"
  }`;

function getRedirectFromLocation() {
  if (typeof window === "undefined") return "/home";
  const redirect = new URLSearchParams(window.location.search).get("redirect");
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//") || redirect.startsWith("/api/")) {
    return "/home";
  }
  return redirect;
}

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { checked, isAuthenticated, loading: authLoading } = useSelector((state) => state.auth);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationOtp, setVerificationOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/home");
  const googleButtonRef = useRef(null);

  useEffect(() => {
    setRedirectPath(getRedirectFromLocation());
  }, []);

  useEffect(() => {
    if (checked && !authLoading && isAuthenticated) router.replace(redirectPath);
  }, [authLoading, checked, isAuthenticated, redirectPath, router]);

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
    switch (name) {
      case "fullName":
        if (!value.trim()) next.fullName = "Full name is required";
        else if (value.trim().length < 2)
          next.fullName = "Must be at least 2 characters";
        else delete next.fullName;
        break;
      case "email":
        if (!value.trim()) next.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          next.email = "Invalid email address";
        else delete next.email;
        break;
      case "password":
        if (!value) next.password = "Password is required";
        else if (value.length < 6) next.password = "At least 6 characters";
        else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value))
          next.password = "Must contain letters and numbers";
        else delete next.password;
        break;
    }
    setErrors(next);
  };



  const validateForm = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required";
    } else if (form.fullName.trim().length < 2) {
      nextErrors.fullName = "Must be at least 2 characters";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Invalid email address";
    }

    if (!form.password) {
      nextErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      nextErrors.password = "At least 6 characters";
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(form.password)) {
      nextErrors.password = "Must contain letters and numbers";
    }

    setTouched({
      fullName: true,
      email: true,
      password: true,
    });
    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) {
      toast.error("Please fix all errors");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      const res = await axios.post("/api/auth/signup", payload);
      if (res.data.success) {
        if (res.data.requiresEmailVerification) {
          setVerificationEmail(res.data.user?.email || payload.email);
          toast.success("Verification OTP sent");
          return;
        }
        dispatch(loginSuccess({ user: res.data.user }));
        toast.success(res.data.message || "Account created successfully");
        router.replace(redirectPath);
        return;
      }
      toast.error("Signup failed. Please try again.");
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        setErrors((prev) => ({ ...prev, ...apiErrors }));
        setTouched({
          fullName: true,
          email: true,
          password: true,
        });
      }
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Signup failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) return;

    setIsResending(true);
    try {
      const res = await axios.post("/api/auth/resend-verification", {
        email: verificationEmail,
      });
      toast.success(res.data?.message || "Verification OTP sent");
    } catch (err) {
      toast.error(err.response?.data?.error || "Unable to resend verification OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!verificationEmail || verificationOtp.trim().length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await axios.post("/api/auth/verify-email", {
        email: verificationEmail,
        otp: verificationOtp,
      });
      if (res.data?.success) {
        dispatch(loginSuccess({ user: res.data.user }));
        toast.success(res.data.message || "Email verified");
        router.replace(redirectPath);
        return;
      }
      toast.error("Unable to verify OTP");
    } catch (err) {
      toast.error(err.response?.data?.error || "Unable to verify OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleGoogleCredential = useCallback(async (googleResponse) => {
    const credential = googleResponse?.credential;
    if (!credential) {
      toast.error("Google sign up failed. Please try again.");
      return;
    }

    setGoogleLoading(true);
    try {
      const res = await axios.post("/api/auth/google-login", { credential });
      if (res.data?.success) {
        dispatch(loginSuccess({ user: res.data.user }));
        toast.success("Signed up with Google successfully");
        router.replace(redirectPath);
        return;
      }
      toast.error("Google sign up failed. Please try again.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Google sign up failed.");
    } finally {
      setGoogleLoading(false);
    }
  }, [dispatch, redirectPath, router]);

  const initGoogleButton = useCallback(() => {
    if (!googleClientId || !googleButtonRef.current || !window.google?.accounts?.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    googleButtonRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: 350,
    });
    setGoogleReady(true);
  }, [googleClientId, handleGoogleCredential]);

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    if (window.google?.accounts?.id) {
      initGoogleButton();
    }
  }, [googleClientId, initGoogleButton]);

  if (!checked || authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-700" />
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
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "you@example.com",
      icon: Mail,
      delay: 0.12,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "••••••••",
      icon: Lock,
      delay: 0.16,
      isPassword: true,
      showToggle: showPassword,
      setShowToggle: setShowPassword,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      {googleClientId ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={initGoogleButton}
        />
      ) : null}

      <Link
        href="/"
        className="absolute top-5 left-5 flex items-center gap-1.5 text-slate-500 hover:text-slate-950 transition-colors text-sm font-medium"
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
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
          {/* Header */}
          <div className="text-center mb-7">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <Image
                src="/logo.png"
                alt="MoneySplit"
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-lg"
                priority
              />
              <span className="text-lg font-bold text-slate-950 tracking-tight">
                Money<span className="text-indigo-700">Split</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-950 mb-1.5">
              Create account
            </h1>
            <p className="text-slate-600 text-sm">
              {verificationEmail
                ? "Verify your email to activate your account"
                : "Join thousands splitting expenses smarter"}
            </p>
          </div>

          {verificationEmail ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
                <CheckCircle className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Enter the OTP
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold text-slate-950">
                    {verificationEmail}
                  </span>
                  . It expires in 10 minutes.
                </p>
              </div>
              <input
                inputMode="numeric"
                maxLength={6}
                value={verificationOtp}
                onChange={(event) => setVerificationOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-2xl font-black tracking-[0.35em] text-slate-950 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isVerifyingOtp ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Verify and continue
              </button>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Resend OTP
              </button>
              <Link
                href={redirectPath === "/home" ? "/login" : `/login?redirect=${encodeURIComponent(redirectPath)}`}
                className="block text-sm font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Go to sign in
              </Link>
            </motion.div>
          ) : (
            <>
          {googleClientId ? (
            <div className="mb-5">
              <div
                ref={googleButtonRef}
                className="w-full min-h-11 flex items-center justify-center"
              />
              {!googleReady && (
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 rounded-xl text-sm font-semibold bg-white/90 text-slate-800 opacity-70"
                >
                  Continue with Google
                </button>
              )}
              {googleLoading && (
                <p className="text-xs text-slate-500 text-center mt-2">
                  Signing up with Google...
                </p>
              )}

              <div className="my-4 flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-500 uppercase tracking-wide">
                  or
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            </div>
          ) : null}

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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        {field.showToggle ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    ) : null}
                  </div>
                  {hasError && (
                    <p className="text-rose-400 text-xs mt-1">
                      {errors[field.name]}
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
              disabled={isSubmitting}
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
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-500">
              Already have an account?
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <p className="text-center text-slate-600 text-sm">
            Sign in{" "}
            <Link
              href={redirectPath === "/home" ? "/login" : `/login?redirect=${encodeURIComponent(redirectPath)}`}
              className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
            >
              here
            </Link>
          </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          By creating an account, you agree to our{" "}
          <Link
            href="/terms-of-service"
            className="hover:text-slate-950 transition-colors"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy-policy"
            className="hover:text-slate-950 transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
