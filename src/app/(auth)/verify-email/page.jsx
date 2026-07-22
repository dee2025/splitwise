import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export const metadata = {
  title: "Verify Email | MoneySplit",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-700 border-t-transparent" />
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
