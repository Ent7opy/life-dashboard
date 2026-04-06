import { useEffect, useMemo } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { projects } from "@/data/greentech";

/**
 * Derives the three top-level KPIs shown in the "Now" section.
 * No API calls here — data is already in the store by the time this runs.
 */
export function useDashboardStats() {
  const readState = useDashboardStore((s) => s.readState);
  const learningStartDate = useDashboardStore((s) => s.learningStartDate);
  const setLearningStartDate = useDashboardStore((s) => s.setLearningStartDate);

  // Seed the learning start date once, on first visit.
  useEffect(() => {
    if (!learningStartDate) {
      setLearningStartDate(new Date().toISOString().split("T")[0]);
    }
  }, [learningStartDate, setLearningStartDate]);

  const booksRead = useMemo(
    () => Object.values(readState).filter(Boolean).length,
    [readState]
  );

  const daysLearning = useMemo(() => {
    if (!learningStartDate) return 0;
    return Math.floor(
      (Date.now() - new Date(learningStartDate).getTime()) / 86_400_000
    );
  }, [learningStartDate]);

  // Static — derived once from the data file, no reactivity needed.
  const activeProjects = useMemo(
    () => projects.filter((p) => p.status === "active").length,
    []
  );

  return { booksRead, daysLearning, activeProjects };
}
