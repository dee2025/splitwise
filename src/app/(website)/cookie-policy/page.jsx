export const metadata = {
  title: "Cookie Policy | Money Split",
  description:
    "Understand how Money Split uses cookies and similar technologies to improve user experience and platform security.",
  alternates: { canonical: "https://moneysplit.in/cookie-policy" },
};

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Cookie Policy</h1>
        <p className="text-slate-300">Effective date: April 4, 2026</p>

        <section className="rounded-2xl border border-dashed border-indigo-400/40 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-indigo-300 font-semibold">Image Space</p>
          <div className="mt-3 h-44 sm:h-56 rounded-xl border border-white/10 bg-slate-800/60 flex items-center justify-center">
            <p className="text-sm text-slate-400">Future image area: cookie types diagram or consent flow graphic</p>
          </div>
        </section>

        <section className="space-y-5 text-slate-300 leading-7">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">1. Essential Cookies</h2>
            <p>Required for login sessions, request validation, and security protections.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">2. Performance Cookies</h2>
            <p>Help us understand reliability and usage patterns so we can improve product speed and stability.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">3. Your Choices</h2>
            <p>You can control cookies through browser settings, but disabling required cookies may break core functionality.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">4. Policy Updates</h2>
            <p>We may update this policy to reflect platform, legal, or security requirements.</p>
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
