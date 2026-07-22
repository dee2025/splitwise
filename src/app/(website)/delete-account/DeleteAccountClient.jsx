"use client";

import { logout } from "@/redux/slices/authSlice";
import axios from "axios";
import { AlertTriangle, Loader2, Lock, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

export default function DeleteAccountClient() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const res = await axios.get("/api/auth/me");
        if (!cancelled) {
          setUser(res.data?.user || null);
          setStatus(res.data?.user ? "authenticated" : "anonymous");
        }
      } catch {
        if (!cancelled) {
          setStatus("anonymous");
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const deleteAccount = async (event) => {
    event.preventDefault();
    setIsDeleting(true);

    try {
      await axios.delete("/api/users/account", {
        data: { password, confirmation },
      });
      dispatch(logout());
      toast.success("Account deleted");
      router.replace("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Unable to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-700" />
          Checking account status...
        </div>
      </div>
    );
  }

  if (status === "anonymous") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-5 w-5 text-indigo-700" />
          <div>
            <h2 className="text-base font-bold text-slate-950">Sign in to delete your account</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              For security, deletion must be requested from the account session. You can also email support from the
              registered email address if you cannot access the account.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login?redirect=/delete-account"
                className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
              >
                Sign in
              </Link>
              <a
                href="mailto:deepaksingh@moneysplit.in?subject=MoneySplit%20Account%20Deletion%20Request"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
              >
                Email support
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isLocalAccount = user?.authProvider !== "google";
  const canSubmit = confirmation === "DELETE" && (!isLocalAccount || password.length > 0);

  return (
    <form onSubmit={deleteAccount} className="rounded-xl border border-rose-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-600" />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-slate-950">Delete signed-in account</h2>
          <p className="mt-2 break-words text-sm leading-6 text-slate-600">
            You are signed in as <span className="font-semibold text-slate-950">{user?.email}</span>.
            This action permanently deletes your MoneySplit account and associated personal data.
          </p>

          {isLocalAccount ? (
            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                Current password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                autoComplete="current-password"
              />
            </div>
          ) : null}

          <div className="mt-4">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
              Type DELETE to confirm
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || isDeleting}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete my account
          </button>
        </div>
      </div>
    </form>
  );
}
