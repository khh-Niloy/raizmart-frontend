"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function ComplainAdvicePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName")?.toString().trim() || "",
      phone: formData.get("phone")?.toString().trim() || "",
      email: formData.get("email")?.toString().trim() || "",
      type: formData.get("type")?.toString().trim() || "",
      details: formData.get("details")?.toString().trim() || "",
    };

    try {
      const response = await fetch("/api/complain-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.ok) {
        toast.success("✅ Thank you! Your submission has been received.");
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error(
          result.error || "⚠️ Something went wrong. You can try whatsapp us directly."
        );
      }
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit. You can try whatsapp us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#F4FBFB] via-white to-[#FFF7F3] py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-[#02C1BE]/20 via-transparent to-transparent" />
      <div className="mx-auto w-[95%] max-w-6xl">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 rounded-3xl bg-white/80 px-8 py-10 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:flex-row sm:px-12">
          <div className="max-w-2xl space-y-4">
            <p className="inline-flex items-center rounded-full bg-[#02C1BE]/10 px-4 py-1 text-sm font-medium text-[#02C1BE]">
              We are listening
            </p>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Share your experience with RaizMart
            </h1>
            <p className="text-base text-slate-600">
              Your insights help us improve every interaction. Submit any
              complaints or advice and our support team will review it within 24
              hours.
            </p>
          </div>
          <div className="rounded-2xl border border-[#02C1BE]/20 bg-[#02C1BE]/5 px-6 py-5 text-sm text-slate-600 sm:w-72">
            <p className="font-semibold text-slate-900">Need urgent help?</p>
            <p className="mt-2">
              Call us at{" "}
              <a
                href="tel:01608362979"
                className="font-semibold text-[#02C1BE] hover:underline"
              >
                01608362979
              </a>{" "}
              or email{" "}
              <a
                href="mailto:raizmart@gmail.com"
                className="font-semibold text-[#02C1BE] hover:underline"
              >
                raizmart@gmail.com
              </a>
              .
            </p>
          </div>
        </div>

        <div className="w-full">
          <div className="rounded-3xl border border-white/60 bg-white/95 p-8 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-10">
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="Enter your full name"
                    className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-slate-800 shadow-sm transition focus:border-[#02C1BE] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#02C1BE]/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Phone No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="Enter your phone number"
                    className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-slate-800 shadow-sm transition focus:border-[#02C1BE] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#02C1BE]/30"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email (optional)"
                    className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-slate-800 shadow-sm transition focus:border-[#02C1BE] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#02C1BE]/30"
                  />
                </div>
              </div>

              <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 px-6 py-6">
                <legend className="px-1 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Select Type <span className="text-red-500">*</span>
                </legend>
                <p className="mt-2 text-sm text-slate-500">
                  Choose the nature of your submission so we can route it to the
                  right specialist.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-xl border border-transparent bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#02C1BE] hover:bg-[#02C1BE]/5">
                    <input
                      type="radio"
                      name="type"
                      value="advice"
                      required
                      className="h-4 w-4 border-slate-300 text-[#02C1BE] focus:ring-[#02C1BE]"
                    />
                    Advice
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-transparent bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#02C1BE] hover:bg-[#02C1BE]/5">
                    <input
                      type="radio"
                      name="type"
                      value="complain"
                      className="h-4 w-4 border-slate-300 text-[#02C1BE] focus:ring-[#02C1BE]"
                    />
                    Complain
                  </label>
                </div>
              </fieldset>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-800">
                  Details (Write your feedback){" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="details"
                  rows={5}
                  required
                  placeholder="Let us know how we can improve your experience"
                  className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-slate-800 shadow-sm transition focus:border-[#02C1BE] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#02C1BE]/30"
                />
                <p className="text-xs text-slate-500">
                  Please avoid sharing sensitive account details. Our team may
                  reach out for follow-up if needed.
                </p>
              </div>

              <div className="flex flex-col-reverse items-stretch justify-between gap-4 sm:flex-row sm:items-center">
                <button
                  type="reset"
                  className="inline-flex items-center justify-center text-sm font-semibold text-[#02C1BE] transition hover:text-[#028f8d]"
                >
                  Clear form
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#DD4B12] to-[#F39C12] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#DD4B12]/25 transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DD4B12]/60 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit feedback"}
                </button>
              </div>

              <div className="mt-8 rounded-2xl border border-dashed border-[#02C1BE]/30 bg-[#02C1BE]/5 px-6 py-6 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Prefer WhatsApp?</p>
                <p className="mt-2">
                  Message us directly through our WhatsApp support channel for a
                  quicker response.
                </p>
                <a
                  href="https://wa.me/8801608362979?text=Hi, is there anyone to assist me?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-fit items-center justify-center rounded-lg bg-[#02C1BE] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#029b99]"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
