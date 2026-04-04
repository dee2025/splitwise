export const metadata = {
  title: "Contact Money Split",
  description:
    "Contact Money Split support for account, billing, partnership, and product related help.",
  alternates: { canonical: "https://moneysplit.in/contact" },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-slate-300 leading-7">
          For support, business queries, feedback, or legal communication, reach us
          through the details below.
        </p>

        <section className="rounded-2xl border border-dashed border-indigo-400/40 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-indigo-300 font-semibold">Image Space</p>
          <div className="mt-3 h-48 sm:h-60 rounded-xl border border-white/10 bg-slate-800/60 flex items-center justify-center">
            <p className="text-sm text-slate-400">Future image area: office map, support banner, or customer success visual</p>
          </div>
        </section>

        <div className="rounded-xl border border-white/10 bg-slate-800/40 p-5 space-y-3">
          <p className="text-slate-200 font-medium">Money Split Support</p>
          <p className="text-slate-300">Email: deepaksingh@moneysplit.in</p>
          <p className="text-slate-300">Phone: +91 8112260346</p>
          <p className="text-slate-400 text-sm mt-2">
            Response window: Mon-Sat, 10:00 AM - 7:00 PM IST
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="rounded-xl border border-white/10 bg-slate-800/40 p-4">
            <h2 className="text-base font-semibold">Support Topics</h2>
            <p className="text-sm text-slate-300 mt-2 leading-6">
              Login help, account access, settlement questions, and report-related assistance.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-slate-800/40 p-4">
            <h2 className="text-base font-semibold">Partnerships</h2>
            <p className="text-sm text-slate-300 mt-2 leading-6">
              Reach out for integrations, campus communities, and brand partnerships.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-slate-800/40 p-4">
            <h2 className="text-base font-semibold">Legal & Compliance</h2>
            <p className="text-sm text-slate-300 mt-2 leading-6">
              For notices and policy clarifications, use the same official email and phone.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
