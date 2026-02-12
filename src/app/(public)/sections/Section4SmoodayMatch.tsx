// /src/app/(public)/sections/Section4SmoodayMatch.tsx
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
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function pct(consumed: number, target: number) {
  if (!target || target <= 0) return 0;
  return Math.round((consumed / target) * 100);
}

export default function Section4SmoodayMatch() {
  const [stored, setStored] = useState<Stored | null>(null);
  const [grams, setGrams] = useState(8.8); // default: your daily ODF blend size

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
    const t = window.setInterval(read, 600);
    return () => window.clearInterval(t);
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

  // Base coverage (same logic as Section3, simplified here)
  const baseMacro = useMemo(() => {
    const k = pct(totals.kcal, targets.kcal);
    const p = pct(totals.p, targets.p);
    const f = pct(totals.f, targets.f);
    const c = pct(totals.c, targets.c);
    return clamp(Math.round((k + p + f + c) / 4), 0, 140);
  }, [totals, targets]);

  const baseVits = useMemo(() => {
    const s = stored?.supplements;
    if (!s) return 0;
    let score = 0;
    if (s.multivitamin) score += 75;
    if (s.vitaminD) score += 15;
    if ((stored?.meals?.length ?? 0) > 0) score += 10;
    return clamp(score, 0, 100);
  }, [stored]);

  const baseMinerals = useMemo(() => {
    const s = stored?.supplements;
    if (!s) return 0;
    let score = 0;
    if (s.multivitamin) score += 55;
    if (s.magnesium) score += 20;
    if (s.zinc) score += 15;
    if ((stored?.meals?.length ?? 0) > 0) score += 10;
    return clamp(score, 0, 100);
  }, [stored]);

  const baseFatty = useMemo(() => {
    const s = stored?.supplements;
    if (!s) return 0;
    let score = 0;
    if (s.omega3) score += 85;
    if (totals.f > 10) score += 15;
    return clamp(score, 0, 100);
  }, [stored, totals.f]);

  const baseEaa = useMemo(() => {
    const g = safeNum(stored?.supplements?.eaaGrams);
    const target = 6;
    return clamp(Math.round((g / target) * 100), 0, 160);
  }, [stored]);

  // “Smooday effect” (V1 proxy): grams increases vitamins/minerals + EAA.
  // Tunable constants (simple + transparent):
  // - vitamins bump: up to +35
  // - minerals bump: up to +35
  // - eaa bump: grams maps to extra EAA grams (assume 5g EAA per 8.8g blend → scale)
  const vitsBoost = useMemo(() => clamp(Math.round((grams / 8.8) * 35), 0, 40), [grams]);
  const mineralsBoost = useMemo(() => clamp(Math.round((grams / 8.8) * 35), 0, 40), [grams]);

  const extraEaaGrams = useMemo(() => {
    // proxy: 8.8g daily blend ~ 5g EAA (you mentioned earlier 5g per 1000ml smoothie, but for this calculator we just need a V1 lever)
    // adjust later when we have exact spec.
    return (grams / 8.8) * 5;
  }, [grams]);

  const eaaWithSmooday = useMemo(() => {
    const current = safeNum(stored?.supplements?.eaaGrams);
    const totalG = current + extraEaaGrams;
    const target = 6;
    return clamp(Math.round((totalG / target) * 100), 0, 200);
  }, [stored, extraEaaGrams]);

  const vitsWithSmooday = clamp(baseVits + vitsBoost, 0, 100);
  const mineralsWithSmooday = clamp(baseMinerals + mineralsBoost, 0, 100);

  return (
    <section className="container-app pb-12">
      <div className="card p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold">What Smooday could cover</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--sd-slate)" }}>
              A simple V1 preview: choose a daily grams amount and see how your coverage improves.
            </p>
          </div>

          <Link href="/products" className="btn btn-primary md:self-center">
            Buy Smooday
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-12 md:items-start">
          {/* Left: slider + summary */}
          <div className="md:col-span-5">
            <div className="rounded-2xl border bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">Daily Smooday amount</div>
                <div className="text-lg font-extrabold tabular-nums">{grams.toFixed(1)} g</div>
              </div>

              <input
                className="mt-4 w-full"
                type="range"
                min={0}
                max={12}
                step={0.2}
                value={grams}
                onChange={(e) => setGrams(safeNum(e.target.value))}
              />

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs" style={{ color: "var(--sd-slate)" }}>
                <div className="rounded-xl border bg-white px-3 py-2">
                  <div className="font-semibold" style={{ color: "var(--sd-ink)" }}>0g</div>
                  <div>no boost</div>
                </div>
                <div className="rounded-xl border bg-white px-3 py-2">
                  <div className="font-semibold" style={{ color: "var(--sd-ink)" }}>8.8g</div>
                  <div>recommended</div>
                </div>
                <div className="rounded-xl border bg-white px-3 py-2">
                  <div className="font-semibold" style={{ color: "var(--sd-ink)" }}>12g</div>
                  <div>higher</div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border bg-[rgba(2,6,23,0.03)] p-4 text-sm">
                <div className="font-semibold">Smart suggestion</div>
                <div className="mt-1" style={{ color: "var(--sd-slate)" }}>
                  If your vitamins/minerals are low today, Smooday helps push you closer to 100% — without adding complexity.
                </div>
              </div>

              <p className="mt-3 text-[11px]" style={{ color: "var(--sd-slate)" }}>
                V1 uses proxy boosts. When the product spec is locked, we’ll compute exact nutrient deltas.
              </p>
            </div>
          </div>

          {/* Right: before/after */}
          <div className="md:col-span-7">
            <div className="grid gap-3">
              <CompareRow title="A) Macros + energy" before={baseMacro} after={baseMacro} note="Smooday doesn’t change macros in this V1 preview." />
              <CompareRow title="B) Vitamins" before={baseVits} after={vitsWithSmooday} note={`Estimated boost: +${vitsBoost}%`} />
              <CompareRow title="C) Minerals & trace elements" before={baseMinerals} after={mineralsWithSmooday} note={`Estimated boost: +${mineralsBoost}%`} />
              <CompareRow title="D) Fatty acids" before={baseFatty} after={baseFatty} note="Omega-3 is tracked separately." />
              <CompareRow title="E) EAA" before={baseEaa} after={eaaWithSmooday} note={`Adds ~${extraEaaGrams.toFixed(1)}g EAA (proxy)`} />
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl border bg-white p-5">
              <div>
                <div className="text-sm font-semibold">Ready to simplify your routine?</div>
                <div className="text-xs" style={{ color: "var(--sd-slate)" }}>
                  Start with one daily scoop. Subscription saves 10%.
                </div>
              </div>
              <Link href="/products" className="btn btn-primary">
                Go to products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompareRow({
  title,
  before,
  after,
  note,
}: {
  title: string;
  before: number;
  after: number;
  note: string;
}) {
  const b = clamp(before, 0, 100);
  const a = clamp(after, 0, 100);

  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs" style={{ color: "var(--sd-slate)" }}>{note}</div>
        </div>
        <div className="text-sm tabular-nums" style={{ color: "var(--sd-slate)" }}>
          <span className="font-extrabold" style={{ color: "var(--sd-ink)" }}>{Math.round(after)}%</span>{" "}
          <span>after</span>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <Bar label="Before" pct={b} />
        <Bar label="After" pct={a} />
      </div>
    </div>
  );
}

function Bar({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--sd-slate)" }}>
        <span className="font-semibold">{label}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-[rgba(2,6,23,0.08)]">
        <div
          className="h-2 rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--sd-primary), var(--sd-teal))",
          }}
        />
      </div>
    </div>
  );
}