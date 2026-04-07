import { CheckCircle, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/6 px-5 sm:px-8 py-14 bg-gradient-to-b from-slate-950 to-slate-900/70">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-indigo-950/60">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="text-base font-bold text-slate-100 tracking-tight">
                Money<span className="text-indigo-400">Split</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xs">
              Split bills with clarity, track group expenses in real time, and settle faster with fewer transactions.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-[11px] font-semibold text-emerald-300 uppercase tracking-wide">
              <CheckCircle className="w-3.5 h-3.5" />
              Trusted by groups across India
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.16em] mb-4">Product</p>
            <div className="space-y-2.5">
              <Link href="/signup" className="block text-sm text-slate-300 hover:text-white transition-colors">Create Account</Link>
              <Link href="/login" className="block text-sm text-slate-300 hover:text-white transition-colors">Sign In</Link>
              <Link href="/about" className="block text-sm text-slate-300 hover:text-white transition-colors">About Money Split</Link>
              <Link href="/articles" className="block text-sm text-slate-300 hover:text-white transition-colors">Articles</Link>
              <Link href="/contact" className="block text-sm text-slate-300 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.16em] mb-4">Legal</p>
            <div className="space-y-2.5">
              <Link href="/privacy-policy" className="block text-sm text-slate-300 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms-of-service" className="block text-sm text-slate-300 hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/cookie-policy" className="block text-sm text-slate-300 hover:text-white transition-colors">Cookie Policy</Link>
              <Link href="/disclaimer" className="block text-sm text-slate-300 hover:text-white transition-colors">Disclaimer</Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.16em] mb-4">Support</p>
            <div className="space-y-3 text-sm text-slate-300">
              <a
                href="mailto:deepaksingh@moneysplit.in"
                className="inline-flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-indigo-400" />
                deepaksingh@moneysplit.in
              </a>
              <a
                href="tel:+918112260346"
                className="inline-flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-indigo-400" />
                +91 8112260346
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Money Split. All rights reserved.</p>
          <p className="text-xs text-slate-600">Made for friends, roommates, teams, and travelers.</p>
        </div>
      </div>
    </footer>
  );
}
