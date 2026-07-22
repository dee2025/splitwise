import { InfoCard, InfoGrid, InfoPageShell } from "@/components/site/InfoPageShell";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact Money Split",
  description:
    "Contact Money Split support for account, billing, partnership, and product related help.",
  alternates: { canonical: "https://www.moneysplit.in/contact" },
};

export default function ContactPage() {
  return (
    <InfoPageShell
      eyebrow="Support"
      title="Contact Us"
      description="For support, business queries, feedback, or legal communication, reach us through the details below."
    >
      <ContactForm />

      <InfoCard title="Money Split Support">
        <p>Email: deepaksingh@moneysplit.in</p>
        <p className="mt-1">Phone: +91 8112260346</p>
        <p className="mt-3 text-xs font-semibold text-slate-500">
          Response window: Mon-Sat, 10:00 AM - 7:00 PM IST
        </p>
      </InfoCard>

      <InfoGrid>
        <InfoCard title="Support Topics">
          Login help, account access, group questions, and report-related assistance.
        </InfoCard>
        <InfoCard title="Partnerships">
          Reach out for integrations, campus communities, and brand partnerships.
        </InfoCard>
        <InfoCard title="Legal & Compliance">
          For notices and policy clarifications, use the same official email and phone.
        </InfoCard>
      </InfoGrid>
    </InfoPageShell>
  );
}
