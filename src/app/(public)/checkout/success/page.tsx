import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="hero-grad">
      <section className="container-app py-14">
        <div className="card-soft p-8 md:p-12">
          <p className="pill">Payment complete</p>
          <h1 className="mt-4 text-3xl md:text-5xl font-heading font-bold">Thank you!</h1>
          <p className="mt-4 max-w-2xl" style={{ color: "var(--sd-slate)" }}>
            Your order has been received. You’ll get an email confirmation shortly.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/products" className="btn btn-primary">Back to products</Link>
            <Link href="/" className="btn btn-ghost">Home</Link>
          </div>
        </div>
      </section>
    </div>
  );
}