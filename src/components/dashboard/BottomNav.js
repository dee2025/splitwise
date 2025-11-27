"use client";

import { motion } from "framer-motion";
import { Users, IndianRupee, CheckCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: "Groups", icon: Users, path: "/groups" },
    { name: "Expenses", icon: IndianRupee, path: "/expenses" },
    { name: "Settled", icon: CheckCircle, path: "/settled" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-black/30 backdrop-blur-lg  shadow-xl rounded-full flex items-center gap-6 px-6 py-3 border border-gray-200">
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
                  active ? "bg-gray-900 text-white" : "text-gray-600"
                }`}
              >
                <Icon size={16} />
              </motion.div>
              {/* <span
                className={`text-xs mt-1 ${
                  active ? "text-gray-900 font-medium" : "text-gray-500"
                }`}
              >
                {tab.name}
              </span> */}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
