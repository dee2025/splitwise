import { articlesIndexJsonLd } from "@/lib/articleUtils";
import { getPublishedArticles } from "@/lib/articles";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";

export const revalidate = 3600;

export const metadata = {
  title: "Articles | Money Split - Expert Guides on Expense Sharing",
  description:
    "Learn how to manage expenses with friends, plan trips, and split bills effectively. Professional guides and tips for better financial management.",
  keywords:
    "expense sharing, split bills, trip planning, friends expenses, financial management, money split guides",
  alternates: {
    canonical: "https://www.moneysplit.in/articles",
  },
};

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();
  const articlesSchema = articlesIndexJsonLd(articles);

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articlesSchema) }}
      />

      <section className="bg-slate-50 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-5 flex items-center justify-center gap-2">
            <span className="h-px w-6 bg-indigo-300" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
              Knowledge base
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Master expense sharing with practical guides.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Professional tips for managing shared expenses, planning trips, and keeping every group experience clear.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.slug}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition-colors hover:border-indigo-200"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4">
                    <span className="rounded-lg bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 shadow-sm backdrop-blur">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="mb-3 line-clamp-2 text-xl font-bold text-slate-950 transition-colors group-hover:text-indigo-800">
                    <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                  </h2>

                  <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-600">
                    {article.excerpt}
                  </p>

                  <div className="mb-5 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(article.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{article.readTime} min read</span>
                    </div>
                  </div>

                  <Link
                    href={`/articles/${article.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700 transition-colors hover:text-indigo-900"
                  >
                    Read article
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-14 text-center">
            <div className="inline-flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700 sm:flex-row">
              <span>Ready to start splitting expenses?</span>
              <Link href="/signup" className="font-bold text-indigo-700 hover:text-indigo-900">
                Get started free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
