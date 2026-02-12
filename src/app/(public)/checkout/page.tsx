// /src/app/(public)/checkout/page.tsx
import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <div className="hero-grad">
      <section className="container-app py-10">
        <Suspense
          fallback={
            <div className="card p-6">
              <h1 className="text-2xl font-heading font-bold">Checkout</h1>
              <p className="mt-2 text-sm" style={{ color: "var(--sd-slate)" }}>
                Loading checkout…
              </p>
            </div>
          }
        >
          <CheckoutClient />
        </Suspense>
      </section>
    </div>
  );
}