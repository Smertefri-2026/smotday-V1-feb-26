import Link from "next/link";

export default function HomePage() {
  return (
    <div className="hero-grad">
      <section className="container-app py-14">
        <div className="card-soft p-8 md:p-12">
          <p className="pill">Smooday V1</p>

          <h1 className="mt-4 text-4xl md:text-6xl font-heading font-bold tracking-tight">
            More than food. More than training.
          </h1>

          <p className="mt-4 max-w-2xl text-lg" style={{ color: "var(--sd-slate)" }}>
            Daily nutrition you can actually stick with. ODF powder first — smoothies and more coming next.
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