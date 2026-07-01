import LandingPageModern from "@/components/home/LandingPageModern";
import { faqPageJsonLd, homeFaqs } from "@/data/homeFaqs";
import { getPublishedArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Money Split - Smart Expense Splitter for Friends, Trips & Roommates",
  description:
    "Money Split helps you split bills and track group expenses clearly. Perfect for trips, roommates, events, and shared living.",
  keywords: [
    "expense splitter",
    "split bills app",
    "group expense tracker",
    "roommate expense app",
    "trip expense manager",
    "money split app",
    "shared expense app",
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

