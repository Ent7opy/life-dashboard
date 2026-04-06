"use client";

import { useMemo, useState } from "react";
import { Sun, Plus, X, Leaf } from "lucide-react";
import { useWeeklyReview } from "@/hooks/useWeeklyReview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewEntry } from "@/store/dashboardStore";

// ── Sparkline ─────────────────────────────────────────────────────────────────
// Pure presentational — receives entries as a prop, renders nothing if < 2.

function Sparkline({ entries }: { entries: ReviewEntry[] }) {
  const last30 = useMemo(
    () => [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-30),
    [entries]
  );

  if (last30.length < 2) return null;

  const maxH = Math.max(...last30.map((e) => e.hours), 1);
  const W = 700;
  const H = 80;
  const step = W / (last30.length - 1);

  const pts = last30.map((e, i) => ({
    x: i * step,
    y: H - (e.hours / maxH) * H * 0.85,
  }));

  const pathD = pts
    .map((p, i) =>
      i === 0
        ? `M ${p.x},${p.y}`
        : `Q ${(pts[i - 1].x + p.x) / 2},${pts[i - 1].y} ${p.x},${p.y}`
    )
    .join(" ");

  const todayPt = pts[pts.length - 1];

  return (
    <div className="mb-10">
      <svg className="w-full overflow-visible" viewBox={`0 0 ${W} ${H + 20}`} style={{ height: "90px" }}>
        <path d={`${pathD} L ${todayPt.x},${H} L 0,${H} Z`} fill="#3d6b4f" fillOpacity="0.08" />
        <path d={pathD} fill="none" stroke="#3d6b4f" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx={todayPt.x} cy={todayPt.y} r="4.5" fill="#c07d2e" />
        {[0, 7, 14, 21].map((idx) => {
          const pt = pts[Math.min(idx, pts.length - 1)];
          return (
            <text key={idx} x={pt.x} y={H + 16} textAnchor="middle" fontSize="9" fontFamily="var(--font-jetbrains)" fill="#9c8f78">
              {last30[Math.min(idx, last30.length - 1)]?.date.slice(5)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function WeeklyReview() {
  const { entries, goals, streak, weekTotal, addEntry, addGoal, removeGoal } =
    useWeeklyReview();

  // Local UI state only: the form fields for today's entry.
  const [hours, setHours] = useState(0);
  const [reflection, setReflection] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEntry({
      date: new Date().toISOString().split("T")[0],
      hours,
      reflection,
      goals: [...goals],
    });
    setHours(0);
    setReflection("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAddGoal = () => {
    if (goalInput.trim()) {
      addGoal(goalInput.trim());
      setGoalInput("");
    }
  };

  const lastEntryDate = useMemo(() => {
    if (entries.length === 0) return "—";
    const last = [...entries].sort((a, b) => b.date.localeCompare(a.date))[0];
    return last.date.slice(5);
  }, [entries]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Sun className="text-forest flex-shrink-0" size={20} strokeWidth={1.8} />
        <h3 className="text-[22px] font-semibold text-ink font-display">Weekly Review</h3>
      </div>

      <Sparkline entries={entries} />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { val: String(streak),              label: "day streak"       },
          { val: weekTotal.toFixed(1),        label: "hours this week"  },
          { val: lastEntryDate,               label: "last entry"       },
        ].map((s) => (
          <div key={s.label} className="bg-surface-2 border border-bark-subtle rounded-[8px] px-4 py-4 text-center">
            <div className="font-data text-2xl font-bold text-forest leading-none mb-1">{s.val}</div>
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
        <div className="absolute top-4 left-4 opacity-[0.06] pointer-events-none">
          <Leaf size={44} color="#3d6b4f" />
        </div>

        <div className="grid grid-cols-[140px_1fr_180px] gap-8 items-center">
          <div className="text-center">
            <div className="font-data text-[52px] font-bold text-forest leading-none">
              {hours.toFixed(1)}
            </div>
            <div className="font-data text-[11px] text-ink-3 mt-1">hours today</div>
          </div>

          <div className="flex flex-col gap-5">
            <input
              type="range" min="0" max="12" step="0.5"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value))}
            />
            <Textarea
              underline
              rows={2}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What did you work on?"
            />
          </div>

          <div className="flex flex-col gap-3 items-center">
            <Button
              type="submit"
              size="lg"
              variant={saved ? "amber" : "primary"}
              className="w-full"
            >
              {saved ? "Saved ✓" : "Save today"}
            </Button>
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
          <Input
            underline
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddGoal())}
            placeholder="Add a goal for this week…"
          />
          <Button
            type="button"
            variant="primary"
            size="icon"
            onClick={handleAddGoal}
            aria-label="Add goal"
            className="mt-auto flex-shrink-0"
          >
            <Plus size={14} strokeWidth={2.5} />
          </Button>
        </div>
        <ul className="space-y-2">
          {goals.map((g, idx) => (
            <li key={idx} className="group flex items-center justify-between px-4 py-3 bg-surface rounded-[6px] border border-bark-subtle">
              <span className="text-[14px] text-ink font-reading leading-snug">{g}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeGoal(idx)}
                aria-label="Remove goal"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-ink-3 hover:text-amber-sol"
              >
                <X size={13} strokeWidth={2} />
              </Button>
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
                <div key={entry.date} className="flex items-baseline gap-6 px-3 py-3 rounded-sm hover:bg-surface-2 transition-colors">
                  <span className="font-data text-[12px] text-ink-3 w-20 flex-shrink-0">{entry.date}</span>
                  <span className="font-data text-[14px] font-bold text-forest flex-shrink-0 w-10">{entry.hours}h</span>
                  {entry.reflection && (
                    <span className="text-[13px] text-ink-2 font-reading truncate">{entry.reflection}</span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
