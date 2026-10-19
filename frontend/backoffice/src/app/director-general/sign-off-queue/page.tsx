"use client";

import { Page } from "@/components/shell/Page";
import { useDemo } from "@/lib/demo";
import { directorGeneral, href } from "@/config/roles";
import { StatusBadge } from "@/components/ui/Badge";
import { KpiCard, KpiRow } from "@/components/ui/KpiCard";
import { TableCard, type Column, type FilterDef } from "@/components/ui/Table";
import { QueueSwitch, decidedPeriodFilter, useQueueSide } from "@/components/review/queueSide";
import { AGE_BUCKETS, ageBucket, signoffDecided, signoffKpisFor, signoffMatters, withSignoffChanges, type SignoffMatter } from "@/data/director-general/signoff";

// Widths are % of the row (design standard §A5a.0 rule 5).
const columns: Column<SignoffMatter>[] = [
  { header: "Reference", width: 14, tone: "link", cell: (r) => r.reference },
  { header: "Matter", width: 34, cell: (r) => r.matter },
  { header: "Recommendation", width: 26, tone: "muted", cell: (r) => r.recommendation },
  { header: "Status", width: 14, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Escalated", width: 12, tone: "muted", cell: (r) => r.escalated },
];
// Completed side (signoff-queue.md §2a): adds the Decided date.
const doneColumns: Column<SignoffMatter>[] = [
  { header: "Reference", width: 14, tone: "link", cell: (r) => r.reference },
  { header: "Matter", width: 31, cell: (r) => r.matter },
  { header: "Recommendation", width: 21, tone: "muted", cell: (r) => r.recommendation },
  { header: "Outcome", width: 12, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Escalated", width: 11, tone: "muted", cell: (r) => r.escalated },
  { header: "Decided", width: 11, cell: (r) => signoffDecided(r) },
];

// Source is a filter, not a column (only Licensing escalates today). Age = days since escalation.
const filters: FilterDef<SignoffMatter>[] = [
  { label: "Source", key: "source", value: (r) => r.source },
  { label: "Age", key: "age", value: (r) => ageBucket(r), order: AGE_BUCKETS },
];
const doneFilters: FilterDef<SignoffMatter>[] = [
  { label: "Source", key: "source", value: (r) => r.source },
  { label: "Outcome", key: "outcome", value: (r) => r.status.label, order: ["Authorised", "Declined"] },
  decidedPeriodFilter<SignoffMatter>((r) => Date.parse(signoffDecided(r))),
];

/**
 * Sign-off Queue (Figma "Sign-off Queue") — matters escalated for the DG's executive sign-off.
 * Open · Completed (signoff-queue.md §2a): pending matters on Open, authorised and declined on Completed.
 */
export default function SignoffQueue() {
  const [side, setSide] = useQueueSide();
  // This session's decisions (lib/demo.ts) move a matter from Open to Completed and recount the cards.
  const demo = useDemo();
  const matters = withSignoffChanges(signoffMatters, demo.signoffs);
  const pending = matters.filter((s) => s.status.label === "Pending Sign-off");
  const decided = matters.filter((s) => s.status.label !== "Pending Sign-off").sort((a, b) => Date.parse(signoffDecided(b)) - Date.parse(signoffDecided(a)));
  const lead = side && <QueueSwitch side={side} onChange={setSide} />;
  return (
    <Page title="Sign-off Queue" subtitle="Matters escalated for your executive sign-off.">
      {side !== "completed" && (
        <KpiRow>
          {signoffKpisFor(matters).map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </KpiRow>
      )}
      {side === "open" && (
        <TableCard
          key="open"
          title="Matters awaiting sign-off"
          lead={lead}
          filters={filters}
          columns={columns}
          rows={pending}
          rowKey={(r) => r.reference}
          rowAction={(r) => (r.detail ? { href: href(directorGeneral, `sign-off-queue/${r.detail}`) } : null)}
          searchText={(r) => `${r.reference} ${r.matter}`}
          paginate={{ one: "matter", many: "matters" }}
        />
      )}
      {side === "completed" && (
        <TableCard
          key="completed"
          title="Completed sign-offs"
          lead={lead}
          filters={doneFilters}
          columns={doneColumns}
          rows={decided}
          rowKey={(r) => r.reference}
          rowAction={(r) => (r.detail ? { href: href(directorGeneral, `sign-off-queue/${r.detail}`) } : null)}
          searchText={(r) => `${r.reference} ${r.matter}`}
          paginate={{ one: "completed matter", many: "completed matters" }}
          empty="Nothing completed yet."
        />
      )}
    </Page>
  );
}
