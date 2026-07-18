"use client";

import { motion, useInView } from "framer-motion";
import Script from "next/script";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Coins,
  FileText,
  MapPin,
  PartyPopper,
  Receipt,
  Shield,
  Tag,
  TrendingDown,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { seoPageList } from "@/data/seoPages";
import Link from "next/link";
import { useRef } from "react";

// ── Import Articles ───────────────────────────────────────────────────────────

// ── Data ──────────────────────────────────────────────────────────────────────
const TICKER = [
  "10K+ Users Active",
  "₹1M+ Tracked",
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
    icon: FileText,
    title: "Expense History",
    desc: "Review who paid, who joined each split, and when every cost was added.",
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
    title: "Review activity",
    desc: "View group history, members, and split details whenever you need them.",
  },
];

const JOURNEY_STEPS = [
  {
    icon: Users,
    title: "Create Group",
    desc: "Tap create, name your group, and launch it in seconds.",
    state: "Group created",
    accent: "text-sky-300",
    chip: "bg-sky-500/15 border-sky-400/30 text-sky-200",
  },
  {
    icon: UserPlus,
    title: "Add Members",
    desc: "Invite friends via link and everyone joins the same ledger.",
    state: "4 members joined",
    accent: "text-violet-300",
    chip: "bg-violet-500/15 border-violet-400/30 text-violet-200",
  },
  {
    icon: Receipt,
    title: "Add Expense",
    desc: "Log who paid and who shared the cost.",
    state: "Expense saved",
    accent: "text-amber-300",
    chip: "bg-amber-500/15 border-amber-400/30 text-amber-200",
  },
  {
    icon: Coins,
    title: "Split Instantly",
    desc: "Auto-split calculates fair shares with zero manual math.",
    state: "Balances updated",
    accent: "text-indigo-300",
    chip: "bg-indigo-500/15 border-indigo-400/30 text-indigo-200",
  },
  {
    icon: FileText,
    title: "Review Records",
    desc: "Open the activity timeline and export a group report when needed.",
    state: "Report ready",
    accent: "text-emerald-300",
    chip: "bg-emerald-500/15 border-emerald-400/30 text-emerald-200",
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
            View Report
          </button>
        </div>
      </motion.div>

      {/* Floating: activity notification */}
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
          Report exported
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">Group activity PDF · just now</p>
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

function AppJourneyDemo() {
  return (
    <div className="relative rounded-3xl border border-white/10 bg-slate-900/70 p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(99,102,241,0.22),transparent_35%),radial-gradient(circle_at_85%_90%,rgba(14,165,233,0.16),transparent_35%)]" />

      <div className="relative hidden md:block">
        <div className="grid md:grid-cols-5 gap-3">
          {JOURNEY_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0.6, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                animate={{
                  borderColor: ["rgba(255,255,255,0.08)", "rgba(99,102,241,0.45)", "rgba(255,255,255,0.08)"],
                  y: [0, -2, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
                className="relative rounded-2xl border bg-slate-800/70 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${step.accent}`} />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${step.chip}`}>
                    Step {i + 1}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-100">{step.title}</p>
                <p className="text-xs text-slate-400 mt-1 leading-5">{step.desc}</p>
                <div className="mt-3 text-[11px] text-slate-300">{step.state}</div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          aria-hidden
          className="absolute top-1/2 -translate-y-1/2 z-20"
          animate={{ left: ["6%", "25%", "44%", "63%", "82%", "82%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            animate={{ scale: [1, 0.92, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.12)] border border-slate-900" />
            <motion.div
              className="absolute -inset-2 rounded-full border border-white/60"
              animate={{ scale: [0.6, 1.4], opacity: [0.8, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.div>
        </motion.div>
      </div>

      <div className="md:hidden space-y-3">
        {JOURNEY_STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="rounded-xl border border-white/10 bg-slate-800/70 p-4"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${step.accent}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">{step.title}</p>
                  <p className="text-xs text-slate-400">{step.state}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-5">{step.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LandingPage({ articles = [], faqs = [] }) {
  const featuresRef = useRef(null);
  const howRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-80px" });
  const howInView = useInView(howRef, { once: true, margin: "-80px" });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* JSON-LD Structured Data */}
      <Script
        id="home-software-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Money Split",
            "description": "Easy expense splitter and bill tracker app for groups, trips, and roommates",
            "url": "https://www.moneysplit.in",
            "applicationCategory": "FinanceApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            },
            "operatingSystem": "Web",
            "isAccessibleForFree": true,
            "featureList": [
              "Create shared expense groups",
              "Split bills across members",
              "Track balances and expense history",
              "Manage trip and roommate expenses"
            ]
          }),
        }}
      />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-20 px-5 sm:px-8">
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
                Track shared costs, add members quickly, and keep every
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

      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-px w-4 bg-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400">
                Popular use cases
              </span>
            </div>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-100 sm:text-4xl">
              Find the right expense splitter for your group
            </h2>
            <p className="mt-4 text-slate-400 leading-7">
              Money Split works as a bill splitter, group expense tracker, trip expense
              splitter, roommate bill splitter, and simple Splitwise alternative.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {seoPageList.map((page) => (
              <Link
                key={page.slug}
                href={`/${page.slug}`}
                className="group rounded-xl border border-white/8 bg-slate-900 p-4 transition-colors hover:border-indigo-400/30 hover:bg-slate-900/80"
              >
                <p className="text-sm font-bold text-slate-100">{page.shortTitle}</p>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
                  {page.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                  Open guide
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features (Bento) ────────────────────────────────────────────────── */}
      <section ref={featuresRef} className="py-20 px-5 sm:px-8">
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

     

      {/* ── App Journey ──────────────────────────────────────────────────────── */}
      <section className="pb-20 px-5 sm:px-8 border-t border-white/6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-4 h-px bg-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.25em]">
                Product journey
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              Watch the full flow,
              <br />
              <span className="text-slate-500">from first click to clear records.</span>
            </h2>
            <p className="text-slate-400 mt-4 max-w-3xl leading-7">
              This is the exact journey your users follow: create a group, add members,
              record expenses, auto-split the amount, review activity, and manage the group
              with clear records and zero awkward follow-ups.
            </p>
          </motion.div>

          <AppJourneyDemo />

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2"
          >
            <PartyPopper className="w-4 h-4 text-emerald-300" />
            <span className="text-xs text-emerald-200 font-semibold tracking-wide uppercase">
              End result: everyone paid fairly, friendship intact
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── Articles Section ─────────────────────────────────────────────────── */}
      <section className="pb-20 px-5 sm:px-8 border-t border-white/6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true }}
            className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-4 h-px bg-indigo-400" />
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.25em]">
                  Expense guides
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
                Practical guides for
                <br />
                <span className="text-slate-500">cleaner shared money decisions.</span>
              </h2>
              <p className="text-slate-400 max-w-3xl leading-7">
                Fresh articles from the admin panel appear here automatically. Use them to
                answer real user questions about trips, roommates, family costs, and fair splits.
              </p>
            </div>
            <Link
              href="/articles"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-300 transition-all hover:border-white/20 hover:bg-white/5"
            >
              All articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {articles.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="group overflow-hidden rounded-2xl border border-white/8 bg-slate-900 lg:col-span-3"
              >
                <Link href={`/articles/${articles[0].slug}`} className="block">
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-800">
                    <img
                      src={articles[0].thumbnail}
                      alt={articles[0].title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-slate-950/80 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-300" />
                        Featured guide
                      </span>
                      <span className="rounded-full border border-white/12 bg-slate-950/80 px-3 py-1 text-xs font-semibold text-slate-300 backdrop-blur">
                        {articles[0].category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 sm:p-7">
                    <h3 className="text-2xl font-bold leading-tight text-slate-100 transition-colors group-hover:text-indigo-300">
                      {articles[0].title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                      {articles[0].excerpt}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {articles[0].readTime} min read
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(articles[0].date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1.5 font-semibold text-indigo-300">
                        Read guide
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>

              <div className="lg:col-span-2 space-y-4">
                {articles.slice(1, 4).map((article, i) => (
                  <motion.article
                    key={article.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.08, duration: 0.45 }}
                    viewport={{ once: true }}
                    className="group rounded-2xl border border-white/8 bg-slate-900 p-4 transition-colors hover:border-white/14"
                  >
                    <Link href={`/articles/${article.slug}`} className="grid grid-cols-[96px_1fr] gap-4">
                      <div className="aspect-square overflow-hidden rounded-xl bg-slate-800">
                        <img
                          src={article.thumbnail}
                          alt={article.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                          <Tag className="h-3.5 w-3.5 text-indigo-300" />
                          <span className="truncate">{article.category}</span>
                        </div>
                        <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-100 transition-colors group-hover:text-indigo-300">
                          {article.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                          {article.excerpt}
                        </p>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── FAQ Section ─────────────────────────────────────────────────────── */}
      <section className="pb-20 px-5 sm:px-8 border-t border-white/6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-14"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-4 h-px bg-indigo-400" />
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.25em]">
                  Common questions
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
                Clear answers before
                <br />
                <span className="text-slate-500">you split a bill.</span>
              </h2>
              <p className="mt-5 max-w-md text-slate-400 leading-7">
                These answers explain how Money Split works for everyday shared costs,
                so visitors and search engines can understand the product clearly.
              </p>
              <Link
                href="/articles"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 hover:text-indigo-200"
              >
                Read detailed guides
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-white/8 bg-slate-900 px-5 py-4 open:border-indigo-400/30 open:bg-slate-900/90"
                  open={index === 0}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                    <span className="text-sm font-bold text-slate-100">{faq.question}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180 group-open:text-indigo-300" />
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{faq.answer}</p>
                </details>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="pb-20 px-5 sm:px-8 border-t border-white/6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
           

            <h2 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-5">
              Start splitting smarter
              <br />
              <span className="text-indigo-400">today.</span>
            </h2>
            <p className="text-lg text-slate-400 mb-12 max-w-md mx-auto leading-relaxed">
              Join thousands of users managing shared expenses on Money Split. Free to
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

    </div>
  );
}

