"use client";

import { useState } from "react";
import { tasks } from "@/data/roadmap";

export default function TaskList() {
  const [taskState, setTaskState] = useState(
    tasks.reduce((acc, task) => ({ ...acc, [task.id]: task.completed }), {} as Record<string, boolean>)
  );

  const toggleTask = (id: string) => {
    setTaskState((prev) => ({ ...prev, [id]: !prev[id] }));
    // In a real app, persist to localStorage or backend
  };

  const completedCount = Object.values(taskState).filter(Boolean).length;
  const totalCount = tasks.length;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          ✅ Tasks
        </h2>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
          {completedCount}/{totalCount}
        </span>
      </div>
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-start">
            <input
              type="checkbox"
              id={task.id}
              checked={taskState[task.id]}
              onChange={() => toggleTask(task.id)}
              className="mt-1 h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
            />
            <label
              htmlFor={task.id}
              className={`ml-3 ${taskState[task.id] ? "line-through text-zinc-500" : "text-zinc-800 dark:text-zinc-200"}`}
            >
              {task.label}
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        Check off tasks as you complete them. Progress is saved in your browser.
      </div>
    </div>
  );
}