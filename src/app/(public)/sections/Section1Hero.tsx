// /src/app/(public)/sections/Section1Hero.tsx
import Link from "next/link";

export default function Section1Hero() {
  return (
    <section className="container-app py-12 md:py-16">
      <div className="card-soft p-8 md:p-12 relative overflow-hidden">
        {/* Subtle color blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--sd-teal)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
          style={{ background: "var(--sd-primary)" }}
        />

        <p className="pill inline-flex">
          Science-backed daily nutrition
        </p>

        <h1 className="mt-5 text-4xl md:text-6xl font-heading font-bold tracking-tight">
          Does your body get <span style={{ color: "var(--sd-primary-ink)" }}>everything</span> it needs —
          every day?
        </h1>

        <p className="mt-4 max-w-2xl text-lg" style={{ color: "var(--sd-slate)" }}>
          Quick-check today’s intake across <span className="font-semibold">energy + macros</span>, plus key
          <span className="font-semibold"> vitamins, minerals, fatty acids</span> and <span className="font-semibold">EAA</span>.
          Built for clarity — powered by nutrition science.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/products" className="btn btn-primary">
            Shop Smooday
          </Link>
          <a href="#quick-check" className="btn btn-ghost">
            Check today’s coverage
          </a>
        </div>

        {/* Trust / promise row */}
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-4">
            <div className="text-sm font-semibold">Transparent logic</div>
            <div className="mt-1 text-sm" style={{ color: "var(--sd-slate)" }}>
              Clear inputs → clear outputs. No mystery scoring.
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <div className="text-sm font-semibold">Quality nutrition</div>
            <div className="mt-1 text-sm" style={{ color: "var(--sd-slate)" }}>
              Premium ingredients with a focus on documented effects.
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <div className="text-sm font-semibold">Make it stick</div>
            <div className="mt-1 text-sm" style={{ color: "var(--sd-slate)" }}>
              Simple routines you can actually follow daily.
            </div>
          </div>
        </div>

        {/* Small note (no “V1”) */}
        <div
          className="mt-6 rounded-2xl border bg-white p-4 text-sm"
          style={{ borderColor: "rgba(2,6,23,0.10)", color: "var(--sd-slate)" }}
        >
          Start by filling in your profile, log your meals and supplements — then see what you’re missing and what to improve next.
        </div>
      </div>
    </section>
  );
}