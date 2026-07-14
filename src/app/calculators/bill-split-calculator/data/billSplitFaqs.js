export const billSplitFaqs = [
  {
    question: "How do I split a bill equally?",
    answer:
      "Enter the total bill, add everyone who is sharing it, and choose Equal. MoneySplit divides the final amount across all participants and adjusts paise rounding so the total stays exact.",
  },
  {
    question: "Can I split a bill by percentage?",
    answer:
      "Yes. Choose Percentage, enter each person's percentage, and make sure the total is exactly 100%. The calculator shows each person's amount instantly.",
  },
  {
    question: "How do I divide a restaurant bill when everyone ordered different items?",
    answer:
      "Use Custom amount when each person owes an exact amount. You can also use Shares if some people should pay more portions than others.",
  },
  {
    question: "Does the calculator include GST and tips?",
    answer:
      "Yes. Open the tax, tip and discount section to add GST, tip, service charge or a discount before the final bill is split.",
  },
  {
    question: "Do I need a MoneySplit account to use the calculator?",
    answer:
      "No. The calculator works without signup. You only need an account if you want to save the result and track it in your MoneySplit dashboard.",
  },
  {
    question: "Can I save the calculated bill in my MoneySplit dashboard?",
    answer:
      "Yes. Use Split & Save in MoneySplit. The calculator draft is preserved through login or signup and opened in the MoneySplit group workflow.",
  },
  {
    question: "How does MoneySplit handle rounding differences?",
    answer:
      "MoneySplit calculates in paise and assigns any remaining paise to participants in order, so the individual amounts always add up to the final bill.",
  },
  {
    question: "Is the Bill Split Calculator free?",
    answer:
      "Yes. The Bill Split Calculator is free to use for quick restaurant, grocery, trip and group expense splits.",
  },
];

export function faqPageJsonLd(faqs = billSplitFaqs) {
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
