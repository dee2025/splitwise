export const metadata = {
  title: "Terms of Service | Money Split",
  description:
    "Read terms and conditions for using Money Split, including acceptable use, service scope, and liability terms.",
  alternates: { canonical: "https://moneysplit.in/terms-of-service" },
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-slate-300">Effective date: April 4, 2026</p>

        <section className="rounded-2xl border border-dashed border-indigo-400/40 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-indigo-300 font-semibold">Image Space</p>
          <div className="mt-3 h-44 sm:h-56 rounded-xl border border-white/10 bg-slate-800/60 flex items-center justify-center">
            <p className="text-sm text-slate-400">Future image area: terms overview chart or legal process timeline</p>
          </div>
        </section>

        <section className="space-y-5 text-slate-300 leading-7">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using Money Split, you agree to these terms and any future updates posted on this page.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">2. Account Responsibility</h2>
            <p>
              You are responsible for account security, credentials, and all activity performed under your account.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">3. Acceptable Use</h2>
            <p>
              You must not use the service for fraud, abuse, unauthorized access attempts, or any unlawful financial activity.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">4. Service Changes</h2>
            <p>
              We may update, improve, or retire product features to maintain reliability, compliance, and user experience.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">5. Limitation of Liability</h2>
            <p>
              Money Split provides calculation and tracking tools. Final payment decisions remain the responsibility of users and group members.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">6. Contact</h2>
            <p>For legal or support communication: deepaksingh@moneysplit.in | +91 8112260346</p>
          </div>
        </section>
      </div>
    </main>
  );
}
