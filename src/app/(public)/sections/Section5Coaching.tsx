// /src/app/(public)/sections/Section5Coaching.tsx
"use client";

import Link from "next/link";

export default function Section5Coaching() {
  // Later: swap this to your real booking link (Cal.com)
  const bookingUrl = "https://cal.com/smertefri/25min";

  return (
    <section className="container-app pb-12">
      <div className="card p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold">Need help to hit your goals?</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--sd-slate)" }}>
              Book a 25-minute nutrition call. Simple, practical, and designed to build routines you can follow.
            </p>
          </div>
          <a href={bookingUrl} target="_blank" rel="noreferrer" className="btn btn-primary md:self-center">
            Book 25 min
          </a>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {/* Single */}
          <div className="rounded-2xl border bg-white p-6">
            <p className="pill inline-flex">Single session</p>
            <h3 className="mt-3 font-heading text-xl font-semibold">€99</h3>
            <p className="mt-2" style={{ color: "var(--sd-slate)" }}>
              One 25-minute call. Perfect for a quick plan, a reset, or a routine upgrade.
            </p>

            <ul className="mt-4 space-y-2 text-sm" style={{ color: "var(--sd-ink)" }}>
              <li>• Simple daily targets (macros + key nutrients)</li>
              <li>• Product + supplement routine that makes sense</li>
              <li>• “What to do next week” checklist</li>
            </ul>

            <div className="mt-6 flex gap-2">
              <a href={bookingUrl} target="_blank" rel="noreferrer" className="btn btn-primary w-full justify-center">
                Book €99
              </a>
            </div>
          </div>

          {/* Monthly */}
          <div className="rounded-2xl border bg-white p-6">
            <p className="pill inline-flex">Monthly</p>
            <h3 className="mt-3 font-heading text-xl font-semibold">€299 / month</h3>
            <p className="mt-2" style={{ color: "var(--sd-slate)" }}>
              Weekly 25-minute calls. Best if you want consistent accountability and measurable progress.
            </p>

            <ul className="mt-4 space-y-2 text-sm" style={{ color: "var(--sd-ink)" }}>
              <li>• 4 calls/month (weekly)</li>
              <li>• Adjust macros + routine based on your log</li>
              <li>• Support for travel, busy weeks, plateaus</li>
            </ul>

            <div className="mt-6 flex gap-2">
              <a href={bookingUrl} target="_blank" rel="noreferrer" className="btn btn-primary w-full justify-center">
                Start €299/month
              </a>
            </div>

            <p className="mt-3 text-[11px]" style={{ color: "var(--sd-slate)" }}>
              * Payments and availability will be finalized in V1. This section is a conversion-first placeholder.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border bg-[rgba(2,6,23,0.03)] p-4 text-sm" style={{ color: "var(--sd-slate)" }}>
          Want us to connect this to Stripe later? We can add a “Pay & book” flow (Stripe Checkout + redirect to Cal.com).
        </div>
      </div>
    </section>
  );
}