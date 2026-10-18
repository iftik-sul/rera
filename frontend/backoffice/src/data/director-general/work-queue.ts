/**
 * Sample data for the DG Work Queue, copied from the Figma frames
 * "Work Queue — Transaction / Escrow / Licensing".
 * `opens` says what clicking the row does, matching the Figma prototype links:
 *   review:<id>  → Application Review page for that sample application
 *   blocker:<id> → a "you can't overturn this" pop-up on top of the queue
 * Rows without `opens` aren't linked in Figma, so they aren't clickable yet.
 *
 * Row counts: page 1 (the first 10 rows) is exactly the Figma frame. Every
 * queue carries exactly 20 open sample rows — two full pages of 10 — so pagination
 * can be used and every page looks the same (project-lead rule, 2026-10-18).
 * Each queue also holds a few DECIDED items, hidden until the Status filter
 * picks "Decided" (Work Queue spec §4c — the DG is the only role that sees them).
 * Rows after Figma's are marked below.
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
// Decided items: listed for the DG only, hidden until the Status filter picks "Decided" (spec §4c).
const APPROVED: Status = { label: "Approved", tone: "success" };
const REJECTED: Status = { label: "Rejected", tone: "error" };

/** Status filter value: Approved / Rejected group under "Decided"; everything else is its own label. */
export const statusFilterValue = (s: Status) => (s.label === "Approved" || s.label === "Rejected" ? "Decided" : s.label);
export const STATUS_ORDER = ["Awaiting Review", "Under Review", "Information Requested", "Returned", "Breaching SLA", "Decided"];

/** Age / SLA state filter value, from the colour the age is shown in. */
export const ageState = (a: Age) => (a.tone === "breach" ? "Breaching SLA" : a.tone === "warning" ? "Ageing" : "Within SLA");
export const AGE_ORDER = ["Within SLA", "Ageing", "Breaching SLA"];

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
  { reference: "TRX-2024-0887", service: "Register Resale", applicant: "Mixta Nigeria Ltd", subject: "Eko Atlantic Tower Unit 2304", status: APPROVED, age: { text: "Decided day 4", tone: "normal" }, opens: "review:trx-decided" }, // was "Information Requested" in Figma, but it opens the decided-item screen

  { reference: "TRX-2024-0882", service: "Register Initial Sale", applicant: "Brains & Hammers Ltd", subject: "Banana Island Plot C-05", status: UR, age: { text: "5 days", tone: "normal" }, opens: "blocker:not-decided" },
  { reference: "TRX-2024-0878", service: "Register Mortgage", applicant: "Lekki Gardens Estate Ltd", subject: "Lekki Phase 1 Villa 18", status: RET, age: { text: "12 days", tone: "warning" }, opens: "blocker:already-overturned" },
  { reference: "TRX-2024-0871", service: "Register Resale", applicant: "RevolutionPlus Property", subject: "Ikoyi Crescent Unit 801", status: UR, age: { text: "9 days", tone: "normal" }, opens: "blocker:not-an-application" },
  { reference: "TRX-2024-0865", service: "Register Initial Sale", applicant: "Palton Morgan Holdings", subject: "Maitama District Plot G-3", status: UR, age: { text: "2 days", tone: "normal" } },
  { reference: "TRX-2024-0858", service: "Register Mortgage", applicant: "Landwey Investment Ltd", subject: "Jabi Lake Tower B", status: RET, age: { text: "15 days", tone: "breach" } },
  { reference: "TRX-2024-0852", service: "Register Resale", applicant: "UPDC Plc", subject: "Ikeja GRA Block 4 Unit 12", status: IR, age: { text: "10 days", tone: "warning" } },
  // ── Beyond the Figma frame: sample rows for page 2 ──
  { reference: "TRX-2024-0849", service: "Register Initial Sale", applicant: "Cappa & D'Alberto Plc", subject: "Gwarinpa Estate Block 9 Unit 3", status: AR, age: { text: "1 day", tone: "normal" } },
  { reference: "TRX-2024-0846", service: "Register Mortgage", applicant: "Haven Homes Nigeria Ltd", subject: "Ajah Sangotedo Plot 114", status: UR, age: { text: "4 days", tone: "normal" } },
  { reference: "TRX-2024-0843", service: "Register Resale", applicant: "Bluestone Realty Ltd", subject: "Wuse II Crescent Flat 6B", status: IR, age: { text: "8 days", tone: "warning" } },
  { reference: "TRX-2024-0839", service: "Register Initial Sale", applicant: "Fola Bolu Developers", subject: "Ibeju-Lekki Coastal Plot 27", status: UR, age: { text: "2 days", tone: "normal" } },
  { reference: "TRX-2024-0836", service: "Register Mortgage", applicant: "Primewaterview Holdings", subject: "Ikoyi Bourdillon Tower Unit 1102", status: SLA, age: { text: "17 days", tone: "breach" } },
  { reference: "TRX-2024-0832", service: "Register Resale", applicant: "Northgate Properties Ltd", subject: "Kaduna GRA Villa 5", status: UR, age: { text: "6 days", tone: "normal" } },
  { reference: "TRX-2024-0829", service: "Register Initial Sale", applicant: "Sujimoto Construction", subject: "Banana Island Lucrezia Unit 4", status: AR, age: { text: "1 day", tone: "normal" } },
  { reference: "TRX-2024-0825", service: "Register Resale", applicant: "Eko Acres Ltd", subject: "Magodo Phase 2 Duplex 41", status: RET, age: { text: "11 days", tone: "warning" } },
  { reference: "TRX-2024-0821", service: "Register Mortgage", applicant: "Garden City Homes Ltd", subject: "Port Harcourt Trans-Amadi Plot 8", status: UR, age: { text: "3 days", tone: "normal" } },
  { reference: "TRX-2024-0818", service: "Register Initial Sale", applicant: "Abuja Prime Estates", subject: "Katampe Extension Plot 63", status: IR, age: { text: "9 days", tone: "warning" } },
  { reference: "TRX-2024-0814", service: "Register Resale", applicant: "Ocean Crest Realty", subject: "Oniru Waterfront Unit 7A", status: UR, age: { text: "5 days", tone: "normal" } },
  { reference: "TRX-2024-0811", service: "Register Mortgage", applicant: "Deluxe Homes Ibadan", subject: "Bodija Estate House 22", status: SLA, age: { text: "19 days", tone: "breach" } },
  { reference: "TRX-2024-0807", service: "Register Initial Sale", applicant: "Kano Heritage Developers", subject: "Nassarawa GRA Plot 15", status: AR, age: { text: "2 days", tone: "normal" } },
  // ── Decided items (hidden until Status → Decided) ──
  { reference: "TRX-2024-0796", service: "Register Initial Sale", applicant: "Victoria Crest Homes", subject: "Chevron Drive Terrace 12", status: APPROVED, age: { text: "Decided day 2", tone: "normal" } },
  { reference: "TRX-2024-0792", service: "Register Mortgage", applicant: "Enugu Royal Estates", subject: "Independence Layout Villa 9", status: REJECTED, age: { text: "Decided day 5", tone: "normal" } },
  { reference: "TRX-2024-0788", service: "Register Resale", applicant: "Atlantic Shores Ltd", subject: "Lekki Phase 2 Unit 14C", status: APPROVED, age: { text: "Decided day 3", tone: "normal" } },
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
  // ── Beyond the Figma frame: sample rows for page 2 ──
  { reference: "REF-ESC-1008", escrowFlag: RECEIVED, applicant: "Fidelity Trustees Ltd", subject: "Escrow Release — Block D, Gwarinpa", status: UR, age: { text: "2 days", tone: "normal" } },
  { reference: "REF-ESC-1009", escrowFlag: AWAIT_TRUSTEE, applicant: "Union Trustees Nigeria", subject: "New Escrow Account — Phase 2, Ibeju-Lekki", status: AR, age: { text: "4 days", tone: "normal" } },
  { reference: "REF-ESC-1010", escrowFlag: RECEIVED, applicant: "Coronation Trustees", subject: "Escrow Amendment — Tower A, Oniru", status: IR, age: { text: "10 days", tone: "warning" } },
  { reference: "REF-ESC-1011", escrowFlag: RECEIVED, applicant: "FBNQuest Trustees", subject: "Fund Release — Villa 3, Asokoro", status: UR, age: { text: "1 day", tone: "normal" } },
  { reference: "REF-ESC-1012", escrowFlag: AWAIT_TRUSTEE, applicant: "ARM Trustees Ltd", subject: "Escrow Setup — Block F, Katampe", status: UR, age: { text: "6 days", tone: "normal" } },
  { reference: "REF-ESC-1013", escrowFlag: RECEIVED, applicant: "Meristem Trustees", subject: "Escrow Closure — Unit 11, Ikeja GRA", status: AR, age: { text: "3 days", tone: "normal" } },
  { reference: "REF-ESC-1014", escrowFlag: AWAIT_TRUSTEE, applicant: "Greenwich Trustees", subject: "Escrow Review — Plot 40, Trans-Amadi", status: SLA, age: { text: "18 days", tone: "breach" } },
  { reference: "REF-ESC-1015", escrowFlag: RECEIVED, applicant: "Afrinvest Trustees", subject: "Fund Release — Block B, Maitama", status: UR, age: { text: "5 days", tone: "normal" } },
  { reference: "REF-ESC-1016", escrowFlag: RECEIVED, applicant: "Cardinalstone Trustees", subject: "Escrow Amendment — Phase 1, Jabi", status: IR, age: { text: "8 days", tone: "warning" } },
  { reference: "REF-ESC-1017", escrowFlag: AWAIT_TRUSTEE, applicant: "PAC Trustees Ltd", subject: "New Escrow Account — Estate C, Abijo", status: AR, age: { text: "2 days", tone: "normal" } },
  { reference: "REF-ESC-1018", escrowFlag: RECEIVED, applicant: "Chapel Hill Denham Trustees", subject: "Fund Release — Unit 9, Victoria Garden City", status: UR, age: { text: "4 days", tone: "normal" } },
  { reference: "REF-ESC-1019", escrowFlag: AWAIT_TRUSTEE, applicant: "Norrenberger Trustees", subject: "Escrow Setup — Phase 4, Lekki Gardens", status: AR, age: { text: "1 day", tone: "normal" } },
  { reference: "REF-ESC-1020", escrowFlag: RECEIVED, applicant: "Lotus Capital Trustees", subject: "Escrow Closure — Plot 18, Wuye", status: IR, age: { text: "11 days", tone: "warning" } },
  // ── Decided items (hidden until Status → Decided) ──
  { reference: "REF-ESC-0994", escrowFlag: RECEIVED, applicant: "Access Bank Trustees Ltd", subject: "Escrow Release — Plot 2, Lekki Phase 1", status: APPROVED, age: { text: "Decided day 3", tone: "normal" } },
  { reference: "REF-ESC-0991", escrowFlag: RECEIVED, applicant: "Zenith Trust Services", subject: "Escrow Closure — Block E, Banana Island", status: REJECTED, age: { text: "Decided day 4", tone: "normal" } },
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
  /** Filter only, never a column (Work Queue spec §3b). Derived from the service. */
  category: LicensingCategory;
  opens?: Opens;
};

/** The three licensing categories and which service belongs to which (licensing-categories.md §2). */
export type LicensingCategory = "Company Licensing & Permits" | "Individual Practitioner Credentials" | "Institutional Accreditation";
export const CATEGORY_ORDER: LicensingCategory[] = ["Company Licensing & Permits", "Individual Practitioner Credentials", "Institutional Accreditation"];
const categoryOf = (service: string): LicensingCategory =>
  /Practice Card/.test(service) ? "Individual Practitioner Credentials" : /Accreditation/.test(service) ? "Institutional Accreditation" : "Company Licensing & Permits";

const lic = (reference: string, applicant: string, service: string, submitted: string, atStage: string, claimedBy: string | null, opens?: Opens, status: Status = UR): LicensingRow => ({
  reference, applicant, service, status, submitted, atStage, claimedBy, category: categoryOf(service), opens,
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
  // ── Beyond the Figma frame: sample rows for page 2 ──
  lic("LIC-2026-00358", "Chidinma Okeke", "Issue Professional Practice Card", "1 day ago", "1 day", null),
  lic("LIC-2026-00355", "Royal Crest Facility Managers", "Real Estate Licensing Application", "3 days ago", "2 days", "Funke Adeyemi"),
  lic("LIC-2026-00351", "Abuja School of Estate Management", "Accreditation of Training Entities", "5 days ago", "5 hours", null),
  lic("LIC-2026-00347", "Ifeanyi Obi & Partners", "Real Estate Permit Application", "2 days ago", "1 day", null),
  lic("LIC-2026-00344", "Bolaji Adewale", "Amend Professional Practice Card", "6 days ago", "3 days", null),
  lic("LIC-2026-00340", "Delta Valuers Association", "Accreditation of Training Entities", "4 days ago", "2 hours", "Funke Adeyemi"),
  lic("LIC-2026-00337", "Cornerstone Realty Agents Ltd", "Real Estate Licensing Application", "11 days ago", "1 day", null),
  lic("LIC-2026-00333", "Musa Ibrahim", "Issue Professional Practice Card", "7 days ago", "2 days", null),
  lic("LIC-2026-00329", "Eastgate Property Developers", "Real Estate Permit Application", "3 days ago", "1 day", null),
  lic("LIC-2026-00326", "Kemi Adeyinka", "Cancel Professional Practice Card", "9 days ago", "4 hours", null),
  // ── Decided items (hidden until Status → Decided) ──
  lic("LIC-2026-00298", "Greenfield Developers Ltd", "Real Estate Licensing Application", "26 days ago", "—", null, undefined, APPROVED),
  lic("LIC-2026-00291", "Yemi Olatunji", "Issue Professional Practice Card", "27 days ago", "—", null, undefined, REJECTED),
  lic("LIC-2026-00286", "Lagos School of Valuation", "Accreditation of Training Entities", "29 days ago", "—", null, undefined, APPROVED),
];
