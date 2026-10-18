import { Icon } from "@/components/shell/Icon";

/**
 * Table pagination (Figma component "Pagination"), one set of rules for every table:
 *
 *  - Only a screen's MAIN table paginates. A table embedded in another section
 *    (Dashboard widget, documents list) has no pagination — it uses "See All".
 *  - 10 rows per page.
 *  - Left label is a real count, never "Page x of y":
 *      one page        → "8 applications — all shown"
 *      several pages   → "23 applications — showing 11–20"
 *      while searching → "2 of 8 applications — filtered"
 *  - Exactly one number button per page (current page blue). From 8 pages up,
 *    the middle collapses to "…" so the bar stays short.
 *  - ‹ and › step a page; each is greyed out when there's nowhere to go.
 *  - Lined up with the table: 20px from the card edge on both sides.
 */
export const PAGE_SIZE = 10;

export type Noun = { one: string; many: string };

export function Pagination({
  page,
  total,
  allTotal,
  noun,
  onPage,
}: {
  /** Current page, starting at 1. */
  page: number;
  /** Rows after any search. */
  total: number;
  /** Rows before search — differs from `total` only while a search is active. */
  allTotal: number;
  noun: Noun;
  onPage: (p: number) => void;
}) {
  const pages = pageCount(total);
  const label = paginationLabel(page, total, allTotal, noun);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between px-5 py-4">
      <p className="text-xs leading-[18px] text-n400">{label}</p>
      <div className="flex items-center gap-1">
        <Step label="Previous page" icon="chevron-left" disabled={page <= 1} onClick={() => onPage(page - 1)} />
        {pageList(page, pages).map((p, i) =>
          p === "…" ? (
            <span key={`gap${i}`} className="flex size-8 items-center justify-center text-[13px] text-n400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              aria-current={p === page ? "page" : undefined}
              className={`flex size-8 cursor-pointer items-center justify-center rounded-lg text-[13px] font-medium ${
                p === page ? "bg-blue-600 text-white" : "bg-white text-n400 hover:bg-n20"
              }`}
            >
              {p}
            </button>
          ),
        )}
        <Step label="Next page" icon="chevron-right" disabled={page >= pages} onClick={() => onPage(page + 1)} />
      </div>
    </nav>
  );
}

function Step({ label, icon, disabled, onClick }: { label: string; icon: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-8 cursor-pointer items-center justify-center rounded-lg bg-n20 text-n400 hover:text-n900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-n400"
    >
      <Icon name={icon} size={14} />
    </button>
  );
}

export const pageCount = (total: number) => Math.max(1, Math.ceil(total / PAGE_SIZE));

/** The left-hand count text (see the rules at the top of this file). */
export function paginationLabel(page: number, total: number, allTotal: number, noun: Noun): string {
  const word = (n: number) => (n === 1 ? noun.one : noun.many);
  if (total !== allTotal) return `${total} of ${allTotal} ${word(allTotal)} — filtered`;
  if (pageCount(total) === 1) return `${total} ${word(total)} — all shown`;
  return `${total} ${word(total)} — showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)}`;
}

/** Up to 7 pages: all of them. More: first, last, and the current page with its neighbours. */
export function pageList(page: number, pages: number): (number | "…")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const keep = new Set([1, pages, page - 1, page, page + 1]);
  const out: (number | "…")[] = [];
  for (let p = 1; p <= pages; p++) {
    if (keep.has(p)) out.push(p);
    else if (out[out.length - 1] !== "…") out.push("…");
  }
  return out;
}
