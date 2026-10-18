"use client";

import { useRole } from "@/components/shell/RoleContext";
import { StatusBadge } from "@/components/ui/Badge";
import { QueueTable, type QueueColumn } from "@/components/ui/QueueTable";
import { WorkQueueFrame } from "@/components/review/WorkQueueFrame";
import { rowAction } from "@/components/review/rowAction";
import { licensingKpis, licensingRows, type LicensingRow } from "@/data/director-general/work-queue";

const columns: QueueColumn<LicensingRow>[] = [
  { header: "REFERENCE", width: 130, tone: "link", cell: (r) => r.reference },
  { header: "APPLICANT", width: 215, cell: (r) => r.applicant },
  { header: "SERVICE", width: 240, cell: (r) => r.service },
  { header: "STATUS", width: 145, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "SUBMITTED", width: 88, cell: (r) => r.submitted },
  { header: "AT STAGE", width: 88, cell: (r) => r.atStage },
  { header: "CLAIMED BY", width: 116, cell: (r) => r.claimedBy ?? <span className="text-n400">—</span> },
];

export default function LicensingQueue() {
  const role = useRole();
  return (
    <WorkQueueFrame title="Work Queue — Licensing" subtitle="Stage 3 of 3 — final decisions and completed licensing items" kpis={licensingKpis}>
      <QueueTable
        title="Applications Awaiting Final Sign-off"
        filters={["Service", "Status", "Category"]}
        columns={columns}
        rows={licensingRows}
        rowKey={(r) => r.reference}
        rowAction={(r) => rowAction(role, r.opens, () => {})}
        searchText={(r) => `${r.reference} ${r.applicant} ${r.service} ${r.claimedBy ?? ""}`}
        pages={3}
        uppercaseHeaders
      />
    </WorkQueueFrame>
  );
}
