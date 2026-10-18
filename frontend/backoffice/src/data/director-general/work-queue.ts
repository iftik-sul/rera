/**
 * Sample data for the DG Work Queue, copied from the Figma frames
 * "Work Queue — Transaction / Escrow / Licensing".
 * `opens` says what clicking the row does, matching the Figma prototype links:
 *   review:<id>  → Application Review page for that sample application
 *   blocker:<id> → a "you can't overturn this" pop-up on top of the queue
 * Rows without `opens` aren't linked in Figma, so they aren't clickable yet.
 */
import type { Status } from "@/components/ui/Badge";

export type Kpi = { label: string; value: string; caption: string };
/** normal = grey, warning = amber (ageing), breach = red (past SLA) */
export type Age = { text: string; tone: "normal" | "warning" | "breach" };
export type Opens = `review:${string}` | `blocker:${BlockerId}`;
export type BlockerId = "not-decided" | "already-overturned" | "not-an-application";

const UR: Status = { label: "Under Review", tone: "info" };
const AR: Status = { label: "Awaiting Review", tone: "info" };
const IR: Status = { label: "Information Requested", tone: "warning" };
const RET: Status = { label: "Returned", tone: "warning" };
const SLA: Status = { label: "Breaching SLA", tone: "error" };

// ── Transaction ─────────────────────────────────────────────
export const transactionKpis: Kpi[] = [
  { label: "Awaiting Review", value: "38", caption: "New submissions" },
  { label: "Under Review", value: "24", caption: "Assigned to reviewers" },
  { label: "Information Requested", value: "11", caption: "Waiting on applicants" },
  { label: "Decided This Month", value: "83", caption: "64 approved · 19 closed" },
  { label: "Breaching SLA", value: "7", caption: "Needs immediate attention" },
];

export type TransactionRow = {
  reference: string;
  service: string;
  applicant: string;
  subject: string;
  status: Status;
  age: Age;
  opens?: Opens;
};

export const transactionRows: TransactionRow[] = [
  { reference: "TRX-2024-0891", service: "Register Initial Sale", applicant: "Adron Homes & Properties", subject: "Victoria Island Plot A-12", status: UR, age: { text: "3 days", tone: "normal" }, opens: "review:trx-undecided" },
  { reference: "TRX-2024-0887", service: "Register Resale", applicant: "Mixta Nigeria Ltd", subject: "Eko Atlantic Tower Unit 2304", status: IR, age: { text: "7 days", tone: "warning" }, opens: "review:trx-decided" },
  { reference: "TRX-2024-0882", service: "Register Initial Sale", applicant: "Brains & Hammers Ltd", subject: "Banana Island Plot C-05", status: UR, age: { text: "5 days", tone: "normal" }, opens: "blocker:not-decided" },
  { reference: "TRX-2024-0878", service: "Register Mortgage", applicant: "Lekki Gardens Estate Ltd", subject: "Lekki Phase 1 Villa 18", status: RET, age: { text: "12 days", tone: "warning" }, opens: "blocker:already-overturned" },
  { reference: "TRX-2024-0871", service: "Register Resale", applicant: "RevolutionPlus Property", subject: "Ikoyi Crescent Unit 801", status: UR, age: { text: "9 days", tone: "normal" }, opens: "blocker:not-an-application" },
  { reference: "TRX-2024-0865", service: "Register Initial Sale", applicant: "Palton Morgan Holdings", subject: "Maitama District Plot G-3", status: UR, age: { text: "2 days", tone: "normal" } },
  { reference: "TRX-2024-0858", service: "Register Mortgage", applicant: "Landwey Investment Ltd", subject: "Jabi Lake Tower B", status: RET, age: { text: "15 days", tone: "breach" } },
  { reference: "TRX-2024-0852", service: "Register Resale", applicant: "UPDC Plc", subject: "Ikeja GRA Block 4 Unit 12", status: IR, age: { text: "10 days", tone: "warning" } },
];

// ── Escrow ──────────────────────────────────────────────────
export const escrowKpis: Kpi[] = [
  { label: "Awaiting Review", value: "9", caption: "New submissions" },
  { label: "Under Review", value: "6", caption: "Assigned to reviewers" },
  { label: "Information Requested", value: "2", caption: "Waiting on applicants" },
  { label: "Decided This Month", value: "14", caption: "64 approved · 19 closed" },
  { label: "Breaching SLA", value: "1", caption: "Needs immediate attention" },
];

export type EscrowRow = {
  reference: string;
  escrowFlag: Status;
  applicant: string;
  subject: string;
  status: Status;
  age: Age;
  opens?: Opens;
};

const RECEIVED: Status = { label: "Received", tone: "success" };
const AWAIT_TRUSTEE: Status = { label: "Awaiting Trustee", tone: "warning" };

export const escrowRows: EscrowRow[] = [
  { reference: "REF-ESC-1001", escrowFlag: RECEIVED, applicant: "Access Bank Trustees Ltd", subject: "Escrow Release — Plot 7, Lekki Phase 1", status: UR, age: { text: "3 days", tone: "normal" }, opens: "review:trx-undecided" },
  { reference: "REF-ESC-1002", escrowFlag: AWAIT_TRUSTEE, applicant: "Zenith Trust Services", subject: "New Escrow Account — Block A, Banana Island", status: AR, age: { text: "7 days", tone: "normal" } },
  { reference: "REF-ESC-1003", escrowFlag: RECEIVED, applicant: "GTBank Trustee Division", subject: "Escrow Amendment — Tower B, Victoria Island", status: IR, age: { text: "12 days", tone: "warning" } },
  { reference: "REF-ESC-1004", escrowFlag: RECEIVED, applicant: "First Bank Trust Co", subject: "Escrow Closure — Villa 12, Maitama", status: UR, age: { text: "1 day", tone: "normal" } },
  { reference: "REF-ESC-1005", escrowFlag: AWAIT_TRUSTEE, applicant: "UBA Trustees Nigeria", subject: "Escrow Setup — Phase 3, Eko Atlantic", status: UR, age: { text: "5 days", tone: "normal" } },
  { reference: "REF-ESC-1006", escrowFlag: RECEIVED, applicant: "Stanbic IBTC Trustees", subject: "Fund Release — Block C, Ikoyi", status: AR, age: { text: "9 days", tone: "normal" } },
  { reference: "REF-ESC-1007", escrowFlag: AWAIT_TRUSTEE, applicant: "Sterling Trust Services", subject: "Escrow Review — Unit 5, Jabi District", status: SLA, age: { text: "16 days", tone: "breach" } },
];

// ── Licensing (stage 3 of 3) ────────────────────────────────
export const licensingKpis: Kpi[] = [
  { label: "Dissents to resolve", value: "1", caption: "Authorizer disagreed" },
  { label: "Longest waiting", value: "12 days", caption: "LIC-2026-00387" },
  { label: "Waiting to be picked up", value: "2", caption: "Unclaimed at your stage" },
  { label: "My open items", value: "2", caption: "Claimed by you" },
];

export type LicensingRow = {
  reference: string;
  applicant: string;
  service: string;
  status: Status;
  submitted: string;
  atStage: string;
  /** null = unclaimed (shown as a grey dash) */
  claimedBy: string | null;
  opens?: Opens;
};

const lic = (reference: string, applicant: string, service: string, submitted: string, atStage: string, claimedBy: string | null, opens?: Opens): LicensingRow => ({
  reference, applicant, service, status: UR, submitted, atStage, claimedBy, opens,
});

export const licensingRows: LicensingRow[] = [
  lic("LIC-2026-00412", "Sahara Estates Development Co", "Real Estate Licensing Application", "2 days ago", "4 hours", null, "review:lic-stage3"),
  lic("LIC-2026-00369", "Zenith Realty Partners Ltd", "Real Estate Permit Application", "14 days ago", "1 day", "Funke Adeyemi"),
  lic("LIC-2026-00394", "Mainland Realty Consulting Ltd", "Real Estate Licensing Application", "9 days ago", "2 days", null),
  lic("LIC-2026-00398", "Lagos Institute of Property Studies", "Accreditation of Training Entities", "8 days ago", "1 day", "Funke Adeyemi"),
  lic("LIC-2026-00387", "Heritage Valuations & Surveyors", "Cancel Professional Practice Card", "12 days ago", "6 hours", null),
  lic("LIC-2026-00376", "Okafor & Sons Properties Ltd", "Issue Professional Practice Card", "4 days ago", "1 day", null),
  lic("LIC-2026-00381", "Amara Investments Ltd", "Accreditation of Training Entities", "7 days ago", "1 day", null),
  lic("LIC-2026-00374", "Pinnacle Realty Consulting Ltd", "Real Estate Licensing Application", "10 days ago", "3 hours", "Funke Adeyemi"),
  lic("LIC-2026-00368", "Tunde Akinwale", "Amend Professional Practice Card", "15 days ago", "1 day", null),
  lic("LIC-2026-00361", "Lagos Prime Holdings Plc", "Real Estate Permit Application", "16 days ago", "2 days", null),
];
