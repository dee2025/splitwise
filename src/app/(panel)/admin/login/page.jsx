"use client";

import { BarChart3, CheckCircle2, Loader2, LockKeyhole, ShieldCheck, Users } from "lucide-react";
import Image from "next/image";
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
    <main className="relative min-h-screen overflow-hidden bg-[#070b14] px-5 py-8 text-slate-100 sm:px-8 lg:flex lg:items-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,.16),transparent_30%),radial-gradient(circle_at_90%_90%,rgba(16,185,129,.07),transparent_25%)]" />
      <div className="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/[0.08] bg-slate-900/75 shadow-[0_40px_120px_rgba(0,0,0,.45)] backdrop-blur-xl lg:grid-cols-[1.08fr_.92fr]">
        <section className="relative hidden overflow-hidden border-r border-white/[0.07] bg-gradient-to-br from-indigo-600/25 via-slate-950/30 to-slate-950/60 p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full border-[52px] border-white/[0.035]" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-950/50">
              <Image src="/logo.png" alt="MoneySplit" width={30} height={30} className="h-8 w-8 rounded-lg" priority />
            </span>
            <div><p className="font-bold text-white">MoneySplit</p><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-300">Operations</p></div>
          </div>

          <div className="relative my-16">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-300/15 bg-indigo-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-indigo-200"><ShieldCheck className="h-3.5 w-3.5" /> Secure workspace</div>
            <h1 className="max-w-lg text-4xl font-bold leading-[1.05] tracking-[-.045em] text-white">Run MoneySplit with clarity and confidence.</h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400">Monitor growth, understand acquisition, manage customers and publish useful content from one focused control center.</p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[{ icon: BarChart3, label: "Live business insights" }, { icon: Users, label: "Customer intelligence" }].map((item) => { const Icon = item.icon; return <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/15 p-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-indigo-300"><Icon className="h-4 w-4" /></span><span className="text-xs font-semibold text-slate-300">{item.label}</span></div>; })}
            </div>
          </div>

          <p className="relative flex items-center gap-2 text-[11px] text-slate-500"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Restricted to authorized MoneySplit administrators</p>
        </section>

        <section className="flex items-center p-6 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300 lg:hidden"><LockKeyhole className="h-5 w-5" /></div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-300">Welcome back</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-.035em] text-white">Sign in to your workspace</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Use your administrator credentials to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-xs font-semibold text-slate-300">Admin email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-slate-950/80 px-4 py-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-700 focus:border-indigo-400/50 focus:ring-4 focus:ring-indigo-500/10"
              autoComplete="username"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-slate-950/80 px-4 py-3.5 text-sm text-slate-100 outline-none transition focus:border-indigo-400/50 focus:ring-4 focus:ring-indigo-500/10"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-[0_16px_35px_rgba(79,70,229,.28)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(79,70,229,.36)] disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
            Continue to admin workspace
          </button>
        </form>
            <p className="mt-6 text-center text-[11px] text-slate-600">Protected administrative access · MoneySplit</p>
          </div>
        </section>
      </div>
    </main>
  );
}
