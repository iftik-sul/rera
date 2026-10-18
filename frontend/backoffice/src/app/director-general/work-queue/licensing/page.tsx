"use client";

import { useRole } from "@/components/shell/RoleContext";
import { StatusBadge } from "@/components/ui/Badge";
import { TableCard, type Column } from "@/components/ui/Table";
import { WorkQueueFrame } from "@/components/review/WorkQueueFrame";
import { rowAction } from "@/components/review/rowAction";
import { licensingKpis, licensingRows, type LicensingRow } from "@/data/director-general/work-queue";

// Widths are % of the row (design standard §A5a.0 rule 5).
const columns: Column<LicensingRow>[] = [
  { header: "Reference", width: 13, tone: "link", cell: (r) => r.reference },
  { header: "Applicant", width: 22, cell: (r) => r.applicant },
  { header: "Service", width: 21, cell: (r) => r.service },
  { header: "Status", width: 12, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Submitted", width: 10, cell: (r) => r.submitted },
  { header: "At Stage", width: 8, cell: (r) => r.atStage },
  { header: "Claimed By", width: 14, cell: (r) => r.claimedBy ?? <span className="text-n400">—</span> },
];

export default function LicensingQueue() {
  const role = useRole();
  return (
    <WorkQueueFrame title="Work Queue — Licensing" subtitle="Stage 3 of 3 — final decisions and completed licensing items" kpis={licensingKpis}>
      <TableCard
        title="Applications Awaiting Final Sign-off"
        filters={["Service", "Status", "Category"]}
        columns={columns}
        rows={licensingRows}
        rowKey={(r) => r.reference}
        rowAction={(r) => rowAction(role, r.opens, () => {})}
        searchText={(r) => `${r.reference} ${r.applicant} ${r.service} ${r.claimedBy ?? ""}`}
        paginate={{ one: "application", many: "applications" }}
      />
    </WorkQueueFrame>
  );
}
