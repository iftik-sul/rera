"use client";

import { useState } from "react";
import { useRole } from "@/components/shell/RoleContext";
import { StatusBadge } from "@/components/ui/Badge";
import { TableCard, type Column, type FilterDef } from "@/components/ui/Table";
import { WorkQueueFrame } from "@/components/review/WorkQueueFrame";
import { AgeText } from "@/components/review/cells";
import { rowAction } from "@/components/review/rowAction";
import { COMPLETED_EMPTY, COMPLETED_NOUN, QueueSwitch, completedFilters, splitQueue, useQueueSide, type Completed } from "@/components/review/queueSide";
import { AGE_ORDER, STATUS_ORDER, ageState, escrowKpis, escrowRows, statusFilterValue, type EscrowRow } from "@/data/director-general/work-queue";

// Widths are % of the row (design standard §A5a.0 rule 5).
const columns: Column<EscrowRow>[] = [
  { header: "Reference", width: 12, tone: "link", cell: (r) => r.reference },
  { header: "Escrow Flag", width: 12, cell: (r) => <StatusBadge status={r.escrowFlag} /> },
  { header: "Applicant", width: 18, cell: (r) => r.applicant },
  { header: "Subject", width: 31, tone: "muted", cell: (r) => r.subject },
  { header: "Status", width: 15, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Age / SLA", width: 12, cell: (r) => <AgeText age={r.age} /> },
];
// Completed side (work-queue.md §4d): no escrow flag or Age / SLA — a decided item needed the assessment to be decided.
const doneColumns: Column<Completed<EscrowRow>>[] = [
  { header: "Reference", width: 12, tone: "link", cell: (r) => r.reference },
  { header: "Applicant", width: 19, cell: (r) => r.applicant },
  { header: "Subject", width: 29, tone: "muted", cell: (r) => r.subject },
  { header: "Outcome", width: 14, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Decided", width: 12, cell: (r) => r.decided },
  { header: "Decided by", width: 14, cell: (r) => r.by },
];

const filters: FilterDef<EscrowRow>[] = [
  { label: "Trustee institution", key: "trustee", value: (r) => r.applicant },
  { label: "Status", key: "status", value: (r) => statusFilterValue(r.status), order: STATUS_ORDER },
  { label: "Age / SLA state", key: "age", value: (r) => ageState(r.age), order: AGE_ORDER },
];
const doneFilters: FilterDef<Completed<EscrowRow>>[] = [{ label: "Trustee institution", key: "trustee", value: (r) => r.applicant }, ...completedFilters<EscrowRow>()];

const { open, completed } = splitQueue(escrowRows);

export default function EscrowQueue() {
  const role = useRole();
  const [exportCount, setExportCount] = useState(0);
  const [side, setSide] = useQueueSide();
  const lead = side && <QueueSwitch side={side} onChange={setSide} />;
  return (
    <WorkQueueFrame title="Work Queue — Escrow" subtitle="Review escrow and trust account requests." kpis={side === "completed" ? undefined : escrowKpis} exportCount={exportCount}>
      {side === "completed" && (
        <TableCard
          key="completed"
          title="Completed applications"
          lead={lead}
          filters={doneFilters}
          columns={doneColumns}
          rows={completed}
          rowKey={(r) => r.reference}
          onMatchedChange={(rs) => setExportCount(rs.length)}
          rowAction={(r) => rowAction(role, r.opens)}
          searchText={(r) => `${r.reference} ${r.applicant} ${r.subject} ${r.by}`}
          paginate={COMPLETED_NOUN}
          empty={COMPLETED_EMPTY}
        />
      )}
      {side === "open" && (
      <TableCard
        key="open"
        lead={lead}
        title="All applications"
        filters={filters}
        columns={columns}
        rows={open}
        rowKey={(r) => r.reference}
        onMatchedChange={(rs) => setExportCount(rs.length)}
        rowAction={(r) => rowAction(role, r.opens)}
        searchText={(r) => `${r.reference} ${r.applicant} ${r.subject}`}
        paginate={{ one: "application", many: "applications" }}
      />
      )}
    </WorkQueueFrame>
  );
}
