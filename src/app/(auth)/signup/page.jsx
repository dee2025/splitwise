"use client";

import { loginSuccess } from "@/redux/slices/authSlice";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowRight,
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
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import GoogleIdentityButton from "@/components/auth/GoogleIdentityButton";

const inputCls = (hasError) =>
  `h-[52px] w-full rounded-lg border py-3 pl-12 pr-11 text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent ${
    hasError
      ? "border-rose-300 bg-rose-50 text-slate-950 placeholder:text-slate-400 focus:ring-rose-500"
      : "border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:ring-emerald-500"
  }`;

function AuthStoryPanel() {
  return (
    <section className="relative hidden h-dvh overflow-hidden bg-[linear-gradient(145deg,#f9fffb_0%,#edf8f3_58%,#d9f2e8_100%)] px-[clamp(32px,4vw,72px)] py-[clamp(24px,3vh,40px)] lg:block">
      <div className="relative z-10 grid h-full grid-rows-[auto_1fr_auto]">
        <Link href="/" className="inline-flex w-fit items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 shadow-[0_14px_30px_rgba(5,150,105,0.22)]">
            <Image
              src="/logo.png"
              alt="MoneySplit"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md"
              priority
            />
          </span>
          <span>
            <span className="block text-lg font-semibold tracking-tight text-slate-950 xl:text-xl">MoneySplit</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-400">
              Group expenses
            </span>
          </span>
        </Link>

        <div className="flex items-center">
          <div className="max-w-[520px]">
            <p className="mb-5 inline-flex items-center gap-2 rounded-lg bg-emerald-100/80 px-3 py-2 text-xs font-semibold text-emerald-800">
              <User className="h-4 w-4" />
              Smart spending starts here.
            </p>
            <h1 className="text-[clamp(44px,4.8vw,68px)] font-semibold leading-[1.04] tracking-tight text-slate-950">
              Create groups.
              <span className="block text-emerald-600">Split with clarity.</span>
            </h1>
            <p className="mt-5 max-w-[390px] text-base leading-7 text-slate-600">
              Start a shared ledger for trips, roommates, dinners, and every group plan.
            </p>
          </div>
        </div>

        <div className="relative h-[32vh] min-h-[220px] max-h-[320px]">
          <Image
            src="/login-banner.png"
            alt="MoneySplit signup visual"
            width={560}
            height={360}
            className="absolute bottom-0 left-0 h-full w-full object-contain object-left-bottom"
            priority
          />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[38vh] bg-[radial-gradient(circle_at_28%_70%,rgba(16,185,129,0.18),transparent_36%),radial-gradient(circle,#ffffff_1px,transparent_1px)] [background-size:auto,14px_14px] opacity-80" />
    </section>
  );
}

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
  const [redirectPath, setRedirectPath] = useState("/home");

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
      label: "Full name",
      type: "text",
      placeholder: "Enter your full name",
      icon: User,
      delay: 0.08,
    },
    {
      name: "email",
      label: "Email address",
      type: "email",
      placeholder: "Enter your email",
      icon: Mail,
      delay: 0.12,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Create a password",
      icon: Lock,
      delay: 0.16,
      isPassword: true,
      showToggle: showPassword,
      setShowToggle: setShowPassword,
    },
  ];

  return (
    <div className="h-dvh overflow-hidden bg-white">
      <main className="grid h-dvh lg:grid-cols-2">
        <AuthStoryPanel />

        <section className="flex h-dvh items-center justify-center overflow-hidden px-5 py-6 sm:px-8 lg:px-[clamp(40px,6vw,96px)]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-[560px]"
          >
            <div className="mb-6 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600">
                  <Image
                    src="/logo.png"
                    alt="MoneySplit"
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-md"
                    priority
                  />
                </span>
                <span>
                  <span className="block text-lg font-semibold tracking-tight text-slate-950">MoneySplit</span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Group expenses
                  </span>
                </span>
              </Link>
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-[38px]">
                {verificationEmail ? "Verify your email" : "Create your account"}
              </h1>
              <p className="mt-2 text-base leading-6 text-slate-500">
                {verificationEmail
                  ? "Enter the OTP to activate your account"
                  : "Sign up to start splitting expenses"}
              </p>
            </div>

            {verificationEmail ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">OTP sent</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        We sent a 6-digit code to{" "}
                        <span className="font-semibold text-slate-950">{verificationEmail}</span>.
                        It expires in 10 minutes.
                      </p>
                    </div>
                  </div>
                </div>
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationOtp}
                  onChange={(event) => setVerificationOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="h-[56px] w-full rounded-lg border border-slate-200 bg-white px-4 text-center text-2xl font-semibold tracking-[0.35em] text-slate-950 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp}
                  className="flex h-[54px] w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-base font-semibold text-white shadow-[0_18px_42px_rgba(4,120,87,0.24)] transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="flex h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isResending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Resend OTP
                </button>
              </motion.div>
            ) : (
              <>
                <div className="mb-5">
                  <GoogleIdentityButton
                    clientId={googleClientId}
                    onCredential={handleGoogleCredential}
                    context="signup"
                    loading={googleLoading}
                    loadingText="Signing up with Google..."
                  />
                  <div className="my-5 flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-sm text-slate-400">or</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
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
                        <label className="mb-2 block text-xs font-semibold text-slate-950">
                          {field.label}
                        </label>
                        <div className="relative">
                          <IconComponent className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-900"
                              aria-label={field.showToggle ? "Hide password" : "Show password"}
                            >
                              {field.showToggle ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          ) : null}
                        </div>
                        {hasError && (
                          <p className="mt-1.5 text-xs text-rose-500">{errors[field.name]}</p>
                        )}
                      </motion.div>
                    );
                  })}

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-5 flex h-[54px] w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-base font-semibold text-white shadow-[0_18px_42px_rgba(4,120,87,0.24)] transition-all hover:bg-emerald-700 hover:shadow-[0_20px_46px_rgba(4,120,87,0.30)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Create account</span>
                    )}
                  </motion.button>
                </form>

                <p className="mt-6 text-center text-base text-slate-500">
                  Already have an account?{" "}
                  <Link
                    href={redirectPath === "/home" ? "/login" : `/login?redirect=${encodeURIComponent(redirectPath)}`}
                    className="font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
                  >
                    Log in
                  </Link>
                </p>

                <p className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md border border-emerald-200 text-emerald-700">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </span>
                  Your data is secure and private
                </p>
              </>
            )}
          </motion.div>
        </section>
      </main>
    </div>
  );
}
