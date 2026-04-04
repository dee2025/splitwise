// app/layout.js
import { Providers } from "@/redux/Providers";
import GlobalAddExpenseModal from "@/components/global/GlobalAddExpenseModal";
import WebsiteShell from "@/components/site/WebsiteShell";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://moneysplit.in"),
  title: "Money Split - Easy Bill Splitting & Expense Tracking App",
  description: "Split bills with friends, roommates, and travel groups without drama. Track shared expenses, settle up instantly with optimal algorithms. Free expense splitter app for groups.",
  keywords: "bill splitter, expense tracker, split bills, money management, group expenses, travel expenses, roommate expenses, settle debts",
  url: "https://moneysplit.in",
  siteName: "Money Split",
  locale: "en_IN",
  openGraph: {
    type: "website",
    url: "https://moneysplit.in",
    title: "Money Split - Easy Bill Splitting & Expense Tracking",
    description: "Split expenses with friends instantly. Track shared bills, balance calculations, and one-click settlements.",
    images: [
      {
        url: "https://moneysplit.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Money Split - Expense Splitting App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Money Split - Easy Bill Splitting App",
    description: "Split expenses with friends instantly. No math, no drama.",
    images: ["https://moneysplit.in/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://moneysplit.in",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-right" />
        <Providers>
          <ThemeProvider>
            <WebsiteShell>{children}</WebsiteShell>
            <GlobalAddExpenseModal />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
