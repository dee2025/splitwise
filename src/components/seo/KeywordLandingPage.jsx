import { ArrowRight, CheckCircle, Receipt, Users } from "lucide-react";
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

export default function KeywordLandingPage({ page }) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd(page)) }}
      />

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <div className="mb-5 flex items-center gap-2">
              <span className="h-px w-5 bg-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400">
                {page.heroLabel}
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-100 sm:text-5xl lg:text-6xl">
              {page.h1}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              {page.intro}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/60 transition-colors hover:bg-indigo-500"
              >
                {page.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={page.slug === "trip-expense-splitter" ? "/articles/planning-a-trip-with-friends-budget-tips" : page.slug === "roommate-bill-splitter" ? "/articles/managing-group-expenses-for-shared-living" : "/features"}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                {page.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-slate-900 p-4 shadow-2xl shadow-black/30">
            <div className="rounded-xl border border-white/8 bg-slate-800 p-4">
              <div className="mb-4 flex items-center justify-between border-b border-white/8 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                    <Receipt className="h-5 w-5 text-indigo-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-100">{page.shortTitle}</p>
                    <p className="text-xs text-slate-500">4 members joined</p>
                  </div>
                </div>
                <span className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                  Active
                </span>
              </div>

              <div className="space-y-3">
                {["Shared dinner", "Transport", "Groceries"].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-xl border border-white/6 bg-slate-900/70 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                        <Users className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{item}</p>
                        <p className="text-xs text-slate-500">Split across group</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-100">Rs {["1,240", "860", "2,100"][index]}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                  Balance summary
                </p>
                <p className="mt-2 text-2xl font-bold text-white">Clear group records</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Everyone can review payments, members and balances before settling up.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/6 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
                Built for real shared expenses
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-400">
                These are the common situations people search for when they need a bill splitter or group expense tracker.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {page.useCases.map((item) => (
                <div key={item} className="rounded-xl border border-white/8 bg-slate-900 p-4">
                  <CheckCircle className="mb-3 h-5 w-5 text-emerald-300" />
                  <p className="text-sm font-semibold leading-6 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/6 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 md:grid-cols-3">
            {page.benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-xl border border-white/8 bg-slate-900 p-6">
                <h2 className="text-lg font-bold text-slate-100">{benefit.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/6 px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-100">Common questions</h2>
            <p className="mt-4 leading-7 text-slate-400">
              Quick answers for people comparing expense splitting tools before they create a group.
            </p>
          </div>
          <div className="space-y-3">
            {page.faqs.map((faq, index) => (
              <details
                key={faq.question}
                open={index === 0}
                className="rounded-xl border border-white/8 bg-slate-900 px-5 py-4"
              >
                <summary className="cursor-pointer text-sm font-bold text-slate-100">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-400">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
