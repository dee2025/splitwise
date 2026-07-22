import { InfoCard, InfoPageShell } from "@/components/site/InfoPageShell";

export const metadata = {
  title: "Terms of Service | Money Split",
  description:
    "Read terms and conditions for using Money Split, including acceptable use, service scope, and liability terms.",
  alternates: { canonical: "https://www.moneysplit.in/terms-of-service" },
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By creating an account or using Money Split, you agree to these terms and any future updates posted on this page.",
  },
  {
    title: "2. Account Responsibility",
    body: "You are responsible for account security, credentials, and all activity performed under your account.",
  },
  {
    title: "3. Acceptable Use",
    body: "You must not use the service for fraud, abuse, unauthorized access attempts, or any unlawful financial activity.",
  },
  {
    title: "4. Service Changes",
    body: "We may update, improve, or retire product features to maintain reliability, compliance, and user experience.",
  },
  {
    title: "5. Limitation of Liability",
    body: "Money Split provides calculation and tracking tools. Final payment decisions remain the responsibility of users and group members.",
  },
  {
    title: "6. Contact",
    body: "For legal or support communication: deepaksingh@moneysplit.in | +91 8112260346",
  },
];

export default function TermsOfServicePage() {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Terms of Service"
      effectiveDate="April 4, 2026"
    >
      {sections.map((section) => (
        <InfoCard key={section.title} title={section.title}>
          {section.body}
        </InfoCard>
      ))}
    </InfoPageShell>
  );
}
