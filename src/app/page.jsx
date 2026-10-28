import LandingPageRevamp from "@/components/home/LandingPageRevamp";
import { faqPageJsonLd, homeFaqs } from "@/data/homeFaqs";
import { getPublishedArticles } from "@/lib/articles";

export const revalidate = 3600;

export const metadata = {
  title: "Free Bill Splitter & Group Expense Tracker | Money Split",
  description:
    "Split bills with friends for free. Track group expenses, trip costs and roommate bills, calculate who owes whom, and settle shared balances with Money Split.",
  keywords: [
    "bill splitter",
    "free bill splitter",
    "bill split calculator",
    "expense splitter",
    "split bills app",
    "group expense tracker",
    "shared expense tracker",
    "settle up app",
    "splitwise alternative",
    "roommate expense app",
    "roommate bill splitter",
    "trip expense splitter",
    "split expenses with friends",
    "money split app",
  ],
  alternates: {
    canonical: "https://www.moneysplit.in",
  },
  openGraph: {
    title: "Free Bill Splitter & Group Expense Tracker | Money Split",
    description: "Split bills, track shared expenses and settle group balances without spreadsheets or awkward reminders.",
    url: "https://www.moneysplit.in",
    images: [{ url: "/hero-banner.png", width: 1536, height: 1024, alt: "Money Split group expense tracker" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Bill Splitter & Group Expense Tracker | Money Split",
    description: "Split bills with friends, roommates and travel groups for free.",
    images: ["/hero-banner.png"],
  },
};

export default async function HomePage() {
  const articles = await getPublishedArticles();
  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Money Split",
    alternateName: "MoneySplit",
    description:
      "Free bill splitter and group expense tracker for friends, trips and roommates.",
    url: "https://www.moneysplit.in",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    featureList: [
      "Split bills with friends",
      "Track group expenses",
      "Manage trip expenses",
      "Split roommate bills",
      "Calculate shared balances",
      "Record settlements",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(homeFaqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://www.moneysplit.in"
            }
          ]
        }) }}
      />
      <LandingPageRevamp articles={articles.slice(0, 3)} faqs={homeFaqs} />
    </>
  );
}
