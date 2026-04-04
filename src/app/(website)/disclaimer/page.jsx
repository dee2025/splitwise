export const metadata = {
  title: "Disclaimer | Money Split",
  description:
    "Important disclaimer regarding informational use, financial responsibility, and service limitations on Money Split.",
  alternates: { canonical: "https://moneysplit.in/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Disclaimer</h1>

        <section className="rounded-2xl border border-dashed border-indigo-400/40 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-indigo-300 font-semibold">Image Space</p>
          <div className="mt-3 h-44 sm:h-56 rounded-xl border border-white/10 bg-slate-800/60 flex items-center justify-center">
            <p className="text-sm text-slate-400">Future image area: legal notice visual or user responsibility illustration</p>
          </div>
        </section>

        <section className="space-y-5 text-slate-300 leading-7">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">1. Informational Use</h2>
            <p>
              Money Split provides expense tracking and settlement support tools for informational and organizational use.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">2. User Responsibility</h2>
            <p>
              Final payment actions, debt decisions, and settlement confirmations are the responsibility of users and group members.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">3. No Professional Advice</h2>
            <p>
              We do not provide legal, tax, accounting, or financial advisory services. Please consult qualified professionals when needed.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">4. Accuracy and Availability</h2>
            <p>
              While we work to keep calculations and records reliable, users should verify critical entries and maintain independent records when appropriate.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">5. Contact</h2>
            <p>deepaksingh@moneysplit.in | +91 8112260346</p>
          </div>
        </section>
      </div>
    </main>
  );
}
