export const metadata = {
  title: "Privacy Policy | Money Split",
  description:
    "Read the Money Split privacy policy to understand what data we collect, how we use it, and how we protect user information.",
  alternates: { canonical: "https://moneysplit.in/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-slate-300">Effective date: April 4, 2026</p>
        <p className="text-slate-300 leading-7">
          Money Split collects only the information necessary to provide group
          expense tracking, settlements, and account security. We do not sell user
          personal data.
        </p>

        <section className="rounded-2xl border border-dashed border-indigo-400/40 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-indigo-300 font-semibold">Image Space</p>
          <div className="mt-3 h-44 sm:h-56 rounded-xl border border-white/10 bg-slate-800/60 flex items-center justify-center">
            <p className="text-sm text-slate-400">Future image area: data privacy infographic or trust/compliance badges</p>
          </div>
        </section>

        <section className="space-y-5 text-slate-300 leading-7">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">1. Data We Collect</h2>
            <p>Account details, group and expense records, settlement actions, and technical logs needed for security and performance.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">2. How We Use Data</h2>
            <p>To provide core product features, improve reliability, prevent abuse, and communicate important account or policy updates.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">3. Data Retention</h2>
            <p>We keep data only as long as needed for product operation, legal compliance, and dispute resolution.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">4. Security Controls</h2>
            <p>We apply standard safeguards to protect data in transit and at rest, and monitor unusual access behavior.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">5. Contact</h2>
            <p>Email: deepaksingh@moneysplit.in | Phone: +91 8112260346</p>
          </div>
        </section>
      </div>
    </main>
  );
}
