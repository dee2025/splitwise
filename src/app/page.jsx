import LandingPageModern from "@/components/home/LandingPageModern";
import { faqPageJsonLd, homeFaqs } from "@/data/homeFaqs";
import { getPublishedArticles } from "@/lib/articles";

export const revalidate = 3600;

export const metadata = {
  title: "Money Split - Free Bill Splitter & Group Expense Tracker",
  description:
    "Use Money Split to split bills, track group expenses, manage trip costs, organize roommate bills, and settle shared balances with friends clearly.",
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
};

export default async function HomePage() {
  const articles = await getPublishedArticles();

  return (
    <>
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
      <LandingPageModern articles={articles.slice(0, 4)} faqs={homeFaqs} />
    </>
  );
}
