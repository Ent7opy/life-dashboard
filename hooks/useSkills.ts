import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { getProgress, updateProgress } from "@/lib/api";

/**
 * Provides skills state and a mutation that writes optimistically to the
 * store, then syncs to the API fire-and-forget.
 *
 * API hydration runs once on mount: remote values overwrite persisted ones
 * so the Railway DB is always the source of truth when available.
 */
export function useSkills() {
  const skills = useDashboardStore((s) => s.skills);
  const setSkillValue = useDashboardStore((s) => s.setSkillValue);

  useEffect(() => {
    getProgress().then((remote) => {
      if (!remote) return;
      Object.entries(remote).forEach(([id, value]) => setSkillValue(id, value));
    });
    // Intentionally empty deps: run once on mount to hydrate from API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSkill = (id: string, value: number) => {
    setSkillValue(id, value);        // optimistic — instant UI update
    updateProgress(id, value);       // fire-and-forget API sync
  };

  return { skills, updateSkill };
}
