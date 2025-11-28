"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  IndianRupee,
  CheckCircle,
  Home,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slices/userSlice";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const [showMenu, setShowMenu] = useState(false);

  const tabs = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Groups", icon: Users, path: "/groups" },
    { name: "Expenses", icon: IndianRupee, path: "/expenses" },
    { name: "Settled", icon: CheckCircle, path: "/settled" },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/login");
  };

  return (
    <>
      {/* BOTTOM NAV */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-black/30 backdrop-blur-xl shadow-xl rounded-full flex items-center gap-6 px-6 py-3 border border-white/20">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname.startsWith(tab.path);

            return (
              <motion.button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ scale: active ? 1.2 : 1 }}
                  className={`p-2 rounded-full cursor-pointer ${
                    active ? "bg-white text-black" : "text-gray-200"
                  }`}
                >
                  <Icon size={18} />
                </motion.div>
              </motion.button>
            );
          })}

          {/* PROFILE BUTTON */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMenu((prev) => !prev)}
            className="flex flex-col items-center"
          >
            <div className="p-2 rounded-full cursor-pointer bg-white text-black">
              <User size={18} />
            </div>
          </motion.button>
        </div>
      </div>

      {/* PROFILE MENU POPUP */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Overlay Background */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
            />

            {/* Menu Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 w-72 z-50 
                         bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
            >
              {/* User Header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                <div className="w-12 h-12 bg-[#3BA9A0] rounded-full flex items-center justify-center text-white font-bold">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {user?.fullName}
                  </p>
                  <p className="text-sm text-gray-500">@{user?.username}</p>
                </div>
              </div>

              {/* Menu Options */}
              <div className="divide-y divide-gray-200">
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-100"
                >
                  <User size={18} />
                  Your Profile
                </button>

                <button
                  onClick={() => router.push("/settings")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-100"
                >
                  <Settings size={18} />
                  Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
