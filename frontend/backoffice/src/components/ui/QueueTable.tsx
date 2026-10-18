"use client";

import Link from "next/link";
import { useState } from "react";
import { FilterDropdown, Pagination, SearchBox } from "./Filters";

/**
 * Work-queue style table (Figma "Applications table" / "Work queue table"):
 * title, search + filter row, header row, 48px rows, pagination.
 * Columns say their header, width and how to draw the cell.
 */
export type QueueColumn<T> = {
  header: string;
  width: number;
  cell: (row: T) => React.ReactNode;
  /** Text tone for plain-text cells: link (blue reference), strong (dark), muted (grey). */
  tone?: "link" | "strong" | "muted";
};

/** What clicking a row does: open a page, open a pop-up, or nothing (not designed yet). */
export type RowAction = { href: string } | { onClick: () => void } | null;

const tone = {
  link: "font-semibold text-blue-600",
  strong: "text-n900",
  muted: "text-n400",
};

export function QueueTable<T>({
  title,
  filters,
  columns,
  rows,
  rowKey,
  rowAction,
  searchText,
  pages,
  uppercaseHeaders = false,
}: {
  title: string;
  filters: string[];
  columns: QueueColumn<T>[];
  rows: T[];
  rowKey: (r: T) => string;
  rowAction: (r: T) => RowAction;
  /** The words the search box matches against for each row. */
  searchText: (r: T) => string;
  pages: number;
  uppercaseHeaders?: boolean;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = q ? rows.filter((r) => searchText(r).toLowerCase().includes(q)) : rows;

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-xl border border-n40 bg-white">
      <div className="flex flex-col gap-4 px-5 pt-5 pb-4">
        <h2 className="text-[13px] font-semibold text-n900">{title}</h2>
        <div className="flex items-center gap-3">
          <SearchBox value={query} onChange={setQuery} />
          {filters.map((f) => (
            <FilterDropdown key={f} label={f} />
          ))}
        </div>
      </div>

      <div className={`flex items-center gap-3 border-b border-n40 px-5 py-3 font-medium text-n400 ${uppercaseHeaders ? "text-[13px]" : "text-xs"}`}>
        {columns.map((c) => (
          <span key={c.header} className="shrink-0 truncate" style={{ width: c.width }}>
            {c.header}
          </span>
        ))}
      </div>

      {visible.map((r) => {
        const cells = columns.map((c) => (
          <span key={c.header} className={`shrink-0 truncate text-[13px] ${tone[c.tone ?? "strong"]}`} style={{ width: c.width }}>
            {c.cell(r)}
          </span>
        ));
        const cls = "flex h-12 w-full items-center gap-3 border-b border-n40 px-5 text-left";
        const action = rowAction(r);
        if (action && "href" in action)
          return (
            <Link key={rowKey(r)} href={action.href} className={`${cls} hover:bg-n20`}>
              {cells}
            </Link>
          );
        if (action && "onClick" in action)
          return (
            <button key={rowKey(r)} type="button" onClick={action.onClick} className={`${cls} cursor-pointer hover:bg-n20`}>
              {cells}
            </button>
          );
        return (
          <div key={rowKey(r)} className={cls}>
            {cells}
          </div>
        );
      })}

      {visible.length === 0 && <p className="border-b border-n40 px-5 py-6 text-center text-[13px] text-n400">No applications match “{query}”.</p>}

      <Pagination pages={pages} />
    </section>
  );
}
