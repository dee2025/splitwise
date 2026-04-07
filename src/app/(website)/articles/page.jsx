import Link from 'next/link';
import { articles } from '../../../data/articles';
import { ArrowRight, Calendar, Clock, Tag } from 'lucide-react';

export const metadata = {
  title: 'Articles | Money Split - Expert Guides on Expense Sharing',
  description: 'Learn how to manage expenses with friends, plan trips, and split bills effectively. Professional guides and tips for better financial management.',
  keywords: 'expense sharing, split bills, trip planning, friends expenses, financial management, money split guides',
  alternates: {
    canonical: 'https://moneysplit.in/articles',
  },
};

export default function ArticlesPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://moneysplit.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Articles",
        "item": "https://moneysplit.in/articles"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-4 h-px bg-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.25em]">
              Knowledge Base
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
            Master Expense Sharing
            <br />
            <span className="text-slate-500">with Expert Guides</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Discover professional tips and strategies for managing shared expenses,
            from trips with friends to living with roommates. Make every group experience stress-free.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="pb-28 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <article
                key={article.slug}
                className="group bg-slate-800 border border-white/6 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-full text-xs font-semibold text-slate-300">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-slate-100 mb-3 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                    <Link href={`/articles/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>

                  <p className="text-slate-400 leading-relaxed mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(article.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{article.readTime} min read</span>
                    </div>
                  </div>

                  {/* Read More Link */}
                  <Link
                    href={`/articles/${article.slug}`}
                    className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold text-sm transition-colors group-hover:gap-3"
                  >
                    Read Article
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 border border-white/10 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 hover:border-white/20 transition-all">
              <span>Ready to start splitting expenses?</span>
              <Link
                href="/signup"
                className="text-indigo-400 hover:text-indigo-300 font-bold ml-2"
              >
                Get Started Free →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}