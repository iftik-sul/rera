import Link from "next/link";

/**
 * Figma: "KPI card" component — label, big number, one-line caption.
 * Give `href` to make the whole card a link to the screen behind the number
 * (KB dashboard.md §1: "Each tile links to the underlying screen"), or `onClick` to make it
 * apply a filter to the table below (work-queue.md §1).
 */
export function KpiCard({ label, value, caption, href, onClick }: { label: string; value: string; caption: string; href?: string; onClick?: () => void }) {
  const body = (
    <>
      <p className="truncate type-label text-muted uppercase">{label}</p>
      <p className="pt-2 type-display text-strong">{value}</p>
      <p className="truncate pt-2 type-caption text-muted">{caption}</p>
    </>
  );
  const box = "flex h-kpi min-w-0 flex-1 flex-col overflow-hidden rounded-card border border-card bg-white px-5 pt-5 pb-6";
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={`${box} cursor-pointer text-left hover:border-control focus-ring`}>
        {body}
      </button>
    );
  return href ? (
    <Link href={href} className={`${box} hover:border-control focus-ring`}>
      {body}
    </Link>
  ) : (
    <div className={box}>{body}</div>
  );
}

export function KpiRow({ children }: { children: React.ReactNode }) {
  return <div className="flex w-full gap-4">{children}</div>;
}
