// app/layout.js
import { Providers } from "@/redux/Providers";
import GlobalAddExpenseModal from "@/components/global/GlobalAddExpenseModal";
import WebsiteShell from "@/components/site/WebsiteShell";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";

const SITE_URL = "https://moneysplit.in";
const APP_NAME = "MoneySplit";
const SHORT_NAME = "Money Split";
const APP_DESCRIPTION =
  "Split bills with friends, roommates, and travel groups without drama. Track shared expenses and group records in one place. Free expense splitter app for groups.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  title: {
    default: "Money Split - Free Bill Splitter & Group Expense Tracker",
    template: "%s",
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    title: SHORT_NAME,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false,
  },
  keywords: [
    "bill splitter",
    "expense tracker",
    "split bills",
    "group expense tracker",
    "shared expense tracker",
    "splitwise alternative",
    "trip expense splitter",
    "roommate bill splitter",
    "money management",
  ],
  siteName: "Money Split",
  locale: "en_IN",
  openGraph: {
    type: "website",
    siteName: "Money Split",
    title: "Money Split - Easy Bill Splitting & Expense Tracking",
    description: "Split expenses with friends instantly. Track shared bills, groups, and members.",
    images: [
      {
        url: `${SITE_URL}/dashboard.png`,
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
    images: [`${SITE_URL}/dashboard.png`],
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  const gaMeasurementId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-QENC54FHEQ";

  const schemaData = {
    "@context": "https://schema.org",
        "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Money Split",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo.svg`,
        },
        description: "Split bills with friends, roommates, and travel groups without drama",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Customer Support",
          url: `${SITE_URL}/contact`,
          email: "deepaksingh@moneysplit.in",
          telephone: "+918112260346",
          areaServed: "IN",
          availableLanguage: ["en", "hi"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Money Split",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        inLanguage: "en-IN",
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
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
        <Script
          id="organization-schema"
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
            <ServiceWorkerRegistration />
            <WebsiteShell>{children}</WebsiteShell>
            <GlobalAddExpenseModal />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}

