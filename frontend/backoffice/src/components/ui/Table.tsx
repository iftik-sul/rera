"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { FilterDropdown, SearchBox } from "./Filters";
import { Pagination, PAGE_SIZE, pageCount, type Noun } from "./Pagination";

/**
 * THE table for the whole back office — every table uses this, so they all
 * look and behave the same. Rules from the KB design standard (§A5a.0):
 *  - Header row: 13px Medium grey, 12px top/bottom, 20px sides, grey bottom line.
 *  - Data rows: exactly 48px tall, 20px sides, grey bottom line, centred vertically.
 *  - 12px between columns.
 *  - Column widths are PERCENTAGES of the row, so the table always fills its
 *    card edge to edge, at any screen width.
 *  - First column is the reference: blue Semi Bold when the row opens something.
 */

export type Column<T> = {
  header: string;
  /** Share of the row width, in percent. A table's columns should add up to 100. */
  width: number;
  cell: (row: T) => React.ReactNode;
  /** Plain-text colour: link = blue Semi Bold, strong = dark (default), muted = grey. */
  tone?: "link" | "strong" | "muted";
  align?: "left" | "right";
};

/** What clicking a row does: open a page, open a pop-up, or nothing. */
export type RowAction = { href: string; onClick?: () => void } | { onClick: () => void } | null;

const toneClass = {
  link: "type-group-title text-link",
  strong: "text-strong",
  muted: "text-muted",
};

export function Table<T>({
  columns,
  rows,
  rowKey,
  rowAction = () => null,
  empty = "Nothing to show.",
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (r: T) => string;
  rowAction?: (r: T) => RowAction;
  empty?: React.ReactNode;
}) {
  // minmax(0, Nfr): columns share the width in proportion and may shrink below their content.
  const grid = { gridTemplateColumns: columns.map((c) => `minmax(0, ${c.width}fr)`).join(" ") };
  const align = (c: Column<T>) => (c.align === "right" ? "text-right justify-self-end" : "");

  return (
    <div role="table" className="w-full">
      <div role="row" className="grid items-center gap-3 border-b border-control px-5 py-3 type-column-header text-muted" style={grid}>
        {columns.map((c) => (
          <span role="columnheader" key={c.header} className={`truncate ${align(c)}`}>
            {c.header}
          </span>
        ))}
      </div>

      {rows.map((r) => {
        const cells = columns.map((c) => (
          <span role="cell" key={c.header} className={`min-w-0 truncate type-body ${toneClass[c.tone ?? "strong"]} ${align(c)}`}>
            {c.cell(r)}
          </span>
        ));
        const cls = "grid h-row w-full items-center gap-3 border-b border-control px-5 text-left";
        const action = rowAction(r);
        if (action && "href" in action)
          return (
            <Link role="row" key={rowKey(r)} href={action.href} onClick={action.onClick} className={`${cls} hover:bg-page focus-ring`} style={grid}>
              {cells}
            </Link>
          );
        if (action && "onClick" in action)
          return (
            <button role="row" key={rowKey(r)} type="button" onClick={action.onClick} className={`${cls} cursor-pointer hover:bg-page focus-ring`} style={grid}>
              {cells}
            </button>
          );
        return (
          <div role="row" key={rowKey(r)} className={cls} style={grid}>
            {cells}
          </div>
        );
      })}

      {rows.length === 0 && <p className="border-b border-control px-5 py-6 text-center type-body text-muted">{empty}</p>}
    </div>
  );
}

/** One filter dropdown on a table (see Filters.tsx for how it looks and behaves). */
export type FilterDef<T> = {
  label: string;
  /** Name used in the web address, e.g. "status" → ?status=Returned */
  key: string;
  /** The value a row has for this filter. */
  value: (r: T) => string;
  /** Option order. Leave out to list values alphabetically. */
  order?: string[];
  /**
   * A value whose rows stay hidden until this filter selects it. The DG's
   * Status filter uses "Decided": decided items only appear on purpose
   * (Work Queue spec §4c — "a Decided filter value, off by default").
   */
  hiddenUnlessSelected?: string;
};

/**
 * White card holding a table (design standard Types A/B/C/E): title row,
 * optional title link (e.g. "See All"), optional search + working filters, the
 * table edge to edge, and pagination when it is the screen's main table
 * (rules in Pagination.tsx).
 *
 * Filters, search and page all combine. Filters and page are kept in the web
 * address, so Back from an opened row restores exactly what was on screen.
 */
export function TableCard<T>({
  title,
  titleSize = "sm",
  action,
  filters,
  searchText,
  paginate,
  note,
  onMatchedChange,
  ...table
}: {
  title: string;
  /** "sm" = 13px Semi Bold (queues), "md" = 16px Medium (cards inside a page, e.g. Dashboard). */
  titleSize?: "sm" | "md";
  action?: React.ReactNode;
  /** Filter dropdowns. Giving filters also shows the search box. */
  filters?: FilterDef<T>[];
  /** The words the search box matches for each row. */
  searchText?: (r: T) => string;
  /**
   * Give this for a screen's main table: 10 rows per page plus the pagination bar.
   * `one` / `many` name the rows in the count, e.g. "1 application" / "8 applications".
   * Leave it out for an embedded table (it shows every row and has no pagination).
   */
  paginate?: Noun;
  /** Small grey note under the table (e.g. a report's totals line). */
  note?: React.ReactNode;
  /** Told the rows that pass the search and filters (every page) — e.g. so Export knows what it covers. */
  onMatchedChange?: (rows: T[]) => void;
} & Parameters<typeof Table<T>>[0]) {
  const defs = filters ?? [];
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [chosen, setChosen] = useState<Record<string, string | null>>({});
  const q = query.trim().toLowerCase();

  // Does a row pass the search and every filter? Rows with a "hidden unless selected"
  // value (e.g. Decided) fail unless that value is the one chosen.
  const passes = (r: T) => {
    if (q && searchText && !searchText(r).toLowerCase().includes(q)) return false;
    return defs.every((f) => {
      const v = f.value(r);
      const sel = chosen[f.key] ?? null;
      if (f.hiddenUnlessSelected && v === f.hiddenUnlessSelected && sel !== f.hiddenUnlessSelected) return false;
      return sel === null || v === sel;
    });
  };
  const matched = table.rows.filter((r) => passes(r));
  const filtered = q !== "" || Object.values(chosen).some((v) => v !== null);
  const matchedKey = matched.map((r) => table.rowKey(r)).join("|");
  useEffect(() => {
    onMatchedChange?.(matched);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the matched set changes
  }, [matchedKey]);

  // Never sit on a page that no longer exists (e.g. ?page=9 on a 3-page table).
  const current = Math.min(page, pageCount(matched.length));
  const rows = paginate ? matched.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE) : matched;

  // Read page + filters from the web address on arrival (Back lands here).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = Number(params.get("page"));
    if (paginate && Number.isInteger(fromUrl) && fromUrl > 1) setPage(fromUrl);
    const sel: Record<string, string | null> = {};
    for (const f of defs) sel[f.key] = params.get(f.key);
    setChosen(sel);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once, on arrival
  }, []);

  // Write page + filters to the web address. replaceState: changing them shouldn't add Back steps.
  const writeUrl = (p: number, sel: Record<string, string | null>) => {
    const url = new URL(window.location.href);
    if (p > 1) url.searchParams.set("page", String(p));
    else url.searchParams.delete("page");
    for (const f of defs) {
      if (sel[f.key]) url.searchParams.set(f.key, sel[f.key] as string);
      else url.searchParams.delete(f.key);
    }
    window.history.replaceState(window.history.state, "", url);
  };
  const goTo = (p: number) => {
    setPage(p);
    writeUrl(p, chosen);
  };
  const choose = (key: string, v: string | null) => {
    const sel = { ...chosen, [key]: v };
    setChosen(sel);
    setPage(1); // any change of filter starts again at page 1
    writeUrl(1, sel);
  };
  const search = (v: string) => {
    setQuery(v);
    goTo(1); // a new search always starts from the first page
  };
  const clearAll = () => {
    setQuery("");
    const none = Object.fromEntries(defs.map((f) => [f.key, null]));
    setChosen(none);
    setPage(1);
    writeUrl(1, none);
  };

  // If the address asked for a page that doesn't exist, correct the address to the page shown.
  useEffect(() => {
    if (paginate && page !== current) goTo(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the numbers change
  }, [paginate, page, current]);

  // Does a row pass search + every OTHER filter? (Ignores this filter entirely, including its
  // "hidden unless selected" rule — so each option can say how many rows choosing it would show.)
  const passesOthers = (r: T, f: FilterDef<T>) => {
    if (q && searchText && !searchText(r).toLowerCase().includes(q)) return false;
    return defs.every((g) => {
      if (g.key === f.key) return true;
      const v = g.value(r);
      const sel = chosen[g.key] ?? null;
      if (g.hiddenUnlessSelected && v === g.hiddenUnlessSelected && sel !== g.hiddenUnlessSelected) return false;
      return sel === null || v === sel;
    });
  };
  const optionsFor = (f: FilterDef<T>) => {
    const counts = new Map<string, number>();
    for (const r of table.rows) {
      if (!passesOthers(r, f)) continue;
      const v = f.value(r);
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    const values = f.order ? f.order.filter((v) => counts.has(v)) : [...counts.keys()].sort((x, y) => x.localeCompare(y));
    return values.map((v) => ({ value: v, count: counts.get(v) ?? 0 }));
  };

  const noun = paginate ?? { one: "row", many: "rows" };
  const empty = filtered ? (
    <span className="flex flex-col items-center gap-2">
      No {noun.many} match {q && defs.every((f) => !chosen[f.key]) ? `“${query}”` : "these filters"}.
      <Button variant="link" onClick={clearAll}>
        Clear filters
      </Button>
    </span>
  ) : (
    table.empty
  );

  return (
    <section className="flex w-full flex-col rounded-card border border-card bg-white">
      <div className="flex flex-col gap-4 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className={titleSize === "md" ? "type-section-title text-strong" : "type-group-title text-strong"}>{title}</h2>
          {action}
        </div>
        {filters && (
          <div className="flex flex-wrap items-center gap-3">
            <SearchBox value={query} onChange={search} />
            {defs.map((f) => (
              <FilterDropdown key={f.key} label={f.label} options={optionsFor(f)} value={chosen[f.key] ?? null} onChange={(v) => choose(f.key, v)} />
            ))}
            {filtered && (
              <Button variant="link" onClick={clearAll}>
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* The rounded clip lives here, not on the card, so open filter lists aren't cut off. */}
      <div className="overflow-hidden rounded-b-card">
        <Table {...table} rows={rows} empty={empty} />
        {paginate && (
          <Pagination page={current} total={matched.length} allTotal={table.rows.length} filtered={filtered} noun={paginate} onPage={goTo} />
        )}
        {note && <p className="px-5 py-4 type-caption text-muted">{note}</p>}
      </div>
    </section>
  );
}
