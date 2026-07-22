"use client";

import axios from "axios";
import { CheckCircle, Loader2, MailWarning, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, setState] = useState({
    status: "loading",
    message: "Verifying your email address...",
  });

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!token) {
        setState({
          status: "error",
          message: "Verification link is missing or incomplete.",
        });
        return;
      }

      try {
        const res = await axios.post("/api/auth/verify-email", { token });
        if (!cancelled) {
          setState({
            status: "success",
            message: res.data?.message || "Email verified successfully.",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              err.response?.data?.error ||
              "This verification link is invalid or expired.",
          });
        }
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const isLoading = state.status === "loading";
  const isSuccess = state.status === "success";
  const Icon = isLoading ? Loader2 : isSuccess ? CheckCircle : XCircle;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-sm items-center justify-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
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

          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
              isLoading
                ? "bg-indigo-50 text-indigo-700"
                : isSuccess
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
            }`}
          >
            <Icon className={`h-7 w-7 ${isLoading ? "animate-spin" : ""}`} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            {isLoading
              ? "Verifying email"
              : isSuccess
                ? "Email verified"
                : "Verification failed"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{state.message}</p>

          <div className="mt-6 space-y-3">
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Sign in
            </Link>
            {!isSuccess && !isLoading ? (
              <Link
                href="/signup"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
              >
                <MailWarning className="h-4 w-4" />
                Request a new link
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
