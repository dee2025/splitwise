"use client";

import { useState } from "react";
import { User, Users, Receipt, Wallet, LogOut, Settings } from "lucide-react";

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("Dashboard");

  const menuItems = [
    { icon: <Wallet size={20} />, label: "Dashboard", id: "Dashboard" },
    { icon: <Users size={20} />, label: "My Groups", id: "My Groups" },
    { icon: <Receipt size={20} />, label: "Expenses", id: "Expenses" },
    { icon: <User size={20} />, label: "Profile", id: "Profile" },
    { icon: <Settings size={20} />, label: "Settings", id: "Settings" },
  ];

  return (
    <aside className="w-64 bg-white shadow-sm border-r flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-black">SplitWise Web</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 space-y-1 px-4">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeItem === item.id}
            onClick={() => setActiveItem(item.id)}
          />
        ))}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t">
        <SidebarItem
          icon={<LogOut size={20} />}
          label="Logout"
          onClick={() => console.log("Logout")}
        />
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition 
      ${active ? "bg-black text-white" : "hover:bg-gray-100 text-gray-700"}`}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}