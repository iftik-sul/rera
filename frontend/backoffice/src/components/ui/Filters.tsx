"use client";

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
