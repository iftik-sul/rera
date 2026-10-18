"use client";

import { useState } from "react";
import { useRole } from "@/components/shell/RoleContext";
import { StatusBadge } from "@/components/ui/Badge";
import { QueueTable, type QueueColumn } from "@/components/ui/QueueTable";
import { WorkQueueFrame } from "@/components/review/WorkQueueFrame";
import { BlockerModal } from "@/components/review/BlockerModal";
import { AgeText } from "@/components/review/cells";
import { rowAction } from "@/components/review/rowAction";
import { transactionKpis, transactionRows, type BlockerId, type TransactionRow } from "@/data/director-general/work-queue";

const columns: QueueColumn<TransactionRow>[] = [
  { header: "Reference", width: 145, tone: "link", cell: (r) => r.reference },
  { header: "Service", width: 269, cell: (r) => r.service },
  { header: "Applicant", width: 170, cell: (r) => r.applicant },
  { header: "Subject", width: 180, tone: "muted", cell: (r) => r.subject },
  { header: "Status", width: 160, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Age / SLA", width: 110, cell: (r) => <AgeText age={r.age} /> },
];

export default function TransactionQueue() {
  const role = useRole();
  const [blocker, setBlocker] = useState<BlockerId | null>(null);
  return (
    <WorkQueueFrame title="Work Queue — Transaction" subtitle="Review and decide submitted applications." kpis={transactionKpis}>
      <QueueTable
        title="All Applications"
        filters={["Service", "Status", "Age / SLA state", "Channel"]}
        columns={columns}
        rows={transactionRows}
        rowKey={(r) => r.reference}
        rowAction={(r) => rowAction(role, r.opens, setBlocker)}
        searchText={(r) => `${r.reference} ${r.service} ${r.applicant} ${r.subject}`}
        pages={1}
      />
      <BlockerModal id={blocker} onClose={() => setBlocker(null)} />
    </WorkQueueFrame>
  );
}
