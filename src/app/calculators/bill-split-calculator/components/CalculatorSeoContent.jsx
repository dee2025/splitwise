import { ArrowRight, ChevronDown, Receipt, ShoppingBasket, Plane, Briefcase, PartyPopper } from "lucide-react";
import Link from "next/link";
import { billSplitFaqs } from "../data/billSplitFaqs";

const splitMethods = [
  {
    title: "Equal splitting",
    text: "Best when everyone shared the bill evenly, such as a simple dinner, cab ride or common purchase.",
  },
  {
    title: "Percentage splitting",
    text: "Useful when people agreed on fixed percentages, such as 50/30/20 or income-based contributions.",
  },
  {
    title: "Share-based splitting",
    text: "Use shares when one person should pay two portions, a child should pay half, or a room has different occupancy.",
  },
  {
    title: "Custom amount splitting",
    text: "Choose exact amounts when everyone ordered different items or you already know each person's share.",
  },
];

const useCases = [
  { title: "Restaurant bills", href: "/bill-splitter", icon: Receipt },
  { title: "Roommate groceries", href: "/roommate-bill-splitter", icon: ShoppingBasket },
  { title: "Group trips", href: "/trip-expense-splitter", icon: Plane },
  { title: "Office lunches", href: "/group-expense-tracker", icon: Briefcase },
  { title: "Parties and events", href: "/group-expense-tracker", icon: PartyPopper },
];

export default function CalculatorSeoContent() {
  return (
    <>
      <section className="border-t border-white/6 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400">
                Simple workflow
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
                How to split a bill with MoneySplit
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "Enter the total bill",
                "Add everyone sharing the expense",
                "Choose a split method and view the result",
              ].map((step, index) => (
                <div
                  key={step}
                  className="rounded-2xl border border-white/8 bg-slate-900 p-5"
                >
                  <span className="text-xs font-bold text-indigo-300">
                    0{index + 1}
                  </span>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-100">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/6 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-2xl">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400">
              Fair choices
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
              Choose the fairest way to divide your bill
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {splitMethods.map((method) => (
              <div
                key={method.title}
                className="rounded-2xl border border-white/8 bg-slate-900 p-5"
              >
                <h3 className="text-base font-bold text-slate-100">
                  {method.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {method.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {useCases.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-white/8 bg-slate-900 p-4 transition-colors hover:border-indigo-400/30 hover:bg-slate-800"
                >
                  <Icon className="h-5 w-5 text-indigo-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-100">
                    {item.title}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-indigo-300">
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-white/6 px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400">
              FAQ
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
              Bill Split Calculator questions
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Short answers for common bill splitting scenarios, including GST,
              custom amounts, saving to dashboard and paise rounding.
            </p>
          </div>
          <div className="space-y-3">
            {billSplitFaqs.map((faq, index) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-white/8 bg-slate-900 px-5 py-4 open:border-indigo-400/30"
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="text-sm font-bold text-slate-100">
                    {faq.question}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180 group-open:text-indigo-300" />
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/6 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-5xl">
            Ready to track more than one bill?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-400">
            Create a MoneySplit group, add your friends and keep every shared
            expense organized in one place.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup?redirect=%2Fgroups"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-950/60 transition-colors hover:bg-indigo-500"
            >
              Create a free group
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login?redirect=%2Fgroups"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 px-7 py-3.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/5"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
