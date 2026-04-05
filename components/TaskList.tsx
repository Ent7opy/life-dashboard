"use client";

import { useState, useEffect } from "react";
import { Task } from "@/data/roadmap";

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  // Initialize state from localStorage or default completed status
  const [taskState, setTaskState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("task-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTaskState(parsed);
      } catch (e) {
        // Fallback to default
        const defaultState = tasks.reduce(
          (acc, task) => ({ ...acc, [task.id]: task.completed }),
          {}
        );
        setTaskState(defaultState);
      }
    } else {
      const defaultState = tasks.reduce(
        (acc, task) => ({ ...acc, [task.id]: task.completed }),
        {}
      );
      setTaskState(defaultState);
    }
  }, [tasks]);

  const toggleTask = (id: string) => {
    const newState = { ...taskState, [id]: !taskState[id] };
    setTaskState(newState);
    localStorage.setItem("task-state", JSON.stringify(newState));
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
              checked={taskState[task.id] || false}
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