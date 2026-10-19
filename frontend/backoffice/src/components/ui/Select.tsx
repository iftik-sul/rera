"use client";

import { PopoverItem, PopoverList, usePopover } from "./Popover";

/**
 * Select (design standard D0.5): a 40px box showing the chosen option, opening a
 * list. Used for choices that aren't table filters — e.g. the report period.
 */
export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  /** Read by screen readers, e.g. "Period" */
  label: string;
  value: T;
  options: { value: T; label: string; trailing?: React.ReactNode }[];
  onChange: (v: T) => void;
}) {
  const p = usePopover();
  const current = options.find((o) => o.value === value);
  return (
    <div ref={p.ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={p.open}
        aria-label={`${label}: ${current?.label ?? ""}`}
        onClick={p.toggle}
        className="flex h-control-lg cursor-pointer items-center gap-3 rounded-control border border-control bg-white px-4 type-body-strong text-strong focus-ring"
      >
        {current?.label}
        <span className="text-muted">▾</span>
      </button>
      {p.open && (
        <PopoverList label={label}>
          {options.map((o) => (
            <PopoverItem
              key={o.value}
              selected={o.value === value}
              trailing={o.trailing}
              onClick={() => {
                onChange(o.value);
                p.close();
              }}
            >
              {o.label}
            </PopoverItem>
          ))}
        </PopoverList>
      )}
    </div>
  );
}
