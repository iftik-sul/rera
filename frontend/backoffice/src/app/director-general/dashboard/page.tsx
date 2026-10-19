"use client";

import Link from "next/link";
import { Page } from "@/components/shell/Page";
import { KpiCard, KpiRow } from "@/components/ui/KpiCard";
import { TableCard, type Column } from "@/components/ui/Table";
import { directorGeneral, href } from "@/config/roles";
import { kpis, oldestPendingSignOffs, type PendingSignOff } from "@/data/director-general/dashboard";

// Widths are % of the row (design standard §A5a.0 rule 5).
const columns: Column<PendingSignOff>[] = [
  { header: "Reference", width: 17, tone: "link", cell: (r) => r.reference },
  { header: "Item", width: 51, tone: "muted", cell: (r) => r.item },
  { header: "Origin", width: 18, cell: (r) => r.origin },
  { header: "Waiting", width: 14, tone: "muted", align: "right", cell: (r) => r.waiting },
];

export default function Dashboard() {
  return (
    <Page title="Dashboard" subtitle="Welcome back — here's your governance overview.">
      <KpiRow>
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </KpiRow>

      {/* Embedded table: "See All" instead of pagination (design standard §A5a.0 rule 6). */}
      <TableCard
        title="Oldest pending sign-offs"
        titleSize="md"
        action={
          <Link href={href(directorGeneral, "sign-off-queue")} className="type-body-strong text-link hover:underline">
            See All
          </Link>
        }
        columns={columns}
        rows={oldestPendingSignOffs}
        rowKey={(r) => r.reference}
        rowAction={(r) => (r.detail ? { href: href(directorGeneral, `sign-off-queue/${r.detail}`) } : null)}
      />
    </Page>
  );
}
