"use client";

import { useState } from "react";
import { useRole } from "@/components/shell/RoleContext";
import { href } from "@/config/roles";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/Badge";
import { TableCard, type Column, type FilterDef } from "@/components/ui/Table";
import { WorkQueueFrame } from "@/components/review/WorkQueueFrame";
import { rowAction } from "@/components/review/rowAction";
import { CATEGORY_ORDER, STATUS_ORDER, claimSince, licensingKpis, licensingRows, reviewId, statusFilterValue, type LicensingRow } from "@/data/director-general/work-queue";

/** Rows another officer holds: opening one raises "Item already claimed" first (M-QUE-03). */
const heldByOther = (r: LicensingRow) => !!r.claimedBy && r.claimedBy !== "Adaeze Nwosu" && statusFilterValue(r.status) !== "Decided";

// Widths are % of the row (design standard §A5a.0 rule 5).
const columns: Column<LicensingRow>[] = [
  { header: "Reference", width: 13, tone: "link", cell: (r) => r.reference },
  { header: "Applicant", width: 22, cell: (r) => r.applicant },
  { header: "Service", width: 21, cell: (r) => r.service },
  { header: "Status", width: 12, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Submitted", width: 10, cell: (r) => r.submitted },
  { header: "At Stage", width: 8, cell: (r) => r.atStage },
  { header: "Claimed By", width: 14, cell: (r) => r.claimedBy ?? <span className="text-muted">—</span> },
];

// Category is a filter only, never a column (Work Queue spec §3b). No Age/SLA filter: licensing has no SLA.
const filters: FilterDef<LicensingRow>[] = [
  { label: "Service", key: "service", value: (r) => r.service },
  { label: "Status", key: "status", value: (r) => statusFilterValue(r.status), order: STATUS_ORDER, hiddenUnlessSelected: "Decided" },
  { label: "Category", key: "category", value: (r) => r.category, order: CATEGORY_ORDER },
];

export default function LicensingQueue() {
  const role = useRole();
  const [held, setHeld] = useState<LicensingRow | null>(null);
  return (
    <WorkQueueFrame title="Work Queue — Licensing" subtitle="Stage 3 of 3 — final decisions and completed licensing items" kpis={licensingKpis}>
      <TableCard
        title="Applications awaiting final sign-off"
        filters={filters}
        columns={columns}
        rows={licensingRows}
        rowKey={(r) => r.reference}
        rowAction={(r) => (heldByOther(r) ? { onClick: () => setHeld(r) } : rowAction(role, r.opens))}
        searchText={(r) => `${r.reference} ${r.applicant} ${r.service} ${r.claimedBy ?? ""}`}
        paginate={{ one: "application", many: "applications" }}
      />

      <Modal
        open={!!held}
        onClose={() => setHeld(null)}
        width={480}
        title="This item is already claimed"
        description={
          held && (
            <p>
              {held.reference} is claimed by {held.claimedBy} (Licensing &amp; Registration Officer), since {held && claimSince(held)}. You can open it read-only.
              To decide it, wait until they release it or the claim lapses after 30 minutes of inactivity.
            </p>
          )
        }
        actions={
          <>
            <Button onClick={() => setHeld(null)}>Cancel</Button>
            {held && (
              <ButtonLink variant="primary" href={href(role, `application-review/${reviewId(held.reference)}`)}>
                Open read-only
              </ButtonLink>
            )}
          </>
        }
      />
    </WorkQueueFrame>
  );
}
