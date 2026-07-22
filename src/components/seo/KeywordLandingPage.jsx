import { ArrowRight, CheckCircle, ChevronDown, Receipt, Users } from "lucide-react";
import Link from "next/link";

function pageJsonLd(page) {
  const url = `https://www.moneysplit.in/${page.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        isPartOf: {
          "@id": "https://www.moneysplit.in/#website",
        },
        inLanguage: "en-IN",
        breadcrumb: {
          "@id": `${url}#breadcrumb`,
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${url}#software`,
        name: "Money Split",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        url: "https://www.moneysplit.in",
        description: page.description,
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        featureList: page.benefits.map((benefit) => benefit.title),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
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
            name: page.shortTitle,
            item: url,
          },
        ],
      },
    ],
  };
}

export function keywordPageMetadata(page) {
  const url = `https://www.moneysplit.in/${page.slug}`;

  return {
    title: `${page.title} | Money Split`,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      type: "website",
      images: [
        {
          url: "https://www.moneysplit.in/logo.png",
          width: 1024,
          height: 1024,
          alt: "MoneySplit logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: ["https://www.moneysplit.in/logo.png"],
    },
  };
}

function PreviewCard({ page }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
              <Receipt className="h-5 w-5 text-indigo-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950">{page.shortTitle}</p>
              <p className="text-xs text-slate-500">4 members joined</p>
            </div>
          </div>
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            Active
          </span>
        </div>

        <div className="space-y-3">
          {["Shared dinner", "Transport", "Groceries"].map((item, index) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <Users className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item}</p>
                  <p className="text-xs text-slate-500">Split across group</p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-950">Rs {["1,240", "860", "2,100"][index]}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
            Balance summary
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">Clear group records</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Everyone can review payments, members, and balances before settling up.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function KeywordLandingPage({ page }) {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd(page)) }}
      />

      <section className="bg-slate-50 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <div className="mb-5 flex items-center gap-2">
              <span className="h-px w-6 bg-indigo-300" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
                {page.heroLabel}
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {page.h1}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              {page.intro}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.2)] transition-colors hover:bg-indigo-700"
              >
                {page.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={page.slug === "trip-expense-splitter" ? "/articles/planning-a-trip-with-friends-budget-tips" : page.slug === "roommate-bill-splitter" ? "/articles/managing-group-expenses-for-shared-living" : "/features"}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                {page.secondaryCta}
              </Link>
            </div>
          </div>

          <PreviewCard page={page} />
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Built for real shared expenses
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-600">
                These are the common situations people search for when they need a bill splitter or group expense tracker.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {page.useCases.map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                  <CheckCircle className="mb-3 h-5 w-5 text-emerald-600" />
                  <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 md:grid-cols-3">
            {page.benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-slate-950">{benefit.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">Common questions</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Quick answers for people comparing expense splitting tools before they create a group.
            </p>
          </div>
          <div className="space-y-3">
            {page.faqs.map((faq, index) => (
              <details
                key={faq.question}
                open={index === 0}
                className="group rounded-lg border border-slate-200 bg-white px-5 py-4 open:border-indigo-200 open:shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-slate-950">
                  {faq.question}
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180 group-open:text-indigo-700" />
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
