/**
 * Sample data for the DG Dashboard (Figma "Director-General / Registrar - Dashboard").
 * Sign-off figures and the "Oldest pending sign-offs" table are worked out from
 * the Sign-off Queue's data (signoff.ts), so the two screens always agree.
 * When the backend exists, this file is replaced by an API call.
 */
import { auditEntries, dateBucket, type AuditEntry } from "./audit";
import { oldestPendingOf, pendingOf, waited, type SignoffMatter } from "./signoff";
import type { StaffMember } from "./staff";

/** An account change, not a read: exports are typed Access too, but they change nobody's access. */
const isAccessChange = (e: AuditEntry) => e.type === "Access" && !/export/i.test(e.action);

/** The DG's five tiles, counted from the data on screen (sample data + this session's changes). */
export function dashboardKpis(matters: SignoffMatter[], staff: StaffMember[], audit: AuditEntry[] = auditEntries) {
  const pending = pendingOf(matters);
  const oldest = oldestPendingOf(matters)[0];
  const active = staff.filter((m) => m.status === "Active");
  return [
    { label: "Pending sign-off", value: String(pending.length), caption: "Awaiting your authorisation", href: "sign-off-queue" },
    { label: "Oldest pending", value: oldest ? waited(oldest) : "—", caption: "Longest in the queue", href: "sign-off-queue" },
    // Counted from the Admin Console and Audit Trail data (Figma's 41 / 3 / 7 matched neither).
    { label: "Active staff", value: String(active.length), caption: `Across ${new Set(active.flatMap((m) => m.roles)).size} roles`, href: "admin-console" },
    { label: "Pending invites", value: String(staff.filter((m) => m.status === "Invited").length), caption: "Awaiting acceptance", href: "admin-console" },
    {
      label: "Recent access changes",
      value: String(audit.filter((e) => isAccessChange(e) && dateBucket(e.timestamp) !== "Earlier").length),
      caption: "In the last 7 days",
      href: "audit-trail?type=Access",
    },
  ];
}

export type PendingSignOff = { reference: string; item: string; origin: string; waiting: string; detail?: string };

/** The 10 longest-waiting pending sign-offs (design standard §A5a.0 rule 7: 10 rows). */
export const oldestPendingSignOffsOf = (matters: SignoffMatter[]): PendingSignOff[] =>
  oldestPendingOf(matters).map((s) => ({ reference: s.reference, item: s.matter, origin: s.origin, waiting: waited(s), detail: s.detail }));
