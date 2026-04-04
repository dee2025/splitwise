"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 inset-x-0 z-50 px-5 sm:px-8 py-4 bg-slate-950/85 backdrop-blur-md border-b border-white/6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">M</span>
          </div>
          <span className="text-base font-bold text-slate-100 tracking-tight">
            Money<span className="text-indigo-400">Split</span>
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-5">
          <Link
            href="/login"
            className="text-sm text-slate-400 hover:text-slate-100 font-medium transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-950/60"
          >
            Get started
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <button
          className="sm:hidden p-1.5 text-slate-400 hover:text-slate-100 transition-colors"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden mt-3 pb-4 border-t border-white/6 pt-4 flex flex-col gap-3 max-w-6xl mx-auto">
          <Link
            href="/login"
            className="text-sm text-slate-400 font-medium py-1"
            onClick={() => setMenuOpen(false)}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
            onClick={() => setMenuOpen(false)}
          >
            Get started free
          </Link>
        </div>
      )}
    </header>
  );
}
