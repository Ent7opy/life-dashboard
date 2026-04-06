"use client";

import { Sprout, Wind } from "lucide-react";
import { learningPath } from "@/data/greentech";
import OakDivider from "@/components/OakDivider";

// ── Timeline ──────────────────────────────────────────────────────────────────
// Pure presentational — no state, no API, no hooks.

function LearningTimeline() {
  const nodes = learningPath;
  const nodeSpacing = 150;
  const width = (nodes.length - 1) * nodeSpacing + 40;

  return (
    <div className="relative px-4 py-8">
      <svg
        className="w-full overflow-visible"
        viewBox={`0 0 ${width} 110`}
        style={{ height: "110px" }}
      >
        {/* Dashed winding path */}
        <path
          d={`M 20,55 Q 95,28 ${nodeSpacing + 20},55 Q ${nodeSpacing * 1.5 + 20},82 ${nodeSpacing * 2 + 20},55 Q ${nodeSpacing * 2.5 + 20},28 ${nodeSpacing * 3 + 20},55 Q ${nodeSpacing * 3.5 + 20},82 ${nodeSpacing * 4 + 20},55`}
          fill="none"
          stroke="#c8b99a"
          strokeWidth="1.8"
          strokeDasharray="6 5"
        />

        {nodes.map((node, i) => {
          const x = 20 + i * nodeSpacing;
          const isCurrent = node.status === "current";
          const isDone = node.status === "done";
          const isFuture = node.status === "future";

          return (
            <g key={node.id}>
              {isCurrent && (
                <circle
                  cx={x} cy={55} r={18}
                  fill="none" stroke="#c07d2e" strokeWidth="1" strokeOpacity="0.4"
                />
              )}
              <circle
                cx={x} cy={55}
                r={isCurrent ? 10 : 6}
                fill={isFuture ? "#f7f3e9" : "#3d6b4f"}
                stroke={isFuture ? "#c8b99a" : "none"}
                strokeWidth="1.5"
                className={isCurrent ? "animate-pulse" : ""}
              />
              {isDone && (
                <path
                  d={`M${x - 3},55 L${x - 1},57.5 L${x + 4},52`}
                  stroke="#fefcf5" strokeWidth="1.5" fill="none" strokeLinecap="round"
                />
              )}
              <text
                x={x} y={83}
                textAnchor="middle"
                fontSize="9"
                fontFamily="var(--font-jetbrains)"
                fontWeight={isCurrent ? "700" : "400"}
                fill={isFuture ? "#9c8f78" : "#3d6b4f"}
                letterSpacing="0.5"
              >
                {node.label.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function LearningSection() {
  return (
    <section id="learning" className="mb-16 scroll-mt-20">
      <div className="flex items-center gap-3 mb-8">
        <Sprout className="text-forest flex-shrink-0" size={20} strokeWidth={1.8} />
        <h3 className="text-[22px] font-semibold text-ink font-display">
          Learning Path
        </h3>
      </div>

      <LearningTimeline />

      {/* Current focus card */}
      <div
        className="bg-surface border border-bark rounded-[10px] p-8 relative overflow-hidden group mt-6"
        style={{ boxShadow: "0 2px 12px rgba(60,40,10,0.04)" }}
      >
        {/* Corner ornament */}
        <div className="absolute top-0 right-0 opacity-[0.05] group-hover:opacity-[0.09] transition-opacity duration-500 pointer-events-none">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#7a6040" strokeWidth="1">
            <path d="M80 0 Q 40 0 0 40 M80 20 Q 60 20 40 40 M80 40 Q 70 40 60 50" />
          </svg>
        </div>

        <div className="flex gap-7 items-start">
          <div className="w-14 h-14 bg-surface-2 rounded-full flex items-center justify-center border border-bark flex-shrink-0">
            <Wind className="text-amber-sol" size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-data text-[11px] text-ink-3 uppercase tracking-wider mb-1">
              Currently studying
            </div>
            <h4 className="text-[20px] font-bold text-ink mb-2 font-display">
              Climate Data Orchestration
            </h4>
            <p className="text-[15px] text-ink-2 leading-relaxed font-reading">
              Analyzing historical carbon flux datasets using Python. Moving
              from simple regressions toward distributed environmental modeling
              frameworks.
            </p>
          </div>
        </div>
      </div>

      <OakDivider />
    </section>
  );
}
