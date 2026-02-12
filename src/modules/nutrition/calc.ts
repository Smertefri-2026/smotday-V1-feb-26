// /src/modules/nutrition/calc.ts

export type Sex = "male" | "female" | null;

export type JobActivity = "low" | "medium" | "high" | null;
export type TrainingActivity = "none" | "light" | "moderate" | "high" | null;

export type Goal = "lose_fat" | "maintain" | "gain_muscle" | null;

export type NutritionProfile = {
  sex: Sex;
  age_years: number | null;
  height_cm: number | null;
  weight_kg: number | null;

  job_activity: JobActivity;
  training_activity: TrainingActivity;
  goal: Goal;
};

export function calcBmr(p: NutritionProfile): number | null {
  const w = p.weight_kg ?? 0;
  const h = p.height_cm ?? 0;
  const a = p.age_years ?? 0;
  const sex = p.sex;

  if (!w || !h || !a || !sex) return null;

  // Mifflin–St Jeor
  const base = 10 * w + 6.25 * h - 5 * a;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

export function calcPal(p: NutritionProfile): number | null {
  const job = p.job_activity;
  const tr = p.training_activity;

  if (!job || !tr) return null;

  // Stabil og lett å forstå
  let pal = job === "low" ? 1.35 : job === "medium" ? 1.55 : 1.75;

  if (tr === "light") pal += 0.10;
  if (tr === "moderate") pal += 0.20;
  if (tr === "high") pal += 0.30;

  pal = Math.min(2.05, Math.max(1.2, pal));
  return Math.round(pal * 100) / 100;
}

export function calcTdee(p: NutritionProfile): {
  bmr: number | null;
  pal: number | null;
  tdee: number | null;
} {
  const bmr = calcBmr(p);
  if (!bmr) return { bmr: null, pal: null, tdee: null };

  const pal = calcPal(p);
  if (!pal) return { bmr, pal: null, tdee: null };

  const tdee = Math.round(bmr * pal);
  return { bmr, pal, tdee };
}

export function goalMeta(goal: Goal) {
  if (goal === "lose_fat") return { label: "Lose fat", tweakLabel: "−15%", factor: 0.85 };
  if (goal === "gain_muscle") return { label: "Gain muscle", tweakLabel: "+10%", factor: 1.1 };
  if (goal === "maintain") return { label: "Maintain", tweakLabel: "0%", factor: 1.0 };
  return { label: "Not set", tweakLabel: "—", factor: 1.0 };
}

export function applyGoalToCalories(tdee: number | null, goal: Goal): number | null {
  if (tdee == null) return null;
  const meta = goalMeta(goal);
  return Math.round(tdee * meta.factor);
}

export function calcMacrosFromCalories(p: NutritionProfile, calories: number | null) {
  const w = p.weight_kg ?? 0;
  if (!w || calories == null) return { protein: null, fat: null, carbs: null };

  // Enkelt V1-oppsett:
  // - protein: 2.0 g/kg for gain, ellers 1.8 g/kg
  // - fett: 0.9 g/kg
  const protein = Math.round(w * (p.goal === "gain_muscle" ? 2.0 : 1.8));
  const fat = Math.round(w * 0.9);

  const carbs = Math.max(0, Math.round((calories - (protein * 4 + fat * 9)) / 4));
  return { protein, fat, carbs };
}

export function calcTargetsFromProfile(p: NutritionProfile) {
  const { tdee } = calcTdee(p);
  const calories = applyGoalToCalories(tdee, p.goal);
  const macros = calcMacrosFromCalories(p, calories);

  return {
    kcal: calories ?? null,
    p: macros.protein ?? null,
    f: macros.fat ?? null,
    c: macros.carbs ?? null,
  };
}

export function isProfileComplete(p: NutritionProfile) {
  return !!(
    p.sex &&
    p.age_years &&
    p.height_cm &&
    p.weight_kg &&
    p.job_activity &&
    p.training_activity
  );
}