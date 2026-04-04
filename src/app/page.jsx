import LandingPageModern from "@/components/home/LandingPageModern";

export const metadata = {
  title: "Money Split - Smart Expense Splitter for Friends, Trips & Roommates",
  description:
    "Money Split helps you split bills, track group expenses, and settle dues clearly. Perfect for trips, roommates, events, and shared living.",
  keywords: [
    "expense splitter",
    "split bills app",
    "group expense tracker",
    "roommate expense app",
    "trip expense manager",
    "money split app",
    "settle up app",
  ],
  alternates: {
    canonical: "https://moneysplit.in",
  },
};

export default function HomePage() {
  return <LandingPageModern />;
}
