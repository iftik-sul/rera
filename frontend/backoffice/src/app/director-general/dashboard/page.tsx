"use client";

import { Page } from "@/components/shell/Page";
import { KpiCard, KpiRow } from "@/components/ui/KpiCard";
import { Panel } from "@/components/ui/Panel";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { directorGeneral, href } from "@/config/roles";
import { kpis, oldestPendingSignOffs, type PendingSignOff } from "@/data/director-general/dashboard";

const columns: Column<PendingSignOff>[] = [
  { header: "REFERENCE", width: 150, tone: "link", cell: (r) => r.reference },
  { header: "ITEM", cell: (r) => r.item },
  { header: "ORIGIN", width: 160, tone: "strong", cell: (r) => r.origin },
  { header: "WAITING", width: 100, align: "right", cell: (r) => r.waiting },
];

export default function Dashboard() {
  return (
    <Page title="Dashboard" subtitle="Welcome back — here's your governance overview.">
      <KpiRow>
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </KpiRow>

      <Panel title="Oldest pending sign-offs" action={{ label: "See All", href: href(directorGeneral, "sign-off-queue") }}>
        <DataTable columns={columns} rows={oldestPendingSignOffs} rowKey={(r) => r.reference} />
      </Panel>
    </Page>
  );
}
