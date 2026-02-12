"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Product = {
  id: string;
  title: string;
  oneTimeNok: number;
  subNok: number;
  inStock: boolean;
};

const PRODUCTS: Record<string, Product> = {
  "odf-citrus-30": { id: "odf-citrus-30", title: "ODF 30-Day Supply — Citrus", oneTimeNok: 590, subNok: 531, inStock: false },
  "odf-vanilla-30": { id: "odf-vanilla-30", title: "ODF 30-Day Supply — Vanilla", oneTimeNok: 590, subNok: 531, inStock: false },
};

export default function CheckoutPage() {
  const params = useSearchParams();
  const router = useRouter();

  const sku = params.get("sku") || "odf-citrus-30";
  const planParam = params.get("plan") === "sub" ? "sub" : "one_time";

  const product = PRODUCTS[sku] || PRODUCTS["odf-citrus-30"];

  const [plan, setPlan] = useState<"one_time" | "sub">(planParam === "sub" ? "sub" : "one_time");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const total = useMemo(() => (plan === "sub" ? product.subNok : product.oneTimeNok), [plan, product]);

  const startStripe = async () => {
    setErr(null);

    if (!product.inStock) {
      setErr("Sold out. We can’t accept payments until inventory arrives.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: product.id, plan }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Checkout failed");
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-grad">
      <section className="container-app py-10">
        <div className="grid gap-6 md:grid-cols-12">
          {/* Left: form */}
          <div className="md:col-span-7">
            <div className="card p-6">
              <h1 className="text-2xl font-heading font-bold">Checkout</h1>
              <p className="mt-2" style={{ color: "var(--sd-slate)" }}>
                Complete your delivery details. Payments open when inventory is in stock.
              </p>

              <div className="mt-6 grid gap-3">
                <label className="text-sm font-semibold">Email</label>
                <input className="w-full rounded-2xl border px-4 py-3" placeholder="you@email.com" />

                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold">First name</label>
                    <input className="w-full rounded-2xl border px-4 py-3" placeholder="First name" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Last name</label>
                    <input className="w-full rounded-2xl border px-4 py-3" placeholder="Last name" />
                  </div>
                </div>

                <div className="mt-2 grid gap-3 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold">Address</label>
                    <input className="w-full rounded-2xl border px-4 py-3" placeholder="Street + number" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">ZIP</label>
                    <input className="w-full rounded-2xl border px-4 py-3" placeholder="3018" />
                  </div>
                </div>

                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold">City</label>
                    <input className="w-full rounded-2xl border px-4 py-3" placeholder="Drammen" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Country</label>
                    <input className="w-full rounded-2xl border px-4 py-3" defaultValue="Norway" />
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border p-4">
                  <div className="text-sm font-semibold">Plan</div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <button
                      type="button"
                      className={`rounded-2xl border px-4 py-3 text-left ${plan === "one_time" ? "bg-[rgba(2,6,23,0.04)]" : "bg-white"}`}
                      onClick={() => setPlan("one_time")}
                    >
                      <div className="font-semibold">One-time</div>
                      <div className="text-sm" style={{ color: "var(--sd-slate)" }}>
                        {product.oneTimeNok} NOK
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`rounded-2xl border px-4 py-3 text-left ${plan === "sub" ? "bg-[rgba(2,6,23,0.04)]" : "bg-white"}`}
                      onClick={() => setPlan("sub")}
                    >
                      <div className="font-semibold">Subscription</div>
                      <div className="text-sm" style={{ color: "var(--sd-slate)" }}>
                        {product.subNok} NOK / month (10% off)
                      </div>
                    </button>
                  </div>
                </div>

                {err && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {err}
                  </div>
                )}

                <button
                  type="button"
                  className={`btn btn-primary mt-4 w-full justify-center ${(!product.inStock || loading) ? "opacity-60" : ""}`}
                  onClick={startStripe}
                  disabled={!product.inStock || loading}
                >
                  {product.inStock ? (loading ? "Redirecting…" : "Pay with Stripe") : "Sold out"}
                </button>

                {!product.inStock && (
                  <p className="mt-3 text-sm" style={{ color: "var(--sd-slate)" }}>
                    Want a notification?{" "}
                    <a className="underline" href={`mailto:hello@smood.day?subject=Notify%20me%20-%20${encodeURIComponent(product.title)}`}>
                      Email us
                    </a>
                    .
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-ghost mt-4"
              onClick={() => router.push(`/products`)}
            >
              Back to products
            </button>
          </div>

          {/* Right: summary */}
          <div className="md:col-span-5">
            <div className="card p-6">
              <p className="pill inline-flex">Order summary</p>
              <h2 className="mt-4 font-heading text-xl font-semibold">{product.title}</h2>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm" style={{ color: "var(--sd-slate)" }}>
                  {plan === "sub" ? "Subscription (monthly)" : "One-time"}
                </div>
                <div className="text-lg font-extrabold">{total} NOK</div>
              </div>

              <div className="mt-4 border-t pt-4 text-sm" style={{ color: "var(--sd-slate)" }}>
                Shipping: calculated at launch (V1). <br />
                Taxes: included where applicable.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}