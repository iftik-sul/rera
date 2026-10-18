"use client";

import { Page } from "@/components/shell/Page";
import { useRole } from "@/components/shell/RoleContext";
import { Icon } from "@/components/shell/Icon";
import { href } from "@/config/roles";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Breadcrumb, Card, FieldGroup } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
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
      footer={app.decide && <DecisionPanel app={app} actions={app.decide} />}
    >
      <Breadcrumb items={[{ label: "Work Queue", href: href(role, "work-queue/transaction") }, { label: "Application Review" }]} />

      {/* Application Metadata */}
      <section className="flex flex-col gap-4 rounded-xl border border-n30 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold text-n900">Application Metadata</h2>
            <p className="text-xs text-n400">{app.metaSubtitle}</p>
          </div>
          <StatusBadge status={app.status} />
        </div>
        <div className="flex gap-6">
          {app.meta.map((m) => (
            <div key={m.label} className="flex flex-1 flex-col gap-1">
              <span className="text-xs font-medium text-n400">{m.label}</span>
              <span className="text-sm font-medium text-n900">{m.value}</span>
            </div>
          ))}
        </div>
        {app.claim && (
          <>
            <hr className="border-n40" />
            <div className="flex items-center justify-between gap-2 text-[13px]">
              <p>
                <span className="font-medium text-n900">{app.claim.held}</span> <span className="text-n400">{app.claim.detail}</span>
              </p>
              {/* Release isn't designed for the DG yet (the Licensing roles have a pop-up for it). */}
              <span className="font-medium text-blue-600">Release item</span>
            </div>
          </>
        )}
      </section>

      {/* Review chain (licensing only) */}
      {app.chain && (
        <Card title="Review chain" gap="gap-3">
          {app.chain.stages.map((s) => (
            <div key={s.name} className="flex flex-col gap-1.5 rounded-lg border border-n40 bg-white px-4 py-3.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-n400">{s.name}</span>
                <StatusBadge status={s.outcome} />
              </div>
              <p className="text-[13px] text-n900">{s.recorded}</p>
              <p className="text-xs text-n400">{s.reason}</p>
            </div>
          ))}
          <p className="text-xs whitespace-pre text-n400">{app.chain.path}</p>
          <div className="flex gap-2 rounded-xl bg-warning-bg px-4 py-3 text-[13px]">
            <span className="font-semibold text-n900">{app.chain.noticeTitle}</span>
            <span className="text-n400">{app.chain.notice}</span>
          </div>
        </Card>
      )}

      {/* Body: summary + documents on the left, register checks on the right */}
      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card title="Application Summary">
            {app.summary.map((g) => (
              <FieldGroup key={g.title} title={g.title} fields={g.fields} />
            ))}
          </Card>
          <Documents docs={app.documents} />
        </div>

        <Card title={app.checksTitle} gap="gap-3" className="w-[360px] shrink-0">
          {app.checks.map((c) => (
            <div key={c} className="flex items-center justify-between gap-2 text-[13px]">
              <span className="text-n900">{c}</span>
              <span className="flex items-center gap-1 font-medium text-valid">
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

      {app.override && <OverridePanel app={app} actions={app.override} />}
    </Page>
  );
}

/** Supporting Documents table. "Review" opens a document viewer that isn't designed for the DG yet. */
function Documents({ docs }: { docs: Doc[] }) {
  const cols = [330, 70, 90, 78, 70];
  return (
    <Card title="Supporting Documents" gap="gap-0">
      <div className="h-4" />
      <div className="flex gap-4 border-b border-n40 py-2 text-[11px] font-medium tracking-[0.5px] text-n400">
        {["DOCUMENT", "TYPE", "UPLOADED", "STATUS", "ACTION"].map((h, i) => (
          <span key={h} style={{ width: cols[i] }} className="shrink-0">
            {h}
          </span>
        ))}
      </div>
      {docs.map((d) => (
        <div key={d.name} className="flex items-center gap-4 border-b border-n40 py-2.5 text-[13px]">
          <span style={{ width: cols[0] }} className="shrink-0 truncate font-semibold text-n900">
            {d.name}
          </span>
          <span style={{ width: cols[1] }} className="shrink-0 text-n400">
            {d.type}
          </span>
          <span style={{ width: cols[2] }} className="shrink-0 text-n400">
            {d.uploaded}
          </span>
          <span style={{ width: cols[3] }} className="shrink-0">
            <StatusBadge status={d.status} />
          </span>
          <span style={{ width: cols[4] }} className="shrink-0">
            <Button variant="link">Review</Button>
          </span>
        </div>
      ))}
    </Card>
  );
}
