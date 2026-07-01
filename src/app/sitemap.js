import { getPublishedArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.moneysplit.in";

const staticRoutes = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/features", priority: 0.8, changeFrequency: "monthly" },
  { path: "/articles", priority: 0.85, changeFrequency: "daily" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.5, changeFrequency: "yearly" },
  { path: "/terms-of-service", priority: 0.5, changeFrequency: "yearly" },
  { path: "/cookie-policy", priority: 0.4, changeFrequency: "yearly" },
  { path: "/disclaimer", priority: 0.4, changeFrequency: "yearly" },
];

export default async function sitemap() {
  const now = new Date();
  const articles = await getPublishedArticles();

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...articles.map((article) => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: new Date(article.updatedAt || article.date || now),
      changeFrequency: "weekly",
      priority: 0.75,
    })),
  ];
}
