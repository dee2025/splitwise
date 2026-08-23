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
    title: "3. Analytics, Advertising and Cookies",
    body: (
      <>
        <p>
          Money Split may use Google products such as Google Analytics and Google
          AdSense to measure site performance, understand aggregate usage, and
          support advertising on public content pages. These services may use
          cookies, web beacons, IP addresses, device identifiers, and similar
          technologies.
        </p>
        <p className="mt-3">
          Third parties, including Google, may place and read cookies in your
          browser or use web beacons to collect information as a result of ad
          serving and analytics on this website. Learn more at{" "}
          <a
            href="https://www.google.com/policies/privacy/partners/"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-indigo-700 hover:text-indigo-900"
          >
            How Google uses data when you use our partners&apos; sites or apps
          </a>
          .
        </p>
      </>
    ),
  },
  {
    title: "4. Data Sharing",
    body: "We do not sell user personal data. We may share limited data with service providers that help us operate hosting, security, analytics, email, and advertising features, or when required by law.",
  },
  {
    title: "5. Data Retention",
    body: "We keep data only as long as needed for product operation, legal compliance, and dispute resolution.",
  },
  {
    title: "6. Security Controls",
    body: "We apply standard safeguards to protect data in transit and at rest, and monitor unusual access behavior.",
  },
  {
    title: "7. User Choices",
    body: "You can request account deletion from the Delete Account page, control cookies in your browser settings, and contact us for privacy questions using the details below.",
  },
  {
    title: "8. Contact",
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
