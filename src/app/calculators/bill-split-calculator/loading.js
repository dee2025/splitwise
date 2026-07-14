export default function LoadingBillSplitCalculator() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 h-6 w-72 animate-pulse rounded bg-slate-800" />
        <div className="mb-10 h-40 animate-pulse rounded-2xl bg-slate-900" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.38fr)_minmax(340px,1fr)]">
          <div className="space-y-5">
            <div className="h-80 animate-pulse rounded-2xl bg-slate-800" />
            <div className="h-72 animate-pulse rounded-2xl bg-slate-800" />
          </div>
          <div className="h-96 animate-pulse rounded-2xl bg-slate-800" />
        </div>
      </div>
    </main>
  );
}
