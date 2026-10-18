"use client";

import { useRole } from "@/components/shell/RoleContext";
import { StatusBadge } from "@/components/ui/Badge";
import { QueueTable, type QueueColumn } from "@/components/ui/QueueTable";
import { WorkQueueFrame } from "@/components/review/WorkQueueFrame";
import { AgeText } from "@/components/review/cells";
import { rowAction } from "@/components/review/rowAction";
import { escrowKpis, escrowRows, type EscrowRow } from "@/data/director-general/work-queue";

const columns: QueueColumn<EscrowRow>[] = [
  { header: "Reference", width: 145, tone: "link", cell: (r) => r.reference },
  { header: "Escrow Flag", width: 130, cell: (r) => <StatusBadge status={r.escrowFlag} /> },
  { header: "Applicant", width: 170, cell: (r) => r.applicant },
  { header: "Subject", width: 319, tone: "muted", cell: (r) => r.subject },
  { header: "Status", width: 160, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Age / SLA", width: 110, cell: (r) => <AgeText age={r.age} /> },
];

export default function EscrowQueue() {
  const role = useRole();
  return (
    <WorkQueueFrame title="Work Queue — Escrow" subtitle="Review escrow and trust account requests." kpis={escrowKpis}>
      <QueueTable
        title="All Applications"
        filters={["Trustee institution", "Status", "Age / SLA state"]}
        columns={columns}
        rows={escrowRows}
        rowKey={(r) => r.reference}
        rowAction={(r) => rowAction(role, r.opens, () => {})}
        searchText={(r) => `${r.reference} ${r.applicant} ${r.subject}`}
        pages={1}
      />
    </WorkQueueFrame>
  );
}
