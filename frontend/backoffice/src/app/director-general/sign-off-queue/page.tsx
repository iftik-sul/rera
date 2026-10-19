"use client";

import { Page } from "@/components/shell/Page";
import { directorGeneral, href } from "@/config/roles";
import { StatusBadge } from "@/components/ui/Badge";
import { KpiCard, KpiRow } from "@/components/ui/KpiCard";
import { TableCard, type Column, type FilterDef } from "@/components/ui/Table";
import { AGE_BUCKETS, SIGNOFF_STATUS_ORDER, ageBucket, signoffKpis, signoffMatters, type SignoffMatter } from "@/data/director-general/signoff";

// Widths are % of the row (design standard §A5a.0 rule 5).
const columns: Column<SignoffMatter>[] = [
  { header: "Reference", width: 14, tone: "link", cell: (r) => r.reference },
  { header: "Matter", width: 34, cell: (r) => r.matter },
  { header: "Recommendation", width: 26, tone: "muted", cell: (r) => r.recommendation },
  { header: "Status", width: 14, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Escalated", width: 12, tone: "muted", cell: (r) => r.escalated },
];

// Source is a filter, not a column (only Licensing escalates today). Age = days since escalation.
const filters: FilterDef<SignoffMatter>[] = [
  { label: "Source", key: "source", value: (r) => r.source },
  { label: "Status", key: "status", value: (r) => r.status.label, order: SIGNOFF_STATUS_ORDER },
  { label: "Age", key: "age", value: (r) => ageBucket(r), order: AGE_BUCKETS },
];

/** Sign-off Queue (Figma "Sign-off Queue") — matters escalated for the DG's executive sign-off. */
export default function SignoffQueue() {
  return (
    <Page title="Sign-off Queue" subtitle="Matters escalated for your executive sign-off.">
      <KpiRow>
        {signoffKpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </KpiRow>
      <TableCard
        title="Matters awaiting sign-off"
        filters={filters}
        columns={columns}
        rows={signoffMatters}
        rowKey={(r) => r.reference}
        rowAction={(r) => (r.detail ? { href: href(directorGeneral, `sign-off-queue/${r.detail}`) } : null)}
        searchText={(r) => `${r.reference} ${r.matter}`}
        paginate={{ one: "matter", many: "matters" }}
      />
    </Page>
  );
}
