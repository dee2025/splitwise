import { articles as staticArticles } from "@/data/articles";
import { connectDB } from "@/lib/db";
import { normalizeArticle } from "@/lib/articleUtils";
import Article from "@/models/Article";

const normalizedStaticArticles = staticArticles.map((article) =>
  normalizeArticle({
    ...article,
    status: "published",
    publishedAt: article.date,
    authorName: "Money Split Editorial Team",
  })
);

export async function getPublishedArticles() {
  try {
    await connectDB();
    const dbArticles = await Article.find({ status: "published" })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    if (dbArticles.length > 0) {
      return dbArticles.map(normalizeArticle);
    }
  } catch (error) {
    console.warn("Falling back to static articles:", error?.message || error);
  }

  return normalizedStaticArticles;
}

export async function getPublishedArticleBySlug(slug) {
  try {
    await connectDB();
    const dbArticle = await Article.findOne({ slug, status: "published" }).lean();
    if (dbArticle) return normalizeArticle(dbArticle);
  } catch (error) {
    console.warn("Falling back to static article:", error?.message || error);
  }

  return normalizedStaticArticles.find((article) => article.slug === slug) || null;
}
