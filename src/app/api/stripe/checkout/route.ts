import Stripe from "stripe";
import { NextResponse } from "next/server";

type Item = {
  id: string;
  name: string;
  flavor: string;
  oneTimeNok: number;
  subNok: number;
  inStock: boolean;
};

const PRODUCTS: Record<string, Item> = {
  "odf-citrus-30": { id: "odf-citrus-30", name: "ODF 30-Day Supply", flavor: "Citrus", oneTimeNok: 590, subNok: 531, inStock: false },
  "odf-vanilla-30": { id: "odf-vanilla-30", name: "ODF 30-Day Supply", flavor: "Vanilla", oneTimeNok: 590, subNok: 531, inStock: false },
};

export async function POST(req: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return NextResponse.json({ error: "Stripe is not configured (missing STRIPE_SECRET_KEY)." }, { status: 400 });
    }

    // ✅ create inside handler to avoid build-time crash
    const stripe = new Stripe(key);

    const body = await req.json();
    const { sku, plan } = body as { sku: string; plan: "one_time" | "sub" };

    const product = PRODUCTS[sku];
    if (!product) return NextResponse.json({ error: "Unknown product." }, { status: 400 });

    if (!product.inStock) {
      return NextResponse.json({ error: "Sold out." }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const unitAmountNok = plan === "sub" ? product.subNok : product.oneTimeNok;

    const session = await stripe.checkout.sessions.create({
      mode: plan === "sub" ? "subscription" : "payment",
      success_url: `${siteUrl}/checkout/success`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      line_items: [
        plan === "sub"
          ? {
              price_data: {
                currency: "nok",
                unit_amount: unitAmountNok * 100,
                product_data: { name: `${product.name} — ${product.flavor} (Subscription)` },
                recurring: { interval: "month" },
              },
              quantity: 1,
            }
          : {
              price_data: {
                currency: "nok",
                unit_amount: unitAmountNok * 100,
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