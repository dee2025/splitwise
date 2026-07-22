"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Script from "next/script";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  HandCoins,
  Layers3,
  LockKeyhole,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { seoPageList } from "@/data/seoPages";

const FEATURE_CARDS = [
  {
    icon: Users,
    title: "Group ledgers",
    desc: "Keep every trip, home, office lunch, and event in a separate record with members, payments, and balances.",
    accent: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-100",
  },
  {
    icon: HandCoins,
    title: "Fast bill splitting",
    desc: "Add who paid, choose the people included, and Money Split updates the fair share instantly.",
    accent: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
  {
    icon: BarChart3,
    title: "Clear balances",
    desc: "See who owes and who gets paid back without scrolling through chat messages or spreadsheet formulas.",
    accent: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    icon: FileText,
    title: "Readable history",
    desc: "Review every expense, payer, participant, and activity update whenever a group needs clarity.",
    accent: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
];

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
  { title: "Weekend trips", desc: "Hotels, cabs, fuel, food, tickets, and last-minute group spends.", icon: MapPin },
  { title: "Shared homes", desc: "Rent, groceries, repairs, deposits, and utilities with roommates.", icon: Users },
  { title: "Office plans", desc: "Team lunches, birthdays, meetups, and recurring group purchases.", icon: Calendar },
];

const MOCK_EXPENSES = [
  { label: "Villa booking", amount: "Rs. 4,500", payer: "Paid by Deepak", tone: "bg-indigo-50 text-indigo-700" },
  { label: "Groceries", amount: "Rs. 2,800", payer: "Paid by Sarah", tone: "bg-emerald-50 text-emerald-700" },
  { label: "Cafe & snacks", amount: "Rs. 1,260", payer: "Paid by Amit", tone: "bg-amber-50 text-amber-700" },
];

const TRUST_POINTS = [
  "Free to start",
  "Built for groups",
  "Works on mobile",
  "Organized expense records",
];

function SectionIntro({ eyebrow, title, description, align = "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <div className={`mb-4 flex items-center gap-2 ${align === "center" ? "justify-center" : ""}`}>
        <span className="h-px w-6 bg-indigo-300" />
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">
          {eyebrow}
        </span>
      </div>
      <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
      )}
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="relative">
      <div className="rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-slate-500">moneysplit.in</span>
        </div>

        <div className="grid gap-0 lg:grid-cols-[180px_1fr]">
          <aside className="hidden border-r border-slate-200 bg-slate-50 p-4 lg:block">
            <div className="mb-8 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                M
              </div>
              <div>
                <p className="text-sm font-bold text-slate-950">MoneySplit</p>
                <p className="text-[11px] text-slate-500">Group expenses</p>
              </div>
            </div>
            {["Dashboard", "Groups", "Expenses", "Activity"].map((item, index) => (
              <div
                key={item}
                className={`mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                  index === 0 ? "bg-indigo-600 text-white" : "text-slate-600"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? "bg-white" : "bg-slate-300"}`} />
                {item}
              </div>
            ))}
          </aside>

          <div className="p-4 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Active group
                </p>
                <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Goa Trip</h3>
                <p className="mt-1 text-sm text-slate-500">4 members · Rs. 8,560 tracked</p>
              </div>
              <div className="w-fit rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                Rs. 2,140 owed to you
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Total recorded", "Rs. 8,560"],
                ["Active members", "4"],
                ["Open balances", "3"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.13em] text-slate-500">{label}</p>
                  <p className="mt-2 text-xl font-bold text-slate-950">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <p className="text-sm font-bold text-slate-950">Recent expenses</p>
                <span className="text-xs font-semibold text-indigo-700">View all</span>
              </div>
              <div className="divide-y divide-slate-100">
                {MOCK_EXPENSES.map((expense) => (
                  <div key={expense.label} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${expense.tone}`}>
                        <ReceiptText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-950">{expense.label}</p>
                        <p className="truncate text-xs text-slate-500">{expense.payer}</p>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-slate-950">{expense.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 right-5 hidden rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.14)] sm:block">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <p className="text-sm font-bold text-slate-950">Balances updated</p>
        </div>
        <p className="mt-1 text-xs text-slate-500">Everyone sees the same final number.</p>
      </div>
    </div>
  );
}

function TrustBar() {
  return (
    <section className="border-y border-slate-200 bg-white px-5 py-5 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_POINTS.map((point) => (
          <div key={point} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Check className="h-4 w-4 text-emerald-600" />
            {point}
          </div>
        ))}
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="bg-[#f8fafc] px-5 pb-16 pt-16 sm:px-8 sm:pb-20 lg:pt-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
            <Sparkles className="h-4 w-4" />
            Product launch for cleaner shared expenses
          </div>
          <h1 className="text-5xl font-bold leading-[0.98] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Money Split
          </h1>
          <p className="mt-5 max-w-xl text-xl font-semibold leading-8 text-slate-800 sm:text-2xl">
            Split bills, manage group expenses, and settle balances without confusion.
          </p>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            A focused expense sharing app for trips, roommates, events, and everyday group costs. Create a group, add expenses, and keep everyone aligned on who owes whom.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.2)] transition-colors hover:bg-indigo-700"
            >
              Create free account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              Explore features
            </Link>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
            {[
              ["10K+", "active users"],
              ["1M+", "tracked"],
              ["0", "setup cost"],
            ].map(([value, label]) => (
              <div key={label} className="border-l border-slate-200 pl-4">
                <p className="text-2xl font-bold text-slate-950">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <ProductPreview />
      </div>
    </section>
  );
}

function FeatureSection() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro
            eyebrow="Core product"
            title="Designed for the real moments where shared money gets messy."
            description="Money Split keeps the workflow simple enough for casual plans while giving every group a clear record they can return to later."
          />
          <Link
            href="/signup"
            className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
          >
            Start now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FEATURE_CARDS.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]"
              >
                <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-lg border ${feature.bg} ${feature.border}`}>
                  <Icon className={`h-5 w-5 ${feature.accent}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section className="bg-slate-50 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionIntro
          eyebrow="How it works"
          title="From first expense to final settlement in four clear steps."
          description="The homepage now shows the product flow directly, so visitors understand the value before they sign up."
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
                className="relative rounded-lg border border-slate-200 bg-white p-5"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-400">0{index + 1}</span>
                </div>
                <h3 className="text-base font-bold text-slate-950">{step.title}</h3>
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
            title="One app for every shared expense group."
            description="Position Money Split as a polished daily utility, not just a calculator. Each use case links back to the product's main reason to exist: shared clarity."
          />
          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <p className="text-sm font-bold text-slate-950">Private group records</p>
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
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]"
              >
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">{item.title}</h3>
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

function SeoLinksSection() {
  const pages = seoPageList.slice(0, 6);

  return (
    <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Explore Money Split</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Built around the ways people actually split costs.
            </h2>
          </div>
          <Link href="/features" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700">
            Product details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Link
              key={page.slug}
              href={`/${page.slug}`}
              className="group rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <p className="font-bold text-slate-950 group-hover:text-indigo-800">{page.navLabel || page.shortTitle}</p>
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

  return (
    <section className="bg-white px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro
            eyebrow="Expense guides"
            title="Launch with helpful content, not generic marketing copy."
            description="Published guides give visitors practical answers about trip, roommate, family, and group expense management."
          />
          <Link
            href="/articles"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            All articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-5">
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.08)] lg:col-span-3"
          >
            <Link href={`/articles/${featured.slug}`} className="block">
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                <Image
                  src={featured.thumbnail}
                  alt={featured.title}
                  fill
                  sizes="(min-width: 1024px) 672px, 100vw"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute left-4 top-4 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900 backdrop-blur">
                  Featured guide
                </div>
              </div>
              <div className="p-6">
                <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-indigo-700" />
                    {featured.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {featured.readTime} min read
                  </span>
                </div>
                <h3 className="text-2xl font-bold leading-tight text-slate-950 transition-colors group-hover:text-indigo-800">
                  {featured.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{featured.excerpt}</p>
              </div>
            </Link>
          </motion.article>

          <div className="grid gap-4 lg:col-span-2">
            {rest.slice(0, 3).map((article, index) => (
              <motion.article
                key={article.slug}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-200"
              >
                <Link href={`/articles/${article.slug}`} className="grid grid-cols-[88px_1fr] gap-4">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={article.thumbnail}
                      alt={article.title}
                      fill
                      sizes="88px"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="mb-1 truncate text-xs font-bold uppercase tracking-[0.12em] text-indigo-700">
                      {article.category}
                    </p>
                    <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-950 group-hover:text-indigo-800">
                      {article.title}
                    </h3>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(article.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
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
    <section className="bg-slate-50 px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionIntro
            eyebrow="Common questions"
            title="Clear answers before anyone adds the first bill."
            description="Keep the page practical with direct answers for new users and search visitors."
          />
          <Link href="/articles" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-indigo-700">
            Read detailed guides
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="group rounded-lg border border-slate-200 bg-white px-5 py-4 open:border-indigo-200 open:shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                <span className="text-sm font-bold text-slate-950">{faq.question}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180 group-open:text-indigo-700" />
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
      <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-slate-50 px-6 py-12 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)] sm:px-10">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          Start with one group. Keep every split clear.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Money Split is free to start and built for the everyday shared expenses that usually get lost in chat.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
          >
            Create free account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-100"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage({ articles = [], faqs = [] }) {
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
      <Hero />
      <TrustBar />
      <FeatureSection />
      <WorkflowSection />
      <UseCaseSection />
      <SeoLinksSection />
      <ArticlesSection articles={articles} />
      <FaqSection faqs={faqs} />
      <FinalCta />
    </main>
  );
}
