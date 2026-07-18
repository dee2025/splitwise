import { articleToJsonLd } from "@/lib/articleUtils";
import { getPublishedArticleBySlug, getPublishedArticles, incrementPublishedArticleView } from "@/lib/articles";
import { ArrowLeft, Calendar, Clock, ExternalLink, Tag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderMarkdown(content) {
  const elements = [];
  let listItems = [];
  let listType = null;

  const flushList = () => {
    if (!listItems.length) return;
    const ListTag = listType === "ol" ? "ol" : "ul";
    elements.push(
      <ListTag
        key={`list-${elements.length}`}
        className={`${listType === "ol" ? "list-decimal" : "list-disc"} ml-6 mb-7 space-y-2 text-slate-300`}
      >
        {listItems.map((item, index) => (
          <li key={index} className="leading-relaxed">
            {renderInline(item)}
          </li>
        ))}
      </ListTag>
    );
    listItems = [];
    listType = null;
  };

  content.split("\n").forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      return;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.+)/);
    if (orderedMatch) {
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      listItems.push(orderedMatch[1]);
      return;
    }

    if (line.startsWith("- ")) {
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      listItems.push(line.slice(2));
      return;
    }

    flushList();

    if (line.startsWith("# ")) {
      elements.push(
        <h2 key={index} className="text-3xl font-bold mt-12 mb-5 text-slate-100">
          {renderInline(line.slice(2))}
        </h2>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h3 key={index} className="text-2xl font-bold mt-10 mb-4 text-slate-100">
          {renderInline(line.slice(3))}
        </h3>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h4 key={index} className="text-xl font-bold mt-8 mb-3 text-slate-200">
          {renderInline(line.slice(4))}
        </h4>
      );
    } else {
      elements.push(
        <p key={index} className="mb-6 text-slate-300 leading-8">
          {renderInline(line)}
        </p>
      );
    }
  });

  flushList();
  return elements;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return {};

  const title = article.seoTitle || `${article.title} | Money Split`;
  const description = article.seoDescription || article.excerpt;
  const image = article.thumbnail?.startsWith("http")
    ? article.thumbnail
    : `https://moneysplit.in${article.thumbnail}`;

  return {
    title,
    description,
    keywords: article.keywords,
    alternates: {
      canonical: `https://moneysplit.in/articles/${slug}`,
    },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      url: `https://moneysplit.in/articles/${slug}`,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      publishedTime: article.date,
      modifiedTime: article.updatedAt,
      authors: [article.authorName],
      tags: [article.category, ...(article.tags || [])],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [image],
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await incrementPublishedArticleView(slug);
  if (!article) notFound();

  const articles = await getPublishedArticles();
  const relatedArticles = articles
    .filter((item) => item.slug !== article.slug)
    .filter((item) => item.category === article.category || item.tags?.some((tag) => article.tags?.includes(tag)))
    .slice(0, 2);
  const fallbackRelated = articles.filter((item) => item.slug !== article.slug).slice(0, 2);
  const related = relatedArticles.length ? relatedArticles : fallbackRelated;

  const articleSchema = articleToJsonLd(article);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>

        <article>
          <header className="mb-12">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm font-semibold text-indigo-300">
                <Tag className="w-4 h-4" />
                {article.category}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              {article.title}
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed mb-8 max-w-3xl">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500">
              <span>By {article.authorName}</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(article.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.readTime} min read</span>
              </div>
            </div>
          </header>

          <div className="relative aspect-[16/9] mb-12 overflow-hidden rounded-xl border border-white/8 bg-slate-900">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="max-w-none mb-14">{renderMarkdown(article.content)}</div>

          {article.sources?.length > 0 && (
            <section className="mb-14 border-t border-white/8 pt-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-4">Sources and Further Reading</h2>
              <div className="space-y-3">
                {article.sources.map((source, index) => (
                  <a
                    key={`${source.url}-${index}`}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-slate-100 transition-colors"
                  >
                    <span>{source.label || source.url}</span>
                    <ExternalLink className="w-4 h-4 shrink-0 text-slate-500" />
                  </a>
                ))}
              </div>
            </section>
          )}

          {article.faqs?.length > 0 && (
            <section className="mb-14 border-t border-white/8 pt-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-5">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {article.faqs.map((faq, index) => (
                  <details
                    key={`${faq.question}-${index}`}
                    className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <summary className="cursor-pointer text-sm font-semibold text-slate-100">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <div className="border-t border-white/8 pt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Ready to organize shared costs?</h3>
                <p className="text-slate-400">Use Money Split to track groups, bills, and balances in one place.</p>
              </div>
              <Link
                href="/signup"
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-950/60"
              >
                Start Free
              </Link>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <div className="mt-16 pt-8 border-t border-white/8">
            <h3 className="text-2xl font-bold text-slate-100 mb-8">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.map((item) => (
                <div key={item.slug} className="bg-slate-900 border border-white/8 rounded-xl p-6 hover:border-white/14 transition-all group">
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2 py-1">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="font-bold mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                    <Link href={`/articles/${item.slug}`}>{item.title}</Link>
                  </h4>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{item.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{item.readTime} min read</span>
                    <Link
                      href={`/articles/${item.slug}`}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Read
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
