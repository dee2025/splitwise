"use client";

import { logout } from "@/redux/slices/authSlice";
import axios from "axios";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Plus,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

export default function DashboardHeader({ onAddClick }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("All Groups");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      dispatch(logout());
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Error logging out");
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Left Section - Group Selector */}
      <div className="hidden sm:block">
        <div className="relative">
          <button
            onClick={() => setIsGroupOpen(!isGroupOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">{selectedGroup}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {isGroupOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">
                All Groups
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">
                Chiang Mai Trip
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">
                Flat Rent
              </button>
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-600 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Group
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="sm:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Right Section - Actions & Profile */}
      <div className="hidden sm:flex items-center gap-3">
        {/* Add Expense Button */}
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>

        {/* Notifications */}
        <Link
          href="/dashboard/notifications"
          className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Link>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <Link
                href="/dashboard/profile"
                className="block px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-20 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-40 p-4 space-y-3">
          <button
            onClick={() => {
              onAddClick();
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
          <Link
            href="/dashboard/notifications"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            Notifications
          </Link>
          <Link
            href="/dashboard/profile"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
