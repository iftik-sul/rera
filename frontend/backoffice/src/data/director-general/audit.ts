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

const DG = "DG / Registrar";

export const auditEntries: AuditEntry[] = [
  // Figma had TRX-2024-00891 here — an item that is still undecided. The overturn the other screens show is Kano Homes' licence.
  a("aud-0901", "11 Oct 2026, 09:42", "Adaeze Nwosu", DG, "Decision overturned", "Override", "Licensing", "LIC-2023-0044", "Licence issued on a forged incorporation certificate"),
  // Figma: "Credential issued CRED/LIC/26/0412" — but the register shows it issued in January.
  a("aud-0900", "11 Oct 2026, 08:15", "Funke Adeyemi", "Licensing Officer", "Credential amended", "Decision", "Licensing", "CRED/LIC/26/0412", "Holder contact details updated"),
  a("aud-0898", "10 Oct 2026, 17:03", "Adaeze Nwosu", DG, "Role assigned", "Access", "Access", "b.adewale@rera.gov.ng", "State Liaison Coordinator"),
  // Figma: "Rejected" — the Work Queue shows TRX-2024-0858 as Returned.
  a("aud-0897", "10 Oct 2026, 14:20", "Chukwuemeka Obi", "C&E Auditor", "Returned for correction", "Decision", "Transaction", "TRX-2024-0858", "Title deed mismatch"),
  a("aud-0896", "10 Oct 2026, 11:48", "Amaka Okeke", "Revenue & Finance", "Schedule published", "Config", "Finance", "FEE-2026-v4", "—"),
  a("aud-0895", "10 Oct 2026, 09:05", "Adaeze Nwosu", DG, "Account suspended", "Access", "Access", "s.okon@rera.gov.ng", "Pending investigation"),
  // Figma: Funke Adeyemi on 09 Oct — the Entry Detail records the DG cancelling it on 11 Oct, after the overturn above.
  a("aud-0902", "11 Oct 2026, 09:44", "Adaeze Nwosu", DG, "Credential cancelled", "Override", "Licensing", "CRED/LIC/23/0044", "Overturn — OVR/2026/0044"),
  a("aud-0893", "09 Oct 2026, 13:10", "Adaeze Nwosu", DG, "Sign-off authorised", "Decision", "Sign-off", "RRA/SO/2026/0231", "Licence revocation — Kano Homes"),
  a("aud-0892", "09 Oct 2026, 10:22", "Ngozi Eze", "Licensing Authorizer", "Endorsed", "Decision", "Licensing", "LIC-2026-00398", "—"),
  a("aud-0890", "08 Oct 2026, 15:44", "Adaeze Nwosu", DG, "MFA reset", "Access", "Access", "y.abdullahi@rera.gov.ng", "Device lost"),
  // ── Beyond the Figma frame: sample entries for page 2 ──
  a("aud-0888", "08 Oct 2026, 11:30", "Ibrahim Musa", "Licensing Reviewer", "Recommended", "Decision", "Licensing", "LIC-2026-00412", "—"),
  a("aud-0886", "08 Oct 2026, 09:12", "Adaeze Nwosu", DG, "Revenue report exported", "Access", "Finance", "Sep 2026", "—"),
  a("aud-0884", "07 Oct 2026, 16:05", "Chukwuemeka Obi", "C&E Auditor", "Information requested", "Decision", "Escrow", "ESC-2024-0312", "Trustee confirmation letter missing"),
  a("aud-0881", "07 Oct 2026, 10:47", "Amaka Okeke", "Revenue & Finance", "Manual payment recorded", "Config", "Finance", "PAY-2026-01187", "Cash at the Lagos office"),
  a("aud-0879", "06 Oct 2026, 14:18", "Adaeze Nwosu", DG, "Account deactivated", "Access", "Access", "f.adebayo@rera.gov.ng", "Left the authority"),
  a("aud-0877", "06 Oct 2026, 09:55", "Funke Adeyemi", "Licensing Officer", "Escalated for sign-off", "Decision", "Licensing", "RRA/SO/2026/0218", "Licence lapsed; renewal window closed"),
  a("aud-0874", "05 Oct 2026, 15:31", "Adaeze Nwosu", DG, "Role assigned", "Access", "Access", "g.etim@rera.gov.ng", "Licensing Reviewer — Individual Practitioner Credentials"),
  a("aud-0871", "05 Oct 2026, 11:02", "Bola Ogunleye", "C&E Auditor", "Approved", "Decision", "Transaction", "TRX-2024-0887", "—"),
  a("aud-0868", "03 Oct 2026, 16:40", "Amaka Okeke", "Revenue & Finance", "Period marked Filed", "Config", "Finance", "Sep 2026", "VAT return submitted to FIRS"),
  a("aud-0865", "02 Oct 2026, 10:15", "Adaeze Nwosu", DG, "Account suspended", "Access", "Access", "t.bankole@rera.gov.ng", "Repeated failed sign-in"),
];

// Newest first.
const key = (t: string) => new Date(t.replace(",", "") + " UTC").getTime();
auditEntries.sort((x, y) => key(y.timestamp) - key(x.timestamp));

/** Date-range filter, against the sample "today" (11 Oct 2026). */
export function dateBucket(timestamp: string): string {
  const d = timestamp.slice(0, 11);
  if (d === "11 Oct 2026") return "Today";
  const days = Math.round((Date.UTC(2026, 9, 11) - key(d + ", 00:00")) / 86_400_000);
  return days <= 7 ? "Last 7 days" : "Earlier";
}
export const DATE_ORDER = ["Today", "Last 7 days", "Earlier"];

/** Where the subject opens, when that screen exists in the sample. */
export function subjectLink(subject: string): string | null {
  const dg = (p: string) => href(directorGeneral, p);
  const member = staff.find((m) => m.email === subject);
  if (member) return dg(`admin-console/${member.id}`);
  if (subject === "CRED/LIC/23/0044" || subject === "LIC-2023-0044") return dg("practitioner-register/cred-lic-23-0044");
  if (subject === "RRA/SO/2026/0218") return dg("sign-off-queue/rra-so-2026-0218");
  if (subject === "TRX-2024-0887") return dg("application-review/trx-decided");
  if (subject === "Sep 2026") return dg("revenue-reports") + "?period=2026-09";
  return null;
}
