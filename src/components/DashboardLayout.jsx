"use client";

import { useSelector } from "react-redux";
import Navbar from "./dashboard/Navbar";
import BottomNav from "./dashboard/BottomNav";

export default function DashboardLayout({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col">
        {/* <Navbar /> */}
        <main className=" p-4 pb-24 ">{children}</main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
