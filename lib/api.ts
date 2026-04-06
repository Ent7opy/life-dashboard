// API client for life-dashboard-api
// Falls back gracefully when API is not configured or unavailable.

function getConfig(): { url: string; key: string } | null {
  if (typeof window === "undefined") return null;
  const url = localStorage.getItem("api-url")?.trim().replace(/\/$/, "");
  if (!url) return null;
  const key = localStorage.getItem("api-key")?.trim() ?? "";
  return { url, key };
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T | null> {
  const config = getConfig();
  if (!config) return null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(config.key ? { "x-api-key": config.key } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(`${config.url}${path}`, { ...options, headers });
    if (!res.ok) return null;
    if (res.status === 204) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

// ── Progress ────────────────────────────────────────────────────────────────

export async function getProgress(): Promise<Record<string, number> | null> {
  return apiFetch<Record<string, number>>("/api/progress");
}

export async function updateProgress(
  category_id: string,
  value: number
): Promise<void> {
  await apiFetch("/api/progress", {
    method: "PUT",
    body: JSON.stringify({ category_id, value }),
  });
}

// ── Reading list ─────────────────────────────────────────────────────────────

export interface ApiReadingEntry {
  id: string;
  book_id: string;
  status: "unread" | "reading" | "completed";
}

export async function getReading(): Promise<ApiReadingEntry[] | null> {
  return apiFetch<ApiReadingEntry[]>("/api/reading");
}

export async function upsertReading(
  book_id: string,
  status: "unread" | "reading" | "completed"
): Promise<void> {
  await apiFetch("/api/reading", {
    method: "POST",
    body: JSON.stringify({ book_id, status }),
  });
}

// ── Weekly review ────────────────────────────────────────────────────────────

export interface ApiWeeklyEntry {
  id: string;
  entry_date: string;
  hours: number;
  reflection: string;
  goals: string[];
}

export async function getWeeklyReview(): Promise<ApiWeeklyEntry[] | null> {
  return apiFetch<ApiWeeklyEntry[]>("/api/weekly-review");
}

export async function saveWeeklyReview(
  entry_date: string,
  hours: number,
  reflection: string,
  goals: string[]
): Promise<void> {
  await apiFetch("/api/weekly-review", {
    method: "POST",
    body: JSON.stringify({ entry_date, hours, reflection, goals }),
  });
}

// ── Tasks ────────────────────────────────────────────────────────────────────

export interface ApiTask {
  id: string;
  label: string;
  completed: boolean;
  phase_id: string;
}

export async function getTasks(): Promise<ApiTask[] | null> {
  return apiFetch<ApiTask[]>("/api/tasks");
}

export async function createTask(
  label: string,
  phase_id: string
): Promise<ApiTask | null> {
  return apiFetch<ApiTask>("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ label, phase_id }),
  });
}

export async function updateTask(
  id: string,
  completed: boolean
): Promise<void> {
  await apiFetch(`/api/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify({ completed }),
  });
}
