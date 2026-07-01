import LandingPageModern from "@/components/home/LandingPageModern";
import { faqPageJsonLd, homeFaqs } from "@/data/homeFaqs";
import { getPublishedArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Money Split - Free Bill Splitter & Group Expense Tracker",
  description:
    "Split bills, track group expenses, and manage shared balances for friends, trips, roommates, events, and family plans with Money Split.",
  keywords: [
    "bill splitter",
    "free bill splitter",
    "expense splitter",
    "split bills app",
    "group expense tracker",
    "shared expense tracker",
    "splitwise alternative",
    "roommate expense app",
    "trip expense splitter",
    "money split app",
  ],
  alternates: {
    canonical: "https://www.moneysplit.in",
  },
};

export default async function HomePage() {
  const articles = await getPublishedArticles();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(homeFaqs)) }}
      />
      <LandingPageModern articles={articles.slice(0, 4)} faqs={homeFaqs} />
    </>
  );
}

