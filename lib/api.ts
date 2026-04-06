// Life OS API client
// Reads api-url and api-key from localStorage.
// All functions return null gracefully when API is unconfigured or unavailable.

function getConfig(): { url: string; key: string } | null {
  if (typeof window === 'undefined') return null;
  const url = localStorage.getItem('api-url')?.trim().replace(/\/$/, '');
  if (!url) return null;
  const key = localStorage.getItem('api-key')?.trim() ?? '';
  return { url, key };
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  const config = getConfig();
  if (!config) return null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config.key ? { 'x-api-key': config.key } : {}),
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

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  email: string;
  display_name: string;
  timezone: string;
  theme: string;
  settings: Record<string, unknown>;
}

export interface ApiSkill {
  id: string;
  name: string;
  category: string | null;
  value: number;
  target: number | null;
  icon: string | null;
}

export interface ApiResource {
  id: string;
  type: 'book' | 'course' | 'article' | 'video' | 'podcast' | 'paper' | 'other';
  title: string;
  author: string | null;
  status: 'backlog' | 'active' | 'completed' | 'abandoned' | 'reference';
  rating: number | null;
  progress_current: number | null;
  progress_total: number | null;
}

export interface ApiGoal {
  id: string;
  title: string;
  type: string;
  timeframe: string;
  status: string;
  target_date: string | null;
  metric_name: string | null;
  metric_target: number | null;
  metric_current: number;
}

export interface ApiProject {
  id: string;
  name: string;
  description: string | null;
  status: 'idea' | 'active' | 'paused' | 'completed' | 'abandoned';
  type: string | null;
  url: string | null;
  repo_url: string | null;
}

export interface ApiTask {
  id: string;
  label: string;
  title: string | null;
  completed: boolean;
  status: string;
  priority: number;
  due_date: string | null;
  project_id: string | null;
  phase_id: string;
}

export interface ApiHabit {
  id: string;
  name: string;
  frequency: string;
  target_count: number;
  color: string | null;
  icon: string | null;
  active: boolean;
  done?: boolean; // populated by /habits/logs/today
}

export interface ApiHabitLog {
  id: string;
  habit_id: string;
  log_date: string;
  count: number;
  note: string | null;
}

export interface ApiJournalEntry {
  id: string;
  entry_date: string;
  body: string | null;
  mood: number | null;
  energy: number | null;
  prompts: Record<string, string>;
}

export interface ApiWeeklyReview {
  id: string;
  week_start: string;
  hours_logged: number | null;
  reflection: string | null;
  wins: string[] | null;
  blockers: string[] | null;
  next_week_focus: string[] | null;
}

export interface ApiHealthLog {
  id: string;
  log_date: string;
  mood: number | null;
  energy: number | null;
  sleep_hours: number | null;
  sleep_quality: number | null;
  weight_kg: number | null;
  notes: string | null;
}

export interface ApiContact {
  id: string;
  name: string;
  relationship: string | null;
  email: string | null;
  keep_in_touch_freq: string | null;
  last_contact: string | null;
}

export interface ApiMediaItem {
  id: string;
  type: string;
  title: string;
  creator: string | null;
  status: string;
  rating: number | null;
}

export interface ApiHobby {
  id: string;
  name: string;
  category: string | null;
  status: string;
  description: string | null;
}

export interface ApiNote {
  id: string;
  title: string | null;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
  pinned: boolean;
}

export interface ApiInboxItem {
  id: string;
  content: string;
  processed: boolean;
}

export interface ApiDashboard {
  today: {
    journal: ApiJournalEntry | null;
    habits: ApiHabit[];
    health: ApiHealthLog | null;
  };
  week: {
    review: ApiWeeklyReview | null;
    tasks_due: ApiTask[];
    hours_logged: number;
  };
  snapshot: {
    active_projects: number;
    active_goals: number;
    inbox_unprocessed: number;
    contacts_due: number;
    skills_count: number;
    resources_active: number;
  };
}

// ─── LEGACY (v0) ──────────────────────────────────────────────────────────────

export interface ApiReadingEntry {
  id: string;
  book_id: string;
  status: 'unread' | 'reading' | 'completed';
}

export interface ApiWeeklyEntry {
  id: string;
  entry_date: string;
  hours: number;
  reflection: string;
  goals: string[];
}

export async function getProgress(): Promise<Record<string, number> | null> {
  return apiFetch<Record<string, number>>('/api/progress');
}
export async function updateProgress(category_id: string, value: number): Promise<void> {
  await apiFetch('/api/progress', { method: 'PUT', body: JSON.stringify({ category_id, value }) });
}
export async function getReading(): Promise<ApiReadingEntry[] | null> {
  return apiFetch<ApiReadingEntry[]>('/api/reading');
}
export async function upsertReading(book_id: string, status: 'unread' | 'reading' | 'completed'): Promise<void> {
  await apiFetch('/api/reading', { method: 'POST', body: JSON.stringify({ book_id, status }) });
}
export async function getWeeklyReview(): Promise<ApiWeeklyEntry[] | null> {
  return apiFetch<ApiWeeklyEntry[]>('/api/weekly-review');
}
export async function saveWeeklyReview(entry_date: string, hours: number, reflection: string, goals: string[]): Promise<void> {
  await apiFetch('/api/weekly-review', { method: 'POST', body: JSON.stringify({ entry_date, hours, reflection, goals }) });
}
export async function getTasks(): Promise<ApiTask[] | null> {
  return apiFetch<ApiTask[]>('/api/tasks');
}
export async function createTask(label: string, phase_id: string): Promise<ApiTask | null> {
  return apiFetch<ApiTask>('/api/tasks', { method: 'POST', body: JSON.stringify({ label, phase_id }) });
}
export async function updateTask(id: string, completed: boolean): Promise<void> {
  await apiFetch(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify({ completed }) });
}

// ─── v1: USER ─────────────────────────────────────────────────────────────────

export async function getUser(): Promise<ApiUser | null> {
  return apiFetch<ApiUser>('/api/v1/user');
}
export async function patchUser(data: Partial<Pick<ApiUser, 'display_name' | 'timezone' | 'theme' | 'settings'>>): Promise<ApiUser | null> {
  return apiFetch<ApiUser>('/api/v1/user', { method: 'PATCH', body: JSON.stringify(data) });
}

// ─── v1: DASHBOARD ────────────────────────────────────────────────────────────

export async function getDashboard(): Promise<ApiDashboard | null> {
  return apiFetch<ApiDashboard>('/api/v1/dashboard');
}

// ─── v1: SKILLS ───────────────────────────────────────────────────────────────

export async function getSkills(category?: string): Promise<ApiSkill[] | null> {
  const q = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiFetch<ApiSkill[]>(`/api/v1/skills${q}`);
}
export async function createSkill(data: { name: string; category?: string; value?: number; target?: number; icon?: string }): Promise<ApiSkill | null> {
  return apiFetch<ApiSkill>('/api/v1/skills', { method: 'POST', body: JSON.stringify(data) });
}
export async function patchSkill(id: string, data: Partial<ApiSkill>): Promise<ApiSkill | null> {
  return apiFetch<ApiSkill>(`/api/v1/skills/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export async function deleteSkill(id: string): Promise<void> {
  await apiFetch(`/api/v1/skills/${id}`, { method: 'DELETE' });
}

// ─── v1: RESOURCES ────────────────────────────────────────────────────────────

export async function getResources(params?: { type?: string; status?: string }): Promise<ApiResource[] | null> {
  const q = new URLSearchParams(params as Record<string, string> ?? {}).toString();
  return apiFetch<ApiResource[]>(`/api/v1/resources${q ? '?' + q : ''}`);
}
export async function createResource(data: Partial<ApiResource> & { type: string; title: string }): Promise<ApiResource | null> {
  return apiFetch<ApiResource>('/api/v1/resources', { method: 'POST', body: JSON.stringify(data) });
}
export async function patchResource(id: string, data: Partial<ApiResource>): Promise<ApiResource | null> {
  return apiFetch<ApiResource>(`/api/v1/resources/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export async function deleteResource(id: string): Promise<void> {
  await apiFetch(`/api/v1/resources/${id}`, { method: 'DELETE' });
}

// ─── v1: GOALS ────────────────────────────────────────────────────────────────

export async function getGoals(params?: { status?: string; timeframe?: string }): Promise<ApiGoal[] | null> {
  const q = new URLSearchParams(params as Record<string, string> ?? {}).toString();
  return apiFetch<ApiGoal[]>(`/api/v1/goals${q ? '?' + q : ''}`);
}
export async function createGoal(data: Partial<ApiGoal> & { title: string }): Promise<ApiGoal | null> {
  return apiFetch<ApiGoal>('/api/v1/goals', { method: 'POST', body: JSON.stringify(data) });
}
export async function patchGoal(id: string, data: Partial<ApiGoal>): Promise<ApiGoal | null> {
  return apiFetch<ApiGoal>(`/api/v1/goals/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export async function deleteGoal(id: string): Promise<void> {
  await apiFetch(`/api/v1/goals/${id}`, { method: 'DELETE' });
}

// ─── v1: PROJECTS ─────────────────────────────────────────────────────────────

export async function getProjects(status?: string): Promise<ApiProject[] | null> {
  const q = status ? `?status=${status}` : '';
  return apiFetch<ApiProject[]>(`/api/v1/projects${q}`);
}
export async function createProject(data: Partial<ApiProject> & { name: string }): Promise<ApiProject | null> {
  return apiFetch<ApiProject>('/api/v1/projects', { method: 'POST', body: JSON.stringify(data) });
}
export async function patchProject(id: string, data: Partial<ApiProject>): Promise<ApiProject | null> {
  return apiFetch<ApiProject>(`/api/v1/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export async function deleteProject(id: string): Promise<void> {
  await apiFetch(`/api/v1/projects/${id}`, { method: 'DELETE' });
}

// ─── v1: TASKS (v1) ───────────────────────────────────────────────────────────

export async function getTasksV1(params?: { status?: string; project_id?: string; due?: 'today' | 'week' }): Promise<ApiTask[] | null> {
  const q = new URLSearchParams(params as Record<string, string> ?? {}).toString();
  return apiFetch<ApiTask[]>(`/api/v1/tasks${q ? '?' + q : ''}`);
}
export async function createTaskV1(data: { title: string; project_id?: string; due_date?: string; priority?: number }): Promise<ApiTask | null> {
  return apiFetch<ApiTask>('/api/v1/tasks', { method: 'POST', body: JSON.stringify(data) });
}
export async function patchTaskV1(id: string, data: Partial<ApiTask>): Promise<ApiTask | null> {
  return apiFetch<ApiTask>(`/api/v1/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export async function deleteTaskV1(id: string): Promise<void> {
  await apiFetch(`/api/v1/tasks/${id}`, { method: 'DELETE' });
}

// ─── v1: HABITS ───────────────────────────────────────────────────────────────

export async function getHabits(): Promise<ApiHabit[] | null> {
  return apiFetch<ApiHabit[]>('/api/v1/habits');
}
export async function getTodayHabits(): Promise<ApiHabit[] | null> {
  return apiFetch<ApiHabit[]>('/api/v1/habits/logs/today');
}
export async function createHabit(data: { name: string; frequency?: string; icon?: string; color?: string }): Promise<ApiHabit | null> {
  return apiFetch<ApiHabit>('/api/v1/habits', { method: 'POST', body: JSON.stringify(data) });
}
export async function patchHabit(id: string, data: Partial<ApiHabit>): Promise<ApiHabit | null> {
  return apiFetch<ApiHabit>(`/api/v1/habits/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export async function logHabit(id: string, log_date: string, count = 1): Promise<ApiHabitLog | null> {
  return apiFetch<ApiHabitLog>(`/api/v1/habits/${id}/logs`, { method: 'POST', body: JSON.stringify({ log_date, count }) });
}

// ─── v1: JOURNAL ──────────────────────────────────────────────────────────────

export async function getJournalEntries(limit = 30): Promise<ApiJournalEntry[] | null> {
  return apiFetch<ApiJournalEntry[]>(`/api/v1/journal?limit=${limit}`);
}
export async function getJournalEntry(date: string): Promise<ApiJournalEntry | null> {
  return apiFetch<ApiJournalEntry>(`/api/v1/journal/${date}`);
}
export async function upsertJournalEntry(data: Partial<ApiJournalEntry> & { entry_date: string }): Promise<ApiJournalEntry | null> {
  return apiFetch<ApiJournalEntry>('/api/v1/journal', { method: 'POST', body: JSON.stringify(data) });
}

// ─── v1: WEEKLY REVIEWS ───────────────────────────────────────────────────────

export async function getWeeklyReviews(limit = 30): Promise<ApiWeeklyReview[] | null> {
  return apiFetch<ApiWeeklyReview[]>(`/api/v1/reviews/weekly?limit=${limit}`);
}
export async function upsertWeeklyReview(data: Partial<ApiWeeklyReview> & { week_start: string }): Promise<ApiWeeklyReview | null> {
  return apiFetch<ApiWeeklyReview>('/api/v1/reviews/weekly', { method: 'POST', body: JSON.stringify(data) });
}

// ─── v1: HEALTH ───────────────────────────────────────────────────────────────

export async function getHealthLogs(limit = 30): Promise<ApiHealthLog[] | null> {
  return apiFetch<ApiHealthLog[]>(`/api/v1/health?limit=${limit}`);
}
export async function getHealthLog(date: string): Promise<ApiHealthLog | null> {
  return apiFetch<ApiHealthLog>(`/api/v1/health/${date}`);
}
export async function upsertHealthLog(data: Partial<ApiHealthLog> & { log_date: string }): Promise<ApiHealthLog | null> {
  return apiFetch<ApiHealthLog>('/api/v1/health', { method: 'POST', body: JSON.stringify(data) });
}

// ─── v1: NOTES ────────────────────────────────────────────────────────────────

export async function getNotes(params?: { entity_type?: string; entity_id?: string; pinned?: boolean }): Promise<ApiNote[] | null> {
  const q = new URLSearchParams(params as Record<string, string> ?? {}).toString();
  return apiFetch<ApiNote[]>(`/api/v1/notes${q ? '?' + q : ''}`);
}
export async function createNote(data: Partial<ApiNote>): Promise<ApiNote | null> {
  return apiFetch<ApiNote>('/api/v1/notes', { method: 'POST', body: JSON.stringify(data) });
}
export async function patchNote(id: string, data: Partial<ApiNote>): Promise<ApiNote | null> {
  return apiFetch<ApiNote>(`/api/v1/notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export async function deleteNote(id: string): Promise<void> {
  await apiFetch(`/api/v1/notes/${id}`, { method: 'DELETE' });
}

// ─── v1: INBOX ────────────────────────────────────────────────────────────────

export async function getInbox(): Promise<ApiInboxItem[] | null> {
  return apiFetch<ApiInboxItem[]>('/api/v1/inbox');
}
export async function createInboxItem(content: string): Promise<ApiInboxItem | null> {
  return apiFetch<ApiInboxItem>('/api/v1/inbox', { method: 'POST', body: JSON.stringify({ content }) });
}
export async function processInboxItem(id: string, routed_to?: string, routed_id?: string): Promise<void> {
  await apiFetch(`/api/v1/inbox/${id}/process`, { method: 'POST', body: JSON.stringify({ routed_to, routed_id }) });
}
export async function deleteInboxItem(id: string): Promise<void> {
  await apiFetch(`/api/v1/inbox/${id}`, { method: 'DELETE' });
}

// ─── v1: PEOPLE ───────────────────────────────────────────────────────────────

export async function getContacts(): Promise<ApiContact[] | null> {
  return apiFetch<ApiContact[]>('/api/v1/people');
}
export async function createContact(data: Partial<ApiContact> & { name: string }): Promise<ApiContact | null> {
  return apiFetch<ApiContact>('/api/v1/people', { method: 'POST', body: JSON.stringify(data) });
}
export async function patchContact(id: string, data: Partial<ApiContact>): Promise<ApiContact | null> {
  return apiFetch<ApiContact>(`/api/v1/people/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export async function getContactsDue(): Promise<ApiContact[] | null> {
  return apiFetch<ApiContact[]>('/api/v1/people/due');
}
export async function logInteraction(contactId: string, data: { type: string; summary?: string; date?: string }): Promise<void> {
  await apiFetch(`/api/v1/people/${contactId}/interactions`, { method: 'POST', body: JSON.stringify(data) });
}

// ─── v1: MEDIA ────────────────────────────────────────────────────────────────

export async function getMedia(params?: { type?: string; status?: string }): Promise<ApiMediaItem[] | null> {
  const q = new URLSearchParams(params as Record<string, string> ?? {}).toString();
  return apiFetch<ApiMediaItem[]>(`/api/v1/media${q ? '?' + q : ''}`);
}
export async function createMediaItem(data: Partial<ApiMediaItem> & { type: string; title: string }): Promise<ApiMediaItem | null> {
  return apiFetch<ApiMediaItem>('/api/v1/media', { method: 'POST', body: JSON.stringify(data) });
}
export async function patchMediaItem(id: string, data: Partial<ApiMediaItem>): Promise<ApiMediaItem | null> {
  return apiFetch<ApiMediaItem>(`/api/v1/media/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

// ─── v1: HOBBIES ──────────────────────────────────────────────────────────────

export async function getHobbies(status?: string): Promise<ApiHobby[] | null> {
  const q = status ? `?status=${status}` : '';
  return apiFetch<ApiHobby[]>(`/api/v1/hobbies${q}`);
}
export async function createHobby(data: Partial<ApiHobby> & { name: string }): Promise<ApiHobby | null> {
  return apiFetch<ApiHobby>('/api/v1/hobbies', { method: 'POST', body: JSON.stringify(data) });
}
export async function patchHobby(id: string, data: Partial<ApiHobby>): Promise<ApiHobby | null> {
  return apiFetch<ApiHobby>(`/api/v1/hobbies/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export async function logHobbySession(hobbyId: string, data: { log_date: string; duration_min?: number; notes?: string; rating?: number }): Promise<void> {
  await apiFetch(`/api/v1/hobbies/${hobbyId}/logs`, { method: 'POST', body: JSON.stringify(data) });
}

// ─── v1: SEARCH ───────────────────────────────────────────────────────────────

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  snippet: string;
}
export async function search(q: string): Promise<SearchResult[] | null> {
  if (!q.trim()) return null;
  const result = await apiFetch<{ results: SearchResult[] }>(`/api/v1/search?q=${encodeURIComponent(q)}`);
  return result?.results ?? null;
}
