"use client";

import { useEffect, useState } from "react";
import { SideSwitch } from "@/components/ui/SideSwitch";
import type { FilterDef } from "@/components/ui/Table";
import { isRange, parseRange } from "@/components/ui/Filters";
import { SAMPLE_TODAY } from "@/data/sample-date";
import { completedRecord, type CompletedRecord } from "@/data/director-general/reviews";
import { isCompleted, OUTCOME_ORDER, outcomeValue } from "@/data/director-general/work-queue";
import type { Status } from "@/components/ui/Badge";
import type { AppChange, Demo } from "@/lib/demo";
import { applyRow, leftStage } from "./demoApply";

/**
 * The Work Queue's Open · Completed switch (KB work-queue.md §4d).
 * Open is the default and is today's queue; Completed is the full history of decided items,
 * most recent first. The side is kept in the web address (?view=completed) so Back from a
 * review returns to it; switching side clears the other side's search, filters and page.
 */
export type Side = "open" | "completed";

export function useQueueSide(): [Side | null, (s: Side) => void] {
  // null until the address has been read, so a table never mounts on the wrong side.
  const [side, setSide] = useState<Side | null>(null);
  useEffect(() => {
    setSide(new URLSearchParams(window.location.search).get("view") === "completed" ? "completed" : "open");
  }, []);
  const change = (s: Side) => {
    const url = new URL(window.location.href);
    url.search = s === "completed" ? "?view=completed" : "";
    window.history.replaceState(window.history.state, "", url);
    setSide(s);
  };
  return [side, change];
}

export function QueueSwitch({ side, onChange }: { side: Side; onChange: (s: Side) => void }) {
  return (
    <SideSwitch
      label="Open or completed items"
      value={side}
      onChange={onChange}
      options={[
        { value: "open", label: "Open" },
        { value: "completed", label: "Completed" },
      ]}
    />
  );
}

export type Completed<T> = T & CompletedRecord;

/**
 * Split a queue's rows, with this session's changes applied (lib/demo.ts): open work, and
 * decided items with their decision date and decider, newest first. A licensing item sent back
 * down the chain leaves the stage-3 pool and appears on neither side.
 */
export function splitQueue<T extends { status: Status; opens?: string }>(rows: T[], demo: Demo): { open: (T & { demo?: AppChange })[]; completed: Completed<T & { demo?: AppChange }>[] } {
  const all = rows.map((r) => applyRow(r, demo)).filter((r) => !leftStage(r));
  return {
    open: all.filter((r) => !isCompleted(r)),
    completed: all
      .filter(isCompleted)
      .map((r) => ({ ...r, ...(r.demo ? { decided: r.demo.on, at: Date.parse(r.demo.on), by: r.demo.by } : completedRecord(r.opens)) }))
      .sort((a, b) => b.at - a.at),
  };
}

const ME = "Adaeze Nwosu";
const DAY = 86_400_000;
const today = SAMPLE_TODAY;
const startOfMonth = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1);
const startOfYear = Date.UTC(today.getUTCFullYear(), 0, 1);
const PERIODS: Record<string, (at: number) => boolean> = {
  "This month": (at) => at >= startOfMonth - DAY / 2,
  "Last 3 months": (at) => at >= today.getTime() - 92 * DAY,
  "This year": (at) => at >= startOfYear - DAY / 2,
};

/** "Decided" date filter — This month · Last 3 months · This year (they overlap, so it uses fixed options). */
export function decidedPeriodFilter<R>(at: (r: R) => number): FilterDef<R> {
  return { label: "Decided", key: "decided", value: () => "", options: Object.keys(PERIODS), matches: (r, o) => inPeriod(at(r), o), dates: true };
}
/** A quick period, or a custom "YYYY-MM-DD..YYYY-MM-DD" range (both ends inclusive, either may be open). */
function inPeriod(at: number, o: string) {
  if (!isRange(o)) return PERIODS[o]?.(at) ?? true;
  const { from, to } = parseRange(o);
  const day = new Date(at);
  const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
  return (!from || iso >= from) && (!to || iso <= to);
}

/** The filters every Completed side shares, after its own (service / trustee, category). */
export function completedFilters<T>(): FilterDef<Completed<T>>[] {
  return [
    { label: "Outcome", key: "outcome", value: (r) => outcomeValue((r as unknown as { status: Status }).status), order: OUTCOME_ORDER },
    decidedPeriodFilter<Completed<T>>((r) => r.at),
    { label: "Decided by", key: "by", value: () => "", options: ["Me"], matches: (r) => r.by === ME },
  ];
}

export const COMPLETED_NOUN = { one: "completed item", many: "completed items" };
export const COMPLETED_EMPTY = "Nothing completed yet.";

/**
 * Apply a card's filters to the Open table: rewrite the address (keeping the side), then
 * remount the table so it reads them — the table keeps filters in the address (Table.tsx).
 */
export function useCardFilter(): [number, (filter: Record<string, string>) => void] {
  const [key, setKey] = useState(0);
  const apply = (filter: Record<string, string>) => {
    const url = new URL(window.location.href);
    url.search = "";
    for (const [k, v] of Object.entries(filter)) url.searchParams.set(k, v);
    window.history.replaceState(window.history.state, "", url);
    setKey((n) => n + 1);
  };
  return [key, apply];
}
