"use client";

/**
 * Underline tabs (design standard D0.4) — switch views inside one screen
 * (e.g. Revenue Reports: Collections · Revenue · Tax & remittance).
 * For tabs that are separate pages, use SegmentedTabs.
 */
export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (id: T) => void }) {
  return (
    <nav role="tablist" className="flex gap-6 border-b border-control">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`-mb-px cursor-pointer border-b-2 px-0.5 pb-2.5 type-body-strong focus-ring ${
            value === t.id ? "border-action text-link" : "border-transparent text-muted hover:text-strong"
          }`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
