"use client";

import { useState } from "react";
import Link from "next/link";
import { Page } from "@/components/shell/Page";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TableCard, type Column, type FilterDef } from "@/components/ui/Table";
import { ACTION_TYPE_ORDER, DATE_ORDER, SUBSYSTEM_ORDER, auditEntries, dateBucket, subjectLink, type AuditEntry } from "@/data/director-general/audit";

// Widths are % of the row (design standard §A5a.0 rule 5).
const columns: Column<AuditEntry>[] = [
  { header: "Timestamp", width: 15, tone: "strong", cell: (e) => e.timestamp },
  { header: "Actor", width: 22, cell: (e) => `${e.actor} · ${e.actedAs}` },
  { header: "Action", width: 18, cell: (e) => e.action },
  { header: "Subject", width: 17, tone: "link", cell: (e) => e.subject },
  { header: "Reason", width: 28, tone: "muted", cell: (e) => e.reason },
];

// Item reference is matched by the search box rather than a dropdown of every reference.
const filters: FilterDef<AuditEntry>[] = [
  { label: "Actor", key: "actor", value: (e) => e.actor },
  { label: "Action type", key: "type", value: (e) => e.type, order: ACTION_TYPE_ORDER },
  { label: "Date range", key: "date", value: (e) => dateBucket(e.timestamp), order: DATE_ORDER },
  { label: "Subsystem", key: "subsystem", value: (e) => e.subsystem, order: SUBSYSTEM_ORDER },
];

/** Audit Trail (Figma "Audit Trail") — append-only; nobody, including the DG, can edit or delete an entry. */
export default function AuditTrail() {
  const [open, setOpen] = useState<AuditEntry | null>(null);
  const link = open && subjectLink(open.subject);
  return (
    <Page title="Audit Trail" subtitle="Every recorded action in the back office.">
      <TableCard
        title="Audit Trail"
        titleSize="md"
        filters={filters}
        columns={columns}
        rows={auditEntries}
        rowKey={(e) => e.id}
        rowAction={(e) => ({ onClick: () => setOpen(e) })}
        searchText={(e) => `${e.actor} ${e.actedAs} ${e.action} ${e.subject} ${e.reason}`}
        paginate={{ one: "entry", many: "entries" }}
      />

      {/* Read-only entry detail (KB: "Row click → read-only detail of the entry"). Not drawn in Figma. */}
      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open?.action ?? ""}
        description={<p>Audit entries are permanent. They can&apos;t be edited or deleted by anyone.</p>}
        actions={
          <>
            {link && (
              <Link href={link} className="inline-flex items-center rounded-lg border border-blue-600 bg-blue-600 px-3.5 py-2 text-sm leading-5 font-semibold text-white hover:bg-blue-600/90">
                Open {open?.subject}
              </Link>
            )}
            <Button onClick={() => setOpen(null)}>Close</Button>
          </>
        }
      >
        {open && (
          <dl className="flex flex-col gap-2.5 rounded-lg border border-n40 p-4 text-[13px]">
            {[
              ["When", open.timestamp],
              ["Actor", open.actor],
              ["Acted as", open.actedAs],
              ["Action type", <Badge key="t" tone={open.type === "Override" ? "warning" : open.type === "Access" ? "neutral" : "info"}>{open.type}</Badge>],
              ["Subsystem", open.subsystem],
              ["Subject", open.subject],
              ["Reason", open.reason],
              ["Entry ID", open.id.toUpperCase()],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex gap-4">
                <dt className="w-28 shrink-0 text-n400">{k}</dt>
                <dd className="text-n900">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </Page>
  );
}
