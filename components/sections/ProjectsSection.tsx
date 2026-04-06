"use client";

import { Settings2 } from "lucide-react";
import { projects } from "@/data/greentech";
import { Badge } from "@/components/ui/badge";

const statusDot: Record<string, string> = {
  active:   "#c07d2e",
  complete: "#4a7c59",
  paused:   "#9c8f78",
};

// ── Pure presentational — projects come from static data, no hooks needed.

export function ProjectsSection() {
  return (
    <section id="projects" className="mb-16 scroll-mt-20">
      <div className="flex items-center gap-3 mb-8">
        <Settings2 className="text-forest flex-shrink-0" size={20} strokeWidth={1.8} />
        <h3 className="text-[22px] font-semibold text-ink font-display">Projects</h3>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-surface border border-bark rounded-[10px] p-6 group hover:border-forest hover:-translate-y-0.5 transition-all duration-300"
            style={{ boxShadow: "0 2px 8px rgba(60,40,10,0.03)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: statusDot[proj.status] }}
              />
              <h4 className="text-[17px] font-bold text-ink font-display group-hover:text-forest transition-colors">
                {proj.name}
              </h4>
            </div>

            <div className="flex gap-1.5 mb-4 flex-wrap">
              {proj.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>

            <p className="text-[13px] text-ink-2 leading-relaxed mb-4 font-reading line-clamp-3">
              {proj.description}
            </p>

            {proj.lastUpdated && (
              <div className="font-data text-[11px] text-ink-3">
                last leaf:{" "}
                {new Date(proj.lastUpdated).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Moss cluster divider */}
      <div className="flex justify-center py-12 opacity-35 select-none pointer-events-none">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path
            d="M30 10 Q 50 10 50 30 Q 50 50 30 50 Q 10 50 10 30 Q 10 10 30 10"
            fill="none" stroke="#7a6040" strokeWidth="1" strokeDasharray="2 2.5"
          />
          <path d="M22 30 L 38 30 M30 22 L 30 38" stroke="#7a6040" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </section>
  );
}
