// components/DashboardLayout.js
"use client";

import { useSelector } from "react-redux";
import Navbar from "./dashboard/Navbar";
export default function DashboardLayout({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Don't render layout if not authenticated (the page will handle redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex ">
      {/* <Sidebar /> */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
