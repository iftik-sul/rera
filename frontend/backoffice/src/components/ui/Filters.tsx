"use client";

import { useState } from "react";
import { Button } from "./Button";
import { TextInput } from "./Form";
import { PopoverItem, PopoverList, usePopover } from "./Popover";

/** Search box (Figma "Search Bar"). 32px toolbar height. Typing filters the table it sits above. */
export function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <TextInput
      size="sm"
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search..."
      aria-label="Search"
      className="w-search"
      leading={<img src="/icons/search.svg" alt="" className="size-4 shrink-0" />}
    />
  );
}

export type FilterOption = { value: string; count: number };

/**
 * Filter dropdown (design standard D3). 32px toolbar height.
 *  - Closed, nothing chosen: "Status ▾".
 *  - Open: "All" first, then each value with how many rows choosing it would show.
 *  - One choice at a time. Chosen: "Status: Returned", blue outline, × to clear.
 */
export function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const p = usePopover();
  const choose = (v: string | null) => {
    onChange(v);
    p.close();
  };
  const active = value !== null;

  return (
    <div ref={p.ref} className="relative shrink-0">
      <div
        className={`flex h-control-sm items-center rounded-control border bg-white whitespace-nowrap ${
          active ? "border-action text-link" : "border-control text-strong"
        }`}
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={p.open}
          onClick={p.toggle}
          className="flex h-full cursor-pointer items-center gap-2 rounded-control pr-2 pl-3 type-body-strong focus-ring"
        >
          {active ? (
            <span>
              {label}: <span className="type-group-title">{value}</span>
            </span>
          ) : (
            label
          )}
          {!active && <span className="text-muted">▾</span>}
        </button>
        {active && (
          <button type="button" aria-label={`Clear ${label} filter`} onClick={() => choose(null)} className="cursor-pointer rounded-control pr-2.5 pl-0.5 type-section-title focus-ring">
            ×
          </button>
        )}
      </div>

      {p.open && (
        <PopoverList label={label}>
          <PopoverItem selected={!active} onClick={() => choose(null)}>
            All
          </PopoverItem>
          {options.map((o) => (
            <PopoverItem key={o.value} selected={value === o.value} onClick={() => choose(o.value)} trailing={o.count}>
              {o.value}
            </PopoverItem>
          ))}
        </PopoverList>
      )}
    </div>
  );
}

/** "2026-09-01..2026-09-30" ⇄ from/to. Either end may be empty ("..2026-09-30" = up to that day). */
export const RANGE_SEP = "..";
export const isRange = (v: string | null) => !!v && v.includes(RANGE_SEP);
export function parseRange(v: string): { from: string; to: string } {
  const [from = "", to = ""] = v.split(RANGE_SEP);
  return { from, to };
}
/** "2026-09-01" (what a date box holds) → "01/09/2026" (how the platform writes it). */
const nice = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
/** How a chosen range reads on the button: "01/09/2026 – 30/09/2026", "From 01/09/2026", "Up to 30/09/2026". */
export function rangeLabel(v: string) {
  const { from, to } = parseRange(v);
  return from && to ? `${nice(from)} – ${nice(to)}` : from ? `From ${nice(from)}` : `Up to ${nice(to)}`;
}

/**
 * Date filter with quick periods and a custom From – To range (KB work-queue.md §4d).
 * Looks like FilterDropdown when closed; open, it lists the periods (with counts) and,
 * under them, two date boxes and Apply. One choice at a time — a period or a range.
 */
export function DateRangeFilter({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const p = usePopover();
  const current = value && isRange(value) ? parseRange(value) : { from: "", to: "" };
  const [from, setFrom] = useState(current.from);
  const [to, setTo] = useState(current.to);
  const choose = (v: string | null) => {
    onChange(v);
    p.close();
  };
  const active = value !== null;
  const shown = value && isRange(value) ? rangeLabel(value) : value;
  const valid = (from || to) && (!from || !to || from <= to);

  return (
    <div ref={p.ref} className="relative shrink-0">
      <div
        className={`flex h-control-sm items-center rounded-control border bg-white whitespace-nowrap ${
          active ? "border-action text-link" : "border-control text-strong"
        }`}
      >
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={p.open}
          onClick={() => {
            setFrom(current.from);
            setTo(current.to);
            p.toggle();
          }}
          className="flex h-full cursor-pointer items-center gap-2 rounded-control pr-2 pl-3 type-body-strong focus-ring"
        >
          {active ? (
            <span>
              {label}: <span className="type-group-title">{shown}</span>
            </span>
          ) : (
            label
          )}
          {!active && <span className="text-muted">▾</span>}
        </button>
        {active && (
          <button type="button" aria-label={`Clear ${label} filter`} onClick={() => choose(null)} className="cursor-pointer rounded-control pr-2.5 pl-0.5 type-section-title focus-ring">
            ×
          </button>
        )}
      </div>

      {p.open && (
        <div role="dialog" aria-label={`${label} filter`} className="absolute top-full left-0 z-30 mt-1 flex w-80 flex-col rounded-control border border-control bg-white py-1 shadow-overlay">
          <ul role="listbox" aria-label={`${label} periods`}>
            <PopoverItem selected={!active} onClick={() => choose(null)}>
              All
            </PopoverItem>
            {options.map((o) => (
              <PopoverItem key={o.value} selected={value === o.value} onClick={() => choose(o.value)} trailing={o.count}>
                {o.value}
              </PopoverItem>
            ))}
          </ul>
          <div className="flex flex-col gap-3 border-t border-control px-3 pt-3 pb-2">
            <p className="type-label text-muted">Custom range</p>
            <div className="flex gap-2">
              <label className="flex flex-1 flex-col gap-1 type-caption text-muted">
                From
                <TextInput size="sm" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} aria-label={`${label} from`} />
              </label>
              <label className="flex flex-1 flex-col gap-1 type-caption text-muted">
                To
                <TextInput size="sm" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} aria-label={`${label} to`} />
              </label>
            </div>
            <div className="flex justify-end">
              <Button size="sm" variant="primary" disabled={!valid} onClick={() => choose(`${from}${RANGE_SEP}${to}`)}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
