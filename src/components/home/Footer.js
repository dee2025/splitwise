"use client";

export default function Footer() {
  return (
    <footer className="px-10 md:px-20 py-10 border-t-2 border-dashed border-gray-400 text-sm text-gray-500">
      <p>© {new Date().getFullYear()} SplitWise Web — Built for friends who travel and forget who paid.</p>
    </footer>
  );
}