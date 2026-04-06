"use client";

import { useState, useEffect } from "react";
import { BookOpen, Check } from "lucide-react";
import { books } from "@/data/books";
import { getReading, upsertReading } from "@/lib/api";

const borderColor: Record<string, string> = {
  reading: "#c07d2e",
  done:    "#3d6b4f",
  unread:  "#e8dfc9",
};

export default function BookList() {
  const [readState, setReadState] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    async function load() {
      const remote = await getReading();
      if (remote !== null) {
        const state: Record<string, boolean> = {};
        for (const entry of remote) {
          state[entry.book_id] = entry.status === "completed";
        }
        setReadState(state);
        localStorage.setItem("book-read-state", JSON.stringify(state));
        return;
      }
      const saved = localStorage.getItem("book-read-state");
      if (saved) {
        try { setReadState(JSON.parse(saved)); } catch { /* ignore */ }
      }
    }
    load();
  }, []);

  const toggleRead = (id: string) => {
    setReadState((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem("book-read-state", JSON.stringify(next));
      upsertReading(id, next[id] ? "completed" : "unread");
      return next;
    });
  };

  const categories = ["All", ...Array.from(new Set(books.map((b) => b.category)))];
  const filtered =
    selectedCategory === "All" ? books : books.filter((b) => b.category === selectedCategory);

  const totalBooks = books.length;
  const readCount = Object.values(readState).filter(Boolean).length;
  const pct = totalBooks > 0 ? Math.round((readCount / totalBooks) * 100) : 0;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="text-forest flex-shrink-0" size={20} strokeWidth={1.8} />
        <h3 className="text-[22px] font-semibold text-ink font-display">Reading</h3>
      </div>

      {/* Progress bar + filter row */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1.5">
            {/* Slim organic progress bar */}
            <div className="flex-1 h-1 rounded-full bg-bark-subtle overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-sol transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-data text-[12px] text-ink-3 flex-shrink-0">
              {readCount} of {totalBooks}
            </span>
            <span className="font-data text-[11px] text-amber-sol flex-shrink-0">●</span>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full font-data text-[11px] border transition-colors duration-150 ${
                selectedCategory === cat
                  ? "bg-forest border-forest text-surface"
                  : "border-bark text-ink-2 hover:border-forest hover:text-forest"
              }`}
            >
              {cat === "All" ? "All" : cat.split("&")[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Book rows */}
      <div className="space-y-0.5">
        {filtered.map((book) => {
          const isRead = readState[book.id] ?? false;
          const status = isRead ? "done" : "unread";

          return (
            <div
              key={book.id}
              className="group flex items-center justify-between px-3 py-3.5 rounded-sm transition-colors duration-150 hover:bg-surface-2"
              style={{ borderLeft: `3px solid ${borderColor[status]}` }}
            >
              <div className="pl-3 min-w-0">
                <div
                  className={`text-[15px] font-medium leading-snug font-reading truncate ${
                    isRead ? "text-ink-3 line-through" : "text-ink"
                  }`}
                >
                  {book.title}
                </div>
                <div className="font-data text-[11px] text-ink-3 mt-0.5 truncate">
                  {book.author}
                  {book.year ? ` · ${book.year}` : ""}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 pl-4">
                <span className="font-data text-[10px] border border-bark-subtle px-2 py-0.5 rounded-full text-ink-3 hidden sm:block">
                  {book.category.split("&")[0].trim().split(" ")[0]}
                </span>
                <button
                  onClick={() => toggleRead(book.id)}
                  aria-label={isRead ? "Mark as unread" : "Mark as read"}
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-150 ${
                    isRead
                      ? "bg-forest border-forest"
                      : "border-bark group-hover:border-forest"
                  }`}
                >
                  {isRead && <Check size={10} color="#fefcf5" strokeWidth={3} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 font-data text-[11px] text-ink-3 italic">
        Curated for environment, energy & systems thinking.
        Progress syncs to API when configured.
      </p>
    </div>
  );
}
