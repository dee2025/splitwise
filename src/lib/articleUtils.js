export function slugify(value = "") {
  return value
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function splitCsv(value = "") {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function estimateReadTime(content = "") {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function wordCount(content = "") {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

function absoluteUrl(path = "", siteUrl = "https://www.moneysplit.in") {
  if (!path) return siteUrl;
  return path.startsWith("http") ? path : `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function normalizeArticle(article) {
  const plain = typeof article?.toObject === "function" ? article.toObject() : article;
  if (!plain) return null;

  const date = plain.publishedAt || plain.date || plain.createdAt || new Date();
  const content = plain.content || "";
  const tags = Array.isArray(plain.tags) ? plain.tags : splitCsv(plain.keywords || "");

  return {
    id: plain._id?.toString?.() || plain.id || plain.slug,
    slug: plain.slug,
    title: plain.title,
    excerpt: plain.excerpt,
    date: date instanceof Date ? date.toISOString() : date,
    readTime: plain.readTime || estimateReadTime(content),
    thumbnail: plain.thumbnail || "/images/articles/friends-expenses.png",
    category: plain.category || "Expense Guides",
    content,
    wordCount: plain.wordCount || wordCount(content),
    keywords: plain.keywords || tags.join(", "),
    tags,
    authorName: plain.authorName || "Money Split Editorial Team",
    reviewerName: plain.reviewerName || "",
    seoTitle: plain.seoTitle || plain.title,
    seoDescription: plain.seoDescription || plain.excerpt,
    sources: Array.isArray(plain.sources) ? plain.sources.filter((source) => source.label || source.url) : [],
    faqs: Array.isArray(plain.faqs) ? plain.faqs.filter((faq) => faq.question && faq.answer) : [],
    status: plain.status || "published",
    views: Number.isFinite(plain.views) ? plain.views : 0,
    updatedAt: plain.updatedAt ? plain.updatedAt.toISOString?.() || plain.updatedAt : date,
  };
}

export function articleToJsonLd(article, siteUrl = "https://www.moneysplit.in") {
  const url = `${siteUrl}/articles/${article.slug}`;
  const image = absoluteUrl(article.thumbnail || "/images/articles/friends-expenses.png", siteUrl);
  const articleId = `${url}#article`;
  const webpageId = `${url}#webpage`;
  const organizationId = `${siteUrl}/#organization`;

  const graph = [
    {
      "@type": ["Article", "BlogPosting"],
      "@id": articleId,
      headline: article.title,
      description: article.excerpt,
      url,
      image: {
        "@type": "ImageObject",
        url: image,
      },
      thumbnailUrl: image,
      datePublished: article.date,
      dateModified: article.updatedAt || article.date,
      author: {
        "@type": "Organization",
        name: article.authorName || "Money Split Editorial Team",
        url: siteUrl,
      },
      publisher: {
        "@id": organizationId,
      },
      mainEntityOfPage: {
        "@id": webpageId,
      },
      articleSection: article.category,
      keywords: article.keywords,
      wordCount: article.wordCount || wordCount(article.content),
      timeRequired: `PT${article.readTime || estimateReadTime(article.content)}M`,
      isAccessibleForFree: true,
      inLanguage: "en-IN",
      about: [
        {
          "@type": "Thing",
          name: article.category,
        },
      ],
      ...(article.sources?.length
        ? {
            citation: article.sources
              .filter((source) => source.url)
              .map((source) => ({
                "@type": "CreativeWork",
                name: source.label || source.url,
                url: source.url,
              })),
          }
        : {}),
      ...(article.reviewerName
        ? {
            reviewedBy: {
              "@type": "Organization",
              name: article.reviewerName,
            },
          }
        : {}),
    },
    {
      "@type": "WebPage",
      "@id": webpageId,
      url,
      name: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt,
      isPartOf: {
        "@id": `${siteUrl}/#website`,
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: image,
      },
      datePublished: article.date,
      dateModified: article.updatedAt || article.date,
      breadcrumb: {
        "@id": `${url}#breadcrumb`,
      },
      inLanguage: "en-IN",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Articles",
          item: `${siteUrl}/articles`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: article.title,
          item: url,
        },
      ],
    },
  ];

  if (article.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: article.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function articlesIndexJsonLd(articles = [], siteUrl = "https://www.moneysplit.in") {
  const articlesUrl = `${siteUrl}/articles`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${articlesUrl}#webpage`,
        url: articlesUrl,
        name: "Money Split Articles",
        description: "Guides on splitting bills, managing group expenses, and planning shared costs.",
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        inLanguage: "en-IN",
        mainEntity: {
          "@id": `${articlesUrl}#itemlist`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${articlesUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Articles",
            item: articlesUrl,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${articlesUrl}#itemlist`,
        itemListElement: articles.map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${articlesUrl}/${article.slug}`,
          name: article.title,
        })),
      },
    ],
  };
}
