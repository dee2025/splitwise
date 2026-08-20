"use client";

import { loginSuccess } from "@/redux/slices/authSlice";
import GoogleIdentityButton from "@/components/auth/GoogleIdentityButton";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Send,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

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
              <Users className="h-4 w-4" />
              Smart spending. Better together.
            </p>
            <h1 className="text-[clamp(44px,4.8vw,68px)] font-semibold leading-[1.04] tracking-tight text-slate-950">
              Share expenses.
              <span className="block text-emerald-600">Stay in sync.</span>
            </h1>
            <p className="mt-5 max-w-[390px] text-base leading-7 text-slate-600">
              Track group expenses, settle up easily, and focus on what matters.
            </p>
          </div>
        </div>

        <div className="relative h-[32vh] min-h-[220px] max-h-[320px]">
          <Image
            src="/login-banner.png"
            alt="MoneySplit login visual"
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

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { checked, isAuthenticated, loading: authLoading } = useSelector((state) => state.auth);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [verificationOtp, setVerificationOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordSetupEmail, setPasswordSetupEmail] = useState("");
  const [passwordSetupOtp, setPasswordSetupOtp] = useState("");
  const [passwordSetupStep, setPasswordSetupStep] = useState("send");
  const [passwordSetupModalOpen, setPasswordSetupModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSendingPasswordOtp, setIsSendingPasswordOtp] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
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
    if (name === "email" && unverifiedEmail) {
      setUnverifiedEmail("");
      setVerificationOtp("");
    }
    if (name === "email" && passwordSetupEmail) {
      setPasswordSetupEmail("");
      setPasswordSetupOtp("");
      setPasswordSetupStep("send");
      setPasswordSetupModalOpen(false);
      setNewPassword("");
    }
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

  const validateForm = () => {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Invalid email address";
    }

    if (!form.password) {
      nextErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    setTouched({ email: true, password: true });
    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) {
      toast.error("Please fix all errors");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        email: form.email.trim(),
        password: form.password,
      };

      const res = await axios.post("/api/auth/login", payload);
      if (res.data.success) {
        dispatch(loginSuccess({ user: res.data.user }));
        toast.success(res.data.message || "Login successful");
        router.replace(redirectPath);
        return;
      }
      toast.error("Login failed. Please try again.");
    } catch (err) {
      if (err.response?.data?.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(err.response.data.email || form.email.trim());
      }
      if (err.response?.data?.code === "PASSWORD_NOT_SET") {
        setPasswordSetupEmail(err.response.data.email || form.email.trim());
        setPasswordSetupOtp("");
        setPasswordSetupStep("send");
        setPasswordSetupModalOpen(true);
        setNewPassword("");
      }
      const apiErrors = err.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        setErrors((prev) => ({ ...prev, ...apiErrors }));
        setTouched({ email: true, password: true });
      }
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    const email = unverifiedEmail || form.email.trim();
    if (!email) return;

    setIsResending(true);
    try {
      const res = await axios.post("/api/auth/resend-verification", { email });
      toast.success(res.data?.message || "Verification OTP sent");
    } catch (err) {
      toast.error(err.response?.data?.error || "Unable to resend verification OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const email = unverifiedEmail || form.email.trim();
    if (!email || verificationOtp.trim().length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await axios.post("/api/auth/verify-email", {
        email,
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

  const closePasswordSetupModal = () => {
    if (isSendingPasswordOtp || isSettingPassword) return;
    setPasswordSetupModalOpen(false);
  };

  const handlePasswordSetupOtpChange = (value) => {
    const otp = value.replace(/\D/g, "").slice(0, 6);
    setPasswordSetupOtp(otp);
    if (otp.length === 6) {
      setPasswordSetupStep("password");
    }
  };

  const handleSendPasswordSetupOtp = async () => {
    const email = passwordSetupEmail || form.email.trim();
    if (!email) {
      toast.error("Enter your email first");
      return;
    }

    setIsSendingPasswordOtp(true);
    try {
      const res = await axios.post("/api/auth/request-password-setup", { email });
      setPasswordSetupEmail(res.data?.email || email);
      setPasswordSetupStep("otp");
      setPasswordSetupModalOpen(true);
      toast.success(res.data?.message || "Password setup OTP sent");
    } catch (err) {
      toast.error(err.response?.data?.error || "Unable to send setup OTP");
    } finally {
      setIsSendingPasswordOtp(false);
    }
  };

  const handleSetPasswordWithOtp = async () => {
    const email = passwordSetupEmail || form.email.trim();
    if (!email || passwordSetupOtp.trim().length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    if (!newPassword || newPassword.length < 6 || !/(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      toast.error("Password must be at least 6 characters and include letters and numbers");
      return;
    }

    setIsSettingPassword(true);
    try {
      const res = await axios.post("/api/auth/set-password-with-otp", {
        email,
        otp: passwordSetupOtp,
        newPassword,
      });
      if (res.data?.success) {
        dispatch(loginSuccess({ user: res.data.user }));
        toast.success(res.data.message || "Password set successfully");
        router.replace(redirectPath);
        return;
      }
      toast.error("Unable to set password");
    } catch (err) {
      toast.error(err.response?.data?.error || "Unable to set password");
    } finally {
      setIsSettingPassword(false);
    }
  };

  const handleGoogleCredential = useCallback(async (googleResponse) => {
    const credential = googleResponse?.credential;
    if (!credential) {
      toast.error("Google sign in failed. Please try again.");
      return;
    }

    setGoogleLoading(true);
    try {
      const res = await axios.post("/api/auth/google-login", { credential });
      if (res.data?.success) {
        dispatch(loginSuccess({ user: res.data.user }));
        toast.success(res.data.message || "Google login successful");
        router.replace(redirectPath);
        return;
      }
      toast.error("Google sign in failed. Please try again.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Google sign in failed.");
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

  const passwordSetupStepIndex = {
    send: 0,
    otp: 1,
    password: 2,
  }[passwordSetupStep] || 0;

  return (
    <div className="h-dvh overflow-hidden bg-white">
      <main className="grid h-dvh lg:grid-cols-2">
        <AuthStoryPanel />

        <section className="flex h-dvh items-center justify-center overflow-hidden px-5 py-6 sm:px-8 lg:px-[clamp(40px,6vw,96px)]">
          <div className="w-full max-w-[560px]">
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

            <div className="mb-7">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-[38px]">
                Welcome back
              </h1>
              <p className="mt-2 text-base leading-6 text-slate-500 sm:text-lg">
                Login to your account to continue
              </p>
            </div>

            <div className="mb-5">
                <GoogleIdentityButton
                  clientId={googleClientId}
                  onCredential={handleGoogleCredential}
                  loading={googleLoading}
                  loadingText="Signing in with Google..."
                />
                <div className="my-5 flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-sm text-slate-400">or</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
            </div>

          {unverifiedEmail ? (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-950">
              <p className="font-semibold">Email verification required</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Enter the 6-digit OTP sent to {unverifiedEmail}. It expires in 10 minutes.
              </p>
              <input
                inputMode="numeric"
                maxLength={6}
                value={verificationOtp}
                onChange={(event) => setVerificationOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-xl font-semibold tracking-[0.35em] text-slate-950 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isVerifyingOtp ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
                Verify and continue
              </button>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Resend OTP
              </button>
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-950">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your email"
                  className={inputCls(touched.email && errors.email)}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-rose-400 text-xs mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-xs font-semibold text-slate-950">
                  Password
                </label>
                <Link
                  href="#forgot-password"
                  className="text-xs font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  className={inputCls(touched.password && errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors"
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 flex h-[54px] w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-base font-semibold text-white shadow-[0_18px_42px_rgba(4,120,87,0.24)] transition-all hover:bg-emerald-700 hover:shadow-[0_20px_46px_rgba(4,120,87,0.30)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Log in</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-base text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href={redirectPath === "/home" ? "/signup" : `/signup?redirect=${encodeURIComponent(redirectPath)}`}
              className="font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
            >
              Sign up
            </Link>
          </p>
          </div>
        </section>
      </main>

      {passwordSetupModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22 }}
            className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-setup-title"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-sm font-medium text-emerald-700">Google account detected</p>
                <h2 id="password-setup-title" className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                  Set email password
                </h2>
              </div>
              <button
                type="button"
                onClick={closePasswordSetupModal}
                disabled={isSendingPasswordOtp || isSettingPassword}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close password setup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 pt-5">
              <div className="grid grid-cols-3 gap-2">
                {["Send OTP", "Verify", "Password"].map((label, index) => (
                  <div key={label}>
                    <div className={`h-1.5 rounded-full ${index <= passwordSetupStepIndex ? "bg-emerald-500" : "bg-slate-200"}`} />
                    <p className={`mt-2 text-[11px] font-medium ${index === passwordSetupStepIndex ? "text-slate-950" : "text-slate-400"}`}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden px-6 py-6">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${passwordSetupStepIndex * 100}%)` }}
              >
                <section className="w-full shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">Confirm this is your email</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    This account was created with Google. We will send a one-time code to{" "}
                    <span className="font-semibold text-slate-950">{passwordSetupEmail}</span> before letting you add a password.
                  </p>
                  <button
                    type="button"
                    onClick={handleSendPasswordSetupOtp}
                    disabled={isSendingPasswordOtp}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSendingPasswordOtp ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send setup OTP
                  </button>
                </section>

                <section className="w-full shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">Enter the OTP</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Type the 6-digit code sent to {passwordSetupEmail}. The password screen opens automatically after the code is complete.
                  </p>
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    value={passwordSetupOtp}
                    onChange={(event) => handlePasswordSetupOtpChange(event.target.value)}
                    placeholder="000000"
                    className="mt-5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-2xl font-semibold tracking-[0.35em] text-slate-950 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={handleSendPasswordSetupOtp}
                      disabled={isSendingPasswordOtp}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSendingPasswordOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Resend
                    </button>
                    <button
                      type="button"
                      onClick={() => setPasswordSetupStep("password")}
                      disabled={passwordSetupOtp.length !== 6}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </section>

                <section className="w-full shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">Create your password</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Use at least 6 characters with letters and numbers. After this, you can use either Google or email sign-in.
                  </p>
                  <div className="relative mt-5">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="New password"
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-10 text-sm text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-900"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setPasswordSetupStep("otp")}
                      disabled={isSettingPassword}
                      className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSetPasswordWithOtp}
                      disabled={isSettingPassword}
                      className="inline-flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSettingPassword ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      Set password and login
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
