"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname() || "/";

  const navLinks = [
    { label: "Features", href: "/features" },
    { label: "Bill splitter", href: "/bill-splitter" },
    { label: "Trips", href: "/trip-expense-splitter" },
    { label: "Roommates", href: "/roommate-bill-splitter" },
    { label: "Articles", href: "/articles" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-emerald-950/10 bg-white/90 px-4 py-3 text-slate-950 shadow-[0_10px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-5 lg:grid-cols-[auto_1fr_auto]">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          onClick={() => setMenuOpen(false)}
          aria-label="MoneySplit home"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 shadow-[0_14px_30px_rgba(5,150,105,0.22)]">
            <Image
              src="/logo.png"
              alt="MoneySplit"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md"
              priority
            />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-semibold tracking-tight text-slate-950">
              Money<span className="text-emerald-700">Split</span>
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:block">
              Group expenses
            </span>
          </span>
        </Link>

        <nav className="hidden items-center justify-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                pathname === link.href || pathname.startsWith(`${link.href}/`)
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-600 hover:bg-emerald-50/70 hover:text-slate-950"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(5,150,105,0.22)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_18px_36px_rgba(5,150,105,0.28)]"
            >
              Start free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button
            className="rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-emerald-800 shadow-sm transition-colors hover:bg-emerald-100 sm:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mx-auto mt-3 max-w-7xl rounded-lg border border-emerald-100 bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.12)] sm:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                pathname === link.href || pathname.startsWith(`${link.href}/`)
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-600 hover:bg-emerald-50/70 hover:text-slate-950"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="grid grid-cols-2 gap-2 px-1 py-2">
            <Link
              href="/about"
              className="rounded-lg bg-slate-50 px-3 py-3 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="rounded-lg bg-slate-50 px-3 py-3 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
          <div className="mt-2 grid gap-2 border-t border-slate-200 pt-3">
            <Link
              href="/login"
              className="rounded-lg border border-emerald-100 px-3 py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
              onClick={() => setMenuOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              onClick={() => setMenuOpen(false)}
            >
              Start free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
