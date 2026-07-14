import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import BillSplitCalculator from "./components/BillSplitCalculator";
import CalculatorSeoContent from "./components/CalculatorSeoContent";
import { billSplitFaqs, faqPageJsonLd } from "./data/billSplitFaqs";

const PAGE_URL = "https://www.moneysplit.in/calculators/bill-split-calculator";

export const metadata = {
  title: "Free Bill Split Calculator – Divide Bills Fairly | MoneySplit",
  description:
    "Use MoneySplit's free Bill Split Calculator to divide restaurant bills, rent, groceries, trips and group expenses equally or by percentage, shares and custom amounts.",
  keywords: [
    "bill split calculator",
    "split bill calculator",
    "bill splitter",
    "divide bill among friends",
    "restaurant bill split calculator",
    "expense split calculator",
    "split bills online",
    "bill split calculator India",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "website",
    siteName: "Money Split",
    title: "Free Bill Split Calculator – Divide Bills Fairly | MoneySplit",
    description:
      "Split restaurant bills, trips, groceries and group expenses equally or by percentage, shares and custom amounts.",
    url: PAGE_URL,
    images: [
      {
        url: "https://www.moneysplit.in/dashboard.png",
        width: 1894,
        height: 925,
        alt: "MoneySplit bill split calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Bill Split Calculator – MoneySplit",
    description:
      "Divide bills fairly by equal split, percentage, shares or custom amounts.",
    images: ["https://www.moneysplit.in/dashboard.png"],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://www.moneysplit.in",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Calculators",
      item: "https://www.moneysplit.in/calculators",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Bill Split Calculator",
      item: PAGE_URL,
    },
  ],
};

const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "MoneySplit Bill Split Calculator",
  url: PAGE_URL,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  brand: {
    "@id": "https://www.moneysplit.in/#organization",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
};

export default function BillSplitCalculatorPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(billSplitFaqs)) }}
      />

      <div className="px-5 pb-4 pt-6 sm:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mx-auto max-w-6xl text-sm text-slate-500"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition-colors hover:text-slate-300">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span>Calculators</span>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-slate-300" aria-current="page">
              Bill Split Calculator
            </li>
          </ol>
        </nav>
      </div>

      <section className="relative overflow-hidden px-5 pb-8 pt-6 sm:px-8">
        <div className="absolute left-1/2 top-0 -z-10 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-indigo-200">
              Free Bill Split Calculator
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl lg:text-6xl">
              Split Any Bill Fairly in Seconds
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Enter the bill amount, add your friends and choose how you want to
              divide the cost. MoneySplit calculates everyone&apos;s share
              instantly—no signup required.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Free to use", "No signup required", "Instant calculation"].map(
                (item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <BillSplitCalculator />
      <CalculatorSeoContent />
    </main>
  );
}
