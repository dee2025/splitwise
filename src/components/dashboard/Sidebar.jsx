"use client";

import { Bell, CreditCard, LayoutDashboard, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Expenses", href: "/expenses", icon: CreditCard },
  { label: "Groups", href: "/groups", icon: Users },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <aside className="hidden lg:flex flex-col w-56 bg-slate-900 border-r border-white/6 sticky top-16 h-[calc(100vh-64px)] shrink-0">
      {/* Nav items */}
      <nav className="flex-1 px-3 pt-5 pb-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/60"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
              }`}
            >
              <Icon
                className="w-4 h-4 shrink-0"
                strokeWidth={active ? 2.5 : 1.75}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-white/6">
        <Link
          href="/profile"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
        >
          <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate leading-tight group-hover:text-white transition-colors">
              {user?.fullName || "User"}
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {user?.email || ""}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
