"use client";

import { Page } from "@/components/shell/Page";
import { useRole } from "@/components/shell/RoleContext";
import { Icon } from "@/components/shell/Icon";
import { href } from "@/config/roles";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Breadcrumb, Card, DetailHeader, FieldGroup } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { TableCard, type Column } from "@/components/ui/Table";
import type { Application, Doc } from "@/data/director-general/applications";
import { DecisionPanel } from "./DecisionPanel";
import { OverridePanel } from "./OverridePanel";

/**
 * Application Review (Figma "Application Review — …").
 * One screen, three states, chosen by the sample data:
 *  - undecided transaction → decision bar (Approve / Request Info / Return / Reject)
 *  - licensing at stage 3  → claim strip + review chain + the same decision bar
 *  - decided item          → Override panel (overturn the recorded decision)
 */
export function ApplicationReview({ app }: { app: Application }) {
  const role = useRole();

  return (
    <Page
      title={app.title}
      subtitle={app.subtitle}
      bodyClassName="gap-4 px-8 py-5"
    >
      <Breadcrumb items={[{ label: "Work Queue", href: href(role, "work-queue/transaction") }, { label: "Application Review" }]} />

      {/* Application metadata */}
      <DetailHeader title="Application metadata" subtitle={app.metaSubtitle} status={app.status} meta={app.meta}>
        {app.claim && (
          <>
            <hr className="border-control" />
            <div className="flex items-center justify-between gap-2 type-body">
              <p>
                <span className="type-body-strong text-strong">{app.claim.held}</span> <span className="text-muted">{app.claim.detail}</span>
              </p>
              {/* Release isn't designed for the DG yet (the Licensing roles have a pop-up for it). */}
              <Button variant="link">Release item</Button>
            </div>
          </>
        )}
      </DetailHeader>

      {/* Review chain (licensing only) */}
      {app.chain && (
        <Card title="Review chain" gap="gap-3">
          {app.chain.stages.map((s) => (
            <div key={s.name} className="flex flex-col gap-1.5 rounded-control border border-control bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="type-label text-muted">{s.name}</span>
                <StatusBadge status={s.outcome} />
              </div>
              <p className="type-body text-strong">{s.recorded}</p>
              <p className="type-caption text-muted">{s.reason}</p>
            </div>
          ))}
          <p className="type-caption whitespace-pre text-muted">{app.chain.path}</p>
          <div className="flex gap-2 rounded-card bg-warning-bg px-4 py-3 type-body">
            <span className="type-group-title text-strong">{app.chain.noticeTitle}</span>
            <span className="text-muted">{app.chain.notice}</span>
          </div>
        </Card>
      )}

      {/* Body: summary + documents on the left, register checks on the right */}
      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card title="Application summary">
            {app.summary.map((g) => (
              <FieldGroup key={g.title} title={g.title} fields={g.fields} />
            ))}
          </Card>
          <Documents docs={app.documents} />
        </div>

        <Card title={app.checksTitle} gap="gap-3" className="w-panel shrink-0">
          {app.checks.map((c) => (
            <div key={c} className="flex items-center justify-between gap-2 type-body">
              <span className="text-strong">{c}</span>
              <span className="flex items-center gap-1 type-body-strong text-valid">
                <Icon name="check-circle" className="text-valid" />
                Valid
              </span>
            </div>
          ))}
          <span>
            <Badge tone="success">All Clear</Badge>
          </span>
        </Card>
      </div>

      {/* Decision / override panels close the page — never pinned (KB application-review.md §6). */}
      {app.decide && <DecisionPanel app={app} actions={app.decide} />}
      {app.override && <OverridePanel app={app} actions={app.override} />}
    </Page>
  );
}

/** Supporting Documents table. "Review" opens a document viewer that isn't designed for the DG yet. */
// Widths are % of the row (design standard §A5a.0 rule 5). Row count = the documents the service requires (rule 7 exception).
const docColumns: Column<Doc>[] = [
  { header: "Document", width: 44, cell: (d) => <span className="type-group-title">{d.name}</span> },
  { header: "Type", width: 11, tone: "muted", cell: (d) => d.type },
  { header: "Uploaded", width: 14, tone: "muted", cell: (d) => d.uploaded },
  { header: "Status", width: 17, cell: (d) => <StatusBadge status={d.status} /> },
  { header: "Action", width: 14, cell: () => <Button variant="link">Review</Button> },
];

function Documents({ docs }: { docs: Doc[] }) {
  return <TableCard title="Supporting documents" titleSize="md" columns={docColumns} rows={docs} rowKey={(d) => d.name} />;
}
