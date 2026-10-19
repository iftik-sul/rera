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
import { COMPLETED_EMPTY, COMPLETED_NOUN, QueueSwitch, completedFilters, splitQueue, useQueueSide, type Completed } from "@/components/review/queueSide";
import { CATEGORY_ORDER, LICENSING_STATUS_ORDER, claimSince, licensingKpis, licensingRows, reviewId, type LicensingRow } from "@/data/director-general/work-queue";

/** Rows another officer holds: opening one raises "Item already claimed" first (M-QUE-03). */
const heldByOther = (r: LicensingRow) => !!r.claimedBy && r.claimedBy !== "Adaeze Nwosu";

// Widths are % of the row (design standard §A5a.0 rule 5).
const columns: Column<LicensingRow>[] = [
  { header: "Reference", width: 13, tone: "link", cell: (r) => r.reference },
  { header: "Applicant", width: 20, cell: (r) => r.applicant },
  { header: "Service", width: 22, cell: (r) => r.service },
  { header: "Status", width: 15, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Submitted", width: 9, cell: (r) => r.submitted },
  { header: "At Stage", width: 8, cell: (r) => r.atStage },
  { header: "Claimed By", width: 13, cell: (r) => r.claimedBy ?? <span className="text-muted">—</span> },
];

// Completed side (work-queue.md §4d): no Submitted / At Stage / Claimed By — none means anything once decided.
const doneColumns: Column<Completed<LicensingRow>>[] = [
  { header: "Reference", width: 13, tone: "link", cell: (r) => r.reference },
  { header: "Applicant", width: 22, cell: (r) => r.applicant },
  { header: "Service", width: 24, cell: (r) => r.service },
  { header: "Outcome", width: 13, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Decided", width: 12, cell: (r) => r.decided },
  { header: "Decided by", width: 16, cell: (r) => r.by },
];

// Category is a filter only, never a column (Work Queue spec §3b). No Age/SLA filter: licensing has no SLA.
const filters: FilterDef<LicensingRow>[] = [
  { label: "Service", key: "service", value: (r) => r.service },
  { label: "Status", key: "status", value: (r) => r.status.label, order: LICENSING_STATUS_ORDER },
  { label: "Category", key: "category", value: (r) => r.category, order: CATEGORY_ORDER },
];
const doneFilters: FilterDef<Completed<LicensingRow>>[] = [
  { label: "Service", key: "service", value: (r) => r.service },
  { label: "Category", key: "category", value: (r) => r.category, order: CATEGORY_ORDER },
  ...completedFilters<LicensingRow>(),
];

const { open, completed } = splitQueue(licensingRows);

export default function LicensingQueue() {
  const role = useRole();
  const [exportCount, setExportCount] = useState(0);
  const [held, setHeld] = useState<LicensingRow | null>(null);
  const [side, setSide] = useQueueSide();
  const lead = side && <QueueSwitch side={side} onChange={setSide} />;
  return (
    <WorkQueueFrame title="Work Queue — Licensing" subtitle="Stage 3 of 3 — final decisions and completed licensing items" kpis={side === "completed" ? undefined : licensingKpis} exportCount={exportCount}>
      {side === "completed" && (
        <TableCard
          key="completed"
          title="Completed licensing applications"
          lead={lead}
          filters={doneFilters}
          columns={doneColumns}
          rows={completed}
          rowKey={(r) => r.reference}
          onMatchedChange={(rs) => setExportCount(rs.length)}
          rowAction={(r) => rowAction(role, r.opens)}
          searchText={(r) => `${r.reference} ${r.applicant} ${r.service} ${r.by}`}
          paginate={COMPLETED_NOUN}
          empty={COMPLETED_EMPTY}
        />
      )}
      {side === "open" && (
      <TableCard
        key="open"
        lead={lead}
        title="Applications awaiting final sign-off"
        filters={filters}
        columns={columns}
        rows={open}
        rowKey={(r) => r.reference}
        onMatchedChange={(rs) => setExportCount(rs.length)}
        rowAction={(r) => (heldByOther(r) ? { onClick: () => setHeld(r) } : rowAction(role, r.opens))}
        searchText={(r) => `${r.reference} ${r.applicant} ${r.service} ${r.claimedBy ?? ""}`}
        paginate={{ one: "application", many: "applications" }}
      />
      )}

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
