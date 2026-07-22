export function InfoPageShell({ eyebrow, title, description, effectiveDate, children }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-4xl">
          {eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h1>
          {effectiveDate ? (
            <p className="mt-3 text-sm font-semibold text-slate-500">
              Effective date: {effectiveDate}
            </p>
          ) : null}
          {description ? (
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              {description}
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-4xl space-y-6">{children}</div>
      </section>
    </main>
  );
}

export function InfoCard({ title, children }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      {title ? <h2 className="text-lg font-bold text-slate-950">{title}</h2> : null}
      <div className={title ? "mt-2 text-sm leading-6 text-slate-600" : "text-sm leading-6 text-slate-600"}>
        {children}
      </div>
    </article>
  );
}

export function InfoGrid({ children }) {
  return <section className="grid grid-cols-1 gap-4 md:grid-cols-3">{children}</section>;
}
