import Link from "next/link";
import { StatusBadge, type Status } from "./Badge";
import { Icon } from "@/components/shell/Icon";

/** Breadcrumb trail (Figma "Breadcrumb"): earlier steps are blue links, the current one grey. */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-2 type-body">
      {items.map((it, i) => (
        <span key={it.label} className="flex items-center gap-2">
          {it.href ? (
            <Link href={it.href} className="type-body-strong text-link hover:underline">
              {it.label}
            </Link>
          ) : (
            <span className="text-muted">{it.label}</span>
          )}
          {i < items.length - 1 && <Icon name="chevron-right" size={14} className="text-muted" />}
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
    <section className={`flex flex-col rounded-card border border-card bg-white px-6 py-5 ${gap} ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3">
          <h2 className="type-section-title text-strong">{title}</h2>
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
    <div className="flex flex-col gap-2 rounded-control border border-control bg-white p-4">
      <h3 className="type-group-title text-strong">{title}</h3>
      <div className="flex gap-6">
        {fields.map((f) => (
          <div key={f.label} className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="type-caption text-muted">{f.label}</span>
            <span className="type-body text-strong">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Yellow notice box (Figma "Callout" / "Banner"). */
export function Notice({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-control bg-warning-bg px-3 py-2.5 type-label text-strong ${className}`}>{children}</div>;
}

/**
 * The header card at the top of every detail screen (Application Review, Sign-off Detail,
 * Entry Detail): name + badge, a grey line under it, then up to four label/value pairs.
 */
export function DetailHeader({
  title,
  subtitle,
  status,
  meta,
  children,
}: {
  title: string;
  subtitle: string;
  status: Status;
  meta: { label: string; value: React.ReactNode }[];
  /** Extra rows under the meta (e.g. the licensing claim strip). */
  children?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-card border border-card bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="type-section-title text-strong">{title}</h2>
          <p className="type-caption text-muted">{subtitle}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="flex gap-6">
        {meta.map((m) => (
          <div key={m.label} className="flex flex-1 flex-col gap-1">
            <span className="type-label text-muted">{m.label}</span>
            <span className="type-body-strong text-strong">{m.value}</span>
          </div>
        ))}
      </div>
      {children}
    </section>
  );
}

/** Full-width status banner (e.g. a report period's state). */
export function Banner({ tone, icon = "check-circle", children }: { tone: "success" | "warning" | "neutral"; icon?: "check-circle" | "x-circle"; children: React.ReactNode }) {
  const fill = tone === "success" ? "bg-success-bg" : tone === "warning" ? "bg-warning-bg" : "bg-neutral-bg";
  return (
    <div role="status" className={`flex items-center gap-3 rounded-card px-4 py-3 type-body-strong text-strong ${fill}`}>
      <Icon name={icon} size={20} className={tone === "success" ? "text-valid" : tone === "warning" ? "text-ageing" : "text-muted"} />
      {children}
    </div>
  );
}
