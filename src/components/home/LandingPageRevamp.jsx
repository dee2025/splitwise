"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  BookOpen,
  Check,
  ChevronDown,
  CircleCheck,
  Clock3,
  IndianRupee,
  LockKeyhole,
  MapPinned,
  Plus,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import { seoPageList } from "@/data/seoPages";

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
  transition: { duration: 0.5, ease: "easeOut" },
};

const useCases = [
  {
    icon: MapPinned,
    eyebrow: "Trips",
    title: "Every booking, meal and cab in one trip expense tracker.",
    copy: "See the full travel budget while Money Split keeps each payer and participant attached to the right cost.",
    href: "/trip-expense-splitter",
    accent: "bg-orange-100 text-orange-800",
  },
  {
    icon: BedDouble,
    eyebrow: "Roommates",
    title: "Rent and recurring house bills without the monthly chase.",
    copy: "Track electricity, Wi-Fi, groceries, repairs and deposits in a shared roommate bill splitter.",
    href: "/roommate-bill-splitter",
    accent: "bg-sky-100 text-sky-800",
  },
  {
    icon: Users,
    eyebrow: "Friends & teams",
    title: "A clear group expense tracker for plans big and small.",
    copy: "Split dinners, office lunches, events and shared purchases while everyone sees the same balance.",
    href: "/group-expense-tracker",
    accent: "bg-violet-100 text-violet-800",
  },
];

function Eyebrow({ children, light = false }) {
  return (
    <div className={`mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] ${light ? "text-emerald-300" : "text-emerald-700"}`}>
      <span className={`h-2 w-2 rounded-full ${light ? "bg-emerald-300" : "bg-emerald-500"}`} />
      {children}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#08251e] px-5 pb-16 pt-14 text-white sm:px-8 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_78%_20%,rgba(51,211,153,0.20),transparent_31%),radial-gradient(circle_at_18%_100%,rgba(249,115,22,0.12),transparent_28%)]" />
      <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-emerald-100 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            Free bill splitter for every kind of group
          </div>
          <h1 className="max-w-[650px] text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[72px]">
            Split bills.
            <span className="mt-2 block text-emerald-300">Keep the good part.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-emerald-50/75 sm:text-lg sm:leading-8">
            Money Split is a free group expense tracker for friends, trips and roommates. Add shared costs, see who owes whom and settle up without spreadsheets or awkward reminders.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#f7ff6b] px-6 py-3.5 text-sm font-bold text-[#08251e] shadow-[0_18px_50px_rgba(217,249,70,.16)] transition hover:-translate-y-0.5 hover:bg-white">
              Start splitting for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#product-tour" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
              See the app
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-emerald-50/70">
            {["Free to start", "Private groups", "Made for India"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CircleCheck className="h-4 w-4 text-emerald-300" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div className="relative" initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08 }}>
          <div className="absolute -inset-6 rounded-[44px] bg-emerald-300/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-black/20 p-2 shadow-[0_40px_100px_rgba(0,0,0,.38)] backdrop-blur sm:p-3">
            <Image src="/hero-banner.png" alt="Money Split group expense tracker showing a Goa trip balance and settle-up screen" width={1536} height={1024} priority sizes="(min-width: 1024px) 58vw, 94vw" className="h-auto w-full rounded-[20px]" />
          </div>
          <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-white/15 bg-white px-4 py-3 text-slate-950 shadow-xl sm:left-8">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800"><Check className="h-5 w-5" /></span>
            <span><span className="block text-xs text-slate-500">Balance updated</span><span className="block text-sm font-bold">Everyone sees the same split</span></span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section aria-label="Money Split benefits" className="border-b border-emerald-950/10 bg-[#f7ff6b] px-5 py-5 text-[#08251e] sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 text-sm font-bold sm:grid-cols-3">
        <span className="flex items-center justify-center gap-2"><Zap className="h-4 w-4" /> Add an expense in seconds</span>
        <span className="flex items-center justify-center gap-2 sm:border-x sm:border-[#08251e]/15"><ReceiptText className="h-4 w-4" /> Accurate shared balances</span>
        <span className="flex items-center justify-center gap-2"><LockKeyhole className="h-4 w-4" /> Clear, private group records</span>
      </div>
    </section>
  );
}

function DashboardPreview() {
  const expenses = [
    ["Villa booking", "Paid by Riya", "₹12,400"],
    ["Airport cab", "Paid by Kabir", "₹1,850"],
    ["Dinner at Panjim", "Paid by you", "₹3,240"],
  ];
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,.13)]">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3"><span className="h-2.5 w-2.5 rounded-full bg-red-300" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" /><span className="ml-3 text-[11px] font-semibold text-slate-400">app.moneysplit.in / goa-trip</span></div>
      <div className="grid min-h-[430px] sm:grid-cols-[150px_1fr]">
        <aside className="hidden bg-[#0a211c] p-5 text-white sm:block">
          <p className="text-sm font-bold">Money<span className="text-emerald-300">Split</span></p>
          <div className="mt-8 space-y-2 text-xs text-white/55"><p className="rounded-lg bg-white/10 px-3 py-2.5 text-white">Overview</p><p className="px-3 py-2.5">Expenses</p><p className="px-3 py-2.5">Members</p><p className="px-3 py-2.5">Activity</p></div>
        </aside>
        <div className="bg-[#f7faf9] p-5 sm:p-7">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">Trip group</p><h3 className="mt-1 text-2xl font-bold text-slate-950">Goa weekend</h3></div><button className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white" aria-label="Add expense preview"><Plus className="h-5 w-5" /></button></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[#0a211c] p-4 text-white sm:col-span-2"><p className="text-xs text-white/55">Total group spend</p><p className="mt-2 text-3xl font-bold">₹28,460</p><p className="mt-4 text-xs text-emerald-300">6 members · 11 expenses</p></div><div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-xs text-emerald-800">Your balance</p><p className="mt-2 text-2xl font-bold text-emerald-800">+₹1,240</p><p className="mt-4 text-xs text-emerald-700">you are owed</p></div></div>
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-bold text-slate-950">Recent expenses</p><p className="text-xs font-semibold text-emerald-700">View all</p></div>{expenses.map(([name, payer, amount]) => <div key={name} className="flex items-center gap-3 border-t border-slate-100 py-3 first:border-0"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-700"><ReceiptText className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-800">{name}</span><span className="block text-[10px] text-slate-400">{payer}</span></span><span className="text-xs font-bold text-slate-900">{amount}</span></div>)}</div>
        </div>
      </div>
    </div>
  );
}

function ProductTour() {
  return (
    <section id="product-tour" className="overflow-hidden bg-[#f6f8f3] px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div><Eyebrow>Inside Money Split</Eyebrow><h2 className="text-4xl font-semibold leading-[1.03] tracking-[-0.04em] text-slate-950 sm:text-5xl">One shared view.<br />No money mystery.</h2></div>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">A practical bill splitting app should make the answer obvious. Money Split connects every expense to its payer, participants and running group balance.</p>
        </div>

        <motion.div className="mt-12" {...fadeUp}><DashboardPreview /></motion.div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <motion.div {...fadeUp} className="rounded-[24px] bg-[#0a211c] p-6 text-white sm:p-8">
            <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-300">Smart settlement</p><h3 className="mt-3 text-2xl font-semibold">Know exactly who pays whom.</h3></div><WalletCards className="h-6 w-6 text-emerald-300" /></div>
            <div className="mt-8 space-y-3"><div className="flex items-center justify-between rounded-xl bg-white/8 p-4"><span className="text-sm"><b>You</b> pay Arjun</span><span className="font-bold text-[#f7ff6b]">₹840</span></div><div className="flex items-center justify-between rounded-xl bg-white/8 p-4"><span className="text-sm"><b>Neha</b> pays you</span><span className="font-bold text-emerald-300">₹1,260</span></div></div>
          </motion.div>
          <motion.div {...fadeUp} className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-orange-700">Flexible splitting</p><h3 className="mt-3 text-2xl font-semibold text-slate-950">Include the right people, every time.</h3></div><Users className="h-6 w-6 text-orange-600" /></div>
            <div className="mt-8 grid grid-cols-4 gap-3">{["You", "Riya", "Kabir", "Neha"].map((name, i) => <div key={name} className={`rounded-xl border p-3 text-center ${i === 2 ? "border-slate-200 bg-slate-50 opacity-45" : "border-emerald-200 bg-emerald-50"}`}><span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700">{name[0]}</span><p className="mt-2 text-[11px] font-semibold text-slate-700">{name}</p></div>)}</div>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-950 px-4 py-3 text-white"><span className="text-xs">₹3,600 split between 3 people</span><span className="text-sm font-bold">₹1,200 each</span></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function LifestyleSection() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
        <motion.div {...fadeUp} className="relative overflow-hidden rounded-[28px] bg-slate-100 shadow-[0_28px_80px_rgba(15,23,42,.12)]">
          <Image src="/images/landing/friends-splitting-trip-expenses.webp" alt="Friends planning a group trip and reviewing shared travel expenses" width={1536} height={1024} sizes="(min-width: 1024px) 50vw, 94vw" className="aspect-[4/3] h-full w-full object-cover" />
          <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur sm:inset-x-6 sm:bottom-6"><p className="text-xs font-bold uppercase tracking-[.14em] text-emerald-700">Built for real plans</p><p className="mt-1 text-sm font-semibold text-slate-900">The memories stay shared. So does the expense record.</p></div>
        </motion.div>
        <div>
          <Eyebrow>For everyday groups</Eyebrow>
          <h2 className="text-4xl font-semibold leading-[1.03] tracking-[-0.04em] text-slate-950 sm:text-5xl">However you spend together, split it clearly.</h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600">From a quick dinner bill to a month of household costs, Money Split gives your group one reliable place to track shared expenses.</p>
          <div className="mt-8 space-y-3">{useCases.map((item) => { const Icon = item.icon; return <Link key={item.title} href={item.href} className="group grid grid-cols-[44px_1fr_auto] items-start gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.accent}`}><Icon className="h-5 w-5" /></span><span><span className="block text-[11px] font-bold uppercase tracking-[.14em] text-slate-400">{item.eyebrow}</span><span className="mt-1 block text-sm font-bold text-slate-950">{item.title}</span></span><ArrowRight className="mt-3 h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-700" /></Link>; })}</div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    [Users, "Create your group", "Start a trip, home, event or team expense group."],
    [ReceiptText, "Add shared expenses", "Choose who paid and exactly who joined the split."],
    [IndianRupee, "Review live balances", "Everyone can see what they owe or are owed."],
    [CircleCheck, "Settle up", "Record repayments and close the loop with confidence."],
  ];
  return (
    <section className="bg-[#0a211c] px-5 py-20 text-white sm:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl"><div className="max-w-3xl"><Eyebrow light>How the expense splitter works</Eyebrow><h2 className="text-4xl font-semibold leading-[1.03] tracking-[-0.04em] sm:text-5xl">From “I’ll pay” to settled in four simple steps.</h2></div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{steps.map(([Icon, title, copy], index) => <motion.div key={title} {...fadeUp} transition={{ ...fadeUp.transition, delay: index * .06 }} className="rounded-2xl border border-white/10 bg-white/[.055] p-6"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-300 text-[#0a211c]"><Icon className="h-5 w-5" /></span><span className="text-sm font-bold text-white/30">0{index + 1}</span></div><h3 className="mt-8 text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/60">{copy}</p></motion.div>)}</div>
      </div>
    </section>
  );
}

function DiscoverSection() {
  const pages = seoPageList.slice(0, 6);
  return (
    <section className="bg-[#f6f8f3] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div className="max-w-3xl"><Eyebrow>Expense splitting guides</Eyebrow><h2 className="text-3xl font-semibold tracking-[-.03em] text-slate-950 sm:text-4xl">Find the right bill splitter for your group.</h2></div><Link href="/features" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800">Explore all features <ArrowRight className="h-4 w-4" /></Link></div>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{pages.map((page) => <Link key={page.slug} href={`/${page.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"><h3 className="font-bold text-slate-950 group-hover:text-emerald-800">{page.navLabel || page.shortTitle}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{page.description}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-emerald-700">Learn more <ArrowRight className="h-3.5 w-3.5" /></span></Link>)}</div></div></section>
  );
}

function Articles({ articles }) {
  if (!articles.length) return null;
  return (
    <section className="bg-white px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><div className="flex items-end justify-between gap-6"><div><Eyebrow>Money guides</Eyebrow><h2 className="text-3xl font-semibold tracking-[-.03em] text-slate-950 sm:text-4xl">Make shared spending feel simpler.</h2></div><Link href="/articles" className="hidden items-center gap-2 text-sm font-bold text-emerald-800 sm:flex">All articles <ArrowRight className="h-4 w-4" /></Link></div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">{articles.slice(0, 3).map((article, index) => <article key={article.slug} className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white ${index === 0 ? "md:col-span-1" : ""}`}><Link href={`/articles/${article.slug}`}><div className="relative aspect-[16/10] overflow-hidden bg-slate-100"><Image src={article.thumbnail} alt={article.title} fill sizes="(min-width:768px) 33vw, 94vw" className="object-cover transition duration-500 group-hover:scale-105" /></div><div className="p-5"><div className="flex items-center gap-2 text-xs font-semibold text-slate-400"><BookOpen className="h-3.5 w-3.5" /><span>Guide</span><span>·</span><Clock3 className="h-3.5 w-3.5" /><span>{article.readTime} min</span></div><h3 className="mt-3 line-clamp-2 text-lg font-bold leading-6 text-slate-950 group-hover:text-emerald-800">{article.title}</h3></div></Link></article>)}</div></div></section>
  );
}

function Faq({ faqs }) {
  return (
    <section className="bg-[#f6f8f3] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[.72fr_1.28fr]"><div><Eyebrow>Questions, answered</Eyebrow><h2 className="text-4xl font-semibold tracking-[-.04em] text-slate-950">Everything your group needs to know.</h2><p className="mt-5 text-sm leading-6 text-slate-600">Still deciding? Explore how Money Split handles shared expenses, balances and settlements.</p></div><div className="space-y-3">{faqs.map((faq, index) => <details key={faq.question} open={index === 0} className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 open:border-emerald-300"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-slate-950">{faq.question}<ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" /></summary><p className="mt-3 pr-8 text-sm leading-6 text-slate-600">{faq.answer}</p></details>)}</div></div></section>
  );
}

function FinalCta() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8"><div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-[#f7ff6b] px-6 py-14 text-center text-[#08251e] sm:px-10 sm:py-16"><div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border-[36px] border-[#08251e]/5" /><ShieldCheck className="mx-auto h-8 w-8" /><h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-[1.03] tracking-[-.045em] sm:text-5xl">Ready to make the next group expense easy?</h2><p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[#08251e]/70 sm:text-base">Create a free group, add your first bill and give everyone a balance they can understand.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#08251e] px-7 py-3.5 text-sm font-bold text-white">Create free account <ArrowRight className="h-4 w-4" /></Link><Link href="/login" className="inline-flex items-center justify-center rounded-full border border-[#08251e]/20 px-7 py-3.5 text-sm font-bold">Sign in</Link></div></div></section>
  );
}

export default function LandingPageRevamp({ articles = [], faqs = [] }) {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <Hero />
      <TrustStrip />
      <ProductTour />
      <LifestyleSection />
      <HowItWorks />
      <DiscoverSection />
      <Articles articles={articles} />
      <Faq faqs={faqs} />
      <FinalCta />
    </main>
  );
}
