// /src/app/api/stripe/checkout/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";

type Item = {
  id: string;
  name: string;
  flavor: string;
  oneTimeEur: number;
  subEur: number;
  inStock: boolean;
};

const PRODUCTS: Record<string, Item> = {
  "odf-citrus-30": {
    id: "odf-citrus-30",
    name: "ODF 30-Day Supply",
    flavor: "Citrus",
    oneTimeEur: 69,
    subEur: 62,
    inStock: true, // <-- sett false hvis du vil stenge betaling
  },
  "odf-vanilla-30": {
    id: "odf-vanilla-30",
    name: "ODF 30-Day Supply",
    flavor: "Vanilla",
    oneTimeEur: 69,
    subEur: 62,
    inStock: true, // <-- sett false hvis du vil stenge betaling
  },
};

export async function POST(req: Request) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "Stripe is not configured (missing STRIPE_SECRET_KEY)." },
        { status: 400 }
      );
    }

    const stripe = new Stripe(secret);

    const body = await req.json();
    const { sku, plan } = body as { sku: string; plan: "one_time" | "sub" };

    const product = PRODUCTS[sku];
    if (!product) return NextResponse.json({ error: "Unknown product." }, { status: 400 });

    if (!product.inStock) {
      return NextResponse.json({ error: "Sold out." }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const unitAmountEur = plan === "sub" ? product.subEur : product.oneTimeEur;

    const session = await stripe.checkout.sessions.create({
      mode: plan === "sub" ? "subscription" : "payment",
      success_url: `${siteUrl}/checkout/success`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      line_items: [
        plan === "sub"
          ? {
              price_data: {
                currency: "eur",
                unit_amount: Math.round(unitAmountEur * 100),
                product_data: {
                  name: `${product.name} — ${product.flavor} (Subscription)`,
                },
                recurring: { interval: "month" },
              },
              quantity: 1,
            }
          : {
              price_data: {
                currency: "eur",
                unit_amount: Math.round(unitAmountEur * 100),
                product_data: { name: `${product.name} — ${product.flavor}` },
              },
              quantity: 1,
            },
      ],
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}