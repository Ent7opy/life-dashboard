import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultSkills, type Skill } from "@/data/greentech";

// ── Shared types ──────────────────────────────────────────────────────────────
// Kept here so hooks and components import from one place.

export type ReviewEntry = {
  date: string; // YYYY-MM-DD
  hours: number;
  reflection: string;
  goals: string[];
};

// ── Store shape ───────────────────────────────────────────────────────────────

interface DashboardState {
  // Skills ─────────────────────────────────────────────────────────────────
  skills: Skill[];
  setSkillValue: (id: string, value: number) => void;

  // Books ──────────────────────────────────────────────────────────────────
  readState: Record<string, boolean>;
  toggleBook: (id: string) => void;
  /** Replace entire readState (used when hydrating from API). */
  setReadState: (state: Record<string, boolean>) => void;

  // Weekly review ──────────────────────────────────────────────────────────
  entries: ReviewEntry[];
  goals: string[];
  upsertEntry: (entry: ReviewEntry) => void;
  /** Replace entire entries list (used when hydrating from API). */
  setEntries: (entries: ReviewEntry[]) => void;
  addGoal: (goal: string) => void;
  removeGoal: (index: number) => void;

  // Meta ───────────────────────────────────────────────────────────────────
  /** ISO date string of when the learning journey began. */
  learningStartDate: string | null;
  setLearningStartDate: (date: string) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      // Skills
      skills: defaultSkills,
      setSkillValue: (id, value) =>
        set((s) => ({
          skills: s.skills.map((skill) =>
            skill.id === id ? { ...skill, value } : skill
          ),
        })),

      // Books
      readState: {},
      toggleBook: (id) =>
        set((s) => ({
          readState: { ...s.readState, [id]: !s.readState[id] },
        })),
      setReadState: (state) => set({ readState: state }),

      // Weekly review
      entries: [],
      goals: [
        "Work through one Python dataset",
        "Read one chapter of Braiding Sweetgrass",
      ],
      upsertEntry: (entry) =>
        set((s) => ({
          entries: [
            ...s.entries.filter((e) => e.date !== entry.date),
            entry,
          ],
        })),
      setEntries: (entries) => set({ entries }),
      addGoal: (goal) => set((s) => ({ goals: [...s.goals, goal] })),
      removeGoal: (index) =>
        set((s) => ({ goals: s.goals.filter((_, i) => i !== index) })),

      // Meta
      learningStartDate: null,
      setLearningStartDate: (date) => set({ learningStartDate: date }),
    }),
    {
      name: "life-dashboard-v2",
      // v2 key so it doesn't conflict with the old localStorage keys
    }
  )
);
