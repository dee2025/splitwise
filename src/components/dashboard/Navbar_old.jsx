// components/Navbar.js
"use client";

import { logout } from "@/redux/slices/authSlice";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  Home,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowSearch(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      dispatch(logout());
      toast.success("Logged out successfully");
      router.push("/");
      setShowUserMenu(false);
    }
  };

  const handleProfile = () => {
    router.push("/profile");
    setShowUserMenu(false);
  };

  const handleSettings = () => {
    router.push("/settings");
    setShowUserMenu(false);
  };

  const handleCreateGroup = () => {
    router.push("/groups/create");
    setShowMobileMenu(false);
  };

  const handleDashboard = () => {
    router.push("/dashboard");
    setShowMobileMenu(false);
  };

  const handleGroups = () => {
    router.push("/groups");
    setShowMobileMenu(false);
  };

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 transition-colors duration-200"
      >
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          {/* Left Section - Logo & Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 lg:hidden"
              onClick={() => setShowMobileMenu(true)}
            >
              <Menu size={22} className="text-gray-600 dark:text-gray-300" />
            </motion.button>

            {/* Logo/Brand */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Wallet size={20} className="text-white" />
                </div>
                <span className="hidden sm:block text-xl font-semibold text-gray-900 dark:text-white">
                  splitzy
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Desktop Search - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={20}
              />
              <input
                type="text"
                placeholder="Search expenses, groups..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Right Section - Actions & User */}
          <div className="flex items-center gap-3">
            {/* Mobile Search Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 md:hidden"
              onClick={() => setShowSearch(true)}
            >
              <Search size={22} className="text-gray-600 dark:text-gray-300" />
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
            >
              {darkMode ? (
                <Sun size={20} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon size={20} className="text-gray-600 dark:text-gray-300" />
              )}
            </motion.button>

            {/* Create Group Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateGroup}
              className="hidden sm:flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl transition-all duration-200 font-medium shadow-sm"
            >
              <Plus size={18} />
              <span>Create Group</span>
            </motion.button>

            {/* Mobile Create Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateGroup}
              className="sm:hidden p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200 shadow-sm"
            >
              <Plus size={18} />
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <NotificationBell />
            </div>

            {/* User Profile Menu */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                  {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <motion.div
                  animate={{ rotate: showUserMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown
                    size={16}
                    className="text-gray-500 dark:text-gray-400"
                  />
                </motion.div>
              </motion.button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                  >
                    {/* User Info */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-medium">
                          {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                            {user?.fullName}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                            @{user?.username}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 space-y-1">
                      <UserMenuItem
                        icon={<User size={18} />}
                        label="Your Profile"
                        onClick={handleProfile}
                      />
                      <UserMenuItem
                        icon={<Settings size={18} />}
                        label="Settings"
                        onClick={handleSettings}
                      />

                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                      <UserMenuItem
                        icon={<LogOut size={18} />}
                        label="Sign Out"
                        onClick={handleLogout}
                        isDanger={true}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white dark:bg-gray-900 z-50 lg:hidden"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                className="p-4 border-b border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSearch(false)}
                    className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
                  >
                    <X size={20} className="text-gray-600 dark:text-gray-300" />
                  </motion.button>
                  <div className="flex-1 relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Search expenses, groups..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      autoFocus
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 dark:bg-black/50 z-50 lg:hidden backdrop-blur-sm"
          >
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-800"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Wallet size={20} className="text-white" />
                    </div>
                    <div>
                      <h1 className="font-semibold text-gray-900 dark:text-white">
                        splitzy
                      </h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Expense Tracker
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl"
                  >
                    <X size={20} className="text-gray-600 dark:text-gray-300" />
                  </motion.button>
                </div>

                {/* User Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-medium">
                    {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                      @{user?.username}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Navigation Items */}
              <div className="p-4 space-y-1">
                <MobileMenuItem
                  icon={<Home size={20} />}
                  label="Dashboard"
                  onClick={handleDashboard}
                  active={pathname === "/dashboard"}
                  delay={0.1}
                />
                <MobileMenuItem
                  icon={<Users size={20} />}
                  label="My Groups"
                  onClick={handleGroups}
                  active={pathname === "/groups"}
                  delay={0.15}
                />
                <MobileMenuItem
                  icon={<User size={20} />}
                  label="Profile"
                  onClick={handleProfile}
                  active={pathname === "/profile"}
                  delay={0.2}
                />
                <MobileMenuItem
                  icon={<Settings size={20} />}
                  label="Settings"
                  onClick={handleSettings}
                  active={pathname === "/settings"}
                  delay={0.25}
                />
                <MobileMenuItem
                  icon={<Bell size={20} />}
                  label="Notifications"
                  onClick={() => {}}
                  delay={0.3}
                />

                {/* Theme Toggle in Mobile Menu */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  onClick={toggleDarkMode}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {darkMode ? (
                    <Sun
                      size={20}
                      className="text-gray-400 dark:text-gray-500"
                    />
                  ) : (
                    <Moon
                      size={20}
                      className="text-gray-400 dark:text-gray-500"
                    />
                  )}
                  <span className="font-medium">
                    {darkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                </motion.button>

                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                  <MobileMenuItem
                    icon={<Plus size={20} />}
                    label="Create Group"
                    onClick={handleCreateGroup}
                    isPrimary={true}
                    delay={0.4}
                  />
                </div>

                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                  <MobileMenuItem
                    icon={<LogOut size={20} />}
                    label="Sign Out"
                    onClick={handleLogout}
                    isDanger={true}
                    delay={0.45}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function UserMenuItem({ icon, label, onClick, isDanger = false }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
        isDanger
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      <div
        className={`${
          isDanger ? "text-red-500" : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </motion.button>
  );
}

function MobileMenuItem({
  icon,
  label,
  onClick,
  active = false,
  isPrimary = false,
  isDanger = false,
  delay = 0,
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200 ${
        isPrimary
          ? "bg-green-500 hover:bg-green-600 text-white"
          : isDanger
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          : active
          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      <div
        className={`
        ${
          isPrimary
            ? "text-white"
            : isDanger
            ? "text-red-500"
            : active
            ? "text-green-600 dark:text-green-400"
            : "text-gray-400 dark:text-gray-500"
        }
      `}
      >
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </motion.button>
  );
}
