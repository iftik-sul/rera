"use client";

import { useMemo, useState } from "react";
import { useDemo } from "@/lib/demo";
import { useRole } from "@/components/shell/RoleContext";
import { StatusBadge } from "@/components/ui/Badge";
import { TableCard, type Column, type FilterDef } from "@/components/ui/Table";
import { WorkQueueFrame } from "@/components/review/WorkQueueFrame";
import { AgeText } from "@/components/review/cells";
import { rowAction } from "@/components/review/rowAction";
import { ClaimedModal } from "@/components/review/ClaimedModal";
import { COMPLETED_EMPTY, COMPLETED_NOUN, QueueSwitch, completedFilters, splitQueue, useCardFilter, useQueueSide, type Completed } from "@/components/review/queueSide";
import { AGE_ORDER, CLAIMED_ORDER, STATUS_ORDER, a1KpisFor, ageState, byUrgency, claimedValue, escrowRows, statusFilterValue, type EscrowRow } from "@/data/director-general/work-queue";

const dash = <span className="text-muted">—</span>;
/** "Escrow Release — Plot 7, Lekki Phase 1" → service "Escrow Release", subject "Plot 7, Lekki Phase 1". */
const serviceOf = (r: EscrowRow) => r.subject.split(" — ")[0];
const placeOf = (r: EscrowRow) => r.subject.split(" — ")[1] ?? r.subject;

// Work Queue spec §3, escrow view — Service added (2026-10-19 review). Widths are % of the row (§A5a.0 rule 5).
const columns: Column<EscrowRow>[] = [
  { header: "Reference", width: 10, tone: "link", cell: (r) => r.reference },
  { header: "Escrow Flag", width: 10, cell: (r) => <StatusBadge status={r.escrowFlag} /> },
  { header: "Service", width: 11, cell: serviceOf },
  { header: "Applicant", width: 12, cell: (r) => r.applicant },
  { header: "Subject", width: 10, tone: "muted", cell: placeOf },
  { header: "Status", width: 10, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Resubmission", width: 10, tone: "muted", cell: (r) => (r.resubmission ? `Round ${r.resubmission}` : dash) },
  { header: "Age / SLA", width: 7, cell: (r) => <AgeText age={r.age} /> },
  { header: "Total elapsed", width: 11, tone: "muted", cell: (r) => r.totalElapsed ?? dash },
  { header: "Claimed by", width: 9, cell: (r) => r.claimedBy ?? dash },
]
// Completed side (work-queue.md §4d): no escrow flag or Age / SLA — a decided item needed the assessment to be decided.
const doneColumns: Column<Completed<EscrowRow>>[] = [
  { header: "Reference", width: 12, tone: "link", cell: (r) => r.reference },
  { header: "Service", width: 13, cell: serviceOf },
  { header: "Applicant", width: 17, cell: (r) => r.applicant },
  { header: "Subject", width: 18, tone: "muted", cell: placeOf },
  { header: "Outcome", width: 14, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Decided", width: 12, cell: (r) => r.decided },
  { header: "Decided by", width: 14, cell: (r) => r.by },
];

const filters: FilterDef<EscrowRow>[] = [
  { label: "Service", key: "service", value: serviceOf },
  { label: "Trustee institution", key: "trustee", value: (r) => r.applicant },
  { label: "Status", key: "status", value: (r) => statusFilterValue(r.status), order: STATUS_ORDER },
  { label: "Age / SLA state", key: "age", value: (r) => ageState(r.age), order: AGE_ORDER },
  { label: "Claimed by", key: "claimed", value: claimedValue, order: CLAIMED_ORDER },
];
const doneFilters: FilterDef<Completed<EscrowRow>>[] = [
  { label: "Service", key: "service", value: serviceOf },
  { label: "Trustee institution", key: "trustee", value: (r) => r.applicant },
  ...completedFilters<EscrowRow>(),
];

const heldByOther = (r: EscrowRow) => !!r.claimedBy && r.claimedBy !== "Adaeze Nwosu";

export default function EscrowQueue() {
  const role = useRole();
  const [exportCount, setExportCount] = useState(0);
  const [side, setSide] = useQueueSide();
  const [preset, applyCard] = useCardFilter();
  const [held, setHeld] = useState<EscrowRow | null>(null);
  const demo = useDemo();
  const { open, completed } = useMemo(() => {
    const q = splitQueue(escrowRows, demo);
    return { ...q, open: [...q.open].sort(byUrgency) };
  }, [demo]);
  const lead = side && <QueueSwitch side={side} onChange={setSide} />;
  return (
    <WorkQueueFrame title="Work Queue — Escrow" subtitle="Review and decide submitted applications." kpis={side === "completed" ? undefined : a1KpisFor(open)} onCard={applyCard} exportCount={exportCount}>
      {side === "open" && (
        <TableCard
          key={`open-${preset}`}
          title="All applications"
          lead={lead}
          filters={filters}
          columns={columns}
          rows={open}
          rowKey={(r) => r.reference}
          onMatchedChange={(rs) => setExportCount(rs.length)}
          rowAction={(r) => (heldByOther(r) ? { onClick: () => setHeld(r) } : rowAction(role, r.opens))}
          searchText={(r) => `${r.reference} ${r.applicant} ${r.subject} ${r.claimedBy ?? ""}`}
          paginate={{ one: "application", many: "applications" }}
          empty="Nothing is waiting in this queue — you are clear."
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
          searchText={(r) => `${r.reference} ${r.applicant} ${r.subject} ${r.by}`}
          paginate={COMPLETED_NOUN}
          empty={COMPLETED_EMPTY}
        />
      )}
      <ClaimedModal item={held} holderRole="Compliance & Escrow Auditor" onClose={() => setHeld(null)} />
    </WorkQueueFrame>
  );
}
