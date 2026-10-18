import Link from "next/link";
import { Icon } from "@/components/shell/Icon";

/** Breadcrumb trail (Figma "Breadcrumb"): earlier steps are blue links, the current one grey. */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-2 text-[13px]">
      {items.map((it, i) => (
        <span key={it.label} className="flex items-center gap-2">
          {it.href ? (
            <Link href={it.href} className="font-medium text-blue-600 hover:underline">
              {it.label}
            </Link>
          ) : (
            <span className="text-n400">{it.label}</span>
          )}
          {i < items.length - 1 && <Icon name="chevron-right" size={14} className="text-n400" />}
        </span>
      ))}
    </nav>
  );
}

/** White rounded section card with a 16px title — used throughout Application Review. */
export function Card({
  title,
  aside,
  children,
  gap = "gap-4",
  className = "",
}: {
  title?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  /** Space between the card's children (Tailwind gap class). */
  gap?: string;
  className?: string;
}) {
  return (
    <section className={`flex flex-col rounded-xl border border-n30 bg-white px-6 py-5 ${gap} ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base leading-6 font-medium text-n900">{title}</h2>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

/** Bordered group of label/value pairs inside a card (e.g. "Applicant Information"). */
export function FieldGroup({ title, fields }: { title: string; fields: { label: string; value: React.ReactNode }[] }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-n40 bg-white p-4">
      <h3 className="text-[13px] font-semibold text-n900">{title}</h3>
      <div className="flex gap-6">
        {fields.map((f) => (
          <div key={f.label} className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-xs text-n400">{f.label}</span>
            <span className="text-[13px] text-n900">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Yellow notice box (Figma "Callout" / "Banner"). */
export function Notice({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg bg-warning-bg px-3 py-2.5 text-xs font-medium text-n900 ${className}`}>{children}</div>;
}
