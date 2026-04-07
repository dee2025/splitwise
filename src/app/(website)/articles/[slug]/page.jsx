import { articles } from '../../../../data/articles';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';

export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return {};

  return {
    title: `${article.title} | Money Split - Expert Guides`,
    description: article.excerpt,
    keywords: article.keywords,
    alternates: {
      canonical: `https://moneysplit.in/articles/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url: `https://moneysplit.in/articles/${slug}`,
      images: [
        {
          url: article.thumbnail,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      publishedTime: article.date,
      authors: ['Money Split'],
      tags: [article.category, ...article.keywords.split(',')],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.thumbnail],
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) {
    notFound();
  }

  // Article Schema for JSON-LD
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.thumbnail,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      "@type": "Organization",
      name: "Money Split",
      url: "https://moneysplit.in",
    },
    publisher: {
      "@type": "Organization",
      name: "Money Split",
      logo: {
        "@type": "ImageObject",
        url: "https://moneysplit.in/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://moneysplit.in/articles/${slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>

        <article>
          {/* Hero Section */}
          <header className="mb-12">
            {/* Category Badge */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm font-semibold text-indigo-300">
                <Tag className="w-4 h-4" />
                {article.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              {article.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-slate-400 leading-relaxed mb-8 max-w-3xl">
              {article.excerpt}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(article.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.readTime} min read</span>
              </div>
            </div>
          </header>

          {/* Thumbnail */}
          <div className="relative aspect-[16/9] mb-12 overflow-hidden rounded-2xl">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Content */}
          <div className="prose prose-lg prose-invert max-w-none mb-16">
            {article.content.split('\n').map((paragraph, index) => {
              if (paragraph.startsWith('# ')) {
                return <h2 key={index} className="text-3xl font-bold mt-12 mb-6 text-slate-100">{paragraph.slice(2)}</h2>;
              } else if (paragraph.startsWith('## ')) {
                return <h3 key={index} className="text-2xl font-bold mt-10 mb-4 text-slate-200">{paragraph.slice(3)}</h3>;
              } else if (paragraph.startsWith('### ')) {
                return <h4 key={index} className="text-xl font-bold mt-8 mb-3 text-slate-300">{paragraph.slice(4)}</h4>;
              } else if (paragraph.trim() === '') {
                return <br key={index} />;
              } else if (paragraph.match(/^\d+\./)) {
                return <li key={index} className="ml-6 mb-2 text-slate-300">{paragraph.slice(paragraph.indexOf('.') + 1).trim()}</li>;
              } else if (paragraph.startsWith('- ')) {
                return <li key={index} className="ml-6 mb-2 text-slate-300">{paragraph.slice(2)}</li>;
              } else {
                return <p key={index} className="mb-6 text-slate-300 leading-relaxed">{paragraph.trim()}</p>;
              }
            })}
          </div>

          {/* Article Footer */}
          <div className="border-t border-white/6 pt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Enjoyed this article?</h3>
                <p className="text-slate-400">Share it with friends who might find it helpful.</p>
              </div>
              <Link
                href="/signup"
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-950/60"
              >
                Start Splitting Expenses
              </Link>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        <div className="mt-16 pt-8 border-t border-white/6">
          <h3 className="text-2xl font-bold text-slate-100 mb-8">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles
              .filter((a) => a.slug !== article.slug)
              .slice(0, 2)
              .map((related) => (
                <div key={related.slug} className="bg-slate-800 border border-white/6 rounded-xl p-6 hover:border-white/10 transition-all group">
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2 py-1">
                      {related.category}
                    </span>
                  </div>
                  <h4 className="font-bold mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                    <Link href={`/articles/${related.slug}`}>
                      {related.title}
                    </Link>
                  </h4>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{related.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{related.readTime} min read</span>
                    <Link
                      href={`/articles/${related.slug}`}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Read →
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}