"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "/features" },
    { label: "Bill Splitter", href: "/bill-splitter" },
    { label: "Trip Expenses", href: "/trip-expense-splitter" },
    { label: "About", href: "/about" },
    { label: "Articles", href: "/articles" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur-md sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="MoneySplit"
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-lg"
            priority
          />
          <span className="text-base font-bold tracking-tight text-slate-950">
            Money<span className="text-indigo-700">Split</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)] transition-colors hover:bg-indigo-700"
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 sm:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="mx-auto mt-3 flex max-w-6xl flex-col gap-3 border-t border-slate-200 pt-4 pb-4 sm:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 border-t border-slate-200 pt-2">
            <Link
              href="/login"
              className="py-1 text-sm font-semibold text-slate-600"
              onClick={() => setMenuOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
              onClick={() => setMenuOpen(false)}
            >
              Get started free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
