import LandingPageModern from "@/components/home/LandingPageModern";

export const metadata = {
  title: "Money Split - Smart Expense Splitter for Friends, Trips & Roommates",
  description:
    "Money Split helps you split bills and track group expenses clearly. Perfect for trips, roommates, events, and shared living.",
  keywords: [
    "expense splitter",
    "split bills app",
    "group expense tracker",
    "roommate expense app",
    "trip expense manager",
    "money split app",
    "shared expense app",
  ],
  alternates: {
    canonical: "https://www.moneysplit.in",
  },
};

export default function HomePage() {
  return <LandingPageModern />;
}

