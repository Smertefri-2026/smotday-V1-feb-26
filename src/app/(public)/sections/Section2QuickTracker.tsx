"use client";

import Section2AProfileAndTargets from "./Section2AProfileAndTargets";
import Section2BMeals from "./Section2BMeals";
import Section2CSupplements from "./Section2CSupplements";

export default function Section2QuickTracker() {
  return (
    <section id="quick-check" className="container-app pb-10">
      <div className="card p-6">
        <Section2AProfileAndTargets />

        <div className="mt-8">
          <Section2BMeals />
        </div>

        <div className="mt-8">
          <Section2CSupplements />
        </div>

        <p className="mt-4 text-xs" style={{ color: "var(--sd-slate)" }}>
          Saved automatically on this device.
        </p>
      </div>
    </section>
  );
}