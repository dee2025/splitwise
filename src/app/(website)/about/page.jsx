import { InfoCard, InfoGrid, InfoPageShell } from "@/components/site/InfoPageShell";

export const metadata = {
  title: "About Money Split | Group Expense Splitter",
  description:
    "Learn about Money Split, a simple and reliable platform to split bills and manage shared expenses with friends, roommates, and travel groups.",
  alternates: { canonical: "https://www.moneysplit.in/about" },
};

export default function AboutPage() {
  return (
    <InfoPageShell
      eyebrow="About"
      title="About Money Split"
      description="Money Split is built to remove confusion from shared spending. Whether you are planning a trip, managing household costs, or splitting event bills, we help every member understand who paid, who joined each split, and how costs were shared."
    >
      <InfoGrid>
        <InfoCard title="Our Mission">
          Make shared money management transparent so friendships and teams stay healthy.
        </InfoCard>
        <InfoCard title="What We Focus On">
          Accurate splits, simple workflows, and clear expense history for every group.
        </InfoCard>
        <InfoCard title="Who Uses Money Split">
          Friends, roommates, students, travelers, and small teams with shared expenses.
        </InfoCard>
      </InfoGrid>

      <InfoCard title="Contact">
        <p>Email: deepaksingh@moneysplit.in</p>
        <p className="mt-1">Phone: +91 8112260346</p>
      </InfoCard>
    </InfoPageShell>
  );
}
