"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import HomeLayout from "@/components/home/HomeLayout";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import HowItWorks from "@/components/home/HowItWorks";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated } = useSelector((state) => state.auth); // Use auth slice
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if user is logged in
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Show loading while checking authentication
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-black" />
          <p className="text-gray-600">Redirecting to main dashboard ...</p>
        </div>
      </div>
    );
  }

  return (
    <HomeLayout>
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
    </HomeLayout>
  );
}