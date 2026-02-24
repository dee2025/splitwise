"use client";

import { Bell, CreditCard, LayoutDashboard, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Expenses", href: "/expenses", icon: CreditCard },
  { label: "Groups", href: "/groups", icon: Users },
  { label: "Alerts", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-white/6">
      <div className="flex items-center justify-around px-1 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 pt-3 pb-2 px-1 transition-colors ${
                active
                  ? "text-indigo-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.75} />
              <span
                className={`text-[10px] ${active ? "font-semibold text-indigo-400" : "font-medium"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
