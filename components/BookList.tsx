"use client";

import { useState, useEffect } from "react";
import { books } from "@/data/books";
import { getReading, upsertReading } from "@/lib/api";

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
        try {
          setReadState(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved book state", e);
        }
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

  const filteredBooks =
    selectedCategory === "All"
      ? books
      : books.filter((b) => b.category === selectedCategory);

  const totalBooks = books.length;
  const readBooks = Object.values(readState).filter(Boolean).length;
  const percentage = totalBooks > 0 ? Math.round((readBooks / totalBooks) * 100) : 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          📚 Reading List
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Curated books for environment & energy studies. Mark as read as you progress.
        </p>
      </div>

      {/* Progress & Filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Reading progress
          </div>
          <div className="mt-1 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {readBooks}/{totalBooks} ({percentage}%)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="category" className="text-sm text-zinc-700 dark:text-zinc-300">
            Filter by:
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Books grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBooks.map((book) => {
          const isRead = readState[book.id] || false;
          return (
            <div
              key={book.id}
              className={`rounded-lg border p-4 transition-all ${
                isRead
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-900/30"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {book.author} {book.year && `· ${book.year}`}
                  </p>
                  <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                    {book.description}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {book.category}
                  </span>
                </div>
                <button
                  onClick={() => toggleRead(book.id)}
                  className={`ml-2 flex h-8 w-8 items-center justify-center rounded-full ${
                    isRead
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  }`}
                  aria-label={isRead ? "Mark as unread" : "Mark as read"}
                >
                  {isRead ? "✓" : "+"}
                </button>
              </div>
              <div className="mt-4 flex justify-between text-xs text-zinc-500 dark:text-zinc-500">
                <span>{book.category}</span>
                <span>{isRead ? "Read" : "Unread"}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        <p>
          Progress is saved in your browser. Add your own books by editing{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">
            data/books.ts
          </code>
          .
        </p>
      </div>
    </div>
  );
}