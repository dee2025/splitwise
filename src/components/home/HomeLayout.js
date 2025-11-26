"use client";

import Header from "./Header";
import Footer from "./Footer";

export default function HomeLayout({ children }) {
  return (
    <main className="min-h-screen bg-white text-black flex flex-col">
      <Header />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </main>
  );
}