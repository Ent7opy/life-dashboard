"use client";

import { useDashboard } from "@/hooks/useDashboard";
import FernDivider from "@/components/FernDivider";

export function NowSection() {
  const { dashboard } = useDashboard();

  const kpis = [
    {
      val: dashboard ? String(dashboard.snapshot.active_projects) : "—",
      label: "projects active",
    },
    {
      val: dashboard ? String(dashboard.snapshot.active_goals) : "—",
      label: "active goals",
    },
    {
      val: dashboard ? String(dashboard.snapshot.resources_active) : "—",
      label: "resources in progress",
    },
  ];

  return (
    <section id="now" className="mb-16 scroll-mt-20">
      <header className="mb-10">
        <h2 className="text-[54px] font-bold text-forest leading-none mb-2 tracking-tight font-display italic">
          vanyo.
        </h2>
        <p className="text-[20px] italic text-ink-2 font-reading">
          Technologist{" "}
          <span className="text-amber-sol not-italic mx-1">→</span>{" "}
          Green Tech
        </p>
      </header>

      <p className="text-[17px] text-ink leading-[1.75] max-w-[620px] mb-12 font-reading">
        Using what I already know — software, systems, data — to work on
        climate tech, clean energy, and sustainable infrastructure. This is
        where I track the journey.
      </p>

      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface-2 border border-bark rounded-[10px] p-6 text-center"
            style={{ boxShadow: "2px 4px 12px rgba(60,40,10,0.05)" }}
          >
            <div className="font-data text-3xl font-bold text-forest mb-1">
              {kpi.val}
            </div>
            <div className="font-data text-[11px] text-ink-3 uppercase tracking-wider">
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      <FernDivider />
    </section>
  );
}
