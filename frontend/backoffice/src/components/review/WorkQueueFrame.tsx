"use client";

import { Page } from "@/components/shell/Page";
import { useRole } from "@/components/shell/RoleContext";
import { href } from "@/config/roles";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { KpiCard, KpiRow } from "@/components/ui/KpiCard";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import type { Kpi } from "@/data/director-general/work-queue";

/**
 * Everything the three Work Queue tabs share: top bar, tab switcher + Export, KPI row.
 * Export covers the queue as currently filtered and searched, every page (KB work-queue.md, Layout).
 */
export function WorkQueueFrame({
  title,
  subtitle,
  kpis,
  exportCount,
  children,
}: {
  title: string;
  subtitle: string;
  /** Triage cards — Open side only (work-queue.md §4d); leave out on Completed. */
  kpis?: Kpi[];
  /** How many items the queue holds as currently filtered — what Export covers. */
  exportCount: number;
  children: React.ReactNode;
}) {
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
        <ExportMenu
          title="Queue exported"
          message={(kind) =>
            `${exportCount} ${exportCount === 1 ? "item" : "items"} — this side of the queue as filtered, every page — as a ${kind === "PDF" ? "PDF" : "spreadsheet"}. Recorded in the audit trail.`
          }
        />
      </div>
      {kpis && (
        <KpiRow>
          {kpis.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </KpiRow>
      )}
      {children}
    </Page>
  );
}
