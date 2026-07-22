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
        <strong key={index} className="font-semibold text-slate-950">
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
        className={`${listType === "ol" ? "list-decimal" : "list-disc"} mb-7 ml-6 space-y-2 text-slate-700`}
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
        <h2 key={index} className="mb-5 mt-12 text-3xl font-bold text-slate-950">
          {renderInline(line.slice(2))}
        </h2>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h3 key={index} className="mb-4 mt-10 text-2xl font-bold text-slate-950">
          {renderInline(line.slice(3))}
        </h3>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h4 key={index} className="mb-3 mt-8 text-xl font-bold text-slate-900">
          {renderInline(line.slice(4))}
        </h4>
      );
    } else {
      elements.push(
        <p key={index} className="mb-6 leading-8 text-slate-700">
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
    : `https://www.moneysplit.in${article.thumbnail}`;

  return {
    title,
    description,
    keywords: article.keywords,
    alternates: {
      canonical: `https://www.moneysplit.in/articles/${slug}`,
    },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      url: `https://www.moneysplit.in/articles/${slug}`,
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
    <main className="min-h-screen bg-white text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <Link
          href="/articles"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to articles
        </Link>

        <article>
          <header className="mb-12">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700">
                <Tag className="h-4 w-4" />
                {article.category}
              </span>
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              {article.title}
            </h1>

            <p className="mb-8 max-w-3xl text-lg leading-8 text-slate-600">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-slate-500">
              <span>By {article.authorName}</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
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
                <Clock className="h-4 w-4" />
                <span>{article.readTime} min read</span>
              </div>
            </div>
          </header>

          <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mb-14 max-w-none">{renderMarkdown(article.content)}</div>

          {article.sources?.length > 0 && (
            <section className="mb-14 border-t border-slate-200 pt-8">
              <h2 className="mb-4 text-2xl font-bold text-slate-950">Sources and further reading</h2>
              <div className="space-y-3">
                {article.sources.map((source, index) => (
                  <a
                    key={`${source.url}-${index}`}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
                  >
                    <span>{source.label || source.url}</span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-slate-500" />
                  </a>
                ))}
              </div>
            </section>
          )}

          {article.faqs?.length > 0 && (
            <section className="mb-14 border-t border-slate-200 pt-8">
              <h2 className="mb-5 text-2xl font-bold text-slate-950">Frequently asked questions</h2>
              <div className="space-y-3">
                {article.faqs.map((faq, index) => (
                  <details
                    key={`${faq.question}-${index}`}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3 open:border-indigo-200 open:shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
                  >
                    <summary className="cursor-pointer text-sm font-bold text-slate-950">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <div className="border-t border-slate-200 pt-8">
            <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="mb-2 text-lg font-bold text-slate-950">Ready to organize shared costs?</h3>
                <p className="text-sm leading-6 text-slate-600">Use Money Split to track groups, bills, and balances in one place.</p>
              </div>
              <Link
                href="/signup"
                className="rounded-lg bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
              >
                Start free
              </Link>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <div className="mt-16 border-t border-slate-200 pt-8">
            <h3 className="mb-8 text-2xl font-bold text-slate-950">Related articles</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {related.map((item) => (
                <div key={item.slug} className="group rounded-lg border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-colors hover:border-indigo-200">
                  <div className="mb-3">
                    <span className="rounded-lg border border-indigo-100 bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="mb-2 line-clamp-2 font-bold text-slate-950 transition-colors group-hover:text-indigo-800">
                    <Link href={`/articles/${item.slug}`}>{item.title}</Link>
                  </h4>
                  <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-600">{item.excerpt}</p>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>{item.readTime} min read</span>
                    <Link
                      href={`/articles/${item.slug}`}
                      className="font-bold text-indigo-700 hover:text-indigo-900"
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
    </main>
  );
}
