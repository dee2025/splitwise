"use client";

import GroupsSection from "@/components/dashboard/GroupsSection";
import RecentExpenses from "@/components/dashboard/RecentExpences";
import StatsCards from "@/components/dashboard/StatsCards";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function Dashboard() {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center flex-col gap-4 border-2 border-black">
        <div className="flex items-center gap-3 p-6 border-2 border-black bg-white shadow-sketch">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
          <p className="text-gray-700 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="mb-8 border-b-2 border-dashed border-gray-300 pb-6">
        <div className="flex items-center gap-3 ">
          <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center shadow-sketch">
            <Pencil className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 border-b-2 border-black pb-1">
              Welcome back, {user?.fullName || "User"}!
            </h1>
            <p className="text-gray-600 mt-2 text-sm">
              Your expense dashboard - clean, simple, and drama-free
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GroupsSection />
        <RecentExpenses />
      </div>
    </DashboardLayout>
  );
}