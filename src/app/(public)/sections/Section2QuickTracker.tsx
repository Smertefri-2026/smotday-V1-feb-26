// /src/app/(public)/sections/Section2QuickTracker.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calcTargetsFromProfile,
  isProfileComplete,
  type NutritionProfile,
  type Goal,
} from "@/modules/nutrition/calc";

type Meal = {
  id: string;
  label: "Breakfast" | "Lunch" | "Dinner" | "Extra";
  note: string;
  kcal: number;
  p: number;
  f: number;
  c: number;
};

type Supplements = {
  multivitamin: boolean;
  vitaminD: boolean;
  omega3: boolean;
  magnesium: boolean;
  zinc: boolean;
  eaaGrams: number; // grams EAA today
};

type Targets = {
  kcal: number;
  p: number;
  f: number;
  c: number;
};

const LS_KEY = "smooday_v1_quickcheck";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function num(v: any) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function usePersistedState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      setState(JSON.parse(raw));
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state]);

  return [state, setState] as const;
}

const DEFAULT_PROFILE: NutritionProfile = {
  sex: null,
  age_years: null,
  height_cm: null,
  weight_kg: null,
  job_activity: "low",
  training_activity: "none",
  goal: "maintain",
};

export default function Section2QuickTracker() {
  const [data, setData] = usePersistedState<{
    meals: Meal[];
    supplements: Supplements;
    targets: Targets;

    // NEW:
    profile: NutritionProfile;
    autoTargets: boolean;
  }>(LS_KEY, {
    meals: [
      { id: uid(), label: "Breakfast", note: "", kcal: 0, p: 0, f: 0, c: 0 },
      { id: uid(), label: "Lunch", note: "", kcal: 0, p: 0, f: 0, c: 0 },
      { id: uid(), label: "Dinner", note: "", kcal: 0, p: 0, f: 0, c: 0 },
    ],
    supplements: {
      multivitamin: false,
      vitaminD: false,
      omega3: false,
      magnesium: false,
      zinc: false,
      eaaGrams: 0,
    },
    targets: {
      kcal: 2200,
      p: 150,
      f: 70,
      c: 220,
    },

    profile: DEFAULT_PROFILE,
    autoTargets: false,
  });

  // ---- totals (meals only) ----
  const totals = useMemo(() => {
    const t = data.meals.reduce(
      (acc, m) => {
        acc.kcal += num(m.kcal);
        acc.p += num(m.p);
        acc.f += num(m.f);
        acc.c += num(m.c);
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

  // ---- computed targets from profile ----
  const computedTargets = useMemo(() => {
    if (!isProfileComplete(data.profile)) return null;
    const t = calcTargetsFromProfile(data.profile);
    if (t.kcal == null || t.p == null || t.f == null || t.c == null) return null;

    return {
      kcal: Math.round(t.kcal),
      p: Math.round(t.p),
      f: Math.round(t.f),
      c: Math.round(t.c),
    } as Targets;
  }, [data.profile]);

  // ---- auto-apply computed targets when enabled ----
  useEffect(() => {
    if (!data.autoTargets) return;
    if (!computedTargets) return;

    const same =
      data.targets.kcal === computedTargets.kcal &&
      data.targets.p === computedTargets.p &&
      data.targets.f === computedTargets.f &&
      data.targets.c === computedTargets.c;

    if (same) return;

    setData((prev) => ({
      ...prev,
      targets: computedTargets,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.autoTargets, computedTargets]);

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

  function resetToday() {
    setData((prev) => ({
      ...prev,
      meals: [
        { id: uid(), label: "Breakfast", note: "", kcal: 0, p: 0, f: 0, c: 0 },
        { id: uid(), label: "Lunch", note: "", kcal: 0, p: 0, f: 0, c: 0 },
        { id: uid(), label: "Dinner", note: "", kcal: 0, p: 0, f: 0, c: 0 },
      ],
      supplements: {
        multivitamin: false,
        vitaminD: false,
        omega3: false,
        magnesium: false,
        zinc: false,
        eaaGrams: 0,
      },
    }));
  }

  // ---- profile helpers ----
  function setProfile(patch: Partial<NutritionProfile>) {
    setData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...patch },
    }));
  }

  function applyComputedOnce() {
    if (!computedTargets) return;
    setData((prev) => ({ ...prev, targets: computedTargets }));
  }

  const profileReady = isProfileComplete(data.profile);

  return (
    <section id="quick-check" className="container-app pb-10">
      <div className="card p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold">Quick check</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--sd-slate)" }}>
              Enter your 3 meals (or more). V1 can be manual macros (fast + reliable). Next we add AI.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button className="btn btn-ghost" type="button" onClick={resetToday}>
              Reset
            </button>
            <button className="btn btn-primary" type="button" onClick={addExtraMeal}>
              + Add meal
            </button>
          </div>
        </div>

        {/* PROFILE (optional) */}
        <div className="mt-6 rounded-2xl border bg-white p-4 md:p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold">Profile (optional)</div>
              <div className="text-xs" style={{ color: "var(--sd-slate)" }}>
                Fill this in to auto-calc kcal + macros targets.
              </div>
            </div>

            <label className="flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={data.autoTargets}
                onChange={(e) => setData((p) => ({ ...p, autoTargets: e.target.checked }))}
              />
              <span className="font-semibold">Auto-calc targets</span>
            </label>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <SelectMini
              label="Sex"
              value={data.profile.sex ?? ""}
              onChange={(v) => setProfile({ sex: (v || null) as any })}
              options={[
                ["", "Choose…"],
                ["male", "Male"],
                ["female", "Female"],
              ]}
            />

            <InputMini
              label="Age (years)"
              value={data.profile.age_years ?? 0}
              onChange={(v) => setProfile({ age_years: v ? clamp(v, 1, 120) : null })}
            />

            <InputMini
              label="Height (cm)"
              value={data.profile.height_cm ?? 0}
              onChange={(v) => setProfile({ height_cm: v ? clamp(v, 50, 250) : null })}
            />

            <InputMini
              label="Weight (kg)"
              value={data.profile.weight_kg ?? 0}
              onChange={(v) => setProfile({ weight_kg: v ? clamp(v, 20, 250) : null })}
            />

            <SelectMini
              label="Job activity"
              value={data.profile.job_activity ?? ""}
              onChange={(v) => setProfile({ job_activity: (v || null) as any })}
              options={[
                ["", "Choose…"],
                ["low", "Low (mostly sitting)"],
                ["medium", "Medium (some walking)"],
                ["high", "High (physical work)"],
              ]}
            />

            <SelectMini
              label="Training"
              value={data.profile.training_activity ?? ""}
              onChange={(v) => setProfile({ training_activity: (v || null) as any })}
              options={[
                ["", "Choose…"],
                ["none", "0 / week"],
                ["light", "1–2 / week"],
                ["moderate", "3–5 / week"],
                ["high", "6+ / week"],
              ]}
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <SelectMini
              label="Goal"
              value={data.profile.goal ?? "maintain"}
              onChange={(v) => setProfile({ goal: (v || null) as Goal })}
              options={[
                ["lose_fat", "Lose fat (−15%)"],
                ["maintain", "Maintain (0%)"],
                ["gain_muscle", "Gain muscle (+10%)"],
              ]}
            />

            <div className="md:col-span-2">
              <div className="rounded-2xl border bg-[rgba(2,6,23,0.02)] p-3 text-xs">
                {!profileReady ? (
                  <span style={{ color: "var(--sd-slate)" }}>
                    Tip: fill in sex + age + height + weight + activity to calculate.
                  </span>
                ) : computedTargets ? (
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold">
                      Calculated targets: {computedTargets.kcal} kcal • P {computedTargets.p}g • F{" "}
                      {computedTargets.f}g • C {computedTargets.c}g
                    </div>
                    <div style={{ color: "var(--sd-slate)" }}>
                      {data.autoTargets
                        ? "Auto-calc is ON → targets update automatically."
                        : "Auto-calc is OFF → click “Use calculated targets” to apply once."}
                    </div>
                    {!data.autoTargets && (
                      <div className="pt-2">
                        <button className="btn btn-ghost" type="button" onClick={applyComputedOnce}>
                          Use calculated targets
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <span style={{ color: "var(--sd-slate)" }}>
                    Could not calculate yet. Check missing fields.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Targets */}
        <div className="mt-6 rounded-2xl border bg-white p-4 md:p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold">Daily targets</div>
              <div className="text-xs" style={{ color: "var(--sd-slate)" }}>
                Used to compute your coverage % below.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <InputMini
                label="kcal"
                value={data.targets.kcal}
                onChange={(v) => setData((p) => ({ ...p, targets: { ...p.targets, kcal: v } }))}
              />
              <InputMini
                label="Protein (g)"
                value={data.targets.p}
                onChange={(v) => setData((p) => ({ ...p, targets: { ...p.targets, p: v } }))}
              />
              <InputMini
                label="Fat (g)"
                value={data.targets.f}
                onChange={(v) => setData((p) => ({ ...p, targets: { ...p.targets, f: v } }))}
              />
              <InputMini
                label="Carbs (g)"
                value={data.targets.c}
                onChange={(v) => setData((p) => ({ ...p, targets: { ...p.targets, c: v } }))}
              />
            </div>
          </div>
        </div>

        {/* Meals */}
        <div className="mt-6 grid gap-3">
          {data.meals.map((m) => (
            <div key={m.id} className="rounded-2xl border bg-white p-4 md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold">{m.label}</div>
                {m.label === "Extra" && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: "0.55rem 0.95rem" }}
                    onClick={() => removeMeal(m.id)}
                  >
                    Remove
                  </button>
                )}
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
                </div>

                <div className="grid grid-cols-2 gap-2 md:col-span-7 md:grid-cols-4">
                  <InputMini label="kcal" value={m.kcal} onChange={(v) => updateMeal(m.id, { kcal: v })} />
                  <InputMini label="P (g)" value={m.p} onChange={(v) => updateMeal(m.id, { p: v })} />
                  <InputMini label="F (g)" value={m.f} onChange={(v) => updateMeal(m.id, { f: v })} />
                  <InputMini label="C (g)" value={m.c} onChange={(v) => updateMeal(m.id, { c: v })} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Supplements */}
        <div className="mt-6 rounded-2xl border bg-white p-4 md:p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold">Supplements today</div>
              <div className="text-xs" style={{ color: "var(--sd-slate)" }}>
                V1 uses simple checkboxes + EAA grams.
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-6 md:items-center">
              <Check
                label="Multivitamin"
                checked={data.supplements.multivitamin}
                onChange={(v) => setData((p) => ({ ...p, supplements: { ...p.supplements, multivitamin: v } }))}
              />
              <Check
                label="Vitamin D"
                checked={data.supplements.vitaminD}
                onChange={(v) => setData((p) => ({ ...p, supplements: { ...p.supplements, vitaminD: v } }))}
              />
              <Check
                label="Omega-3"
                checked={data.supplements.omega3}
                onChange={(v) => setData((p) => ({ ...p, supplements: { ...p.supplements, omega3: v } }))}
              />
              <Check
                label="Magnesium"
                checked={data.supplements.magnesium}
                onChange={(v) => setData((p) => ({ ...p, supplements: { ...p.supplements, magnesium: v } }))}
              />
              <Check
                label="Zinc"
                checked={data.supplements.zinc}
                onChange={(v) => setData((p) => ({ ...p, supplements: { ...p.supplements, zinc: v } }))}
              />
              <InputMini
                label="EAA (g)"
                value={data.supplements.eaaGrams}
                onChange={(v) =>
                  setData((p) => ({
                    ...p,
                    supplements: { ...p.supplements, eaaGrams: clamp(v, 0, 50) },
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Totals preview */}
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <Metric label="Calories" value={`${totals.kcal} kcal`} />
          <Metric label="Protein" value={`${totals.p} g`} />
          <Metric label="Fat" value={`${totals.f} g`} />
          <Metric label="Carbs" value={`${totals.c} g`} />
        </div>

        <p className="mt-4 text-xs" style={{ color: "var(--sd-slate)" }}>
          Saved automatically on this device.
        </p>
      </div>
    </section>
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
        type="number"
        inputMode="numeric"
        className="mt-1 w-full rounded-2xl border px-3 py-2.5 text-sm"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(num(e.target.value))}
      />
    </div>
  );
}

function SelectMini({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold" style={{ color: "var(--sd-slate)" }}>
        {label}
      </label>
      <select
        className="mt-1 w-full rounded-2xl border bg-white px-3 py-2.5 text-sm"
        value={value}
        onChange={(e) => onChange(String(e.target.value))}
      >
        {options.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}