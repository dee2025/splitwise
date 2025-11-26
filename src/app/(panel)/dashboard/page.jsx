"use client";

import GroupsSection from "@/components/dashboard/GroupsSection";
import RecentExpenses from "@/components/dashboard/RecentExpences";
import StatsCards from "@/components/dashboard/StatsCards";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2 } from "lucide-react";
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        {" "}
        <Loader2 className="w-8 h-8 animate-spin text-black" />{" "}
        <p className="text-gray-600 mt-2">Redirecting to login...</p>{" "}
      </div>
    );
  }

  return (
    <DashboardLayout>
      {" "}
      <div className="mb-8">
        {" "}
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.fullName || "User"}!{" "}
        </h1>{" "}
        <p className="text-gray-600 mt-2">
          Manage your shared expenses, trips & group balances.{" "}
        </p>{" "}
      </div>{" "}
      <StatsCards />{" "}
      <div className="mt-12 grid grid-cols-1 xl:grid-cols-2 gap-8">
        {" "}
        <GroupsSection /> <RecentExpenses />{" "}
      </div>{" "}
    </DashboardLayout>
  );
}
