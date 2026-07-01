import { slugify, splitCsv } from "@/lib/articleUtils";

function cleanList(items, keys) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) =>
      keys.reduce((acc, key) => {
        acc[key] = item?.[key]?.toString?.().trim?.() || "";
        return acc;
      }, {})
    )
    .filter((item) => keys.some((key) => item[key]));
}

export function buildArticlePayload(body, userId, existingArticle = null) {
  const title = body.title?.trim() || "";
  const content = body.content?.trim() || "";
  const slug = slugify(body.slug || title);
  const status = body.status === "published" ? "published" : "draft";
  const wasPublished = existingArticle?.status === "published" && existingArticle?.publishedAt;

  return {
    title,
    slug,
    excerpt: body.excerpt?.trim() || "",
    content,
    category: body.category?.trim() || "Expense Guides",
    tags: Array.isArray(body.tags)
      ? body.tags.map((tag) => tag.trim()).filter(Boolean)
      : splitCsv(body.tags || ""),
    keywords: body.keywords?.trim() || "",
    thumbnail: body.thumbnail?.trim() || "/images/articles/friends-expenses.png",
    authorName: body.authorName?.trim() || "Money Split Editorial Team",
    reviewerName: body.reviewerName?.trim() || "",
    seoTitle: body.seoTitle?.trim() || "",
    seoDescription: body.seoDescription?.trim() || "",
    sources: cleanList(body.sources, ["label", "url"]).filter((source) => source.url),
    faqs: cleanList(body.faqs, ["question", "answer"]).filter((faq) => faq.question && faq.answer),
    status,
    publishedAt: status === "published" ? wasPublished || new Date() : null,
    updatedBy: userId,
    ...(existingArticle ? {} : { createdBy: userId }),
  };
}

export function validateArticlePayload(payload) {
  const errors = {};

  if (payload.title.length < 12) errors.title = "Use a descriptive title with at least 12 characters.";
  if (!payload.slug) errors.slug = "Slug is required.";
  if (payload.excerpt.length < 80) errors.excerpt = "Write an excerpt with at least 80 characters.";
  if (payload.content.length < 650) errors.content = "Article content should be at least 650 characters.";
  if (payload.seoTitle && payload.seoTitle.length > 70) errors.seoTitle = "SEO title should stay under 70 characters.";
  if (payload.seoDescription && payload.seoDescription.length > 170) {
    errors.seoDescription = "SEO description should stay under 170 characters.";
  }

  return errors;
}
