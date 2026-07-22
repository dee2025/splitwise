import { InfoCard, InfoPageShell } from "@/components/site/InfoPageShell";

export const metadata = {
  title: "Privacy Policy | Money Split",
  description:
    "Read the Money Split privacy policy to understand what data we collect, how we use it, and how we protect user information.",
  alternates: { canonical: "https://www.moneysplit.in/privacy-policy" },
};

const sections = [
  {
    title: "1. Data We Collect",
    body: "Account details, group and expense records, member activity, and technical logs needed for security and performance.",
  },
  {
    title: "2. How We Use Data",
    body: "To provide core product features, improve reliability, prevent abuse, and communicate important account or policy updates.",
  },
  {
    title: "3. Data Retention",
    body: "We keep data only as long as needed for product operation, legal compliance, and dispute resolution.",
  },
  {
    title: "4. Security Controls",
    body: "We apply standard safeguards to protect data in transit and at rest, and monitor unusual access behavior.",
  },
  {
    title: "5. Contact",
    body: "Email: deepaksingh@moneysplit.in | Phone: +91 8112260346",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <InfoPageShell
      eyebrow="Privacy"
      title="Privacy Policy"
      effectiveDate="April 4, 2026"
      description="Money Split collects only the information necessary to provide group expense tracking, group management, and account security. We do not sell user personal data."
    >
      {sections.map((section) => (
        <InfoCard key={section.title} title={section.title}>
          {section.body}
        </InfoCard>
      ))}
    </InfoPageShell>
  );
}
