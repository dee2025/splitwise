import { InfoCard, InfoPageShell } from "@/components/site/InfoPageShell";

export const metadata = {
  title: "Cookie Policy | Money Split",
  description:
    "Understand how Money Split uses cookies and similar technologies to improve user experience and platform security.",
  alternates: { canonical: "https://www.moneysplit.in/cookie-policy" },
};

const sections = [
  {
    title: "1. Essential Cookies",
    body: "Required for login sessions, request validation, and security protections.",
  },
  {
    title: "2. Performance Cookies",
    body: "Help us understand reliability and usage patterns so we can improve product speed and stability.",
  },
  {
    title: "3. Your Choices",
    body: "You can control cookies through browser settings, but disabling required cookies may break core functionality.",
  },
  {
    title: "4. Policy Updates",
    body: "We may update this policy to reflect platform, legal, or security requirements.",
  },
  {
    title: "5. Contact",
    body: "deepaksingh@moneysplit.in | +91 8112260346",
  },
];

export default function CookiePolicyPage() {
  return (
    <InfoPageShell
      eyebrow="Privacy"
      title="Cookie Policy"
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
