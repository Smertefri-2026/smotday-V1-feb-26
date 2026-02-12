"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const LS_KEY = "smooday_v1_quickcheck";

type Sex = "male" | "female" | null;
type Goal = "maintain" | "lose_fat" | "gain_muscle";
type Job = "low" | "medium" | "high";
type Training = "none" | "light" | "moderate" | "high";

type Profile = {
  sex: Sex;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  goal: Goal;
  jobActivity: Job;
  trainingActivity: Training;
};

type Stored = {
  meals: Array<{ id: string; label: string; note: string; kcal: number; p: number; f: number; c: number }>;
  supplements: {
    multivitamin: boolean;
    vitaminD: boolean;
    omega3: boolean;
    magnesium: boolean;
    zinc: boolean;
    eaaGrams: number;
  };
  targets: { kcal: number; p: number; f: number; c: number };
  profile: Profile;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function safeNum(v: any) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
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
  } catch {
    // ignore
  }
}

function defaultStore(): Stored {
  return {
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
    targets: { kcal: 2200, p: 150, f: 70, c: 220 },
    profile: {
      sex: null,
      age: null,
      heightCm: null,
      weightKg: null,
      goal: "maintain",
      jobActivity: "low",
      trainingActivity: "none",
    },
  };
}

function ensureDefaults(s: Stored | null): Stored {
  const base = defaultStore();
  if (!s) return base;

  return {
    ...base,
    ...s,
    meals: Array.isArray(s.meals) && s.meals.length ? s.meals : base.meals,
    supplements: { ...base.supplements, ...(s.supplements || {}) },
    targets: { ...base.targets, ...(s.targets || {}) },
    profile: { ...base.profile, ...(s.profile || {}) },
  };
}

/** --- Calculations --- */
function calcBmr(p: Profile) {
  const w = p.weightKg ?? 0;
  const h = p.heightCm ?? 0;
  const a = p.age ?? 0;
  const sex = p.sex;

  // validate here (not while typing)
  if (!sex) return null;
  if (a < 5 || a > 120) return null;
  if (h < 80 || h > 250) return null;
  if (w < 20 || w > 300) return null;

  const base = 10 * w + 6.25 * h - 5 * a;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

function calcPal(p: Profile) {
  const job = p.jobActivity;
  const tr = p.trainingActivity;

  let pal = job === "low" ? 1.35 : job === "medium" ? 1.55 : 1.75;

  if (tr === "light") pal += 0.1;
  if (tr === "moderate") pal += 0.2;
  if (tr === "high") pal += 0.3;

  pal = Math.min(2.05, Math.max(1.2, pal));
  return Math.round(pal * 100) / 100;
}

function goalFactor(goal: Goal) {
  if (goal === "lose_fat") return 0.85;
  if (goal === "gain_muscle") return 1.1;
  return 1.0;
}

function autoTargets(p: Profile) {
  const bmr = calcBmr(p);
  if (!bmr) return null;

  const pal = calcPal(p);
  const tdee = Math.round(bmr * pal);
  const calories = Math.round(tdee * goalFactor(p.goal));

  const w = p.weightKg ?? 0;
  const protein = w ? Math.round(w * (p.goal === "gain_muscle" ? 2.0 : 1.8)) : null;
  const fat = w ? Math.round(w * 0.9) : null;

  const carbs =
    calories && protein != null && fat != null
      ? Math.max(0, Math.round((calories - (protein * 4 + fat * 9)) / 4))
      : null;

  return { calories, protein, fat, carbs, bmr, pal, tdee };
}

/** Input that lets you type normally */
function InputMini({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
}) {
  const str = value == null ? "" : String(value);

  return (
    <div>
      <label className="text-[11px] font-semibold" style={{ color: "var(--sd-slate)" }}>
        {label}
      </label>
      <input
        type="text"
        inputMode="numeric"
        className="mt-1 w-full rounded-2xl border px-3 py-2.5 text-sm"
        value={str}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw.trim() === "") return onChange(null);
          const cleaned = raw.replace(",", ".").replace(/[^\d.]/g, "");
          const n = Number(cleaned);
          onChange(Number.isFinite(n) ? n : null);
        }}
      />
    </div>
  );
}

export default function Section2AProfileAndTargets() {
  const [data, setData] = useState<Stored>(() => ensureDefaults(null));
  const targetsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setData(ensureDefaults(readLS()));
  }, []);

  useEffect(() => {
    writeLS(data);
  }, [data]);

  const auto = useMemo(() => autoTargets(data.profile), [data.profile]);

  function setProfile(patch: Partial<Profile>) {
    setData((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
  }

  function applyAutoTargets() {
    if (!auto) return;
    setData((prev) => ({
      ...prev,
      targets: {
        kcal: auto.calories,
        p: auto.protein ?? prev.targets.p,
        f: auto.fat ?? prev.targets.f,
        c: auto.carbs ?? prev.targets.c,
      },
    }));
  }

  function applyAutoTargetsAndScroll() {
    if (!auto) return;
    applyAutoTargets();
    // Smooth scroll to Daily targets so user sees the updated numbers
    setTimeout(() => {
      targetsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function resetProfileAndTargets() {
    setData((prev) => ({
      ...prev,
      targets: { kcal: 2200, p: 150, f: 70, c: 220 },
      profile: {
        sex: null,
        age: null,
        heightCm: null,
        weightKg: null,
        goal: "maintain",
        jobActivity: "low",
        trainingActivity: "none",
      },
    }));
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold">Quick check</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--sd-slate)" }}>
            Profile is optional, but enables auto-calculated targets.
          </p>
        </div>

        {/* Desktop actions (keep up top) */}
        <div className="hidden md:flex gap-2">
          <button className="btn btn-ghost" type="button" onClick={resetProfileAndTargets}>
            Reset targets/profile
          </button>
          <button className="btn btn-primary" type="button" onClick={applyAutoTargets} disabled={!auto}>
            Auto-calc targets
          </button>
        </div>

        {/* Mobile action: reset only (auto button is moved down) */}
        <div className="md:hidden">
          <button className="btn btn-ghost w-full justify-center" type="button" onClick={resetProfileAndTargets}>
            Reset targets/profile
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="mt-6 rounded-2xl border bg-white p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">Profile (optional)</div>
            <div className="text-xs" style={{ color: "var(--sd-slate)" }}>
              Fill this in to auto-calc kcal + macros targets.
            </div>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            {auto ? (
              <div className="text-xs" style={{ color: "var(--sd-slate)" }}>
                BMR <b style={{ color: "var(--sd-ink)" }}>{auto.bmr}</b> • PAL{" "}
                <b style={{ color: "var(--sd-ink)" }}>{auto.pal}</b> • TDEE{" "}
                <b style={{ color: "var(--sd-ink)" }}>{auto.tdee}</b> • Goal kcal{" "}
                <b style={{ color: "var(--sd-ink)" }}>{auto.calories}</b>
              </div>
            ) : (
              <div className="text-xs" style={{ color: "var(--sd-slate)" }}>
                Add sex + age + height + weight to see auto-calc preview.
              </div>
            )}

            {/* ✅ Small “Auto-calc” in profile that scrolls to targets (mobile-friendly) */}
            <button
              type="button"
              className={`btn btn-primary w-full justify-center md:w-auto ${!auto ? "opacity-60" : ""}`}
              onClick={applyAutoTargetsAndScroll}
              disabled={!auto}
              style={{ padding: "0.6rem 1rem" }}
            >
              Auto-calc → Daily targets
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-6">
          {/* Sex */}
          <div>
            <label className="text-[11px] font-semibold" style={{ color: "var(--sd-slate)" }}>
              Sex
            </label>
            <select
              className="mt-1 w-full rounded-2xl border px-3 py-2.5 text-sm"
              value={data.profile.sex ?? ""}
              onChange={(e) => setProfile({ sex: (e.target.value || null) as Sex })}
            >
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Age / Height / Weight */}
          <InputMini label="Age" value={data.profile.age} placeholder="e.g. 32" onChange={(v) => setProfile({ age: v })} />
          <InputMini
            label="Height (cm)"
            value={data.profile.heightCm}
            placeholder="e.g. 188"
            onChange={(v) => setProfile({ heightCm: v })}
          />
          <InputMini
            label="Weight (kg)"
            value={data.profile.weightKg}
            placeholder="e.g. 105"
            onChange={(v) => setProfile({ weightKg: v })}
          />

          {/* Goal */}
          <div>
            <label className="text-[11px] font-semibold" style={{ color: "var(--sd-slate)" }}>
              Goal
            </label>
            <select
              className="mt-1 w-full rounded-2xl border px-3 py-2.5 text-sm"
              value={data.profile.goal}
              onChange={(e) => setProfile({ goal: e.target.value as Goal })}
            >
              <option value="maintain">Maintain</option>
              <option value="lose_fat">Lose fat</option>
              <option value="gain_muscle">Gain muscle</option>
            </select>
          </div>

          {/* Job activity */}
          <div>
            <label className="text-[11px] font-semibold" style={{ color: "var(--sd-slate)" }}>
              Job activity
            </label>
            <select
              className="mt-1 w-full rounded-2xl border px-3 py-2.5 text-sm"
              value={data.profile.jobActivity}
              onChange={(e) => setProfile({ jobActivity: e.target.value as Job })}
            >
              <option value="low">Low (mostly sitting)</option>
              <option value="medium">Medium (on feet / moving)</option>
              <option value="high">High (physical work)</option>
            </select>
          </div>

          {/* Training activity */}
          <div className="md:col-span-2">
            <label className="text-[11px] font-semibold" style={{ color: "var(--sd-slate)" }}>
              Training activity
            </label>
            <select
              className="mt-1 w-full rounded-2xl border px-3 py-2.5 text-sm"
              value={data.profile.trainingActivity}
              onChange={(e) => setProfile({ trainingActivity: e.target.value as Training })}
            >
              <option value="none">None / very little</option>
              <option value="light">Light (1–2x/week)</option>
              <option value="moderate">Moderate (3–5x/week)</option>
              <option value="high">High (6+x/week)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Daily targets */}
      <div ref={targetsRef} className="mt-6 rounded-2xl border bg-white p-4">
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
              onChange={(v) => setData((p) => ({ ...p, targets: { ...p.targets, kcal: safeNum(v) } }))}
            />
            <InputMini
              label="Protein (g)"
              value={data.targets.p}
              onChange={(v) => setData((p) => ({ ...p, targets: { ...p.targets, p: safeNum(v) } }))}
            />
            <InputMini
              label="Fat (g)"
              value={data.targets.f}
              onChange={(v) => setData((p) => ({ ...p, targets: { ...p.targets, f: safeNum(v) } }))}
            />
            <InputMini
              label="Carbs (g)"
              value={data.targets.c}
              onChange={(v) => setData((p) => ({ ...p, targets: { ...p.targets, c: safeNum(v) } }))}
            />
          </div>
        </div>

        {/* Mobile-first: keep auto button here too */}
        <div className="mt-4">
          <button
            className={`btn btn-primary w-full justify-center ${!auto ? "opacity-60" : ""}`}
            type="button"
            onClick={applyAutoTargets}
            disabled={!auto}
          >
            Auto-calc targets
          </button>

          {!auto ? (
            <p className="mt-2 text-xs" style={{ color: "var(--sd-slate)" }}>
              Add sex + age + height + weight to enable auto-calc.
            </p>
          ) : (
            <p className="mt-2 text-xs" style={{ color: "var(--sd-slate)" }}>
              Targets updated from your profile.
            </p>
          )}
        </div>
      </div>
    </>
  );
}