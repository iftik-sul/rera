"use client";

import { useState } from "react";
import { useRole } from "@/components/shell/RoleContext";
import { StatusBadge } from "@/components/ui/Badge";
import { TableCard, type Column, type FilterDef } from "@/components/ui/Table";
import { WorkQueueFrame } from "@/components/review/WorkQueueFrame";
import { BlockerModal } from "@/components/review/BlockerModal";
import { AgeText } from "@/components/review/cells";
import { rowAction } from "@/components/review/rowAction";
import { AGE_ORDER, STATUS_ORDER, ageState, statusFilterValue, transactionKpis, transactionRows, type BlockerId, type TransactionRow } from "@/data/director-general/work-queue";

// Widths are % of the row (design standard §A5a.0 rule 5).
const columns: Column<TransactionRow>[] = [
  { header: "Reference", width: 13, tone: "link", cell: (r) => r.reference },
  { header: "Service", width: 18, cell: (r) => r.service },
  { header: "Applicant", width: 19, cell: (r) => r.applicant },
  { header: "Subject", width: 21, tone: "muted", cell: (r) => r.subject },
  { header: "Status", width: 17, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Age / SLA", width: 12, cell: (r) => <AgeText age={r.age} /> },
];

// Work Queue spec §2. "Channel" (transaction vs escrow) is left out: for the DG the tabs already make that split.
const filters: FilterDef<TransactionRow>[] = [
  { label: "Service", key: "service", value: (r) => r.service },
  { label: "Status", key: "status", value: (r) => statusFilterValue(r.status), order: STATUS_ORDER, hiddenUnlessSelected: "Decided" },
  { label: "Age / SLA state", key: "age", value: (r) => ageState(r.age), order: AGE_ORDER },
];

export default function TransactionQueue() {
  const role = useRole();
  const [blocker, setBlocker] = useState<BlockerId | null>(null);
  return (
    <WorkQueueFrame title="Work Queue — Transaction" subtitle="Review and decide submitted applications." kpis={transactionKpis}>
      <TableCard
        title="All Applications"
        filters={filters}
        columns={columns}
        rows={transactionRows}
        rowKey={(r) => r.reference}
        rowAction={(r) => rowAction(role, r.opens, setBlocker)}
        searchText={(r) => `${r.reference} ${r.service} ${r.applicant} ${r.subject}`}
        paginate={{ one: "application", many: "applications" }}
      />
      <BlockerModal id={blocker} onClose={() => setBlocker(null)} />
    </WorkQueueFrame>
  );
}
