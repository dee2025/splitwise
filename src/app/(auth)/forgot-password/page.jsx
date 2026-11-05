"use client";

import { getEmailValidationError, getPasswordValidationError } from "@/lib/authValidation";
import axios from "axios";
import { ArrowLeft, Check, Eye, EyeOff, KeyRound, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const requestCode = async () => {
    const emailError = getEmailValidationError(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      await axios.post("/api/auth/request-password-reset", { email: email.trim() });
      setStep("reset");
      toast.success("If this account exists, a secure reset code was sent.");
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to send reset code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPassword = async () => {
    const nextErrors = {};
    if (otp.length !== 6) nextErrors.otp = "Enter the 6-digit code";
    const passwordError = getPasswordValidationError(password, { requiredLabel: "New password" });
    if (passwordError) nextErrors.password = passwordError;
    if (!confirmPassword) nextErrors.confirmPassword = "Confirm your new password";
    else if (confirmPassword !== password) nextErrors.confirmPassword = "Passwords do not match";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      await axios.post("/api/auth/reset-password", {
        email: email.trim(),
        otp,
        newPassword: password,
      });
      toast.success("Password reset successfully. You can now sign in.");
      router.replace("/login");
    } catch (error) {
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) setErrors({ ...apiErrors, password: apiErrors.newPassword || apiErrors.password });
      toast.error(error.response?.data?.error || "Unable to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const rules = [
    ["8+ characters", password.length >= 8],
    ["One letter", /[a-zA-Z]/.test(password)],
    ["One number", /[0-9]/.test(password)],
  ];

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#071b17] px-5 py-10 text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(52,211,153,.16),transparent_30%),radial-gradient(circle_at_90%_90%,rgba(99,102,241,.10),transparent_28%)]" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[30px] border border-white/10 bg-white shadow-[0_40px_120px_rgba(0,0,0,.35)] lg:grid-cols-[.9fr_1.1fr]">
        <section className="hidden bg-[#0a2a23] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <Link href="/" className="flex items-center gap-3"><Image src="/logo.png" alt="MoneySplit" width={42} height={42} className="rounded-xl" /><span className="font-bold">MoneySplit</span></Link>
          <div><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300"><ShieldCheck className="h-6 w-6" /></span><h1 className="mt-6 text-4xl font-semibold leading-tight tracking-[-.04em]">Secure account recovery.</h1><p className="mt-4 text-sm leading-7 text-emerald-50/60">Reset codes expire after 10 minutes and can only be used once. Your account stays protected throughout the process.</p></div>
          <p className="text-xs text-emerald-50/40">MoneySplit account security</p>
        </section>

        <section className="p-6 sm:p-10 lg:p-12">
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700"><ArrowLeft className="h-4 w-4" /> Back to login</Link>
          <div className="mt-8"><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">{step === "email" ? "Step 1 of 2" : "Step 2 of 2"}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.035em]">{step === "email" ? "Forgot your password?" : "Create a new password"}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{step === "email" ? "Enter your account email and we’ll send a secure verification code." : `Enter the code sent to ${email.trim()} and choose a strong password.`}</p></div>

          {step === "email" ? (
            <div className="mt-8"><label className="text-xs font-bold text-slate-700">Email address</label><div className="relative mt-2"><Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setErrors({}); }} onKeyDown={(event) => event.key === "Enter" && requestCode()} placeholder="you@example.com" className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10" /></div>{errors.email && <p className="mt-2 text-xs text-rose-600">{errors.email}</p>}<button type="button" onClick={requestCode} disabled={isSubmitting} className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 font-bold text-white shadow-[0_16px_38px_rgba(5,150,105,.25)] transition hover:bg-emerald-700 disabled:opacity-60">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Send secure reset code</button></div>
          ) : (
            <div className="mt-8 space-y-5">
              <div><label className="text-xs font-bold text-slate-700">6-digit reset code</label><input inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-center text-xl font-bold tracking-[.32em] outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10" />{errors.otp && <p className="mt-2 text-xs text-rose-600">{errors.otp}</p>}</div>
              {[{ label: "New password", value: password, set: setPassword, error: errors.password }, { label: "Confirm password", value: confirmPassword, set: setConfirmPassword, error: errors.confirmPassword }].map((field) => <div key={field.label}><label className="text-xs font-bold text-slate-700">{field.label}</label><div className="relative mt-2"><LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type={showPassword ? "text" : "password"} autoComplete="new-password" value={field.value} onChange={(event) => field.set(event.target.value)} className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10" />{field.label === "New password" && <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}</div>{field.error && <p className="mt-2 text-xs text-rose-600">{field.error}</p>}</div>)}
              <div className="flex flex-wrap gap-2">{rules.map(([label, passed]) => <span key={label} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold ${passed ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}><Check className="h-3 w-3" />{label}</span>)}</div>
              <button type="button" onClick={resetPassword} disabled={isSubmitting} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 font-bold text-white shadow-[0_16px_38px_rgba(5,150,105,.25)] hover:bg-emerald-700 disabled:opacity-60">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Reset password securely</button>
              <div className="flex justify-between gap-4 text-xs font-semibold"><button type="button" onClick={() => setStep("email")} className="text-slate-500 hover:text-slate-900">Use another email</button><button type="button" onClick={requestCode} className="text-emerald-700 hover:text-emerald-800">Resend code</button></div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
