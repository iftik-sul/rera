"use client";

import { useEffect, useRef, useState } from "react";

/** Search box (Figma "Search Bar"). Typing filters the table it sits above. */
export function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex h-8 w-[180px] items-center gap-2 rounded-lg border border-n40 bg-white px-3 py-2">
      <img src="/icons/search.svg" alt="" className="size-4 shrink-0" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        className="min-w-0 flex-1 bg-transparent text-[13px] leading-5 font-medium text-n900 outline-none placeholder:text-n400"
      />
    </label>
  );
}

export type FilterOption = { value: string; count: number };

/**
 * Filter dropdown (Figma "Filter Dropdown" — Figma draws only the closed button;
 * the open list and the "active" look are built here to match the app's style).
 *
 *  - Closed, nothing chosen: "Status ▾" (as in Figma).
 *  - Click: a list opens — "All" first, then each value with how many rows have it.
 *  - One choice at a time. Choosing one shows "Status: Returned" with a blue
 *    outline and a × to clear it.
 *  - Closes on choosing, clicking elsewhere, or Esc.
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
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const choose = (v: string | null) => {
    onChange(v);
    setOpen(false);
  };
  const active = value !== null;

  return (
    <div ref={box} className="relative shrink-0">
      <div
        className={`flex h-8 items-center rounded-lg border bg-white font-medium whitespace-nowrap ${
          active ? "border-blue-600 text-blue-600" : "border-n40 text-n900"
        }`}
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex h-full cursor-pointer items-center gap-2 pr-2 pl-3 text-[13px] leading-5"
        >
          {active ? (
            <span>
              {label}: <span className="font-semibold">{value}</span>
            </span>
          ) : (
            label
          )}
          {!active && <span className="text-base text-n400">▾</span>}
        </button>
        {active && (
          <button type="button" aria-label={`Clear ${label} filter`} onClick={() => choose(null)} className="cursor-pointer pr-2.5 pl-0.5 text-base leading-none">
            ×
          </button>
        )}
      </div>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute top-9 left-0 z-30 max-h-72 min-w-56 overflow-y-auto rounded-lg border border-n40 bg-white py-1 shadow-lg"
        >
          <Item selected={!active} onClick={() => choose(null)} text="All" />
          {options.map((o) => (
            <Item key={o.value} selected={value === o.value} onClick={() => choose(o.value)} text={o.value} count={o.count} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Item({ text, count, selected, onClick }: { text: string; count?: number; selected: boolean; onClick: () => void }) {
  return (
    <li role="option" aria-selected={selected}>
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-[13px] leading-5 hover:bg-n20 ${
          selected ? "font-medium text-blue-600" : "text-n900"
        }`}
      >
        <span className="w-3 shrink-0">{selected ? "✓" : ""}</span>
        <span className="flex-1 whitespace-nowrap">{text}</span>
        {count !== undefined && <span className="text-n400">{count}</span>}
      </button>
    </li>
  );
}
