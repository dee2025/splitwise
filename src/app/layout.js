// app/layout.js
import { Providers } from "@/redux/Providers";
import GlobalAddExpenseModal from "@/components/global/GlobalAddExpenseModal";
import WebsiteShell from "@/components/site/WebsiteShell";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  metadataBase: new URL("https://www.moneysplit.in"),
  applicationName: "Money Split",
  title: "Money Split - Easy Bill Splitting & Expense Tracking App",
  description: "Split bills with friends, roommates, and travel groups without drama. Track shared expenses and group records in one place. Free expense splitter app for groups.",
  keywords: "bill splitter, expense tracker, split bills, money management, group expenses, travel expenses, roommate expenses",
  siteName: "Money Split",
  locale: "en_IN",
  openGraph: {
    type: "website",
    siteName: "Money Split",
    title: "Money Split - Easy Bill Splitting & Expense Tracking",
    description: "Split expenses with friends instantly. Track shared bills, groups, and members.",
    images: [
      {
        url: "https://www.moneysplit.in/dashboard.png",
        width: 1894,
        height: 925,
        alt: "Money Split - Expense Splitting App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Money Split - Easy Bill Splitting App",
    description: "Split expenses with friends instantly. No math, no drama.",
    images: ["https://www.moneysplit.in/dashboard.png"],
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({ children }) {
  const gaMeasurementId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-QENC54FHEQ";

  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.moneysplit.in/#organization",
        name: "Money Split",
        url: "https://www.moneysplit.in",
        logo: {
          "@type": "ImageObject",
          url: "https://www.moneysplit.in/logo.svg",
        },
        description: "Split bills with friends, roommates, and travel groups without drama",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Customer Support",
          url: "https://www.moneysplit.in/contact",
          email: "deepaksingh@moneysplit.in",
          telephone: "+918112260346",
          areaServed: "IN",
          availableLanguage: ["en", "hi"],
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://www.moneysplit.in/#website",
        url: "https://www.moneysplit.in",
        name: "Money Split",
        publisher: {
          "@id": "https://www.moneysplit.in/#organization",
        },
        inLanguage: "en-IN",
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
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

