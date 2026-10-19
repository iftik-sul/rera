"use client";

import { useMemo, useState } from "react";
import { useDemo } from "@/lib/demo";
import { useRole } from "@/components/shell/RoleContext";
import { ClaimedModal } from "@/components/review/ClaimedModal";
import { StatusBadge } from "@/components/ui/Badge";
import { TableCard, type Column, type FilterDef } from "@/components/ui/Table";
import { WorkQueueFrame } from "@/components/review/WorkQueueFrame";
import { rowAction } from "@/components/review/rowAction";
import { COMPLETED_EMPTY, COMPLETED_NOUN, QueueSwitch, completedFilters, splitQueue, useCardFilter, useQueueSide, type Completed } from "@/components/review/queueSide";
import { CATEGORY_ORDER, CLAIMED_ORDER, LICENSING_STATUS_ORDER, byOldest, claimSince, claimedValue, licensingKpisFor, licensingRows, type LicensingRow } from "@/data/director-general/work-queue";

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
  { label: "Claimed by", key: "claimed", value: claimedValue, order: CLAIMED_ORDER },
];
const doneFilters: FilterDef<Completed<LicensingRow>>[] = [
  { label: "Service", key: "service", value: (r) => r.service },
  { label: "Category", key: "category", value: (r) => r.category, order: CATEGORY_ORDER },
  ...completedFilters<LicensingRow>(),
];


export default function LicensingQueue() {
  const role = useRole();
  const [exportCount, setExportCount] = useState(0);
  const [held, setHeld] = useState<LicensingRow | null>(null);
  const [side, setSide] = useQueueSide();
  const demo = useDemo();
  const [preset, applyCard] = useCardFilter();
  const { open, completed } = useMemo(() => {
    const q = splitQueue(licensingRows, demo);
    return { ...q, open: [...q.open].sort(byOldest) };
  }, [demo]);
  const lead = side && <QueueSwitch side={side} onChange={setSide} />;
  return (
    <WorkQueueFrame title="Work Queue — Licensing" subtitle="Stage 3 of 3 — final decisions and completed licensing items" kpis={side === "completed" ? undefined : licensingKpisFor(open)} onCard={applyCard} exportCount={exportCount}>
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
        key={`open-${preset}`}
        lead={lead}
        title="Applications awaiting final sign-off"
        empty="Nothing at your stage — no item is waiting for a final decision."
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

      <ClaimedModal item={held} holderRole="Licensing & Registration Officer" since={held ? claimSince(held) : undefined} onClose={() => setHeld(null)} />
    </WorkQueueFrame>
  );
}
