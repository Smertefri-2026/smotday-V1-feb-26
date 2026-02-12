// /src/app/(public)/sections/Section7Contact.tsx
import Link from "next/link";

export default function Section7Contact() {
  return (
    <section className="container-app pb-16">
      <div className="card p-6">
        <div className="grid gap-6 md:grid-cols-12 md:items-start">
          <div className="md:col-span-7">
            <h2 className="font-heading text-2xl font-semibold">Contact</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--sd-slate)" }}>
              Questions about Smooday, shipping, or coaching? Send us an email and we’ll reply fast.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                className="btn btn-primary"
                href="mailto:hello@smood.day?subject=Smooday%20question"
              >
                Email hello@smood.day
              </a>
              <Link className="btn btn-ghost" href="/products">
                Products
              </Link>
            </div>

            <div className="mt-6 rounded-2xl border bg-[rgba(2,6,23,0.03)] p-4 text-sm" style={{ color: "var(--sd-slate)" }}>
              Next: We can add a proper contact form with spam protection (Turnstile) + admin email routing.
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="rounded-3xl border bg-white p-6">
              <div className="text-sm font-semibold">Business</div>
              <div className="mt-2 text-sm" style={{ color: "var(--sd-slate)" }}>
                Smooday is building a simple nutrition system: log → see coverage → improve routine.
              </div>

              <div className="mt-5 rounded-2xl border p-4">
                <div className="text-xs font-semibold" style={{ color: "var(--sd-slate)" }}>
                  Useful links
                </div>

                <div className="mt-2 flex flex-col gap-2">
                  <Link className="underline" href="/products">
                    Products
                  </Link>
                  <a className="underline" href="#quick-check">
                    Quick check
                  </a>
                  <a className="underline" href="mailto:hello@smood.day?subject=Coaching%20question">
                    Coaching questions
                  </a>
                </div>
              </div>

              <p className="mt-4 text-[11px]" style={{ color: "var(--sd-slate)" }}>
                * Legal text, VAT/tax notes and policies can be added later when logistics are finalized.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}