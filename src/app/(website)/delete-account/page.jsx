import { CheckCircle2, Database, Mail, ShieldCheck, Trash2 } from "lucide-react";
import DeleteAccountClient from "./DeleteAccountClient";

export const metadata = {
  title: "Delete Account | MoneySplit",
  description:
    "Request deletion of your MoneySplit account and associated data. Includes deletion steps, data removed, data retained, and retention periods.",
  alternates: { canonical: "https://www.moneysplit.in/delete-account" },
};

const deletedData = [
  "MoneySplit account profile, name, email, contact number, bio, avatar reference, login credentials, and third-party sign-in identifiers.",
  "Group memberships connected to your account and in-app notifications addressed to your account.",
  "Activity records and expense records where your account paid, owed, or was included in the split.",
  "Groups created by your account when no other registered member can take ownership.",
];

const retainedData = [
  "Shared group records that do not include your account may remain for other group members.",
  "Support emails and deletion request correspondence may be retained for up to 90 days for abuse prevention and audit history.",
  "Encrypted backups may retain deleted data for up to 30 days before normal backup rotation removes it.",
  "Information required by law, fraud prevention, security, or dispute handling may be retained only for the required period.",
];

export default function DeleteAccountPage() {
  return (
    <main className="bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
              Account and data deletion
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Delete your MoneySplit account
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Use this page to request deletion of your MoneySplit account and associated data. This is the account
              deletion URL for the MoneySplit app:{" "}
              <span className="font-semibold text-slate-950">https://www.moneysplit.in/delete-account</span>.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-700" />
                <h2 className="text-xl font-bold text-slate-950">How to request deletion</h2>
              </div>
              <ol className="space-y-3 text-sm leading-6 text-slate-700">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                    1
                  </span>
                  Sign in to your MoneySplit account from this page.
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                    2
                  </span>
                  Confirm the request by entering your password for email accounts, or by using your signed-in Google
                  session for Google accounts.
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                    3
                  </span>
                  Type DELETE and submit. The deletion process starts immediately and signs you out.
                </li>
              </ol>
              <p className="text-sm leading-6 text-slate-600">
                If you cannot access your account, email{" "}
                <a className="font-semibold text-indigo-700 hover:text-indigo-900" href="mailto:deepaksingh@moneysplit.in">
                  deepaksingh@moneysplit.in
                </a>{" "}
                from your registered email address with the subject &quot;MoneySplit Account Deletion Request&quot;.
              </p>
            </section>

            <section className="grid gap-5 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-rose-600" />
                  <h2 className="text-lg font-bold text-slate-950">Data deleted</h2>
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  {deletedData.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-indigo-700" />
                  <h2 className="text-lg font-bold text-slate-950">Data retained</h2>
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  {retainedData.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-indigo-700" />
                <h2 className="text-lg font-bold text-slate-950">Processing time</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                In-app account deletion is processed immediately. Manual email requests are reviewed after ownership
                verification and normally completed within 7 days. Some deleted data may remain in backups for up to 30
                days before backup rotation removes it.
              </p>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <DeleteAccountClient />
          </aside>
        </div>
      </section>
    </main>
  );
}
