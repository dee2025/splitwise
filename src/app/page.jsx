"use client";

import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  ChevronRight,
  MapPin,
  Menu,
  Receipt,
  Shield,
  TrendingDown,
  Users,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────
const TICKER = [
  "10K+ Users Active",
  "₹1M+ Settled",
  "Zero Math Required",
  "Real-time Sync",
  "Group Trips",
  "Split Instantly",
  "No Awkward Texts",
  "Works Everywhere",
];

const FEATURES = [
  {
    icon: Users,
    title: "Smart Groups",
    desc: "Create groups for trips, roommates, or events. Everyone added in seconds with a link.",
    accent: "text-sky-400",
    accentBg: "bg-sky-500/10",
  },
  {
    icon: TrendingDown,
    title: "Auto-Split",
    desc: "Expenses split instantly — equally or custom. Zero mental math, ever.",
    accent: "text-violet-400",
    accentBg: "bg-violet-500/10",
  },
  {
    icon: BarChart3,
    title: "Balance Tracking",
    desc: "Always know who owes who. Balances update live with every new expense.",
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
  },
  {
    icon: CheckCircle,
    title: "One-click Settle",
    desc: "Optimal settlement plans with minimum transactions. Everyone pays their fair share.",
    accent: "text-indigo-400",
    accentBg: "bg-indigo-500/10",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Works offline. Syncs the moment you're back. Blazing speed always.",
    accent: "text-amber-400",
    accentBg: "bg-amber-500/10",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    desc: "Your data is encrypted and never shared. Clear pricing, no hidden fees.",
    accent: "text-rose-400",
    accentBg: "bg-rose-500/10",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Create a group",
    desc: "Name your trip or event. Invite friends via link — they join instantly.",
  },
  {
    n: "02",
    title: "Log expenses",
    desc: "Add who paid, who joined in, and how much. The math handles itself.",
  },
  {
    n: "03",
    title: "Settle up",
    desc: "Review the summary and pay. One click, everyone's square.",
  },
];

const MOCK_EXPENSES = [
  { name: "Villa Booking", amount: "₹4,500", by: "You", color: "text-indigo-400" },
  { name: "Groceries", amount: "₹2,800", by: "Sarah", color: "text-sky-400" },
  { name: "Activities", amount: "₹1,900", by: "Amit", color: "text-violet-400" },
];

// ── Marquee ───────────────────────────────────────────────────────────────────
function Ticker() {
  const doubled = [...TICKER, ...TICKER];
  return (
    <div className="overflow-hidden border-y border-white/6 bg-slate-900/50 py-3.5">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="flex gap-10 w-max"
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2.5 shrink-0 text-[11px] font-bold text-slate-500 tracking-[0.15em] uppercase"
          >
            <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Hero App Card ──────────────────────────────────────────────────────────────
function HeroCard() {
  return (
    <div className="relative w-full max-w-xs mx-auto">
      {/* Ambient glow */}
      <div className="absolute inset-0 -z-10 bg-indigo-600/12 rounded-3xl blur-3xl scale-125" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: 2 }}
        animate={{ opacity: 1, y: 0, rotate: 2 }}
        transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
        className="bg-slate-800 rounded-2xl border border-white/8 overflow-hidden shadow-2xl shadow-black/50"
      >
        {/* Card header */}
        <div className="px-4 py-3.5 border-b border-white/6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sky-500/10 rounded-xl flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">Goa Trip 2025</p>
              <p className="text-[10px] text-slate-500">4 members · ₹9,200 total</p>
            </div>
          </div>
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md tracking-wide">
            ACTIVE
          </span>
        </div>

        {/* Expenses */}
        <div className="p-2.5 space-y-0.5">
          {MOCK_EXPENSES.map((exp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/4 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-white/5 rounded-lg flex items-center justify-center">
                  <Receipt className="w-3 h-3 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{exp.name}</p>
                  <p className="text-[10px] text-slate-500">by {exp.by}</p>
                </div>
              </div>
              <p className={`text-xs font-bold ${exp.color}`}>{exp.amount}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-white/3 border-t border-white/6 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
              You&apos;re owed
            </p>
            <p className="text-base font-bold text-emerald-400">₹2,300</p>
          </div>
          <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[11px] font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-950/60">
            Settle Up
          </button>
        </div>
      </motion.div>

      {/* Floating: settled notification */}
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.9 }}
        animate={{
          opacity: 1,
          x: 0,
          scale: 1,
          y: [0, -7, 0],
        }}
        transition={{
          opacity: { delay: 1.5, duration: 0.4 },
          x: { delay: 1.5, duration: 0.4 },
          scale: { delay: 1.5, duration: 0.4 },
          y: { delay: 2.2, duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute -bottom-4 -left-7 bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 shadow-xl shadow-black/50"
      >
        <p className="text-[11px] font-bold text-slate-100 flex items-center gap-1.5">
          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
          Rahul settled up
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">₹1,150 received · just now</p>
      </motion.div>

      {/* Floating: balance chip */}
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.7, duration: 0.4, ease: "backOut" }}
        className="absolute -top-3 -right-5 bg-indigo-600 rounded-xl px-3 py-2 shadow-lg shadow-indigo-950/60"
      >
        <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-wide">Net balance</p>
        <p className="text-sm font-bold text-white">+₹2,300</p>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const featuresRef = useRef(null);
  const howRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-80px" });
  const howInView = useInView(howRef, { once: true, margin: "-80px" });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 px-5 sm:px-8 py-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="font-bold text-sm tracking-tight">
              Split<span className="text-indigo-400">Wise</span>
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-5">
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-slate-100 font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-950/60"
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            className="sm:hidden p-1.5 text-slate-400 hover:text-slate-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="sm:hidden mt-3 pb-4 border-t border-white/6 pt-4 flex flex-col gap-3 max-w-6xl mx-auto"
          >
            <Link
              href="/login"
              className="text-sm text-slate-400 font-medium py-1"
              onClick={() => setMenuOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
              onClick={() => setMenuOpen(false)}
            >
              Get started free
            </Link>
          </motion.div>
        )}
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center min-h-[60vh]">

            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Overline */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center gap-2 mb-6"
              >
                <span className="w-5 h-px bg-indigo-400" />
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.25em]">
                  Expense splitting, redesigned
                </span>
              </motion.div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.06] tracking-tight mb-6">
                Split bills,<br />
                <span className="text-indigo-400">not friendships.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-md">
                Track shared costs, settle up instantly, and keep every
                friendship intact — no matter how messy the tab gets.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link
                  href="/signup"
                  className="group flex items-center justify-center gap-2 px-7 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-950/60 text-sm"
                >
                  Start for free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 px-7 py-3.5 border border-white/10 text-slate-300 rounded-xl font-semibold hover:bg-white/5 transition-all text-sm"
                >
                  Sign in
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-x-6 gap-y-2.5">
                {[
                  "No credit card needed",
                  "Free to use",
                  "10K+ groups created",
                ].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right: App mockup */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="hidden lg:flex justify-center items-center"
            >
              <HeroCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Ticker ──────────────────────────────────────────────────────────── */}
      <Ticker />

      {/* ── Features (Bento) ────────────────────────────────────────────────── */}
      <section ref={featuresRef} className="py-28 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-4 h-px bg-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.25em]">
                Features
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              Everything you need,
              <br />
              <span className="text-slate-500">nothing you don&apos;t.</span>
            </h2>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Large card — spans 2 cols */}
            {(() => {
              const f = FEATURES[0];
              const Icon = f.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.08, duration: 0.5 }}
                  className="md:col-span-2 bg-slate-800 border border-white/6 rounded-2xl p-8 hover:border-white/10 transition-all group"
                >
                  <div className={`w-12 h-12 ${f.accentBg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-6 h-6 ${f.accent}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mb-3">{f.title}</h3>
                  <p className="text-slate-400 leading-relaxed mb-8">{f.desc}</p>

                  {/* Inline preview */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Goa Trip", cls: "bg-sky-500/10 text-sky-400 border-sky-500/20", Icon: MapPin },
                      { label: "Office Lunch", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20", Icon: Receipt },
                      { label: "Roommates", cls: "bg-violet-500/10 text-violet-400 border-violet-500/20", Icon: Users },
                    ].map((g) => (
                      <div
                        key={g.label}
                        className={`flex items-center gap-1.5 px-3 py-2.5 ${g.cls} border rounded-xl text-xs font-semibold`}
                      >
                        <g.Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{g.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })()}

            {/* Right column — 2 stacked small cards */}
            <div className="flex flex-col gap-4">
              {FEATURES.slice(1, 3).map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.14 + i * 0.08, duration: 0.5 }}
                    className="flex-1 bg-slate-800 border border-white/6 rounded-2xl p-6 hover:border-white/10 transition-all group"
                  >
                    <div className={`w-10 h-10 ${f.accentBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                      <Icon className={`w-5 h-5 ${f.accent}`} />
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mb-2">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom row — 3 equal small cards */}
            {FEATURES.slice(3, 6).map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i + 3}
                  initial={{ opacity: 0, y: 20 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.28 + i * 0.08, duration: 0.5 }}
                  className="bg-slate-800 border border-white/6 rounded-2xl p-6 hover:border-white/10 transition-all group"
                >
                  <div className={`w-10 h-10 ${f.accentBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-5 h-5 ${f.accent}`} />
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section ref={howRef} className="py-28 px-5 sm:px-8 border-t border-white/6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={howInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-4 h-px bg-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.25em]">
                How it works
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              Three moves.
              <br />
              <span className="text-slate-500">That&apos;s all it takes.</span>
            </h2>
          </motion.div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                animate={howInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="bg-slate-800 border border-white/6 rounded-2xl p-7 hover:border-white/10 transition-all relative overflow-hidden group"
              >
                {/* Big background number */}
                <span className="absolute -bottom-4 -right-2 text-[100px] font-black text-white/3 leading-none select-none group-hover:text-white/5 transition-colors">
                  {step.n}
                </span>

                {/* Step badge */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2.5 py-1.5 tracking-wider">
                    {step.n}
                  </span>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-slate-700" />
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-100 mb-3">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed relative z-10">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="py-28 px-5 sm:px-8 border-t border-white/6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {/* Logo mark with glow */}
            <div className="relative inline-flex mb-10">
              <div className="absolute inset-0 -z-10 bg-indigo-600/25 blur-2xl rounded-full scale-150" />
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-950/60">
                <span className="text-white font-black text-2xl">S</span>
              </div>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-5">
              Start splitting smarter
              <br />
              <span className="text-indigo-400">today.</span>
            </h2>
            <p className="text-lg text-slate-400 mb-12 max-w-md mx-auto leading-relaxed">
              Join thousands of groups already settling up on SplitWise. Free to
              use, forever.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-950/60 text-sm"
              >
                Create free account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-8 py-4 border border-white/10 text-slate-300 rounded-xl font-semibold hover:bg-white/5 transition-all text-sm"
              >
                Sign in instead
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/6 px-5 sm:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-[10px]">S</span>
            </div>
            <span className="text-sm font-bold text-slate-500">
              Split<span className="text-indigo-400">Wise</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6">
            {[
              { label: "Features", href: "#features" },
              { label: "Privacy", href: "#privacy" },
              { label: "Terms", href: "#terms" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors font-medium"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <p className="text-xs text-slate-700 font-medium">
            © {new Date().getFullYear()} SplitWise
          </p>
        </div>
      </footer>
    </div>
  );
}
