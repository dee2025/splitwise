"use client";

import { loginSuccess } from "@/redux/slices/authSlice";
import axios from "axios";
import { CheckCircle, Loader2, MailWarning } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim() || otp.trim().length !== 6) {
      toast.error("Enter your email and 6-digit OTP");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post("/api/auth/verify-email", {
        email,
        otp,
      });
      if (res.data?.success) {
        dispatch(loginSuccess({ user: res.data.user }));
        toast.success(res.data.message || "Email verified");
        router.replace("/home");
        return;
      }
      toast.error("Unable to verify OTP");
    } catch (err) {
      toast.error(err.response?.data?.error || "Unable to verify OTP");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-sm items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-[0_24px_80px_rgba(15,23,42,0.12)]"
        >
          <Link href="/" className="mb-7 inline-flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="MoneySplit"
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-lg"
              priority
            />
            <span className="text-lg font-bold tracking-tight text-slate-950">
              Money<span className="text-indigo-700">Split</span>
            </span>
          </Link>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
            <MailWarning className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Verify your email
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter the 6-digit OTP sent to your inbox. Verification links are no longer used.
          </p>

          <div className="mt-6 space-y-3">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
            <input
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-2xl font-black tracking-[0.35em] text-slate-950 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Verify and continue
            </button>
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
