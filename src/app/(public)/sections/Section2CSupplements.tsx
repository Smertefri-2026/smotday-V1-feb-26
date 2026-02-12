"use client";

import { useEffect, useState } from "react";

const LS_KEY = "smooday_v1_quickcheck";

type Stored = {
  meals: any[];
  targets: any;
  profile: any;
  supplements: {
    multivitamin: boolean;
    vitaminD: boolean;
    omega3: boolean;
    magnesium: boolean;
    zinc: boolean;
    eaaGrams: number;
  };
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
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
  } catch {}
}

function ensureDefaults(s: Stored | null): Stored {
  const base: Stored = {
    meals: [],
    targets: { kcal: 2200, p: 150, f: 70, c: 220 },
    profile: {},
    supplements: {
      multivitamin: false,
      vitaminD: false,
      omega3: false,
      magnesium: false,
      zinc: false,
      eaaGrams: 0,
    },
  };

  if (!s) return base;
  return {
    ...base,
    ...s,
    supplements: { ...base.supplements, ...(s.supplements || {}) },
  };
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

export default function Section2CSupplements() {
  const [data, setData] = useState<Stored>(() => ensureDefaults(null));

  useEffect(() => {
    setData(ensureDefaults(readLS()));
  }, []);

  useEffect(() => {
    writeLS(data);
  }, [data]);

  return (
    <>
      <div>
        <h3 className="font-heading text-xl font-semibold">Supplements today</h3>
        <p className="mt-1 text-sm" style={{ color: "var(--sd-slate)" }}>
          V1 uses simple checkboxes + EAA grams. (Text smart-toggles can come next.)
        </p>
      </div>

      <div className="mt-4 rounded-2xl border bg-white p-4">
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
                supplements: { ...p.supplements, eaaGrams: clamp(safeNum(v), 0, 50) },
              }))
            }
          />
        </div>
      </div>
    </>
  );
}