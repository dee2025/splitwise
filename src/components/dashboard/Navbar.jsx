"use client";

import { logout } from "@/redux/slices/authSlice";
import axios from "axios";
import { Bell, ChevronDown, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

export default function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      dispatch(logout());
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Error logging out");
    }
  };

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <nav className="sticky top-0 z-40 bg-slate-900 border-b border-white/6 h-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="text-base font-bold tracking-tight text-slate-100">
            Split<span className="text-indigo-400">Wise</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <Link
            href="/dashboard/notifications"
            className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-white/6 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
          </Link>

          {/* Profile */}
          <div className="relative ml-1">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 py-1.5 pl-1.5 pr-2.5 hover:bg-white/6 rounded-lg transition-colors"
            >
              <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-300 max-w-[100px] truncate">
                {user?.fullName?.split(" ")[0] || "User"}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-52 bg-slate-800 border border-white/8 rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-white/6">
                    <p className="text-sm font-semibold text-slate-100 truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
