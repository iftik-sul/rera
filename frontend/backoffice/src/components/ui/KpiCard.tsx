/** Figma: "KPI card" component — label, big number, one-line caption. */
export function KpiCard({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="flex h-[127px] min-w-0 flex-1 flex-col overflow-hidden rounded-[14px] border border-n30 bg-white px-5 pt-5 pb-6">
      <p className="truncate text-xs leading-[18px] font-medium text-n400 uppercase">{label}</p>
      <p className="pt-2 text-2xl font-semibold tracking-[-0.96px] text-black">{value}</p>
      <p className="truncate pt-2 text-xs leading-[18px] text-n400">{caption}</p>
    </div>
  );
}

export function KpiRow({ children }: { children: React.ReactNode }) {
  return <div className="flex w-full gap-4">{children}</div>;
}
