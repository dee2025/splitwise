"use client";

import { Loader2, LockKeyhole, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("deepaksingh@moneysplit.in");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/admin/auth/check");
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.authenticated) {
          router.replace("/admin/articles");
          return;
        }
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Invalid admin credentials");
      }

      toast.success("Admin login successful");
      router.replace("/admin/articles");
    } catch (error) {
      toast.error(error.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage users and publish articles.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/8 bg-slate-900 p-5 shadow-2xl shadow-black/30"
        >
          <label className="block">
            <span className="text-xs font-semibold text-slate-400">Admin email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/8 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none focus:border-indigo-400/50"
              autoComplete="username"
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-semibold text-slate-400">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/8 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none focus:border-indigo-400/50"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
            Login to Admin Panel
          </button>
        </form>
      </div>
    </main>
  );
}
