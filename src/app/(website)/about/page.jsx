export const metadata = {
  title: "About Money Split | Group Expense Splitter",
  description:
    "Learn about Money Split, a simple and reliable platform to split bills and manage shared expenses with friends, roommates, and travel groups.",
  alternates: { canonical: "https://moneysplit.in/about" },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">About Money Split</h1>
          <p className="text-slate-300 leading-7">
            Money Split is built to remove confusion from shared spending. Whether you are
            planning a trip, managing household costs, or splitting event bills, we help every
            member understand who paid, who owes, and what to settle next.
          </p>
        </section>

        <section className="rounded-2xl border border-dashed border-indigo-400/40 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-indigo-300 font-semibold">Image Space</p>
          <div className="mt-3 h-52 sm:h-64 rounded-xl border border-white/10 bg-slate-800/60 flex items-center justify-center">
            <p className="text-sm text-slate-400">Future image area: team photo, product story visual, or timeline graphic</p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="rounded-xl border border-white/10 bg-slate-800/40 p-4">
            <h2 className="text-base font-semibold">Our Mission</h2>
            <p className="text-slate-300 mt-2 text-sm leading-6">
              Make shared money management transparent so friendships and teams stay healthy.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-slate-800/40 p-4">
            <h2 className="text-base font-semibold">What We Focus On</h2>
            <p className="text-slate-300 mt-2 text-sm leading-6">
              Accurate splits, simple workflows, and clear settlement suggestions with minimal transactions.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-slate-800/40 p-4">
            <h2 className="text-base font-semibold">Who Uses Money Split</h2>
            <p className="text-slate-300 mt-2 text-sm leading-6">
              Friends, roommates, students, travelers, and small teams with shared expenses.
            </p>
          </article>
        </section>

        <section className="rounded-xl border border-white/10 bg-slate-800/40 p-5 space-y-2">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="text-slate-300">Email: deepaksingh@moneysplit.in</p>
          <p className="text-slate-300">Phone: +91 8112260346</p>
        </section>
      </div>
    </main>
  );
}
