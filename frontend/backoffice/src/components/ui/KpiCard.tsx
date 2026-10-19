/** Figma: "KPI card" component — label, big number, one-line caption. */
export function KpiCard({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="flex h-kpi min-w-0 flex-1 flex-col overflow-hidden rounded-card border border-card bg-white px-5 pt-5 pb-6">
      <p className="truncate type-label text-muted uppercase">{label}</p>
      <p className="pt-2 type-display text-strong">{value}</p>
      <p className="truncate pt-2 type-caption text-muted">{caption}</p>
    </div>
  );
}

export function KpiRow({ children }: { children: React.ReactNode }) {
  return <div className="flex w-full gap-4">{children}</div>;
}
