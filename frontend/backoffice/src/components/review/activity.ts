import type { ActivityItem } from "@/components/ui/Activity";
import type { Application } from "@/data/director-general/applications";
import { auditEntries, type AuditEntry } from "@/data/director-general/audit";
import type { Demo } from "@/lib/demo";

/** Audit Trail entries about one subject — the sample trail plus what was done in this session. */
export function auditFor(subject: string, demo: Demo): ActivityItem[] {
  const from = (e: AuditEntry): ActivityItem => ({ at: e.timestamp, who: e.actor, role: e.actedAs, what: e.action, note: e.reason });
  return [...demo.audit, ...auditEntries].filter((e) => e.subject === subject).map(from);
}

const STAGE_ROLE: Record<string, string> = { Reviewer: "Licensing Reviewer", Authorizer: "Licensing Authorizer", Officer: "Licensing & Registration Officer" };

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const field = (app: Application, label: string) => app.summary.flatMap((g) => g.fields).find((f) => f.label === label)?.value;

/**
 * An application's history, built from what the page already shows (KB application-review.md:
 * "Activity / Audit trail"): when it was submitted, each stage of the licensing chain, the
 * recorded decision, and every Audit Trail entry about it — including this session's.
 */
export function applicationActivity(sample: Application, app: Application, demo: Demo): ActivityItem[] {
  const ref = app.title.split(" — ")[0];
  const applicant = field(app, "Entity name") ?? app.subtitle;
  const submitted = field(app, "Submitted") ?? app.documents.map((d) => d.uploaded).sort((a, b) => Date.parse(a) - Date.parse(b))[0];
  const items: ActivityItem[] = [];
  if (submitted) items.push({ at: submitted, who: applicant, what: "Application submitted" });
  for (const s of sample.chain?.stages ?? []) {
    const m = s.recorded.match(/^(.+?) recorded this on (.+?)\.$/);
    if (m) items.push({ at: m[2], who: m[1], role: STAGE_ROLE[s.name.split(" · ")[1]] ?? s.name.split(" · ")[1], what: `${s.name.split(" · ")[0]} — ${s.outcome.label}`, note: cap(s.reason.replace(/^Reason given: /, "")) });
  }
  // A licensing chain already carries the stage-3 decision; elsewhere the Override panel's record is the decision.
  const rec = sample.chain ? undefined : sample.override?.recorded;
  if (rec) items.push({ at: rec.recordedAt, who: rec.decidedBy, role: rec.role, what: rec.outcome.label, note: rec.reason });
  return [...items, ...auditFor(ref, demo)];
}
