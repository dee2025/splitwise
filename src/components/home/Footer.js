"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Security", href: "#security" },
    ],
    company: [
      { label: "About", href: "#about" },
      { label: "Blog", href: "#blog" },
      { label: "Careers", href: "#careers" },
    ],
    legal: [
      { label: "Privacy", href: "#privacy" },
      { label: "Terms", href: "#terms" },
      { label: "Contact", href: "#contact" },
    ],
  };

  const social = [
    { icon: Twitter, href: "#twitter", label: "Twitter" },
    { icon: Github, href: "#github", label: "GitHub" },
    { icon: Linkedin, href: "#linkedin", label: "LinkedIn" },
    { icon: Mail, href: "#mail", label: "Email" },
  ];

  return (
    <footer className="w-full bg-white border-t border-gray-200">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-12 sm:mb-16">
            {/* Brand Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link href="/" className="inline-block mb-4">
                <span className="text-xl sm:text-2xl font-bold">
                  Split
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Wise
                  </span>
                </span>
              </Link>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Making shared expenses simple, fair, and stress-free for
                everyone.
              </p>
              <div className="flex gap-3">
                {social.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.a
                      key={index}
                      href={item.href}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-600 flex items-center justify-center transition-all duration-300"
                      aria-label={item.label}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

            {/* Product Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-8 sm:pt-10">
            {/* Bottom Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-gray-600">
                © {currentYear} SplitWise. Built with love for friends and
                travelers.
              </p>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-600">
                <Link
                  href="#privacy"
                  className="hover:text-blue-600 transition-colors"
                >
                  Privacy Policy
                </Link>
                <span className="text-gray-300">•</span>
                <Link
                  href="#terms"
                  className="hover:text-blue-600 transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
