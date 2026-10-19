/**
 * Sample data for the DG Audit Trail (Figma "Audit Trail"). The first 10 entries are
 * Figma's, corrected where they contradicted the other screens (marked); the rest are
 * marked. 20 entries = two full pages.
 *
 * The DG sees all four action types, including Access, which every other role is
 * denied (KB audit-trail.md — open-questions A9). Nothing here can be edited or deleted.
 */
import { directorGeneral, href } from "@/config/roles";
import { staff } from "./staff";
import { applications } from "./reviews";
import { entryDetails } from "./register";
import { signoffDetails } from "./signoff";

export type ActionType = "Decision" | "Config" | "Access" | "Override";
export const ACTION_TYPE_ORDER: ActionType[] = ["Decision", "Override", "Config", "Access"];
export const SUBSYSTEM_ORDER = ["Transaction", "Escrow", "Licensing", "Sign-off", "Finance", "Access"];

export type AuditEntry = {
  id: string;
  /** "11 Oct 2026, 09:42" */
  timestamp: string;
  actor: string;
  actedAs: string;
  action: string;
  type: ActionType;
  subsystem: string;
  subject: string;
  reason: string;
};

const a = (id: string, timestamp: string, actor: string, actedAs: string, action: string, type: ActionType, subsystem: string, subject: string, reason = "—"): AuditEntry => ({
  id, timestamp, actor, actedAs, action, type, subsystem, subject, reason,
});

// Full role names, as every other screen writes them (2026-10-19 review: one role, one name).
const DG = "Director-General / Registrar";

const entries: AuditEntry[] = [
  // Figma had TRX-2024-00891 here — an item that is still undecided. The overturn the other screens show is Kano Homes' licence.
  a("aud-0901", "11 Oct 2026, 09:42", "Adaeze Nwosu", DG, "Decision overturned", "Override", "Licensing", "LIC-2023-0044", "Licence issued on a forged incorporation certificate"),
  // Figma: "Credential issued CRED/LIC/26/0412" — but the register shows it issued in January.
  a("aud-0900", "11 Oct 2026, 08:15", "Funke Adeyemi", "Licensing & Registration Officer", "Credential amended", "Decision", "Licensing", "CRED/LIC/26/0412", "Holder contact details updated"),
  a("aud-0898", "10 Oct 2026, 17:03", "Adaeze Nwosu", DG, "Role assigned", "Access", "Access", "b.adewale@rera.gov.ng", "State Liaison Coordinator"),
  // Figma: "Rejected" — the Work Queue shows TRX-2024-0858 as Returned.
  a("aud-0897", "10 Oct 2026, 14:20", "Chukwuemeka Obi", "Compliance & Escrow Auditor", "Returned for correction", "Decision", "Transaction", "TRX-2024-0858", "Title deed mismatch"),
  a("aud-0896", "30 Sep 2026, 11:48", "Amaka Okeke", "Revenue & Finance Officer", "Schedule published", "Config", "Finance", "FEE-2026-v3", "Takes effect 1 Oct 2026"), // was v4 on 10 Oct, but Revenue shows v3 in force from 1 Oct
  a("aud-0895", "10 Oct 2026, 09:05", "Adaeze Nwosu", DG, "Account suspended", "Access", "Access", "s.okon@rera.gov.ng", "Pending investigation"),
  // Figma: Funke Adeyemi on 09 Oct — the Entry Detail records the DG cancelling it on 11 Oct, after the overturn above.
  a("aud-0902", "11 Oct 2026, 09:44", "Adaeze Nwosu", DG, "Credential cancelled", "Override", "Licensing", "CRED/LIC/23/0044", "Overturn — OVR/2026/0044"),
  a("aud-0893", "9 Oct 2026, 13:10", "Adaeze Nwosu", DG, "Sign-off authorised", "Decision", "Sign-off", "RRA/SO/2026/0231", "Licence revocation — Crestview Property Managers"),
  a("aud-0892", "9 Oct 2026, 10:22", "Ngozi Eze", "Licensing Authorizer", "Endorsed", "Decision", "Licensing", "LIC-2026-00398", "—"),
  a("aud-0890", "8 Oct 2026, 15:44", "Adaeze Nwosu", DG, "MFA reset", "Access", "Access", "y.abdullahi@rera.gov.ng", "Device lost"),
  // ── Beyond the Figma frame: sample entries for page 2 ──
  a("aud-0858", "30 Sep 2026, 09:42", "Ibrahim Musa", "Licensing Reviewer", "Recommended approval", "Decision", "Licensing", "LIC-2026-00412", "—"), // matches the review chain on its Application Review
  a("aud-0886", "8 Oct 2026, 09:12", "Adaeze Nwosu", DG, "Revenue report exported", "Access", "Finance", "Sep 2026", "—"),
  a("aud-0884", "7 Oct 2026, 16:05", "Chukwuemeka Obi", "Compliance & Escrow Auditor", "Information requested", "Decision", "Escrow", "REF-ESC-1016", "Trustee confirmation letter missing"),
  a("aud-0881", "7 Oct 2026, 10:47", "Amaka Okeke", "Revenue & Finance Officer", "Manual payment recorded", "Config", "Finance", "PAY-2026-01187", "Cash at the Lagos office"),
  a("aud-0879", "6 Oct 2026, 14:18", "Adaeze Nwosu", DG, "Account deactivated", "Access", "Access", "f.adebayo@rera.gov.ng", "Left the authority"),
  a("aud-0877", "5 Oct 2026, 16:20", "Funke Adeyemi", "Licensing & Registration Officer", "Escalated for sign-off", "Decision", "Licensing", "RRA/SO/2026/0218", "Licence lapsed; renewal window closed"),
  // Batch 6: the overturn behind TRX-2024-0878's two badges (Approved → Rejected, mortgage certificate revoked).
  a("aud-0875", "5 Oct 2026, 15:48", "Adaeze Nwosu", DG, "Decision overturned", "Override", "Transaction", "TRX-2024-0878", "Mortgage registered against a title the lender does not hold"),
  a("aud-0876", "5 Oct 2026, 15:50", "Adaeze Nwosu", DG, "Output revoked", "Override", "Transaction", "RERA/MC/2026/04712", "Overturn — OVR/2026/0878"),
  a("aud-0874", "5 Oct 2026, 15:31", "Adaeze Nwosu", DG, "Role assigned", "Access", "Access", "g.etim@rera.gov.ng", "Licensing Reviewer — Individual Practitioner Credentials"),
  a("aud-0861", "2 Oct 2026, 11:42", "Chukwuemeka Obi", "Compliance & Escrow Auditor", "Approved", "Decision", "Transaction", "TRX-2024-0887", "Registry checks clear; title deed issued"), // matches the recorded decision on its Application Review
  a("aud-0868", "3 Oct 2026, 16:40", "Amaka Okeke", "Revenue & Finance Officer", "Period marked Filed", "Config", "Finance", "Sep 2026", "VAT return submitted to FIRS"),
  a("aud-0865", "2 Oct 2026, 10:15", "Adaeze Nwosu", DG, "Account suspended", "Access", "Access", "t.bankole@rera.gov.ng", "Repeated failed sign-in"),
];

export const auditEntries: AuditEntry[] = [...entries];

// Newest first, by timestamp — the trail reads in time order whatever order the samples were written in.
const key = (t: string) => new Date(t.replace(",", "") + " UTC").getTime();
auditEntries.sort((x, y) => key(y.timestamp) - key(x.timestamp));

/** Date-range filter, against the sample "today" (11 Oct 2026). */
export function dateBucket(timestamp: string): string {
  const d = timestamp.split(",")[0];
  if (d === "11 Oct 2026") return "Today";
  const days = Math.round((Date.UTC(2026, 9, 11) - key(d + ", 00:00")) / 86_400_000);
  return days <= 7 ? "Last 7 days" : "Earlier";
}
export const DATE_ORDER = ["Today", "Last 7 days", "Earlier"];

/** Where the subject opens — every application, register entry, sign-off and staff account in the sample has a screen. */
export function subjectLink(subject: string): string | null {
  const dg = (p: string) => href(directorGeneral, p);
  const member = staff.find((m) => m.email === subject);
  if (member) return dg(`admin-console/${member.id}`);
  // An issuing decision opens the credential it issued (LIC-2023-0044 → CRED/LIC/23/0044).
  const issued = subject.match(/^LIC-20(\d\d)-(\d{4})$/);
  const credential = issued ? entryDetails.find((d) => d.groups.some((g) => g.fields.some((f) => f.label === "Issuing decision" && f.value === subject))) : undefined;
  if (credential) return dg(`practitioner-register/${credential.id}`);
  const entry = entryDetails.find((d) => d.title.startsWith(subject + " "));
  if (entry) return dg(`practitioner-register/${entry.id}`);
  const matter = signoffDetails.find((d) => d.reference === subject);
  if (matter) return dg(`sign-off-queue/${matter.id}`);
  const app = applications.find((a) => a.title.startsWith(subject + " "));
  if (app) return dg(`application-review/${app.id}`);
  if (subject === "Sep 2026") return dg("revenue-reports") + "?period=2026-09";
  return null;
}
