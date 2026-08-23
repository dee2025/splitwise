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

function mergeArticles(dbArticles = []) {
  const merged = new Map();

  dbArticles.map(normalizeArticle).forEach((article) => {
    if (article?.slug) merged.set(article.slug, article);
  });

  normalizedStaticArticles.forEach((article) => {
    if (!merged.has(article.slug)) merged.set(article.slug, article);
  });

  return Array.from(merged.values()).sort((a, b) => {
    const aTime = new Date(a.date || a.updatedAt || 0).getTime();
    const bTime = new Date(b.date || b.updatedAt || 0).getTime();
    return bTime - aTime;
  });
}

function withTimeout(promise, timeoutMs, label) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

async function findPublishedArticlesFromDb() {
  await connectDB();
  return Article.find({ status: "published" })
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean();
}

async function findPublishedArticleBySlugFromDb(slug) {
  await connectDB();
  return Article.findOne({ slug, status: "published" }).lean();
}

export async function getPublishedArticles() {
  try {
    const dbArticles = await withTimeout(
      findPublishedArticlesFromDb(),
      8000,
      "Published article lookup",
    );
     
    if (dbArticles.length > 0) {
      return mergeArticles(dbArticles);
    }
  } catch (error) {
    console.warn("Falling back to static articles:", error?.message || error);
  }

  return normalizedStaticArticles;
}

export async function getPublishedArticleBySlug(slug) {
  try {
    const dbArticle = await withTimeout(
      findPublishedArticleBySlugFromDb(slug),
      8000,
      "Published article lookup",
    );
    if (dbArticle) return normalizeArticle(dbArticle);
  } catch (error) {
    console.warn("Falling back to static article:", error?.message || error);
  }

  return normalizedStaticArticles.find((article) => article.slug === slug) || null;
}

export async function incrementPublishedArticleView(slug) {
  try {
    await connectDB();
    const dbArticle = await Article.findOneAndUpdate(
      { slug, status: "published" },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (dbArticle) return normalizeArticle(dbArticle);
  } catch (error) {
    console.warn("Unable to increment article view:", error?.message || error);
  }

  return normalizedStaticArticles.find((article) => article.slug === slug) || null;
}
