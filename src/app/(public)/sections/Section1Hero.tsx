// /src/app/(public)/sections/Section1Hero.tsx
import Link from "next/link";

export default function Section1Hero() {
  return (
    <section className="container-app py-12 md:py-16">
      <div className="card-soft p-8 md:p-12">
        <p className="pill inline-flex"></p>

        <h1 className="mt-4 text-4xl md:text-6xl font-heading font-bold tracking-tight">
          Daily nutrition that’s easy to follow.
        </h1>

        <p className="mt-4 max-w-2xl text-lg" style={{ color: "var(--sd-slate)" }}>
          Log 3 meals, add supplements, and see your coverage across macros, vitamins, minerals, fatty acids and EAA.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/products" className="btn btn-primary">
            View products
          </Link>
          <a href="#quick-check" className="btn btn-ghost">
            Try quick check
          </a>
        </div>

        <div
          className="mt-8 rounded-2xl border bg-white p-4 text-sm"
          style={{ borderColor: "rgba(2,6,23,0.10)", color: "var(--sd-slate)" }}
        >
          Tip: This is a quick tracker in V1. Later we can add login + history + “My Page” with purchases and progress.
        </div>
      </div>
    </section>
  );
}