import { FeaturesPageClient } from "./features-client";

export const metadata = {
  title: "Features | Money Split - Smart Expense Splitter",
  description: "Discover all the powerful features in Money Split. Smart groups, auto-split, balance tracking, one-click settle, and more.",
  keywords: "expense splitter features, bill splitting app, group expense tracker, money management features",
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <FeaturesPageClient />
    </div>
  );
}
