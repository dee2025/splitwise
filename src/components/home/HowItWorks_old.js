"use client";

import { motion } from "framer-motion";
import { Calculator, CheckCircle2, PlusCircle, Users } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Create Your Group",
      description:
        "Start a new group for your trip, event, or shared expenses. Give it a memorable name that reflects your adventure.",
      icon: <Users className="w-5 h-5" />,
      visual: {
        title: "Goa Trip 2024",
        members: "5 friends",
        type: "Travel",
        color: "bg-blue-50",
      },
    },
    {
      number: "02",
      title: "Add & Split Expenses",
      description:
        "Easily add expenses for food, travel, accommodation, or anything else. Select participants and let us handle the math.",
      icon: <PlusCircle className="w-5 h-5" />,
      visual: {
        title: "Beachside Dinner",
        amount: "₹2,800",
        split: "5 people",
        paidBy: "You",
        color: "bg-green-50",
      },
    },
    {
      number: "03",
      title: "Settle Up Effortlessly",
      description:
        "Get clear settlement suggestions showing who owes whom. No awkward conversations—just quick, fair resolutions.",
      icon: <Calculator className="w-5 h-5" />,
      visual: {
        title: "All Settled Up!",
        amount: "₹0.00",
        status: "Balanced",
        color: "bg-purple-50",
      },
    },
  ];

  return (
    <section className="px-6 md:px-12 lg:px-20 py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Split expenses with friends and colleagues in three simple steps. No
            complicated math, no forgotten payments.
          </p>
        </motion.div>

        {/* Steps with Visual Cards */}
        <div className="space-y-12">
          {steps.map((step, index) => (
            <StepWithVisual
              key={index}
              number={step.number}
              title={step.title}
              description={step.description}
              icon={step.icon}
              visual={step.visual}
              index={index}
              delay={index * 0.2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepWithVisual({
  number,
  title,
  description,
  icon,
  visual,
  index,
  delay = 0,
}) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className={`flex flex-col lg:flex-row gap-8 items-center ${
        isEven ? "lg:flex-row" : "lg:flex-row-reverse"
      }`}
    >
      {/* Left Side - Content */}
      <div className="flex-1">
        <div className="max-w-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-black text-white flex items-center justify-center font-bold text-lg border-2 border-black">
              {number}
            </div>
            <div className="w-12 h-12 rounded-lg bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-gray-700">
              {icon}
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h3>
          <p className="text-lg text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Right Side - Visual Card */}
      <div className="flex-1 flex justify-center">
        <VisualCard {...visual} index={index} />
      </div>
    </motion.div>
  );
}

function VisualCard({
  title,
  amount,
  split,
  paidBy,
  members,
  type,
  status,
  color,
  index,
}) {
  const getCardContent = (index) => {
    switch (index) {
      case 0: // Group Creation
        return (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{title}</h4>
                <p className="text-sm text-gray-500">{members}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="text-sm text-gray-600">Trip Type</span>
                <span className="font-medium">{type}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="text-sm text-gray-600">Status</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>
        );

      case 1: // Adding Expense
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900">{title}</h4>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-900">{amount}</p>
                <p className="text-sm text-gray-500">{split}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded border">
                <span className="text-gray-600">Paid by</span>
                <span className="font-medium">{paidBy}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded border">
                <span className="text-gray-600">Split between</span>
                <span className="font-medium">5 people</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded border">
                <span className="text-gray-600">Each pays</span>
                <span className="font-bold text-green-600">₹560</span>
              </div>
            </div>
          </div>
        );

      case 2: // Settlement
        return (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 text-lg">{title}</h4>
              <p className="text-2xl font-bold text-gray-900 my-2">{amount}</p>
              <p className="text-sm text-green-600 font-medium">{status}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="text-gray-600">Amit → Priya</span>
                <span className="font-medium text-green-600">₹0</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="text-gray-600">Rohit → You</span>
                <span className="font-medium text-green-600">₹0</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="text-gray-600">Neha → All</span>
                <span className="font-medium text-green-600">₹0</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      viewport={{ once: true }}
      className="w-full max-w-sm"
    >
      <div className="rounded-2xl border-2 border-gray-300 bg-white shadow-sketch-lg hover:shadow-sketch-xl transition-all duration-300 hover:border-black">
        {getCardContent(index)}

        {/* Card Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">splitzy</span>
            <span className="text-gray-400">Live</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
