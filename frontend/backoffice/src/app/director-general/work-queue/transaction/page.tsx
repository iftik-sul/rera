"use client";

import { useState } from "react";
import { useRole } from "@/components/shell/RoleContext";
import { StatusBadge } from "@/components/ui/Badge";
import { TableCard, type Column, type FilterDef } from "@/components/ui/Table";
import { WorkQueueFrame } from "@/components/review/WorkQueueFrame";
import { AgeText } from "@/components/review/cells";
import { rowAction } from "@/components/review/rowAction";
import { COMPLETED_EMPTY, COMPLETED_NOUN, QueueSwitch, completedFilters, splitQueue, useQueueSide, type Completed } from "@/components/review/queueSide";
import { AGE_ORDER, STATUS_ORDER, ageState, statusFilterValue, transactionKpis, transactionRows, type TransactionRow } from "@/data/director-general/work-queue";

// Widths are % of the row (design standard §A5a.0 rule 5).
const columns: Column<TransactionRow>[] = [
  { header: "Reference", width: 13, tone: "link", cell: (r) => r.reference },
  { header: "Service", width: 18, cell: (r) => r.service },
  { header: "Applicant", width: 19, cell: (r) => r.applicant },
  { header: "Subject", width: 21, tone: "muted", cell: (r) => r.subject },
  { header: "Status", width: 17, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Age / SLA", width: 12, cell: (r) => <AgeText age={r.age} /> },
];
// Completed side (work-queue.md §4d): no Age / SLA — nothing ages once it is decided.
const doneColumns: Column<Completed<TransactionRow>>[] = [
  { header: "Reference", width: 12, tone: "link", cell: (r) => r.reference },
  { header: "Service", width: 14, cell: (r) => r.service },
  { header: "Applicant", width: 16, cell: (r) => r.applicant },
  { header: "Subject", width: 15, tone: "muted", cell: (r) => r.subject },
  { header: "Outcome", width: 18, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Decided", width: 11, cell: (r) => r.decided },
  { header: "Decided by", width: 14, cell: (r) => r.by },
];

// Work Queue spec §2. "Channel" (transaction vs escrow) is left out: for the DG the tabs already make that split.
const filters: FilterDef<TransactionRow>[] = [
  { label: "Service", key: "service", value: (r) => r.service },
  { label: "Status", key: "status", value: (r) => statusFilterValue(r.status), order: STATUS_ORDER },
  { label: "Age / SLA state", key: "age", value: (r) => ageState(r.age), order: AGE_ORDER },
];
const doneFilters: FilterDef<Completed<TransactionRow>>[] = [{ label: "Service", key: "service", value: (r) => r.service }, ...completedFilters<TransactionRow>()];

const { open, completed } = splitQueue(transactionRows);

export default function TransactionQueue() {
  const role = useRole();
  const [exportCount, setExportCount] = useState(0);
  const [side, setSide] = useQueueSide();
  const lead = side && <QueueSwitch side={side} onChange={setSide} />;
  return (
    <WorkQueueFrame title="Work Queue — Transaction" subtitle="Review and decide submitted applications." kpis={side === "completed" ? undefined : transactionKpis} exportCount={exportCount}>
      {side === "open" && (
        <TableCard
          key="open"
          title="All applications"
          lead={lead}
          filters={filters}
          columns={columns}
          rows={open}
          rowKey={(r) => r.reference}
          onMatchedChange={(rs) => setExportCount(rs.length)}
          rowAction={(r) => rowAction(role, r.opens)}
          searchText={(r) => `${r.reference} ${r.service} ${r.applicant} ${r.subject}`}
          paginate={{ one: "application", many: "applications" }}
        />
      )}
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
          searchText={(r) => `${r.reference} ${r.service} ${r.applicant} ${r.subject} ${r.by}`}
          paginate={COMPLETED_NOUN}
          empty={COMPLETED_EMPTY}
        />
      )}
    </WorkQueueFrame>
  );
}
