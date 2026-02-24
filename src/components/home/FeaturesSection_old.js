"use client";

import { motion } from "framer-motion";
import FeatureCard from "./FeatureCard";

export default function FeaturesSection() {
  const features = [
    {
      title: "Create a Trip Group",
      desc: "Bring your friends into one space and keep all expenses in a single timeline.",
      icon: "📁"
    },
    {
      title: "Add & Split Bills",
      desc: "Add expenses, choose who participated, and the app does the math.",
      icon: "📊"
    },
    {
      title: "Instant Settlements",
      desc: "Get a clean, simple summary of who owes whom — without headaches.",
      icon: "⚖️"
    }
  ];

  return (
    <section className="px-10 md:px-20 mb-24">
      <motion.h3 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-3xl font-bold mb-12 border-b-2 border-dotted border-black pb-2 inline-block"
      >
        What makes it smooth?
      </motion.h3>

      <div className="grid md:grid-cols-3 gap-12">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            desc={feature.desc}
            icon={feature.icon}
            delay={index * 0.1}
          />
        ))}
      </div>
    </section>
  );
}