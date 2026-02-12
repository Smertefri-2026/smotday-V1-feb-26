// /src/app/(public)/sections/Section3Coverage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const LS_KEY = "smooday_v1_quickcheck";

type Stored = {
  meals: Array<{ kcal: number; p: number; f: number; c: number }>;
  supplements: {
    multivitamin: boolean;
    vitaminD: boolean;
    omega3: boolean;
    magnesium: boolean;
    zinc: boolean;
    eaaGrams: number;
  };
  targets: { kcal: number; p: number; f: number; c: number };
};

function safeNum(v: any) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function pct(consumed: number, target: number) {
  if (!target || target <= 0) return 0;
  return Math.round((consumed / target) * 100);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Section3Coverage() {
  const [stored, setStored] = useState<Stored | null>(null);

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return setStored(null);
        setStored(JSON.parse(raw));
      } catch {
        setStored(null);
      }
    };

    read();
    window.addEventListener("storage", read);
    const t = window.setInterval(read, 600); // keep it in sync even within same tab
    return () => {
      window.removeEventListener("storage", read);
      window.clearInterval(t);
    };
  }, []);

  const totals = useMemo(() => {
    const meals = stored?.meals ?? [];
    return meals.reduce(
      (acc, m) => {
        acc.kcal += safeNum(m.kcal);
        acc.p += safeNum(m.p);
        acc.f += safeNum(m.f);
        acc.c += safeNum(m.c);
        return acc;
      },
      { kcal: 0, p: 0, f: 0, c: 0 }
    );
  }, [stored]);

  const targets = stored?.targets ?? { kcal: 2200, p: 150, f: 70, c: 220 };

  // A) Macro + energy coverage (average of kcal/p/f/c)
  const aMacro = useMemo(() => {
    const k = pct(totals.kcal, targets.kcal);
    const p = pct(totals.p, targets.p);
    const f = pct(totals.f, targets.f);
    const c = pct(totals.c, targets.c);
    const avg = Math.round((k + p + f + c) / 4);
    return clamp(avg, 0, 140);
  }, [totals, targets]);

  // B) Vitamins coverage (simple V1 proxy)
  const bVitamins = useMemo(() => {
    const s = stored?.supplements;
    if (!s) return 0;
    // Proxy: multivitamin covers most, vitamin D adds more
    let score = 0;
    if (s.multivitamin) score += 75;
    if (s.vitaminD) score += 15;
    // small bump if you log any meals
    if ((stored?.meals?.length ?? 0) > 0) score += 10;
    return clamp(score, 0, 100);
  }, [stored]);

  // C) Minerals / trace elements proxy
  const cMinerals = useMemo(() => {
    const s = stored?.supplements;
    if (!s) return 0;
    let score = 0;
    if (s.multivitamin) score += 55;
    if (s.magnesium) score += 20;
    if (s.zinc) score += 15;
    if ((stored?.meals?.length ?? 0) > 0) score += 10;
    return clamp(score, 0, 100);
  }, [stored]);

  // D) Fatty acids proxy (Omega-3 = the key V1 check)
  const dFatty = useMemo(() => {
    const s = stored?.supplements;
    if (!s) return 0;
    let score = 0;
    if (s.omega3) score += 85;
    // bump if fat macro exists today
    if (totals.f > 10) score += 15;
    return clamp(score, 0, 100);
  }, [stored, totals.f]);

  // E) EAA coverage (target 6g/day as a simple V1)
  const eEaa = useMemo(() => {
    const s = stored?.supplements;
    const grams = safeNum(s?.eaaGrams);
    const target = 6;
    return clamp(Math.round((grams / target) * 100), 0, 160);
  }, [stored]);

  return (
    <section className="container-app pb-12">
      <div className="card p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold">Today’s coverage</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--sd-slate)" }}>
              V1 uses simple, transparent logic. Later we can switch this to full nutrient math + history when users log in.
            </p>
          </div>

          <Link href="/products" className="btn btn-ghost md:self-center">
            Shop Smooday
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <CoverageCard
            title="A) Macros + energy"
            pct={aMacro}
            desc={`Based on kcal / protein / fat / carbs vs your daily targets.`}
          />

          <CoverageCard
            title="B) Vitamins (V1 core)"
            pct={bVitamins}
            desc={`Proxy score: multivitamin + vitamin D + food logged.`}
          />

          <CoverageCard
            title="C) Minerals & trace elements (V1 core)"
            pct={cMinerals}
            desc={`Proxy score: multivitamin + magnesium + zinc + food logged.`}
          />

          <CoverageCard
            title="D) Fatty acids"
            pct={dFatty}
            desc={`Proxy score: omega-3 + some dietary fat today.`}
          />

          <div className="md:col-span-2">
            <CoverageCard
              title="E) EAA"
              pct={eEaa}
              desc={`Based on EAA grams today (target ~6g/day as a simple V1).`}
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-4 text-sm" style={{ color: "var(--sd-slate)" }}>
          Next step: we can add “Smooday grams would cover X% more…” + a strong CTA to your Products page.
        </div>
      </div>
    </section>
  );
}

function CoverageCard({
  title,
  pct,
  desc,
}: {
  title: string;
  pct: number;
  desc: string;
}) {
  const shown = clamp(pct, 0, 100);

  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs" style={{ color: "var(--sd-slate)" }}>
            {desc}
          </div>
        </div>

        <div className="text-lg font-extrabold tabular-nums">
          {Math.round(pct)}%
        </div>
      </div>

      <div className="mt-4 h-2 w-full rounded-full bg-[rgba(2,6,23,0.08)]">
        <div
          className="h-2 rounded-full"
          style={{
            width: `${shown}%`,
            background: "linear-gradient(90deg, var(--sd-primary), var(--sd-teal))",
          }}
        />
      </div>

      <div className="mt-2 text-[11px]" style={{ color: "var(--sd-slate)" }}>
        {pct > 100 ? "Over 100% is possible if you exceed targets (e.g. EAA grams)." : "Aim for 80–100% most days."}
      </div>
    </div>
  );
}