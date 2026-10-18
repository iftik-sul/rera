"use client";

import { useRole } from "@/components/shell/RoleContext";
import { StatusBadge } from "@/components/ui/Badge";
import { TableCard, type Column } from "@/components/ui/Table";
import { WorkQueueFrame } from "@/components/review/WorkQueueFrame";
import { AgeText } from "@/components/review/cells";
import { rowAction } from "@/components/review/rowAction";
import { escrowKpis, escrowRows, type EscrowRow } from "@/data/director-general/work-queue";

// Widths are % of the row (design standard §A5a.0 rule 5).
const columns: Column<EscrowRow>[] = [
  { header: "Reference", width: 12, tone: "link", cell: (r) => r.reference },
  { header: "Escrow Flag", width: 12, cell: (r) => <StatusBadge status={r.escrowFlag} /> },
  { header: "Applicant", width: 18, cell: (r) => r.applicant },
  { header: "Subject", width: 31, tone: "muted", cell: (r) => r.subject },
  { header: "Status", width: 15, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Age / SLA", width: 12, cell: (r) => <AgeText age={r.age} /> },
];

export default function EscrowQueue() {
  const role = useRole();
  return (
    <WorkQueueFrame title="Work Queue — Escrow" subtitle="Review escrow and trust account requests." kpis={escrowKpis}>
      <TableCard
        title="All Applications"
        filters={["Trustee institution", "Status", "Age / SLA state"]}
        columns={columns}
        rows={escrowRows}
        rowKey={(r) => r.reference}
        rowAction={(r) => rowAction(role, r.opens, () => {})}
        searchText={(r) => `${r.reference} ${r.applicant} ${r.subject}`}
        paginate={{ one: "application", many: "applications" }}
      />
    </WorkQueueFrame>
  );
}
