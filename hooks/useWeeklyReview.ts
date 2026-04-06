import { useEffect, useMemo } from "react";
import { useDashboardStore, type ReviewEntry } from "@/store/dashboardStore";
import { getWeeklyReview, saveWeeklyReview } from "@/lib/api";

/**
 * Provides weekly review entries, goals, and derived metrics (streak,
 * weekTotal). Mutations write optimistically to the store and sync to the API.
 */
export function useWeeklyReview() {
  const entries = useDashboardStore((s) => s.entries);
  const goals = useDashboardStore((s) => s.goals);
  const upsertEntry = useDashboardStore((s) => s.upsertEntry);
  const setEntries = useDashboardStore((s) => s.setEntries);
  const addGoal = useDashboardStore((s) => s.addGoal);
  const removeGoal = useDashboardStore((s) => s.removeGoal);

  useEffect(() => {
    getWeeklyReview().then((remote) => {
      if (!remote) return;
      setEntries(
        remote.map((e) => ({
          date: e.entry_date,
          hours: e.hours,
          reflection: e.reflection ?? "",
          goals: Array.isArray(e.goals) ? e.goals : [],
        }))
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addEntry = (entry: ReviewEntry) => {
    upsertEntry(entry);                                              // optimistic
    saveWeeklyReview(entry.date, entry.hours, entry.reflection, entry.goals); // fire-and-forget
  };

  // ── Derived ─────────────────────────────────────────────────────────────

  const streak = useMemo(() => {
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
      } else {
        break;
      }
    }
    return count;
  }, [entries]);

  const weekTotal = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entries
      .filter((e) => new Date(e.date) >= weekAgo)
      .reduce((sum, e) => sum + e.hours, 0);
  }, [entries]);

  return { entries, goals, streak, weekTotal, addEntry, addGoal, removeGoal };
}
