"use client";

import { logoutUser } from "@/redux/slices/userSlice";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  Home,
  IndianRupee,
  LogOut,
  Settings,
  User,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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
      {/* BOTTOM NAV - Transparent with 2D style */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full">
        <div className="bg-black/5 backdrop-blur-md flex justify-center items-center gap-4 px-4 py-2 shadow-sketch">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname.startsWith(tab.path);

            return (
              <motion.button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                whileTap={{ scale: 0.9 }}
                whileHover={{ y: -1 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ scale: active ? 1.1 : 1 }}
                  className={`p-2 rounded-lg cursor-pointer border-2 transition-all duration-150 ${
                    active 
                      ? "bg-black border-black text-white" 
                      : "border-gray-400 text-gray-700 hover:border-gray-600"
                  }`}
                >
                  <Icon size={16} />
                </motion.div>
                <motion.span
                  animate={{ scale: active ? 1.05 : 1 }}
                  className={`text-xs mt-1 font-medium transition-colors duration-150 ${
                    active ? "text-black" : "text-gray-600"
                  }`}
                >
                  {tab.name}
                </motion.span>
              </motion.button>
            );
          })}

          {/* PROFILE BUTTON */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ y: -1 }}
            onClick={() => setShowMenu((prev) => !prev)}
            className="flex flex-col items-center"
          >
            <div className="p-2 rounded-lg cursor-pointer border-2 border-black bg-black text-white">
              <User size={16} />
            </div>
            <span className="text-xs mt-1 font-medium text-gray-600">
              Profile
            </span>
          </motion.button>
        </div>
      </div>

      {/* PROFILE MENU POPUP - Transparent with 2D style */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Overlay Background */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
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
              className="fixed bottom-20 left-1/2 -translate-x-1/2 w-64 z-50 
                         bg-white/95 backdrop-blur-md rounded-lg border-2 border-gray-400 shadow-sketch overflow-hidden"
            >
              {/* Corner accents */}
              <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-gray-400"></div>
              <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-gray-400"></div>

              {/* User Header */}
              <div className="flex items-center gap-3 p-4 border-b-2 border-dashed border-gray-300">
                <div className="w-10 h-10 border-2 border-gray-400 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700 font-bold text-sm">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
                </div>
              </div>

              {/* Menu Options */}
              <div className="divide-y-2 divide-dashed divide-gray-300">
                <motion.button
                  whileHover={{ x: 2 }}
                  onClick={() => {
                    router.push("/profile");
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-100/80 transition-all duration-150 text-sm"
                >
                  <User size={16} className="text-gray-600" />
                  Your Profile
                </motion.button>

                <motion.button
                  whileHover={{ x: 2 }}
                  onClick={() => {
                    router.push("/settings");
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-100/80 transition-all duration-150 text-sm"
                >
                  <Settings size={16} className="text-gray-600" />
                  Settings
                </motion.button>

                <motion.button
                  whileHover={{ x: 2 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50/80 transition-all duration-150 text-sm"
                >
                  <LogOut size={16} />
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