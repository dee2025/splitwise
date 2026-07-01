export const homeFaqs = [
  {
    question: "What is Money Split used for?",
    answer:
      "Money Split helps friends, roommates, couples, families, and travel groups record shared expenses, split bills fairly, and see who owes whom without manual calculations.",
  },
  {
    question: "Can I use Money Split for trips and roommate expenses?",
    answer:
      "Yes. You can create separate groups for trips, shared homes, office lunches, events, or recurring household costs, then add members and track every expense in one place.",
  },
  {
    question: "How does Money Split calculate balances?",
    answer:
      "When an expense is added, Money Split records who paid, who participated, and the split method. It then updates group balances so every member can see the amount they owe or are owed.",
  },
  {
    question: "Is Money Split free to use?",
    answer:
      "Money Split can be used for free to create groups, add expenses, and manage shared balances. You can start without a credit card.",
  },
  {
    question: "Why is tracking shared expenses better than using chat messages?",
    answer:
      "A dedicated expense tracker keeps receipts, members, payment history, and balances organized. This reduces confusion, missed costs, duplicate reminders, and awkward follow-ups.",
  },
  {
    question: "Can published guides and articles help me learn better expense sharing?",
    answer:
      "Yes. Money Split publishes practical guides on trip budgeting, roommate bills, couple finances, and family expense planning so users can make better decisions before costs become disputes.",
  },
];

export function faqPageJsonLd(faqs = homeFaqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
