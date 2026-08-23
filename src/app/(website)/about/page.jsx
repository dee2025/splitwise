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
          Make shared money management transparent so friends, roommates, families, and small teams can settle bills without repeated calculations or uncomfortable reminders.
        </InfoCard>
        <InfoCard title="What We Focus On">
          Accurate splits, simple workflows, clear expense history, and readable balances for every group.
        </InfoCard>
        <InfoCard title="Who Uses Money Split">
          Friends, roommates, students, travelers, and small teams with shared expenses.
        </InfoCard>
      </InfoGrid>

      <InfoCard title="Why the product exists">
        <p>
          Shared expenses often start in informal places: a dinner receipt in a chat,
          a taxi screenshot, a rent message, or a hotel booking confirmation. Those
          records become hard to audit once more people pay for different things.
          Money Split brings those payments into one group ledger so each member can
          see what was paid, who was included, and what balance remains.
        </p>
        <p className="mt-3">
          The product is intentionally focused on everyday shared bills rather than
          complex personal finance. It is built for common cases such as trips,
          roommate homes, office lunches, family plans, events, and friend groups.
        </p>
      </InfoCard>

      <InfoGrid>
        <InfoCard title="Editorial standards">
          Our public guides are written to explain practical expense-sharing
          decisions: when to split equally, when to split by participant, how to
          treat refunds, and how to keep personal purchases separate from group costs.
        </InfoCard>
        <InfoCard title="Privacy approach">
          Group expense data belongs to the account and group members who create it.
          We provide account deletion controls and publish clear privacy, cookie,
          terms, and disclaimer pages for users and reviewers.
        </InfoCard>
        <InfoCard title="Support commitment">
          Users can contact Money Split for account access, group questions,
          product feedback, policy clarification, and legal communication through
          the official support details below.
        </InfoCard>
      </InfoGrid>

      <InfoCard title="Contact">
        <p>Email: deepaksingh@moneysplit.in</p>
        <p className="mt-1">Phone: +91 8112260346</p>
      </InfoCard>
    </InfoPageShell>
  );
}
