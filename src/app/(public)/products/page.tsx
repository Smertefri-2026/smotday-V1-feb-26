import Image from "next/image";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  flavor: string;
  desc: string;
  image: string;
  oneTimeEur: number;
  subEur: number;
  inStock: boolean; // set true when inventory arrives
};

const PRODUCTS: Product[] = [
  {
    id: "odf-citrus-30",
    name: "ODF 30-Day Supply",
    flavor: "Citrus",
    desc: "EAA + vitamins. Mix with water. Designed for daily consistency.",
    image: "/products/citrus.png",
    oneTimeEur: 69,
    subEur: 62, // ~10% off
    inStock: false,
  },
  {
    id: "odf-vanilla-30",
    name: "ODF 30-Day Supply",
    flavor: "Vanilla",
    desc: "EAA + vitamins. Smooth taste. Mix with water — daily routine made easy.",
    image: "/products/vanilla.png",
    oneTimeEur: 69,
    subEur: 62, // ~10% off
    inStock: false,
  },
];

function formatEur(amount: number) {
  return `€${amount}`;
}

export default function ProductsPage() {
  return (
    <div className="hero-grad">
      <section className="container-app py-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold">Products</h1>
            <p className="mt-2 max-w-2xl text-lg" style={{ color: "var(--sd-slate)" }}>
              Start with ODF powder. Smoothies and more are coming next.
            </p>

            <p className="mt-2 text-xs" style={{ color: "var(--sd-slate)" }}>
              Shipping included. <span className="opacity-80">Local taxes &amp; duties may apply at delivery.</span>
            </p>
          </div>

          <Link href="/checkout" className="btn btn-ghost md:self-center">
            Checkout
          </Link>
        </div>

        {/* Subscription pitch */}
        <div className="mt-6 card-soft p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="pill inline-flex">Save 10%</p>
              <h2 className="mt-3 font-heading text-xl font-semibold">Subscribe &amp; save</h2>
              <p className="mt-1" style={{ color: "var(--sd-slate)" }}>
                Get your monthly pack automatically — 10% discount vs one-time.
              </p>
              <p className="mt-2 text-xs" style={{ color: "var(--sd-slate)" }}>
                Shipping included. <span className="opacity-80">Local taxes &amp; duties may apply at delivery.</span>
              </p>
            </div>

            <div className="text-sm" style={{ color: "var(--sd-slate)" }}>
              Subscription:{" "}
              <span className="font-extrabold" style={{ color: "var(--sd-ink)" }}>
                {formatEur(62)}
              </span>{" "}
              / month
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {PRODUCTS.map((p) => (
            <div key={p.id} className="card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-xl font-semibold">
                    {p.name} — {p.flavor}
                  </h3>
                  <p className="mt-2" style={{ color: "var(--sd-slate)" }}>
                    {p.desc}
                  </p>
                </div>

                {!p.inStock && (
                  <span className="pill" style={{ background: "rgba(2,6,23,0.06)", color: "var(--sd-ink)" }}>
                    Sold out
                  </span>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border p-4">
                  <div className="text-xs font-semibold" style={{ color: "var(--sd-slate)" }}>
                    One-time
                  </div>
                  <div className="mt-1 text-lg font-extrabold">{formatEur(p.oneTimeEur)}</div>
                  <div className="mt-1 text-xs" style={{ color: "var(--sd-slate)" }}>
                    Shipping included
                  </div>
                </div>

                <div className="rounded-2xl border p-4">
                  <div className="text-xs font-semibold" style={{ color: "var(--sd-slate)" }}>
                    Subscription (10% off)
                  </div>
                  <div className="mt-1 text-lg font-extrabold">{formatEur(p.subEur)}</div>
                  <div className="mt-1 text-xs" style={{ color: "var(--sd-slate)" }}>
                    Shipping included
                  </div>
                </div>
              </div>

              {/* Image: square container matches your 1:1 renders */}
              <div className="mt-5 relative overflow-hidden rounded-2xl border">
                <div className="relative aspect-square w-full bg-[rgba(2,6,23,0.03)]">
                  <Image
                    src={p.image}
                    alt={`${p.name} ${p.flavor}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                    priority={false}
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm" style={{ color: "var(--sd-slate)" }}>
                  30-day supply • Powder • Mix with water
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/checkout?sku=${encodeURIComponent(p.id)}&plan=one_time`}
                    className={`btn btn-ghost ${!p.inStock ? "pointer-events-none opacity-50" : ""}`}
                    aria-disabled={!p.inStock}
                  >
                    Buy one-time
                  </Link>

                  <Link
                    href={`/checkout?sku=${encodeURIComponent(p.id)}&plan=sub`}
                    className={`btn btn-primary ${!p.inStock ? "pointer-events-none opacity-50" : ""}`}
                    aria-disabled={!p.inStock}
                  >
                    Subscribe
                  </Link>
                </div>
              </div>

              <p className="mt-3 text-xs" style={{ color: "var(--sd-slate)" }}>
                Shipping included. <span className="opacity-80">Local taxes &amp; duties may apply at delivery.</span>
              </p>

              {!p.inStock && (
                <div className="mt-4 text-sm" style={{ color: "var(--sd-slate)" }}>
                  Want a notification when it’s back?{" "}
                  <a className="underline" href={`mailto:hello@smood.day?subject=Notify%20me%20-%20${encodeURIComponent(p.flavor)}`}>
                    Email us
                  </a>
                  .
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}