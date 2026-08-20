"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Script from "next/script";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  CirclePlay,
  Layers3,
  LockKeyhole,
  MapPin,
  Receipt,
  ReceiptText,
  ShieldCheck,
  UserPlus,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { seoPageList } from "@/data/seoPages";

const WORKFLOW = [
  {
    icon: Layers3,
    title: "Create the group",
    desc: "Start with a trip, apartment, event, or team ledger.",
  },
  {
    icon: UserPlus,
    title: "Invite members",
    desc: "Bring people into the same shared record quickly.",
  },
  {
    icon: ReceiptText,
    title: "Add expenses",
    desc: "Log payer, amount, and participants in one clean flow.",
  },
  {
    icon: WalletCards,
    title: "Settle clearly",
    desc: "Use live balances to settle up with fewer reminders.",
  },
];

const USE_CASES = [
  { title: "Trip expense splitter", desc: "Track hotels, fuel, taxis, food, tickets, activities, and last-minute travel payments.", icon: MapPin },
  { title: "Roommate bill splitter", desc: "Organize rent, groceries, repairs, deposits, internet, electricity, and monthly utilities.", icon: Users },
  { title: "Friends and office groups", desc: "Split dinners, birthday plans, team lunches, events, and recurring group purchases.", icon: Calendar },
];

const SEARCH_INTENT_LINKS = [
  {
    href: "/bill-splitter",
    title: "Bill splitter for everyday shared payments",
    desc: "Split dinner bills, subscriptions, shopping runs, event costs, and small group purchases without losing the details in chat.",
    icon: Receipt,
  },
  {
    href: "/trip-expense-splitter",
    title: "Trip expense splitter for travel groups",
    desc: "Keep hotels, taxis, fuel, food, tickets, and activity costs in one shared trip ledger from the first payment to the final settlement.",
    icon: MapPin,
  },
  {
    href: "/roommate-expense-splitter",
    title: "Roommate bill splitter for monthly costs",
    desc: "Track rent, electricity, WiFi, groceries, repairs, and deposits so housemates can see who paid and who still owes.",
    icon: Users,
  },
  {
    href: "/splitwise-alternative",
    title: "Simple Splitwise alternative for clear balances",
    desc: "Use a focused group expense tracker when you want clean records, readable balances, and fewer reminders before everyone settles up.",
    icon: WalletCards,
  },
];

const COMPARISON_POINTS = [
  {
    title: "Chats hide the real balance",
    desc: "Payment screenshots and reminders get buried quickly, especially when a trip or apartment group has many small expenses.",
  },
  {
    title: "Spreadsheets need constant cleanup",
    desc: "Manual formulas, duplicate rows, and unclear participants make a simple shared bill harder to explain later.",
  },
  {
    title: "Money Split keeps the record readable",
    desc: "Each group gets a clear expense history, live balances, and a settlement path that everyone can understand.",
  },
];

const SETTLEMENT_EXAMPLES = [
  "Amit paid for dinner, Sarah paid for the taxi, and the group can still see one final balance.",
  "Roommates add monthly electricity, WiFi, and groceries as separate expenses instead of one confusing note.",
  "Travel groups can settle after the trip without recalculating every hotel, fuel, and food payment.",
];

const HERO_CHECKS = [
  { icon: Users, title: "No spreadsheets" },
  { icon: ReceiptText, title: "Clear balances" },
  { icon: Zap, title: "Fast settlement" },
];

const PROCESS_STEPS = [
  {
    icon: Layers3,
    title: "Create a shared group",
    desc: "Trips, roommates, office lunches, and event plans each get their own clean ledger.",
    metric: "01",
  },
  {
    icon: ReceiptText,
    title: "Add bills as they happen",
    desc: "Choose the payer, amount, and people included so the split stays accurate.",
    metric: "02",
  },
  {
    icon: WalletCards,
    title: "Settle with confidence",
    desc: "Money Split shows who pays whom next, with a readable record behind every balance.",
    metric: "03",
  },
];

function SectionIntro({ eyebrow, title, description, align = "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <div className={`mb-4 flex items-center gap-2 ${align === "center" ? "justify-center" : ""}`}>
        <span className="h-px w-6 bg-emerald-300" />
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          {eyebrow}
        </span>
      </div>
      <h2 className="text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
      )}
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[700px] lg:mr-0">
      <div className="absolute -right-2 top-4 hidden h-16 w-16 border-t-2 border-emerald-600 sm:block" />
      <div className="absolute right-4 top-8 hidden h-10 w-20 rounded-[50%] border-t-2 border-emerald-600 sm:block" />
      <div className="absolute -right-5 top-24 hidden h-28 w-20 bg-[radial-gradient(circle,#cbd5d0_1.5px,transparent_1.5px)] [background-size:10px_10px] opacity-60 sm:block" />
      <div className="absolute inset-x-8 bottom-0 -z-10 h-24 rounded-lg bg-emerald-100/80 blur-2xl" />
      <div className="relative flex justify-center">
        <Image
          src="/hero-banner.png"
          alt="MoneySplit app showing trip expense balances and settlement"
          width={650}
          height={520}
          priority
          sizes="(min-width: 1024px) 560px, 92vw"
          className="h-auto max-h-[440px] w-full object-contain sm:max-h-[470px] lg:max-h-[455px]"
        />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#fbfdfb] px-5 pb-12 pt-12 text-slate-950 sm:px-8 sm:pb-14 sm:pt-16 lg:pb-16 lg:pt-16">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,#ffffff_0%,#fbfdfb_46%,#eef8f4_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-emerald-100 to-transparent" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="max-w-[560px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 shadow-sm">
            <Users className="h-4 w-4" />
            Built for shared bills, not messy chats
          </div>
          <h1 className="text-5xl font-semibold leading-[1.04] tracking-tight text-slate-950 sm:text-6xl lg:text-[64px]">
            Shared expenses.
            <span className="block text-emerald-600">Zero confusion.</span>
          </h1>
          <p className="mt-6 max-w-[470px] text-base leading-7 text-slate-600 sm:text-lg">
            Split bills, track payments, and settle up so you can focus on what matters, not who owes what.
          </p>

          <div className="mt-8 grid max-w-[430px] grid-cols-3 gap-4 sm:gap-6">
            {HERO_CHECKS.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`min-w-0 ${index > 0 ? "border-l border-slate-200 pl-4 sm:pl-6" : ""}`}
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium leading-5 text-slate-600">{item.title}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(5,150,105,0.22)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              Start splitting free
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50"
            >
              <CirclePlay className="h-4 w-4" />
              See how it works
            </Link>
          </div>

          <div className="mt-7 flex items-center gap-2 text-sm text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-600 text-white">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            Your data is secure and private
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}
function FeatureSection() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <SectionIntro
            eyebrow="Product flow"
            title="A cleaner way to move from spending to settling."
            description="The landing page now shows the real job Money Split performs: create a shared record, add the bills, then close the loop with a suggested settlement."
          />

          <div className="mt-10 space-y-4">
            {PROCESS_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="group grid grid-cols-[48px_1fr] gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)] transition-colors hover:border-emerald-200 hover:bg-[#fbfffc]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white transition-colors group-hover:bg-emerald-900">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-base font-semibold text-slate-950">{step.title}</h3>
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                        {step.metric}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-lg border border-slate-200 bg-[#f8faf8] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
            <div className="rounded-lg bg-slate-950 p-5 text-white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-300">Today in Goa Trip</p>
                  <h3 className="mt-2 text-2xl font-semibold">Dinner added. Balances updated.</h3>
                </div>
                <div className="rounded-lg bg-white/10 px-4 py-3">
                  <p className="text-xs text-slate-300">Group total</p>
                  <p className="mt-1 text-xl font-semibold">INR 8,560</p>
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between text-xs font-medium text-slate-300">
                  <span>Create group</span>
                  <span>Add expense</span>
                  <span>Settle</span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-emerald-400"
                    animate={{ width: ["0%", "45%", "74%", "100%"] }}
                    transition={{ duration: 4.8, repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 pt-4 md:grid-cols-3">
              {[
                { label: "Paid by", value: "Amit", icon: Users },
                { label: "Split across", value: "4 members", icon: ReceiptText },
                { label: "Suggested next", value: "Sarah -> Amit", icon: WalletCards },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    className="rounded-lg border border-slate-200 bg-white p-4"
                    animate={{ y: [0, index === 1 ? -6 : -3, 0] }}
                    transition={{ duration: 3.8, repeat: Infinity, delay: index * 0.35, ease: "easeInOut" }}
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
                    <p className="mt-2 text-base font-semibold text-slate-950">{item.value}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div
            className="absolute -bottom-5 left-5 hidden rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-[0_14px_34px_rgba(15,23,42,0.10)] sm:block"
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            No one has to recalculate the split.
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section className="bg-[#f5fbfa] px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionIntro
          eyebrow="How it works"
          title="From first expense to final settlement in four clear steps."
          description={
            <>
              Visitors can understand the full workflow immediately: {' '}
              <Link href="/group-expense-tracker">create a group</Link>{' '}, {' '}
              <Link href="/features">invite people</Link>{' '}, {' '}
              <Link href="/bill-splitter">add expenses</Link>{' '}, and {' '}
              <Link href="/features">review the balance</Link>
              before paying back.
            </>
          }
          align="center"
        />

        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {WORKFLOW.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="relative rounded-lg border border-emerald-100 bg-white/90 p-5 shadow-[0_12px_35px_rgba(16,185,129,0.08)]"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-emerald-700">0{index + 1}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function UseCaseSection() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <SectionIntro
            eyebrow="Use cases"
            title="One expense splitter for the situations people search for most."
            description={
              <>
                Use Money Split when a simple calculator is not enough and your group needs a{' '}
                <Link href="/group-expense-tracker">shared record</Link>
                everyone can check later.
              </>
            }
          />
          <div className="mt-8 rounded-lg border border-emerald-100 bg-emerald-50/70 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <p className="text-sm font-semibold text-slate-950">Private group records</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Expense details stay organized around the people and groups they belong to, which keeps settlements easier to explain.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {USE_CASES.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4 }}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)] transition-colors hover:border-emerald-200 hover:bg-emerald-50/30"
              >
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SearchIntentSection() {
  return (
    <section className="bg-[#fbfdfc] px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
        <div>
          <SectionIntro
            eyebrow="Shared expense needs"
            title="Helpful pages for the exact bill-splitting problems people search for."
            description="Money Split is built around real group expense questions: how to split rent fairly, how to manage trip costs, how to track who paid, and how to settle without awkward follow-ups."
          />

          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-semibold text-slate-950">What a shared expense tracker should answer</p>
            <div className="mt-4 space-y-3">
              {SETTLEMENT_EXAMPLES.map((example) => (
                <div key={example} className="flex gap-3 text-sm leading-6 text-slate-600">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{example}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {SEARCH_INTENT_LINKS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className="group flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-[0_18px_44px_rgba(15,23,42,0.07)]"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold leading-6 text-slate-950 group-hover:text-emerald-800">
                    {item.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{item.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <SectionIntro
            eyebrow="Why Money Split"
            title="Better than messy chats, screenshots, and shared spreadsheets."
            description="A dedicated bill splitter gives every payment a place, every member a balance, and every settlement a clear reason."
          />

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            {COMPARISON_POINTS.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="rounded-lg border border-slate-200 bg-[#fbfdfc] p-5"
              >
                <span className="mb-5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="text-base font-semibold text-slate-950">{point.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{point.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-emerald-100 bg-emerald-50/60 p-5 sm:p-6">
          <p className="max-w-4xl text-sm leading-7 text-slate-700">
            For Google search visitors, the homepage now explains the core product in plain language: Money Split is a free bill splitter,
            group expense tracker, trip expense splitter, roommate bill splitter, and simple settle-up app for shared balances.
          </p>
        </div>
      </div>
    </section>
  );
}

function SeoLinksSection() {
  const pages = seoPageList.slice(0, 6);

  return (
    <section className="border-y border-emerald-100 bg-[#f8fcfb] px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Explore Money Split</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Built around the searches that matter: bill splitter, trip expenses, roommate bills, and shared balances.
            </h2>
          </div>
          <Link href="/features" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
            Product details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Link
              key={page.slug}
              href={`/${page.slug}`}
              className="group rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
            >
              <p className="font-semibold text-slate-950 group-hover:text-emerald-800">{page.navLabel || page.shortTitle}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{page.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArticlesSection({ articles }) {
  if (!articles.length) return null;

  const [featured, ...rest] = articles;
  const sideArticles = rest.slice(0, 2);

  return (
    <section className="bg-[#fbfdfc] px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-700" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Expense guides
              </span>
            </div>
            <h2 className="text-4xl font-semibold leading-[1.06] tracking-tight text-slate-950 sm:text-5xl lg:text-[56px]">
              Helpful guides for smarter{" "}
              <span className="text-emerald-600">shared expenses.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Practical, easy-to-follow articles to help you split expenses fairly,
              avoid awkward conversations, and keep every group on track.
            </p>
          </div>
          <Link
            href="/articles"
            className="inline-flex w-fit items-center justify-center gap-3 rounded-lg border border-emerald-200 bg-white px-6 py-4 text-sm font-semibold text-slate-950 shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50"
          >
            All articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_24px_60px_rgba(15,23,42,0.09)]"
          >
            <Link href={`/articles/${featured.slug}`} className="block">
              <div className="relative aspect-[1.78] overflow-hidden bg-slate-100">
                <Image
                  src={featured.thumbnail}
                  alt={featured.title}
                  fill
                  sizes="(min-width: 1024px) 720px, 100vw"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-[0_12px_28px_rgba(15,23,42,0.10)] backdrop-blur">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-50">
                    <BookOpen className="h-3.5 w-3.5" />
                  </span>
                  Featured guide
                </div>
              </div>
              <div className="p-6 sm:p-7">
                <div className="mb-4 flex flex-wrap items-center gap-5 text-xs font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
                    Expense guides
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {featured.readTime} min read
                  </span>
                </div>
                <h3 className="text-2xl font-semibold leading-tight text-slate-950 transition-colors group-hover:text-emerald-800 sm:text-3xl">
                  {featured.title}
                </h3>
                <p className="mt-4 line-clamp-3 text-base leading-7 text-slate-600">{featured.excerpt}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  Read full guide
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </motion.article>

          <div className="grid gap-5">
            {sideArticles.map((article, index) => (
              <motion.article
                key={article.slug}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group rounded-lg border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_20px_48px_rgba(15,23,42,0.08)]"
              >
                <Link href={`/articles/${article.slug}`} className="grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={article.thumbnail}
                      alt={article.title}
                      fill
                      sizes="180px"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-800 shadow-[0_12px_26px_rgba(15,23,42,0.14)]">
                      {index === 0 ? <Users className="h-5 w-5" /> : <ReceiptText className="h-5 w-5" />}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                      Expense guides
                    </p>
                    <h3 className="line-clamp-3 text-lg font-semibold leading-6 text-slate-950 transition-colors group-hover:text-emerald-800">
                      {article.title}
                    </h3>
                    <div className="mt-5 grid gap-2 text-sm text-slate-500 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div className="space-y-2">
                        <p className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {article.readTime} min read
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(article.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-700">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection({ faqs }) {
  return (
    <section className="bg-[#f5fbfa] px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionIntro
            eyebrow="Common questions"
            title="Clear answers before anyone adds the first bill."
            description={
              <>
                Direct answers help new users {' '}
                <Link href="/features">understand the product</Link>
                and give search visitors the information they came for.
              </>
            }
          />
          <Link href="/articles" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
            Read detailed guides
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="group rounded-lg border border-slate-200 bg-white px-5 py-4 open:border-emerald-200 open:shadow-[0_10px_30px_rgba(16,185,129,0.08)]"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                <span className="text-sm font-semibold text-slate-950">{faq.question}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180 group-open:text-emerald-700" />
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-4xl rounded-lg border border-emerald-100 bg-[linear-gradient(135deg,#f7fffc_0%,#eef8ff_100%)] px-6 py-12 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)] sm:px-10">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Start with one group. Keep every split clear.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Money Split is{' '}
          <Link href="/features">free to start</Link>
          and built for the{' '}
          <Link href="/bill-splitter">everyday shared expenses</Link>
          that usually{' '}
          <Link href="/articles">get lost in chat</Link>
          .
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Create free account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage({ articles = [], faqs = [] }) {
  const articleListJsonLd = articles.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Money Split expense guides",
        itemListElement: articles.map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `https://www.moneysplit.in/articles/${article.slug}`,
          item: {
            "@type": "Article",
            headline: article.title,
            description: article.excerpt,
            image: article.thumbnail?.startsWith("http")
              ? article.thumbnail
              : `https://www.moneysplit.in${article.thumbnail}`,
            datePublished: article.date,
            author: {
              "@type": "Organization",
              name: "Money Split",
            },
          },
        })),
      }
    : null;

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <Script
        id="home-software-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Money Split",
            description: "Easy expense splitter and bill tracker app for groups, trips, and roommates",
            url: "https://www.moneysplit.in",
            applicationCategory: "FinanceApplication",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "INR",
            },
            operatingSystem: "Web",
            isAccessibleForFree: true,
            featureList: [
              "Create shared expense groups",
              "Split bills across members",
              "Track balances and expense history",
              "Manage trip and roommate expenses",
            ],
          }),
        }}
      />
      {articleListJsonLd && (
        <Script
          id="home-article-list-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleListJsonLd) }}
        />
      )}
      <Hero />
      <FeatureSection />
      <WorkflowSection />
      <UseCaseSection />
      <SearchIntentSection />
      <ComparisonSection />
      <SeoLinksSection />
      <ArticlesSection articles={articles} />
      <FaqSection faqs={faqs} />
      <FinalCta />
    </main>
  );
}
