"use client";

import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import BottomNav from "./dashboard/BottomNav";
import Sidebar from "./dashboard/Sidebar";

export default function DashboardLayout({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const pathname = usePathname();

  if (!isAuthenticated) return null;

  const contentWidth = pathname?.startsWith("/admin") ? "max-w-7xl" : "max-w-5xl";

  return (
    <div className="min-h-screen bg-slate-950">
      {/* <Navbar /> */}

      <div className="flex">
        <Sidebar />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10 min-h-[calc(100vh-64px)]">
          <div className={`${contentWidth} mx-auto`}>{children}</div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
