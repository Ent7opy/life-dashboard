"use client";

import { useState, useEffect } from "react";
import { getWeeklyReview, saveWeeklyReview } from "@/lib/api";

type ReviewEntry = {
  date: string; // YYYY-MM-DD
  hours: number;
  reflection: string;
  goals: string[];
};

export default function WeeklyReview() {
  const [hours, setHours] = useState(0);
  const [reflection, setReflection] = useState("");
  const [goal, setGoal] = useState("");
  const [goals, setGoals] = useState<string[]>([
    "Complete one math chapter",
    "30 minutes of German",
  ]);
  const [entries, setEntries] = useState<ReviewEntry[]>([]);
  const [streak, setStreak] = useState(0);

  // Load saved data: API first, then localStorage
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
        const savedEntries = localStorage.getItem("weekly-review-entries");
        if (savedEntries) {
          try {
            setEntries(JSON.parse(savedEntries));
          } catch (e) {
            console.error("Failed to parse saved entries", e);
          }
        }
      }
      const savedGoals = localStorage.getItem("weekly-review-goals");
      if (savedGoals) {
        try {
          setGoals(JSON.parse(savedGoals));
        } catch (e) {
          console.error("Failed to parse saved goals", e);
        }
      }
    }
    load();
  }, []);

  // Calculate streak (consecutive days with at least 0.5h study)
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    let currentStreak = 0;
    let expectedDate = today;

    for (const entry of sortedEntries) {
      if (entry.date !== expectedDate) break;
      if (entry.hours >= 0.5) {
        currentStreak++;
        // Move to previous day
        const prev = new Date(expectedDate);
        prev.setDate(prev.getDate() - 1);
        expectedDate = prev.toISOString().split("T")[0];
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  }, [entries]);

  const saveEntries = (newEntries: ReviewEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem("weekly-review-entries", JSON.stringify(newEntries));
  };

  const saveGoals = (newGoals: string[]) => {
    setGoals(newGoals);
    localStorage.setItem("weekly-review-goals", JSON.stringify(newGoals));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];
    const newEntry: ReviewEntry = {
      date: today,
      hours,
      reflection,
      goals: [...goals],
    };
    const updatedEntries = [...entries.filter((e) => e.date !== today), newEntry];
    saveEntries(updatedEntries);
    saveWeeklyReview(today, hours, reflection, [...goals]);
    setHours(0);
    setReflection("");
    alert("Review saved for today!");
  };

  const addGoal = () => {
    if (goal.trim()) {
      const updated = [...goals, goal.trim()];
      saveGoals(updated);
      setGoal("");
    }
  };

  const removeGoal = (index: number) => {
    const updated = goals.filter((_, i) => i !== index);
    saveGoals(updated);
  };

  const todayEntry = entries.find((e) => e.date === new Date().toISOString().split("T")[0]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        📅 Weekly Review
      </h2>

      {/* Streak & Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
          <div className="text-sm text-blue-800 dark:text-blue-300">Current Streak</div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-200">
            {streak} day{streak !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/30">
          <div className="text-sm text-emerald-800 dark:text-emerald-300">
            Hours This Week
          </div>
          <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-200">
            {entries.reduce((sum, e) => sum + e.hours, 0)}
          </div>
        </div>
        <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/30">
          <div className="text-sm text-amber-800 dark:text-amber-300">
            Goals Completed
          </div>
          <div className="text-3xl font-bold text-amber-900 dark:text-amber-200">
            {goals.filter((g) => g.startsWith("[x]")).length}/{goals.length}
          </div>
        </div>
        <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/30">
          <div className="text-sm text-purple-800 dark:text-purple-300">
            Last Entry
          </div>
          <div className="text-xl font-medium text-purple-900 dark:text-purple-200">
            {todayEntry ? "Today" : "None"}
          </div>
        </div>
      </div>

      {/* Today's Log */}
      <form onSubmit={handleSubmit} className="mb-8">
        <h3 className="mb-4 text-xl font-semibold text-zinc-800 dark:text-zinc-200">
          Log Today&apos;s Progress
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Study Hours
            </label>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-700"
            />
            <div className="mt-2 flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
              <span>0h</span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {hours}h
              </span>
              <span>12h</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Reflection (optional)
            </label>
            <textarea
              rows={3}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-300 bg-white p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="What went well? What could be improved?"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Save Today&apos;s Review
        </button>
      </form>

      {/* Goals */}
      <div className="mb-8">
        <h3 className="mb-4 text-xl font-semibold text-zinc-800 dark:text-zinc-200">
          Weekly Goals
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGoal())}
            placeholder="Add a goal for this week"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            onClick={addGoal}
            className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
          >
            Add
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {goals.map((g, idx) => (
            <li key={idx} className="flex items-center justify-between rounded-lg bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
              <span className="text-zinc-800 dark:text-zinc-200">{g}</span>
              <button
                onClick={() => removeGoal(idx)}
                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Entries */}
      <div>
        <h3 className="mb-4 text-xl font-semibold text-zinc-800 dark:text-zinc-200">
          Recent Entries
        </h3>
        {entries.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">No entries yet. Log your first day!</p>
        ) : (
          <div className="space-y-3">
            {entries.slice(-5).map((entry) => (
              <div
                key={entry.date}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex justify-between">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {entry.date}
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {entry.hours}h
                  </span>
                </div>
                {entry.reflection && (
                  <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                    {entry.reflection}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}