"use client";

import Link from "next/link";
import { useState } from "react";
import { FilterDropdown, Pagination, SearchBox } from "./Filters";

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
export type RowAction = { href: string } | { onClick: () => void } | null;

const toneClass = {
  link: "font-semibold text-blue-600",
  strong: "text-n900",
  muted: "text-n400",
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
  empty?: string;
}) {
  // minmax(0, Nfr): columns share the width in proportion and may shrink below their content.
  const grid = { gridTemplateColumns: columns.map((c) => `minmax(0, ${c.width}fr)`).join(" ") };
  const align = (c: Column<T>) => (c.align === "right" ? "text-right justify-self-end" : "");

  return (
    <div role="table" className="w-full">
      <div role="row" className="grid items-center gap-3 border-b border-n40 px-5 py-3 text-[13px] leading-5 font-medium text-n400 uppercase" style={grid}>
        {columns.map((c) => (
          <span role="columnheader" key={c.header} className={`truncate ${align(c)}`}>
            {c.header}
          </span>
        ))}
      </div>

      {rows.map((r) => {
        const cells = columns.map((c) => (
          <span role="cell" key={c.header} className={`min-w-0 truncate text-[13px] ${toneClass[c.tone ?? "strong"]} ${align(c)}`}>
            {c.cell(r)}
          </span>
        ));
        const cls = "grid h-12 w-full items-center gap-3 border-b border-n40 px-5 text-left";
        const action = rowAction(r);
        if (action && "href" in action)
          return (
            <Link role="row" key={rowKey(r)} href={action.href} className={`${cls} hover:bg-n20`} style={grid}>
              {cells}
            </Link>
          );
        if (action && "onClick" in action)
          return (
            <button role="row" key={rowKey(r)} type="button" onClick={action.onClick} className={`${cls} cursor-pointer hover:bg-n20`} style={grid}>
              {cells}
            </button>
          );
        return (
          <div role="row" key={rowKey(r)} className={cls} style={grid}>
            {cells}
          </div>
        );
      })}

      {rows.length === 0 && <p className="border-b border-n40 px-5 py-6 text-center text-[13px] text-n400">{empty}</p>}
    </div>
  );
}

/**
 * White card holding a table (design standard Types A/B/C/E): title row,
 * optional title link (e.g. "See All"), optional search + filters, the table
 * edge to edge, optional pagination (only for a screen's main table).
 */
export function TableCard<T>({
  title,
  titleSize = "sm",
  action,
  filters,
  searchText,
  pages,
  ...table
}: {
  title: string;
  /** "sm" = 13px Semi Bold (queues), "md" = 16px Medium (cards inside a page, e.g. Dashboard). */
  titleSize?: "sm" | "md";
  action?: React.ReactNode;
  /** Filter dropdown labels. Giving filters also shows the search box. */
  filters?: string[];
  /** The words the search box matches for each row. */
  searchText?: (r: T) => string;
  /** Number of pages → shows pagination. Leave out for embedded tables. */
  pages?: number;
} & Parameters<typeof Table<T>>[0]) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const rows = q && searchText ? table.rows.filter((r) => searchText(r).toLowerCase().includes(q)) : table.rows;

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-xl border border-n30 bg-white">
      <div className="flex flex-col gap-4 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className={titleSize === "md" ? "text-base leading-6 font-medium text-n900" : "text-[13px] font-semibold text-n900"}>{title}</h2>
          {action}
        </div>
        {filters && (
          <div className="flex items-center gap-3">
            <SearchBox value={query} onChange={setQuery} />
            {filters.map((f) => (
              <FilterDropdown key={f} label={f} />
            ))}
          </div>
        )}
      </div>

      <Table {...table} rows={rows} empty={q ? `No rows match “${query}”.` : table.empty} />

      {pages !== undefined && <Pagination pages={pages} />}
    </section>
  );
}
