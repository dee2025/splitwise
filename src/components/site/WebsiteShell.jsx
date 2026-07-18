"use client";

import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { usePathname } from "next/navigation";

const PANEL_PREFIXES = [
  "/dashboard",
  "/home",
  "/groups",
  "/expenses",
  "/notifications",
  "/profile",
  "/admin",
  "/offline",
];

export default function WebsiteShell({ children }) {
  const pathname = usePathname() || "/";
  const hideWebsiteChrome = PANEL_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (hideWebsiteChrome) {
    return children;
  }

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
