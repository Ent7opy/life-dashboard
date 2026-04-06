import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { getReading, upsertReading } from "@/lib/api";
import { books } from "@/data/books";

/**
 * Provides book read-state and a toggle that writes optimistically to the
 * store and syncs to the API.
 *
 * `booksRead` and `total` are derived here so consumers never compute them.
 */
export function useBooks() {
  const readState = useDashboardStore((s) => s.readState);
  const toggleBook = useDashboardStore((s) => s.toggleBook);
  const setReadState = useDashboardStore((s) => s.setReadState);

  useEffect(() => {
    getReading().then((remote) => {
      if (!remote) return;
      const state: Record<string, boolean> = {};
      remote.forEach((e) => {
        state[e.book_id] = e.status === "completed";
      });
      setReadState(state);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id: string) => {
    const wasRead = readState[id] ?? false;
    toggleBook(id);                                      // optimistic
    upsertReading(id, wasRead ? "unread" : "completed"); // fire-and-forget
  };

  const booksRead = Object.values(readState).filter(Boolean).length;

  return { readState, toggle, booksRead, total: books.length };
}
