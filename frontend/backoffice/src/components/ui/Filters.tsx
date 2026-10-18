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

/**
 * Filter dropdown (Figma "Filter Dropdown"). Shown as designed; the open
 * state isn't drawn in Figma yet, so it doesn't open.
 */
export function FilterDropdown({ label }: { label: string }) {
  return (
    <span className="flex h-8 shrink-0 items-center gap-2 rounded-lg border border-n40 bg-white px-3 py-2 font-medium whitespace-nowrap">
      <span className="text-[13px] leading-5 text-n900">{label}</span>
      <span className="text-base text-n400">▾</span>
    </span>
  );
}
