import { CheckCircle, Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="MoneySplit"
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-lg shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
              />
              <span className="text-base font-bold tracking-tight text-slate-950">
                Money<span className="text-indigo-700">Split</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
              Split bills with clarity, track group expenses in real time, and keep clear shared records.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
              <CheckCircle className="h-3.5 w-3.5" />
              Trusted by groups across India
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Product</p>
            <div className="space-y-2.5">
              <Link href="/signup" className="block text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">Create Account</Link>
              <Link href="/login" className="block text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">Sign In</Link>
              <Link href="/bill-splitter" className="block text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">Bill Splitter</Link>
              <Link href="/group-expense-tracker" className="block text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">Group Expense Tracker</Link>
              <Link href="/trip-expense-splitter" className="block text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">Trip Expense Splitter</Link>
              <Link href="/roommate-bill-splitter" className="block text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">Roommate Bill Splitter</Link>
              <Link href="/splitwise-alternative" className="block text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">Splitwise Alternative</Link>
              <Link href="/about" className="block text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">About Money Split</Link>
              <Link href="/articles" className="block text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">Articles</Link>
              <Link href="/contact" className="block text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">Contact</Link>
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Legal</p>
            <div className="space-y-2.5">
              <Link href="/privacy-policy" className="block text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">Privacy Policy</Link>
              <Link href="/delete-account" className="block text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">Delete Account</Link>
              <Link href="/terms-of-service" className="block text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">Terms of Service</Link>
              <Link href="/cookie-policy" className="block text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">Cookie Policy</Link>
              <Link href="/disclaimer" className="block text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">Disclaimer</Link>
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Support</p>
            <div className="space-y-3 text-sm font-medium text-slate-600">
              <a
                href="mailto:deepaksingh@moneysplit.in"
                className="inline-flex items-center gap-2 transition-colors hover:text-slate-950"
              >
                <Mail className="h-4 w-4 text-indigo-700" />
                deepaksingh@moneysplit.in
              </a>
              <a
                href="tel:+918112260346"
                className="inline-flex items-center gap-2 transition-colors hover:text-slate-950"
              >
                <Phone className="h-4 w-4 text-indigo-700" />
                +91 8112260346
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Money Split. All rights reserved.</p>
          <p className="text-xs text-slate-500">Made for friends, roommates, teams, and travelers.</p>
        </div>
      </div>
    </footer>
  );
}
