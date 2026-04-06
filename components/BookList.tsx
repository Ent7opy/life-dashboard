"use client";

import { useState } from "react";
import { BookOpen, Check } from "lucide-react";
import { useBooks } from "@/hooks/useBooks";
import { books } from "@/data/books";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const leftBorder: Record<string, string> = {
  reading: "#c07d2e",
  done:    "#3d6b4f",
  unread:  "#e8dfc9",
};

export default function BookList() {
  const { readState, toggle, booksRead, total } = useBooks();

  // UI-only: which category filter is active.
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(books.map((b) => b.category)))];
  const filtered =
    selectedCategory === "All"
      ? books
      : books.filter((b) => b.category === selectedCategory);

  const pct = total > 0 ? Math.round((booksRead / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="text-forest flex-shrink-0" size={20} strokeWidth={1.8} />
        <h3 className="text-[22px] font-semibold text-ink font-display">Reading</h3>
      </div>

      {/* Progress bar + filter */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-36 h-1 rounded-full bg-bark-subtle overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-sol transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-data text-[12px] text-ink-3">
            {booksRead} of {total}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="focus:outline-none"
            >
              <Badge variant={selectedCategory === cat ? "active" : "subtle"}>
                {cat === "All" ? "All" : cat.split("&")[0].trim().split(" ")[0]}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Book list */}
      <div className="space-y-0.5">
        {filtered.map((book) => {
          const isRead = readState[book.id] ?? false;

          return (
            <div
              key={book.id}
              className="group flex items-center justify-between px-3 py-3.5 rounded-sm transition-colors duration-150 hover:bg-surface-2 cursor-pointer"
              style={{ borderLeft: `3px solid ${leftBorder[isRead ? "done" : "unread"]}` }}
              onClick={() => toggle(book.id)}
            >
              <div className="pl-3 min-w-0">
                <p className={`text-[15px] font-medium leading-snug font-reading truncate ${isRead ? "text-ink-3 line-through" : "text-ink"}`}>
                  {book.title}
                </p>
                <p className="font-data text-[11px] text-ink-3 mt-0.5 truncate">
                  {book.author}{book.year ? ` · ${book.year}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 pl-4">
                <Badge variant="subtle" className="hidden sm:inline-flex">
                  {book.category.split("&")[0].trim().split(" ")[0]}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={isRead ? "Mark as unread" : "Mark as read"}
                  onClick={(e) => { e.stopPropagation(); toggle(book.id); }}
                  className={`h-5 w-5 rounded-full border transition-colors ${isRead ? "bg-forest border-forest" : "border-bark group-hover:border-forest"}`}
                >
                  {isRead && <Check size={10} color="#fefcf5" strokeWidth={3} />}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 font-data text-[11px] text-ink-3 italic">
        Curated for environment, energy & systems thinking. Syncs to API when configured.
      </p>
    </div>
  );
}
