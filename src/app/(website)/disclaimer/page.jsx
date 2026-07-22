import { InfoCard, InfoPageShell } from "@/components/site/InfoPageShell";

export const metadata = {
  title: "Disclaimer | Money Split",
  description:
    "Important disclaimer regarding informational use, financial responsibility, and service limitations on Money Split.",
  alternates: { canonical: "https://www.moneysplit.in/disclaimer" },
};

const sections = [
  {
    title: "1. Informational Use",
    body: "Money Split provides expense tracking tools for informational and organizational use.",
  },
  {
    title: "2. User Responsibility",
    body: "Financial decisions and any real-world transfers outside the app are the responsibility of users and group members.",
  },
  {
    title: "3. No Professional Advice",
    body: "We do not provide legal, tax, accounting, or financial advisory services. Please consult qualified professionals when needed.",
  },
  {
    title: "4. Accuracy and Availability",
    body: "While we work to keep calculations and records reliable, users should verify critical entries and maintain independent records when appropriate.",
  },
  {
    title: "5. Contact",
    body: "deepaksingh@moneysplit.in | +91 8112260346",
  },
];

export default function DisclaimerPage() {
  return (
    <InfoPageShell eyebrow="Legal" title="Disclaimer">
      {sections.map((section) => (
        <InfoCard key={section.title} title={section.title}>
          {section.body}
        </InfoCard>
      ))}
    </InfoPageShell>
  );
}
