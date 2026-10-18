import { Icon } from "@/components/shell/Icon";

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

/** Page x of y with numbered buttons (Figma "Pagination"). Static for now. */
export function Pagination({ page = 1, pages }: { page?: number; pages: number }) {
  return (
    <div className="flex items-center justify-between py-4 pr-[15px]">
      <p className="px-[15px] text-xs leading-[18px] text-n400">
        Page {page} of {pages}
      </p>
      <div className="flex items-center gap-1">
        <span className="flex size-8 items-center justify-center rounded-lg bg-n20 text-n400">
          <Icon name="chevron-left" size={14} />
        </span>
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`flex size-8 items-center justify-center rounded-lg text-[13px] font-medium ${
              n === page ? "bg-blue-600 text-white" : "bg-white text-n400"
            }`}
          >
            {n}
          </span>
        ))}
        <span className="flex size-8 items-center justify-center rounded-lg bg-n20 text-n400">
          <Icon name="chevron-right" size={14} />
        </span>
      </div>
    </div>
  );
}
