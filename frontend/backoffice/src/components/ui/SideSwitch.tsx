"use client";

/**
 * Two-option switch in the grey pill look of SegmentedTabs — but it changes what one page
 * shows instead of going to another page. Used for the queues' Open · Completed (KB
 * work-queue.md §4d), placed first in the filters row.
 */
export function SideSwitch<V extends string>({ options, value, onChange, label }: { options: { value: V; label: string }[]; value: V; onChange: (v: V) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex h-control-sm shrink-0 items-stretch rounded-control bg-control p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => !active && onChange(o.value)}
            className={`flex items-center rounded-control px-3 type-body-strong whitespace-nowrap focus-ring ${active ? "bg-white text-strong" : "text-muted hover:text-strong"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
