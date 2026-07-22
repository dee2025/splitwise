"use client";

import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";

const enquiryTypes = [
  { value: "feedback", label: "Feedback" },
  { value: "bug", label: "Bug report" },
  { value: "report", label: "Report a problem" },
  { value: "support", label: "Account support" },
  { value: "partnership", label: "Partnership" },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  enquiryType: "feedback",
  subject: "",
  message: "",
  companyWebsite: "",
};

function inputClass(hasError) {
  return `mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:ring-2 ${
    hasError
      ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-rose-100"
      : "border-slate-300 bg-white focus:border-indigo-600 focus:ring-indigo-100"
  }`;
}

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (errors[field]) {
      setErrors((previous) => ({ ...previous, [field]: "" }));
    }
    if (status) setStatus(null);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || {});
        setStatus({
          type: "error",
          message: data.error || "Please check the form and try again.",
        });
        return;
      }

      setForm(initialForm);
      setStatus({
        type: "success",
        message: data.message || "Your enquiry has been sent successfully.",
      });
    } catch {
      setStatus({
        type: "error",
        message: "Unable to send enquiry. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submitForm}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]"
    >
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-950">Send an enquiry</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Share feedback, report a bug, or send a support request. Your message will be sent directly to Money Split support.
        </p>
      </div>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={form.companyWebsite}
        onChange={(event) => updateField("companyWebsite", event.target.value)}
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Full name
          </label>
          <input
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className={inputClass(errors.name)}
            placeholder="Your name"
            autoComplete="name"
          />
          {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name}</p> : null}
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Email address
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className={inputClass(errors.email)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email}</p> : null}
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Phone number
          </label>
          <input
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className={inputClass(errors.phone)}
            placeholder="+91 98765 43210"
            autoComplete="tel"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Enquiry type
          </label>
          <select
            value={form.enquiryType}
            onChange={(event) => updateField("enquiryType", event.target.value)}
            className={inputClass(errors.enquiryType)}
          >
            {enquiryTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.enquiryType ? (
            <p className="mt-1 text-xs text-rose-600">{errors.enquiryType}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Subject
        </label>
        <input
          value={form.subject}
          onChange={(event) => updateField("subject", event.target.value)}
          className={inputClass(errors.subject)}
          placeholder="Short summary"
        />
        {errors.subject ? <p className="mt-1 text-xs text-rose-600">{errors.subject}</p> : null}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Message
          </label>
          <span className="text-xs text-slate-500">{form.message.length}/3000</span>
        </div>
        <textarea
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          className={`${inputClass(errors.message)} min-h-36 resize-y leading-6`}
          placeholder="Tell us what happened, what you expected, or what feedback you want to share."
          maxLength={3000}
        />
        {errors.message ? <p className="mt-1 text-xs text-rose-600">{errors.message}</p> : null}
      </div>

      {status ? (
        <div
          className={`mt-5 flex items-start gap-2 rounded-lg border px-3 py-3 text-sm ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {isSubmitting ? "Sending" : "Send enquiry"}
      </button>
    </form>
  );
}
