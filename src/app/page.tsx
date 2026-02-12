// /src/app/page.tsx
import Link from "next/link";

import Section2QuickTracker from "@/app/(public)/sections/Section2QuickTracker";
import Section3Coverage from "@/app/(public)/sections/Section3Coverage";

export default function HomePage() {
  return (
    <div className="hero-grad">
      {/* SECTION 1: HERO */}
      <section className="container-app py-14">
        <div className="card-soft p-8 md:p-12">
          <p className="pill">Your body</p>

          <h1 className="mt-4 text-4xl md:text-6xl font-heading font-bold tracking-tight">
            Are you sure your body getting everything its needs?
          </h1>

          <p className="mt-4 max-w-2xl text-lg" style={{ color: "var(--sd-slate)" }}>
            Test here, enter your data + the food and supplements you take today and check.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className="btn btn-primary">
              View products
            </Link>
            <Link href="/login" className="btn btn-ghost">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: QUICK TRACKER */}
      <Section2QuickTracker />

      {/* SECTION 3: COVERAGE */}
      <Section3Coverage />

      {/* SECTION 4: SIMPLE VALUE CARDS (keep for now) */}
      <section className="container-app pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-6">
            <h3 className="font-heading text-xl font-semibold">ODF Powder</h3>
            <p className="mt-2" style={{ color: "var(--sd-slate)" }}>
              A premium daily blend — simple to use.
            </p>
          </div>

          <div className="card p-6">
            <h3 className="font-heading text-xl font-semibold">Taste + Effect</h3>
            <p className="mt-2" style={{ color: "var(--sd-slate)" }}>
              Taste first — built with well-documented ingredients.
            </p>
          </div>

          <div className="card p-6">
            <h3 className="font-heading text-xl font-semibold">Subscription</h3>
            <p className="mt-2" style={{ color: "var(--sd-slate)" }}>
              Monthly delivery (coming soon).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}