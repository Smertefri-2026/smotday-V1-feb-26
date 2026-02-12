// /src/app/(public)/sections/Section6AppCTA.tsx
import Link from "next/link";

export default function Section6AppCTA() {
  return (
    <section className="container-app pb-12">
      <div className="card-soft p-8 md:p-12">
        <div className="grid gap-6 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7">
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">
              Make it a daily habit.
            </h2>
            <p className="mt-3 text-lg" style={{ color: "var(--sd-slate)" }}>
              In V1, Smooday starts as a “quick check.” Next we add login, history, and a personal dashboard.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href="#quick-check" className="btn btn-primary">
                Track today
              </a>
              <Link href="/products" className="btn btn-ghost">
                See products
              </Link>
            </div>

            <p className="mt-4 text-[11px]" style={{ color: "var(--sd-slate)" }}>
              “Download the app” can link to App Store / Google Play later. For now this is a web-first V1.
            </p>
          </div>

          <div className="md:col-span-5">
            <div className="rounded-3xl border bg-white p-6">
              <div className="text-sm font-semibold">What’s next in the app</div>

              <ul className="mt-3 space-y-2 text-sm" style={{ color: "var(--sd-ink)" }}>
                <li>• Login + My Page</li>
                <li>• Meal history + trends</li>
                <li>• Product routine + reminders</li>
                <li>• Coaching minutes + subscriptions</li>
              </ul>

              <div className="mt-5 rounded-2xl border bg-[rgba(2,6,23,0.03)] p-4 text-sm" style={{ color: "var(--sd-slate)" }}>
                Keep it simple, but measurable.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}