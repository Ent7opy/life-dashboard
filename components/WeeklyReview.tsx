"use client";

import { useState, useEffect } from "react";
import { Sun, Plus, X, Leaf } from "lucide-react";
import { getWeeklyReview, saveWeeklyReview } from "@/lib/api";

type ReviewEntry = {
  date: string;
  hours: number;
  reflection: string;
  goals: string[];
};

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ entries }: { entries: ReviewEntry[] }) {
  const last30 = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  if (last30.length < 2) return null;

  const maxH = Math.max(...last30.map((e) => e.hours), 1);
  const W = 700;
  const H = 80;
  const step = W / (last30.length - 1);

  const points = last30.map((e, i) => ({
    x: i * step,
    y: H - (e.hours / maxH) * H * 0.85,
  }));

  const pathD = points
    .map((p, i) =>
      i === 0 ? `M ${p.x},${p.y}` : `Q ${(points[i - 1].x + p.x) / 2},${points[i - 1].y} ${p.x},${p.y}`
    )
    .join(" ");

  const fillD = `${pathD} L ${points[points.length - 1].x},${H} L 0,${H} Z`;
  const todayPt = points[points.length - 1];

  return (
    <div className="mb-10">
      <svg className="w-full overflow-visible" viewBox={`0 0 ${W} ${H + 20}`} style={{ height: "90px" }}>
        {/* Fill */}
        <path d={fillD} fill="#3d6b4f" fillOpacity="0.08" />
        {/* Line — slightly hand-drawn feel via quadratic bezier */}
        <path d={pathD} fill="none" stroke="#3d6b4f" strokeWidth="2.2" strokeLinecap="round" />
        {/* Today dot */}
        <circle cx={todayPt.x} cy={todayPt.y} r="4.5" fill="#c07d2e" />
        {/* Day labels */}
        {[0, 7, 14, 21, 29].map((idx) => {
          const pt = points[Math.min(idx, points.length - 1)];
          return (
            <text
              key={idx}
              x={pt?.x ?? 0}
              y={H + 16}
              textAnchor="middle"
              fontSize="9"
              fontFamily="var(--font-jetbrains)"
              fill="#9c8f78"
            >
              {last30[Math.min(idx, last30.length - 1)]?.date.slice(5) ?? ""}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function WeeklyReview() {
  const [hours, setHours] = useState(0);
  const [reflection, setReflection] = useState("");
  const [goal, setGoal] = useState("");
  const [goals, setGoals] = useState<string[]>([
    "Work through one Python dataset",
    "Read one chapter of Braiding Sweetgrass",
  ]);
  const [entries, setEntries] = useState<ReviewEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [saved, setSaved] = useState(false);

  // Load
  useEffect(() => {
    async function load() {
      const remote = await getWeeklyReview();
      if (remote !== null) {
        const mapped: ReviewEntry[] = remote.map((e) => ({
          date: e.entry_date,
          hours: e.hours,
          reflection: e.reflection ?? "",
          goals: Array.isArray(e.goals) ? e.goals : [],
        }));
        setEntries(mapped);
        localStorage.setItem("weekly-review-entries", JSON.stringify(mapped));
      } else {
        const saved = localStorage.getItem("weekly-review-entries");
        if (saved) {
          try { setEntries(JSON.parse(saved)); } catch { /* ignore */ }
        }
      }
      const savedGoals = localStorage.getItem("weekly-review-goals");
      if (savedGoals) {
        try { setGoals(JSON.parse(savedGoals)); } catch { /* ignore */ }
      }
    }
    load();
  }, []);

  // Streak
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    let count = 0;
    let expected = today;
    for (const entry of sorted) {
      if (entry.date !== expected) break;
      if (entry.hours >= 0.5) {
        count++;
        const prev = new Date(expected);
        prev.setDate(prev.getDate() - 1);
        expected = prev.toISOString().split("T")[0];
      } else break;
    }
    setStreak(count);
  }, [entries]);

  const persistEntries = (updated: ReviewEntry[]) => {
    setEntries(updated);
    localStorage.setItem("weekly-review-entries", JSON.stringify(updated));
  };

  const persistGoals = (updated: string[]) => {
    setGoals(updated);
    localStorage.setItem("weekly-review-goals", JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];
    const newEntry: ReviewEntry = { date: today, hours, reflection, goals: [...goals] };
    persistEntries([...entries.filter((e) => e.date !== today), newEntry]);
    saveWeeklyReview(today, hours, reflection, [...goals]);
    setHours(0);
    setReflection("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addGoal = () => {
    if (goal.trim()) {
      persistGoals([...goals, goal.trim()]);
      setGoal("");
    }
  };

  const weekTotal = entries
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    })
    .reduce((s, e) => s + e.hours, 0);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-8">
        <Sun className="text-forest flex-shrink-0" size={20} strokeWidth={1.8} />
        <h3 className="text-[22px] font-semibold text-ink font-display">Weekly Review</h3>
      </div>

      {/* Sparkline */}
      <Sparkline entries={entries} />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { val: `${streak}`, label: streak === 1 ? "day streak" : "day streak" },
          { val: weekTotal.toFixed(1), label: "hours this week" },
          { val: entries.length > 0 ? entries[entries.length - 1]?.date.slice(5) ?? "—" : "—", label: "last entry" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-surface-2 border border-bark-subtle rounded-[8px] px-4 py-4 text-center"
          >
            <div className="font-data text-2xl font-bold text-forest leading-none mb-1">
              {s.val}
            </div>
            <div className="font-data text-[10px] text-ink-3 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Log form */}
      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-bark rounded-[10px] p-8 mb-8 relative overflow-hidden"
        style={{ boxShadow: "0 2px 10px rgba(60,40,10,0.04)" }}
      >
        {/* Leaf watermark */}
        <div className="absolute top-4 left-4 opacity-[0.06] pointer-events-none">
          <Leaf size={44} color="#3d6b4f" />
        </div>

        <div className="grid grid-cols-[140px_1fr_180px] gap-8 items-center">
          {/* Big hours display */}
          <div className="text-center">
            <div className="font-data text-[52px] font-bold text-forest leading-none">
              {hours.toFixed(1)}
            </div>
            <div className="font-data text-[11px] text-ink-3 mt-1">hours today</div>
          </div>

          {/* Slider + reflection */}
          <div className="flex flex-col gap-5">
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value))}
            />
            <textarea
              rows={2}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What did you work on?"
              className="bg-transparent border-b border-bark focus:border-forest focus:outline-none py-2 text-[15px] text-ink placeholder:text-ink-3 font-reading resize-none"
            />
          </div>

          {/* Save button */}
          <div className="flex flex-col gap-3 items-center">
            <button
              type="submit"
              className={`w-full py-3 px-5 rounded-[10px] font-display font-semibold text-[15px] transition-all duration-200 ${
                saved
                  ? "bg-forest-light text-surface"
                  : "bg-forest text-surface hover:bg-forest-light"
              }`}
              style={{ boxShadow: "0 4px 14px rgba(61,107,79,0.2)" }}
            >
              {saved ? "Saved ✓" : "Save today"}
            </button>
            {streak > 0 && (
              <p className="font-data text-[11px] text-ink-3 italic text-center">
                {streak} day{streak !== 1 ? "s" : ""} of growth
              </p>
            )}
          </div>
        </div>
      </form>

      {/* Goals */}
      <div className="mb-8">
        <h4 className="text-[16px] font-semibold text-ink mb-4 font-display">Weekly Goals</h4>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGoal())}
            placeholder="Add a goal for this week…"
            className="flex-1 bg-surface border-b border-bark focus:border-forest focus:outline-none px-1 py-2 font-reading text-[14px] text-ink placeholder:text-ink-3"
          />
          <button
            onClick={addGoal}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-forest text-surface hover:bg-forest-light transition-colors mt-auto"
            aria-label="Add goal"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>

        <ul className="space-y-2">
          {goals.map((g, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between px-4 py-3 bg-surface rounded-[6px] border border-bark-subtle group"
            >
              <span className="text-[14px] text-ink font-reading leading-snug">{g}</span>
              <button
                onClick={() => persistGoals(goals.filter((_, i) => i !== idx))}
                className="text-ink-3 hover:text-amber-sol transition-colors opacity-0 group-hover:opacity-100 ml-3 flex-shrink-0"
                aria-label="Remove goal"
              >
                <X size={13} strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent entries */}
      {entries.length > 0 && (
        <div>
          <h4 className="text-[15px] font-semibold text-ink mb-3 font-display">Recent Entries</h4>
          <div className="space-y-0.5">
            {[...entries]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)
              .map((entry) => (
                <div
                  key={entry.date}
                  className="flex items-baseline gap-6 px-3 py-3 rounded-sm hover:bg-surface-2 transition-colors"
                >
                  <span className="font-data text-[12px] text-ink-3 w-20 flex-shrink-0">
                    {entry.date}
                  </span>
                  <span className="font-data text-[14px] font-bold text-forest flex-shrink-0 w-10">
                    {entry.hours}h
                  </span>
                  {entry.reflection && (
                    <span className="text-[13px] text-ink-2 font-reading truncate">
                      {entry.reflection}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
