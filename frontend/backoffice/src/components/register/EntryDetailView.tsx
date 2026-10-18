"use client";

import { Page } from "@/components/shell/Page";
import { directorGeneral, href } from "@/config/roles";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Breadcrumb, Card, FieldGroup } from "@/components/ui/Cards";
import { TableCard, type Column } from "@/components/ui/Table";
import type { EntryDetail } from "@/data/director-general/register";

type HistoryRow = EntryDetail["history"][number];

// Embedded table: row count = the entry's real history (design standard §A5a.0 rule 7 exception), no pagination.
const historyColumns: Column<HistoryRow>[] = [
  { header: "Date", width: 14, tone: "muted", cell: (h) => h.date },
  { header: "Event", width: 32, cell: (h) => h.event },
  { header: "By", width: 20, cell: (h) => h.by },
  { header: "Type", width: 14, cell: (h) => <StatusBadge status={h.type} /> },
  { header: "Reference", width: 20, tone: "muted", cell: (h) => h.reference },
];

/** Practitioner Register — Entry Detail (Figma). Read-only: entries change only through a licensing decision. */
export function EntryDetailView({ entry }: { entry: EntryDetail }) {
  return (
    <Page title={entry.title} subtitle={entry.subtitle} bodyClassName="gap-4 px-8 py-5">
      <Breadcrumb items={[{ label: "Practitioner Register", href: href(directorGeneral, "practitioner-register") }, { label: "Entry Detail" }]} />

      <section className="flex flex-col gap-4 rounded-xl border border-n30 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold text-n900">{entry.subtitle}</h2>
            <p className="text-xs text-n400">{entry.title}</p>
          </div>
          <StatusBadge status={entry.status} />
        </div>
        <div className="flex gap-6">
          {entry.meta.map((m) => (
            <div key={m.label} className="flex flex-1 flex-col gap-1">
              <span className="text-xs font-medium text-n400">{m.label}</span>
              <span className="text-sm font-medium text-n900">{m.value}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card title="Entry Record">
            {entry.groups.map((g) => (
              <FieldGroup key={g.title} title={g.title} fields={g.fields} />
            ))}
          </Card>
          <TableCard title="History" titleSize="md" columns={historyColumns} rows={entry.history} rowKey={(h) => h.date + h.event} />
        </div>

        {entry.withdrawal && (
          <Card title="Withdrawal" gap="gap-3" className="w-[360px] shrink-0">
            {[
              ["Cause", entry.withdrawal.cause],
              ["Authorised by", entry.withdrawal.authorisedBy],
              ["Date", entry.withdrawal.date],
              ["Decision ref.", entry.withdrawal.decisionRef],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-2 text-[13px]">
                <span className="text-n400">{label}</span>
                <span className="font-medium text-n900">{value}</span>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Closing panel — at the end of the content, never pinned. */}
      <div className="flex items-center gap-6 rounded-xl border border-n40 bg-white px-6 py-4">
        <p className="flex-1 text-xs text-n400">{entry.footer}</p>
        {/* Export isn't designed beyond the button yet. */}
        <Button>Export record</Button>
      </div>
    </Page>
  );
}
