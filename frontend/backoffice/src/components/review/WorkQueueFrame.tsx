"use client";

import { Page } from "@/components/shell/Page";
import { useRole } from "@/components/shell/RoleContext";
import { href } from "@/config/roles";
import { Button } from "@/components/ui/Button";
import { KpiCard, KpiRow } from "@/components/ui/KpiCard";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import type { Kpi } from "@/data/director-general/work-queue";

/** Everything the three Work Queue tabs share: top bar, tab switcher + Export, KPI row. */
export function WorkQueueFrame({ title, subtitle, kpis, children }: { title: string; subtitle: string; kpis: Kpi[]; children: React.ReactNode }) {
  const role = useRole();
  return (
    <Page title={title} subtitle={subtitle} bodyClassName="gap-6 p-8">
      <div className="flex items-center gap-4">
        <SegmentedTabs
          tabs={[
            { label: "Transaction", href: href(role, "work-queue/transaction") },
            { label: "Escrow", href: href(role, "work-queue/escrow") },
            { label: "Licensing", href: href(role, "work-queue/licensing") },
          ]}
        />
        <span className="flex-1" />
        {/* Export isn't designed beyond the button yet. */}
        <Button variant="secondary">Export</Button>
      </div>
      <KpiRow>
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </KpiRow>
      {children}
    </Page>
  );
}
