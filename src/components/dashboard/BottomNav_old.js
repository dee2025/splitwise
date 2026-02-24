"use client";

import { logout } from "@/redux/slices/authSlice";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Home,
  IndianRupee,
  LogOut,
  Settings,
  User,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showMenu, setShowMenu] = useState(false);

  const tabs = [
    { name: "Home", icon: Home, path: "/dashboard" },
    { name: "Groups", icon: Users, path: "/groups" },
    { name: "Expenses", icon: IndianRupee, path: "/expenses" },
    { name: "Alerts", icon: Bell, path: "/notifications" },
  ];

  const handleLogout = async () => {
    setShowMenu(false);
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      dispatch(logout());
      toast.success("Logged out successfully");
      router.push("/");
    }
  };

  return (
    <>
      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-white/95 backdrop-blur-md border-t-2 border-gray-300 flex items-center justify-around px-2 py-1 shadow-[0_-2px_0_0_#000]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname.startsWith(tab.path);

            return (
              <motion.button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center gap-0.5 flex-1 py-1.5"
              >
                <div
                  className={`p-2 rounded-lg border-2 transition-all duration-150 ${
                    active
                      ? "bg-black border-black text-white shadow-sketch-sm"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  <Icon size={17} />
                </div>
                <span
                  className={`text-[10px] font-semibold leading-none transition-colors duration-150 ${
                    active ? "text-black" : "text-gray-400"
                  }`}
                >
                  {tab.name}
                </span>
              </motion.button>
            );
          })}

          {/* PROFILE BUTTON */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setShowMenu((prev) => !prev)}
            className="flex flex-col items-center gap-0.5 flex-1 py-1.5"
          >
            <div
              className={`p-2 rounded-lg border-2 transition-all duration-150 ${
                showMenu
                  ? "bg-black border-black text-white shadow-sketch-sm"
                  : "border-transparent text-gray-500"
              }`}
            >
              <User size={17} />
            </div>
            <span
              className={`text-[10px] font-semibold leading-none transition-colors duration-150 ${
                showMenu ? "text-black" : "text-gray-400"
              }`}
            >
              Profile
            </span>
          </motion.button>
        </div>
      </div>

      {/* PROFILE MENU POPUP */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="fixed bottom-[72px] left-1/2 -translate-x-1/2 w-72 z-50
                         bg-white rounded-xl border-2 border-gray-400 shadow-sketch overflow-hidden"
            >
              {/* Corner accents */}
              <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-gray-300 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-gray-300 pointer-events-none" />

              {/* User Header */}
              <div className="flex items-center gap-3 p-4 border-b-2 border-dashed border-gray-200">
                <div className="w-10 h-10 border-2 border-gray-400 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-bold text-sm shrink-0">
                  {user?.fullName?.charAt(0).toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    @{user?.username}
                  </p>
                </div>
              </div>

              {/* Menu Options */}
              <div className="py-1">
                {[
                  {
                    icon: User,
                    label: "Your Profile",
                    action: () => {
                      router.push("/profile");
                      setShowMenu(false);
                    },
                  },
                  {
                    icon: Settings,
                    label: "Settings",
                    action: () => {
                      router.push("/settings");
                      setShowMenu(false);
                    },
                  },
                ].map(({ icon: Icon, label, action }) => (
                  <motion.button
                    key={label}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-50 transition-all duration-100 text-sm font-medium border-b border-dashed border-gray-100"
                  >
                    <Icon size={15} className="text-gray-500 shrink-0" />
                    {label}
                  </motion.button>
                ))}

                <motion.button
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-all duration-100 text-sm font-medium"
                >
                  <LogOut size={15} className="shrink-0" />
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
