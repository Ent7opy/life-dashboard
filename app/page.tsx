"use client";

import { useState, useEffect, useRef } from "react";
import { Sprout, Wind, Settings2, Check } from "lucide-react";
import OrganicProgressBar from "@/components/OrganicProgressBar";
import FernDivider from "@/components/FernDivider";
import OakDivider from "@/components/OakDivider";
import WheatDivider from "@/components/WheatDivider";
import BookList from "@/components/BookList";
import WeeklyReview from "@/components/WeeklyReview";
import { defaultSkills, learningPath, projects, type Skill } from "@/data/greentech";
import { getProgress, updateProgress } from "@/lib/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDaysLearning(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem("learning-start-date");
  const start = stored ? new Date(stored) : (() => {
    const d = new Date().toISOString().split("T")[0];
    localStorage.setItem("learning-start-date", d);
    return new Date(d);
  })();
  return Math.floor((Date.now() - start.getTime()) / 86_400_000);
}

function getBooksRead(): number {
  if (typeof window === "undefined") return 0;
  try {
    const state = JSON.parse(localStorage.getItem("book-read-state") ?? "{}");
    return Object.values(state).filter(Boolean).length;
  } catch {
    return 0;
  }
}

// ── Status dot helper ─────────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  active: "#c07d2e",
  complete: "#4a7c59",
  paused: "#9c8f78",
};

// ── Learning path node ────────────────────────────────────────────────────────
function LearningTimeline() {
  const nodes = learningPath;
  const totalNodes = nodes.length;

  return (
    <div className="relative px-4 py-8">
      <svg
        className="w-full overflow-visible"
        viewBox={`0 0 ${(totalNodes - 1) * 160 + 40} 110`}
        style={{ height: "110px" }}
      >
        {/* Dashed winding path */}
        <path
          d={`M 20,55 Q 100,25 ${160},55 Q ${240},85 ${320},55 Q ${400},25 ${480},55 Q ${560},85 ${620},55`}
          fill="none"
          stroke="#c8b99a"
          strokeWidth="1.8"
          strokeDasharray="6 5"
        />

        {nodes.map((node, i) => {
          const x = 20 + i * 150;
          // Alternate y so the nodes sit on the winding path
          const y = i % 2 === 0 ? 55 : 55;
          const isCurrent = node.status === "current";
          const isDone = node.status === "done";

          return (
            <g key={node.id}>
              {/* Amber halo on current */}
              {isCurrent && (
                <circle
                  cx={x}
                  cy={y}
                  r={18}
                  fill="none"
                  stroke="#c07d2e"
                  strokeWidth="1"
                  strokeOpacity="0.4"
                />
              )}

              {/* Node circle */}
              <circle
                cx={x}
                cy={y}
                r={isCurrent ? 10 : 6}
                fill={node.status === "future" ? "#f7f3e9" : "#3d6b4f"}
                stroke={node.status === "future" ? "#c8b99a" : "none"}
                strokeWidth="1.5"
                className={isCurrent ? "animate-pulse" : ""}
              />

              {/* Checkmark for done */}
              {isDone && (
                <path
                  d={`M${x - 3},${y} L${x - 1},${y + 2.5} L${x + 4},${y - 3}`}
                  stroke="#fefcf5"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
              )}

              {/* Label */}
              <text
                x={x}
                y={y + 28}
                textAnchor="middle"
                fontSize="9"
                fontFamily="var(--font-jetbrains)"
                fontWeight={isCurrent ? "700" : "400"}
                fill={node.status === "future" ? "#9c8f78" : "#3d6b4f"}
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [skills, setSkills] = useState<Skill[]>(defaultSkills);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState(0);
  const [stats, setStats] = useState({ daysLearning: 0, booksRead: 0 });
  const editRef = useRef<HTMLInputElement>(null);

  // Load skills from API / localStorage
  useEffect(() => {
    setMounted(true);
    setStats({
      daysLearning: getDaysLearning(),
      booksRead: getBooksRead(),
    });

    async function loadSkills() {
      const remote = await getProgress();
      setSkills((prev) =>
        prev.map((skill) => {
          // API value takes precedence, then localStorage, then default
          if (remote && remote[skill.id] !== undefined) {
            return { ...skill, value: remote[skill.id] };
          }
          const local = localStorage.getItem(`progress-${skill.id}`);
          if (local !== null) {
            const parsed = parseInt(local, 10);
            if (!isNaN(parsed)) return { ...skill, value: parsed };
          }
          return skill;
        })
      );
    }
    loadSkills();
  }, []);

  const startEdit = (skill: Skill) => {
    setEditingSkill(skill.id);
    setDraftValue(skill.value);
    setTimeout(() => editRef.current?.focus(), 50);
  };

  const commitEdit = (skillId: string) => {
    const clamped = Math.min(100, Math.max(0, draftValue));
    setSkills((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, value: clamped } : s))
    );
    localStorage.setItem(`progress-${skillId}`, clamped.toString());
    updateProgress(skillId, clamped);
    setEditingSkill(null);
  };

  const activeProjectCount = projects.filter((p) => p.status === "active").length;

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex justify-center py-20">
      <div className="w-full max-w-[780px] px-8">

        {/* ── SECTION: NOW ─────────────────────────────────────────────── */}
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

          {/* KPI chips */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { val: String(stats.daysLearning), label: "days learning" },
              { val: String(stats.booksRead), label: "books read" },
              { val: String(activeProjectCount), label: "projects active" },
            ].map((kpi) => (
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

        {/* ── SECTION: LEARNING ────────────────────────────────────────── */}
        <section id="learning" className="mb-16 scroll-mt-20">
          <div className="flex items-center gap-3 mb-8">
            <Sprout className="text-forest flex-shrink-0" size={20} strokeWidth={1.8} />
            <h3 className="text-[22px] font-semibold text-ink font-display">
              Learning Path
            </h3>
          </div>

          {/* Winding milestone map */}
          <LearningTimeline />

          {/* Current focus card */}
          <div
            className="bg-surface border border-bark rounded-[10px] p-8 relative overflow-hidden group mt-6"
            style={{ boxShadow: "0 2px 12px rgba(60,40,10,0.04)" }}
          >
            {/* Corner botanical ornament */}
            <div className="absolute top-0 right-0 opacity-[0.05] group-hover:opacity-[0.09] transition-opacity duration-500">
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
                  Analyzing historical carbon flux datasets using Python.
                  Moving from simple regressions toward distributed
                  environmental modeling frameworks.
                </p>
              </div>
            </div>
          </div>

          <OakDivider />
        </section>

        {/* ── SECTION: SKILLS ──────────────────────────────────────────── */}
        <section id="skills" className="mb-16 scroll-mt-20">
          <div className="flex items-center gap-3 mb-8">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3d6b4f" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 2C6 2 2 6 2 12s4 10 10 10 10-4 10-10" />
              <path d="M12 6v6l4 2" />
              <path d="M18 2l2 2-2 2" />
            </svg>
            <h3 className="text-[22px] font-semibold text-ink font-display">Skills</h3>
          </div>

          <div className="space-y-7">
            {skills.map((skill) => {
              const isEditing = editingSkill === skill.id;
              return (
                <div
                  key={skill.id}
                  className="group relative cursor-pointer"
                  onClick={() => !isEditing && startEdit(skill)}
                >
                  <div className="flex justify-between items-end mb-2 px-0.5">
                    <span className="text-[15px] text-ink font-reading">{skill.name}</span>
                    {isEditing ? (
                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          ref={editRef}
                          type="number"
                          min={0}
                          max={100}
                          value={draftValue}
                          onChange={(e) => setDraftValue(Number(e.target.value))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitEdit(skill.id);
                            if (e.key === "Escape") setEditingSkill(null);
                          }}
                          className="w-12 bg-transparent border-b border-amber-sol font-data text-[13px] text-amber-sol text-right focus:outline-none"
                        />
                        <button
                          onClick={() => commitEdit(skill.id)}
                          className="text-forest hover:text-amber-sol transition-colors"
                          aria-label="Save"
                        >
                          <Check size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    ) : (
                      <span className="font-data text-[14px] font-bold text-forest group-hover:text-amber-sol transition-colors">
                        {skill.value}%
                      </span>
                    )}
                  </div>

                  <OrganicProgressBar
                    progress={isEditing ? draftValue : skill.value}
                    color={isEditing ? "#c07d2e" : "#3d6b4f"}
                  />

                  {!isEditing && (
                    <p className="mt-1 text-[11px] text-ink-3 font-data opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      click to edit
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <WheatDivider />
        </section>

        {/* ── SECTION: PROJECTS ────────────────────────────────────────── */}
        <section id="projects" className="mb-16 scroll-mt-20">
          <div className="flex items-center gap-3 mb-8">
            <Settings2 className="text-forest flex-shrink-0" size={20} strokeWidth={1.8} />
            <h3 className="text-[22px] font-semibold text-ink font-display">Projects</h3>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-surface border border-bark rounded-[10px] p-6 hover:border-forest hover:-translate-y-0.5 transition-all duration-300 group"
                style={{ boxShadow: "0 2px 8px rgba(60,40,10,0.03)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: statusColor[proj.status] }}
                  />
                  <h4 className="text-[17px] font-bold text-ink font-display group-hover:text-forest transition-colors">
                    {proj.name}
                  </h4>
                </div>

                <div className="flex gap-1.5 mb-4 flex-wrap">
                  {proj.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-data text-[10px] border border-bark px-2 py-0.5 rounded-full text-forest"
                    >
                      {tag}
                    </span>
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
              <path d="M30 10 Q 50 10 50 30 Q 50 50 30 50 Q 10 50 10 30 Q 10 10 30 10"
                fill="none" stroke="#7a6040" strokeWidth="1" strokeDasharray="2 2.5" />
              <path d="M22 30 L 38 30 M30 22 L 30 38" stroke="#7a6040" strokeWidth="1.5"
                strokeLinecap="round" />
            </svg>
          </div>
        </section>

        {/* ── SECTION: READING ─────────────────────────────────────────── */}
        <section id="reading" className="mb-16 scroll-mt-20">
          <BookList />
        </section>

        {/* ── SECTION: REVIEW ──────────────────────────────────────────── */}
        <section id="review" className="pb-32 scroll-mt-20">
          <WeeklyReview />
        </section>

      </div>
    </div>
  );
}
