"use client";

import { useState } from "react";
import { Icon } from "@/components/shell/Icon";
import { dayOf, toTime } from "@/lib/dates";

/** One line of an item's history: when, who (and as which role), what happened, and any reason. */
export type ActivityItem = { at: string; who: string; role?: string; what: string; note?: string };

const time = toTime;

/**
 * Newest first. The same person doing the same thing on the same day is one line, however many
 * sources record it — the entry that carries a time of day wins (it sorts first).
 */
export function sortActivity(items: ActivityItem[]): ActivityItem[] {
  const seen = new Set<string>();
  return [...items]
    .sort((a, b) => time(b.at) - time(a.at))
    .filter((i) => {
      const k = `${i.who}|${dayOf(i.at)}|${i.what.replace(/^Stage \d — /, "").toLowerCase()}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

/**
 * Activity / Audit trail (KB application-review.md layout, signoff-detail.md §6): the item's
 * history at the foot of the page, newest first. Collapsed by default so the decision panel
 * stays the last thing the officer acts on; the header says how many entries it holds.
 */
export function Activity({ items }: { items: ActivityItem[] }) {
  const [open, setOpen] = useState(false);
  const list = sortActivity(items);
  return (
    <section className="flex flex-col rounded-card border border-card bg-white px-6 py-5">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex items-center gap-2 text-left">
        <Icon name="chevron-right" size={16} className={`text-muted transition-transform ${open ? "rotate-90" : ""}`} />
        <h2 className="type-section-title text-strong">Activity</h2>
        <span className="type-caption text-muted">
          {list.length} {list.length === 1 ? "entry" : "entries"} · newest first
        </span>
      </button>
      {open && (
        <ol className="mt-4 flex flex-col">
          {list.map((i, n) => (
            <li key={`${i.at}-${n}`} className="flex gap-6 border-t border-card py-3 type-body first:border-t-0">
              <span className="w-40 shrink-0 text-muted">{i.at}</span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-strong">
                  <span className="type-body-strong">{i.what}</span> — {i.who}
                  {i.role ? <span className="text-muted"> · {i.role}</span> : null}
                </span>
                {i.note && i.note !== "—" && <span className="type-caption text-muted">{i.note}</span>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
