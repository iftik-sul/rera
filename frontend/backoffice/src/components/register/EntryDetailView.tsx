"use client";

import { Page } from "@/components/shell/Page";
import { directorGeneral, href } from "@/config/roles";
import { StatusBadge } from "@/components/ui/Badge";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { Breadcrumb, Card, DetailHeader, FieldGroup } from "@/components/ui/Cards";
import { TableCard, type Column } from "@/components/ui/Table";
import type { EntryDetail } from "@/data/director-general/register";
import Link from "next/link";
import { linkRefs } from "@/components/ui/RefLink";
import { subjectLink } from "@/data/director-general/audit";

/** A reference that has its own screen opens it (2026-10-19 review). */
const Ref = ({ value, self }: { value: string; self: string }) => {
  const to = subjectLink(value);
  return to && !(self && to.includes(self)) ? (
    <Link href={to} className="type-body-strong text-link hover:underline">
      {value}
    </Link>
  ) : (
    <>{value}</>
  );
};

type HistoryRow = EntryDetail["history"][number];

// Embedded table: row count = the entry's real history (design standard §A5a.0 rule 7 exception), no pagination.
const historyColumns: Column<HistoryRow>[] = [
  { header: "Date", width: 14, tone: "muted", cell: (h) => h.date },
  { header: "Event", width: 32, cell: (h) => h.event },
  { header: "By", width: 20, cell: (h) => h.by },
  { header: "Type", width: 14, cell: (h) => <StatusBadge status={h.type} /> },
  { header: "Reference", width: 20, tone: "muted", cell: (h) => <Ref value={h.reference} self="" /> },
];

/** Practitioner Register — Entry Detail (Figma). Read-only: entries change only through a licensing decision. */
export function EntryDetailView({ entry }: { entry: EntryDetail }) {
  return (
    <Page title={entry.title} subtitle={entry.subtitle} bodyClassName="gap-4 px-8 py-5">
      <Breadcrumb items={[{ label: "Practitioner Register", href: href(directorGeneral, "practitioner-register") }, { label: entry.title.split(" ")[0] }]} />

      <DetailHeader title={entry.subtitle} subtitle={entry.title} status={entry.status} meta={entry.meta} />

      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card title="Entry record">
            {entry.groups.map((g) => (
              <FieldGroup key={g.title} title={g.title} fields={linkRefs(g.fields, href(directorGeneral, `practitioner-register/${entry.id}`))} />
            ))}
          </Card>
          <TableCard title="History" titleSize="md" columns={historyColumns} rows={entry.history} rowKey={(h) => h.date + h.event} />
        </div>

        {entry.withdrawal && (
          <Card title="Withdrawal" gap="gap-3" className="w-panel shrink-0">
            {[
              ["Cause", entry.withdrawal.cause],
              ["Authorised by", entry.withdrawal.authorisedBy],
              // Authorised and carried out can be different days (Crestview: authorised 09 Oct, withdrawn 10 Oct).
              ...(entry.withdrawal.authorisedOn ? [["Authorised on", entry.withdrawal.authorisedOn]] : []),
              [entry.withdrawal.authorisedOn ? "Withdrawn on" : "Date", entry.withdrawal.date],
              ["Decision ref.", entry.withdrawal.decisionRef],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-2 type-body">
                <span className="text-muted">{label}</span>
                <span className="type-body-strong text-strong">{label === "Decision ref." ? <Ref value={value} self={entry.id} /> : value}</span>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Closing panel — at the end of the content, never pinned. */}
      <div className="flex items-center gap-6 rounded-card border border-control bg-white px-6 py-4">
        <p className="flex-1 type-caption text-muted">{entry.footer}</p>
        <ExportMenu
          label="Export record"
          formats={["PDF"]}
          title="Record exported"
          audit={{ subsystem: "Licensing", subject: entry.title.split(" — ")[0] }}
          message={() => `${entry.title.split(" — ")[0]} and its history, as a PDF register extract. Recorded in the audit trail.`}
        />
      </div>
    </Page>
  );
}
