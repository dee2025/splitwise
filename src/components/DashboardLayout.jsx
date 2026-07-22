"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import BottomNav from "./dashboard/BottomNav";
import Sidebar from "./dashboard/Sidebar";

export default function DashboardLayout({ children }) {
  const { checked, isAuthenticated, loading } = useSelector((state) => state.auth);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!checked || loading || isAuthenticated) return;

    const loginPath = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : "/login";
    router.replace(loginPath);
  }, [checked, isAuthenticated, loading, pathname, router]);

  if (!checked || loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
      </div>
    );
  }

  const contentWidth = pathname?.startsWith("/admin") ? "max-w-7xl" : "max-w-5xl";

  return (
    <div className="user-dashboard min-h-screen w-full overflow-x-hidden bg-slate-950 text-slate-100">
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
