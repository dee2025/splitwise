"use client";

import Footer from "./Footer";
import Header from "./Header";

export default function HomeLayout({ children }) {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 w-full">{children}</div>
      <Footer />
    </main>
  );
}
