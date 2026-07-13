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
    <div className="user-dashboard min-h-screen w-full overflow-x-hidden bg-slate-950">
      {/* <Navbar /> */}

      <div className="flex min-w-0">
        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-10">
          <div className={`${contentWidth} mx-auto w-full min-w-0`}>
            {children}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
