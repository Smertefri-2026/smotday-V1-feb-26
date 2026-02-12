"use client";

import { useEffect, useMemo, useState } from "react";

const LS_KEY = "smooday_v1_quickcheck";

type Meal = {
  id: string;
  label: "Breakfast" | "Lunch" | "Dinner" | "Extra";
  note: string;
  kcal: number;
  p: number;
  f: number;
  c: number;
};

type Stored = {
  meals: Meal[];
  supplements: any;
  targets: any;
  profile: any;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function safeNum(v: any) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function readLS(): Stored | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function writeLS(next: Stored) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {}
}

function ensureDefaults(s: Stored | null): Stored {
  const base: Stored = {
    meals: [
      { id: uid(), label: "Breakfast", note: "", kcal: 0, p: 0, f: 0, c: 0 },
      { id: uid(), label: "Lunch", note: "", kcal: 0, p: 0, f: 0, c: 0 },
      { id: uid(), label: "Dinner", note: "", kcal: 0, p: 0, f: 0, c: 0 },
    ],
    supplements: {},
    targets: {},
    profile: {},
  };

  if (!s) return base;
  return {
    ...base,
    ...s,
    meals: Array.isArray(s.meals) && s.meals.length ? s.meals : base.meals,
  };
}

function InputMini({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold" style={{ color: "var(--sd-slate)" }}>
        {label}
      </label>
      <input
        type="text"
        inputMode="numeric"
        className="mt-1 w-full rounded-2xl border px-3 py-2.5 text-sm"
        value={Number.isFinite(value) ? String(value) : "0"}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw.trim() === "") return onChange(0);
          const cleaned = raw.replace(",", ".").replace(/[^\d.]/g, "");
          const n = Number(cleaned);
          onChange(Number.isFinite(n) ? n : 0);
        }}
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-xs font-semibold" style={{ color: "var(--sd-slate)" }}>
        {label}
      </div>
      <div className="mt-1 text-lg font-extrabold">{value}</div>
    </div>
  );
}

export default function Section2BMeals() {
  const [data, setData] = useState<Stored>(() => ensureDefaults(null));
  const [aiBusy, setAiBusy] = useState<Record<string, boolean>>({});
  const [aiErr, setAiErr] = useState<Record<string, string | null>>({});

  useEffect(() => {
    setData(ensureDefaults(readLS()));
  }, []);

  useEffect(() => {
    writeLS(data);
  }, [data]);

  const totals = useMemo(() => {
    const t = data.meals.reduce(
      (acc, m) => {
        acc.kcal += safeNum(m.kcal);
        acc.p += safeNum(m.p);
        acc.f += safeNum(m.f);
        acc.c += safeNum(m.c);
        return acc;
      },
      { kcal: 0, p: 0, f: 0, c: 0 }
    );
    return {
      kcal: Math.round(t.kcal),
      p: Math.round(t.p),
      f: Math.round(t.f),
      c: Math.round(t.c),
    };
  }, [data.meals]);

  function updateMeal(id: string, patch: Partial<Meal>) {
    setData((prev) => ({
      ...prev,
      meals: prev.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }

  function addExtraMeal() {
    setData((prev) => ({
      ...prev,
      meals: [...prev.meals, { id: uid(), label: "Extra", note: "", kcal: 0, p: 0, f: 0, c: 0 }],
    }));
  }

  function removeMeal(id: string) {
    setData((prev) => ({
      ...prev,
      meals: prev.meals.filter((m) => m.id !== id),
    }));
  }

  function resetMeals() {
    setData((prev) => ({
      ...prev,
      meals: [
        { id: uid(), label: "Breakfast", note: "", kcal: 0, p: 0, f: 0, c: 0 },
        { id: uid(), label: "Lunch", note: "", kcal: 0, p: 0, f: 0, c: 0 },
        { id: uid(), label: "Dinner", note: "", kcal: 0, p: 0, f: 0, c: 0 },
      ],
    }));
  }

  async function estimateWithAI(mealId: string) {
    const meal = data.meals.find((m) => m.id === mealId);
    if (!meal) return;

    const text = (meal.note || "").trim();
    if (!text) {
      setAiErr((p) => ({ ...p, [mealId]: "Write what you ate first." }));
      return;
    }

    setAiErr((p) => ({ ...p, [mealId]: null }));
    setAiBusy((p) => ({ ...p, [mealId]: true }));

    try {
      const res = await fetch("/api/ai/meal-macros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out?.error || "AI request failed");

      updateMeal(mealId, {
        kcal: clamp(safeNum(out.kcal), 0, 20000),
        p: clamp(safeNum(out.p), 0, 500),
        f: clamp(safeNum(out.f), 0, 500),
        c: clamp(safeNum(out.c), 0, 1000),
      });
    } catch (e: any) {
      setAiErr((p) => ({ ...p, [mealId]: e?.message || "Something went wrong." }));
    } finally {
      setAiBusy((p) => ({ ...p, [mealId]: false }));
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="font-heading text-xl font-semibold">Meals</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--sd-slate)" }}>
            Log what you ate, then estimate macros with AI — or type them manually.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-ghost" type="button" onClick={resetMeals}>
            Reset meals
          </button>
          <button className="btn btn-primary" type="button" onClick={addExtraMeal}>
            + Add meal
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {data.meals.map((m) => (
          <div key={m.id} className="rounded-2xl border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm font-semibold">{m.label}</div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: "0.45rem 0.8rem" }}
                  onClick={() => estimateWithAI(m.id)}
                  disabled={!!aiBusy[m.id]}
                  title="Estimate calories + macros from the text"
                >
                  {aiBusy[m.id] ? "Estimating…" : "Estimate with AI"}
                </button>

                {m.label === "Extra" && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: "0.45rem 0.8rem" }}
                    onClick={() => removeMeal(m.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-12 md:items-end">
              <div className="md:col-span-5">
                <label className="text-xs font-semibold" style={{ color: "var(--sd-slate)" }}>
                  What did you eat?
                </label>
                <input
                  className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm"
                  placeholder="e.g. oatmeal + whey + berries"
                  value={m.note}
                  onChange={(e) => updateMeal(m.id, { note: e.target.value })}
                />

                {aiErr[m.id] ? (
                  <div className="mt-2 text-xs" style={{ color: "var(--sd-error)" }}>
                    {aiErr[m.id]}
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2 md:col-span-7 md:grid-cols-4">
                <InputMini label="kcal" value={m.kcal} onChange={(v) => updateMeal(m.id, { kcal: clamp(v, 0, 10000) })} />
                <InputMini label="P (g)" value={m.p} onChange={(v) => updateMeal(m.id, { p: clamp(v, 0, 400) })} />
                <InputMini label="F (g)" value={m.f} onChange={(v) => updateMeal(m.id, { f: clamp(v, 0, 400) })} />
                <InputMini label="C (g)" value={m.c} onChange={(v) => updateMeal(m.id, { c: clamp(v, 0, 800) })} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <Metric label="Calories" value={`${totals.kcal} kcal`} />
        <Metric label="Protein" value={`${totals.p} g`} />
        <Metric label="Fat" value={`${totals.f} g`} />
        <Metric label="Carbs" value={`${totals.c} g`} />
      </div>
    </>
  );
}