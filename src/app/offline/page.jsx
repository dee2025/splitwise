import OfflineRetryButton from "@/components/pwa/OfflineRetryButton";
import Image from "next/image";

export const metadata = {
  title: "You're offline",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <main className="min-h-dvh bg-slate-950 px-6 py-10 text-slate-100 dark:bg-slate-950">
      <section className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-md flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl shadow-xl shadow-indigo-950/40">
          <Image
            src="/logo.png"
            alt="MoneySplit"
            width={64}
            height={64}
            priority
            className="h-20 w-20 rounded-2xl"
          />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          You&apos;re offline
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
          MoneySplit needs an internet connection for live balances, groups,
          expenses, and account data. Reconnect and try again.
        </p>
        <div className="mt-7">
          <OfflineRetryButton />
        </div>
      </section>
    </main>
  );
}
