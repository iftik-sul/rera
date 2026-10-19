/**
 * Sample data for the DG Work Queue, copied from the Figma frames
 * "Work Queue — Transaction / Escrow / Licensing".
 * `opens` says what clicking the row does, matching the Figma prototype links:
 *   review:<id>  → Application Review page for that sample application
 * (Figma also linked three rows to the "you can't overturn this" pop-ups. Those guards fire on
 * the Overturn action, which is absent on such items, so they moved to the style guide — batch 6.)
 * Rows Figma didn't link open their own review, built from the row (reviews.ts), so no row is a
 * dead end. `reviewId` turns a reference into that review's page id.
 *
 * Row counts: page 1 (the first 10 rows) is exactly the Figma frame. Every
 * queue carries exactly 20 open sample rows — two full pages of 10 — so pagination
 * can be used and every page looks the same (project-lead rule, 2026-10-18).
 * Each queue also holds twelve or more DECIDED items. They are not open work: the page
 * shows them on the Completed side of the Open · Completed switch (Work Queue spec §4d).
 * `decidedAgo` (days before the sample "today") sets when each was decided; the review
 * built for the row reads the same value, so the list and the review agree.
 * Rows after Figma's are marked below.
 */
import type { Status } from "@/components/ui/Badge";
import { fmtTime } from "@/lib/dates";

/** `filter` = the table filters choosing the card applies (work-queue.md §1: "selecting one filters the table"). */
export type Kpi = { label: string; value: string; caption: string; filter?: Record<string, string> };
/** normal = grey, warning = amber (ageing), breach = red (past SLA) */
export type Age = { text: string; tone: "normal" | "warning" | "breach" };
export type Opens = `review:${string}`;

/** Page id of the review built for a row: "TRX-2024-0865" → "trx-2024-0865". */
export const reviewId = (reference: string) => reference.toLowerCase();
const linked = <T extends { reference: string; opens?: Opens }>(rows: T[]): T[] =>
  rows.map((r) => ({ ...r, opens: r.opens ?? (`review:${reviewId(r.reference)}` as Opens) }));

const UR: Status = { label: "Under Review", tone: "info" };
// Licensing Review Stage (KB status-badges.md §6): shown IN PLACE of the decision status while an
// item is in the chain. The DG's queue is stage 3, so its open rows read Under Final Sign-off —
// or Dissent Recorded, where the Authorizer dissented (the exception wins).
export const FINAL_SIGNOFF: Status = { label: "Under Final Sign-off", tone: "purple" };
export const DISSENT: Status = { label: "Dissent Recorded", tone: "orange" };
// "Awaiting Review" and "Breaching SLA" were local status words (status-badges §1 forbids them,
// 2026-10-19 review): a waiting item is Under Review, and a breach shows in the Age / SLA column.
const AR: Status = UR;
const IR: Status = { label: "Information Requested", tone: "warning" };
const RET: Status = { label: "Returned", tone: "warning" };
const SLA: Status = UR;
// Decided items: the Completed side of the switch (spec §4d).
const APPROVED: Status = { label: "Approved", tone: "success" };
/** RED #22 only — decided in the applicant's favour; the licence issues on payment (KB A-2 §9). */
const ACCEPTED: Status = { label: "Accepted", tone: "success" };
const REJECTED: Status = { label: "Rejected", tone: "error" };
/** Overturned by the DG: two badges, "Overturned" then the replacement outcome (status-badges.md §1). */
const OVERTURNED_REJECTED: Status = { label: "Rejected", tone: "error", overturned: true };

/** Approved / Rejected (and overturned) items are "Decided" — they belong on the Completed side. */
export const statusFilterValue = (s: Status) => (s.overturned || s.label === "Approved" || s.label === "Accepted" || s.label === "Rejected" ? "Decided" : s.label);
export const STATUS_ORDER = ["Under Review", "Information Requested", "Returned"];
export const isCompleted = (r: { status: Status }) => statusFilterValue(r.status) === "Decided";
/** Outcome filter on the Completed side. */
export const outcomeValue = (s: Status) => (s.overturned ? "Overturned" : s.label);
export const OUTCOME_ORDER = ["Approved", "Accepted", "Rejected", "Overturned"];

/** Age / SLA state filter value, from the colour the age is shown in. */
export const ageState = (a: Age) => (a.tone === "breach" ? "Breaching SLA" : a.tone === "warning" ? "Ageing" : "Within SLA");
export const AGE_ORDER = ["Within SLA", "Ageing", "Breaching SLA"];

/**
 * Claims and query history for the A-1 queues (work-queue.md §3–§4). Items with the applicant
 * are released, so they carry no claim. The DG holds the two its sample reviews open as "yours".
 */
const A1_CLAIMS: Record<string, string> = {
  "TRX-2024-0891": "Adaeze Nwosu", "TRX-2024-0882": "Chukwuemeka Obi", "TRX-2024-0871": "Bola Ogunleye",
  "TRX-2024-0846": "Chukwuemeka Obi", "TRX-2024-0832": "Bola Ogunleye", "TRX-2024-0821": "Adaeze Nwosu",
  "REF-ESC-1001": "Bola Ogunleye", "REF-ESC-1004": "Chukwuemeka Obi", "REF-ESC-1011": "Adaeze Nwosu", "REF-ESC-1015": "Bola Ogunleye",
};
/** Resubmitted items: round, and the days spent in earlier rounds (added to Total elapsed). */
const A1_RESUB: Record<string, { round: number; earlier: number }> = {
  "TRX-2024-0871": { round: 2, earlier: 7 }, "TRX-2024-0814": { round: 2, earlier: 6 }, "TRX-2024-0807": { round: 3, earlier: 11 },
  "REF-ESC-1008": { round: 2, earlier: 7 }, "REF-ESC-1018": { round: 2, earlier: 5 },
};
const dayCount = (a: Age) => parseInt(a.text, 10) || 0;
function a1<T extends { reference: string; status: Status; age: Age }>(rows: T[]): T[] {
  return rows.map((r) => {
    if (statusFilterValue(r.status) === "Decided") return r;
    const resub = A1_RESUB[r.reference];
    const withApplicant = r.status.label === "Information Requested" || r.status.label === "Returned";
    const total = dayCount(r.age) + (resub?.earlier ?? 0);
    return { ...r, claimedBy: withApplicant ? null : (A1_CLAIMS[r.reference] ?? null), resubmission: resub?.round, totalElapsed: `${total} ${total === 1 ? "day" : "days"}` };
  });
}
/** Most urgent deadline first (A-1, §1): past the window, then ageing, then the rest — oldest first in each. */
const URGENCY = { breach: 0, warning: 1, normal: 2 } as const;
export const byUrgency = (a: { age: Age }, b: { age: Age }) => URGENCY[a.age.tone] - URGENCY[b.age.tone] || dayCount(b.age) - dayCount(a.age);

/** The four A-1 triage cards (work-queue.md §1), counted from the open rows on screen. */
export function a1KpisFor(open: { age: Age; status: Status; claimedBy?: string | null }[]): Kpi[] {
  const inPool = open.filter((r) => r.status.label === "Under Review");
  return [
    { label: "Breaching deadline", value: String(open.filter((r) => r.age.tone === "breach").length), caption: "Past the service's window — act now", filter: { age: "Breaching SLA" } },
    { label: "Due soon", value: String(open.filter((r) => r.age.tone === "warning").length), caption: "Approaching the deadline", filter: { age: "Ageing" } },
    { label: "Waiting to be picked up", value: String(inPool.filter((r) => !r.claimedBy).length), caption: "Unclaimed in the pool", filter: { claimed: "Unclaimed", status: "Under Review" } },
    { label: "My open items", value: String(inPool.filter((r) => r.claimedBy === "Adaeze Nwosu").length), caption: "Claimed by you", filter: { claimed: "Claimed by you" } },
  ];
}

// ── Transaction ─────────────────────────────────────────────
// "Decided This Month" was dropped 2026-10-19: decided work lives on the Completed side (spec §4d), and §1 excludes it.
/** Counted from the rows (were hand-typed 38 / 24 / 11 / 7, which matched no row — 2026-10-19 review). */
export const transactionKpis: Kpi[] = [];

export type TransactionRow = {
  /** Who holds the item (claim-on-open, work-queue.md §4). null = in the pool. */
  claimedBy?: string | null;
  /** Round number when the item came back after Information Requested / Returned (G9). */
  resubmission?: number;
  /** Time since first submission, across query rounds — never resets (§3). */
  totalElapsed?: string;
  reference: string;
  service: string;
  applicant: string;
  subject: string;
  status: Status;
  age: Age;
  opens?: Opens;
  /** Decided items: how many days before the sample "today" the decision was recorded. */
  decidedAgo?: number;
};

export const transactionRows: TransactionRow[] = a1(linked([
  { reference: "TRX-2024-0891", service: "Register Initial Sale", applicant: "Adron Homes & Properties", subject: "Victoria Island Plot A-12", status: UR, age: { text: "3 days", tone: "normal" }, opens: "review:trx-undecided" },
  { reference: "TRX-2024-0887", service: "Register Resale", applicant: "Mixta Nigeria Ltd", subject: "Eko Atlantic Tower Unit 2304", status: APPROVED, age: { text: "Decided day 4", tone: "normal" }, opens: "review:trx-decided" }, // was "Information Requested" in Figma, but it opens the decided-item screen

  { reference: "TRX-2024-0882", service: "Register Initial Sale", applicant: "Brains & Hammers Ltd", subject: "Banana Island Plot C-05", status: UR, age: { text: "5 days", tone: "normal" } },
  // Figma: Returned, linked to the "already overturned" pop-up. It IS the overturned item now (overturned 05 Oct — audit aud-0875).
  { reference: "TRX-2024-0878", service: "Register Mortgage", applicant: "Lekki Gardens Estate Ltd", subject: "Lekki Phase 1 Villa 18", status: OVERTURNED_REJECTED, age: { text: "Decided day 3", tone: "normal" } },
  { reference: "TRX-2024-0871", service: "Register Resale", applicant: "RevolutionPlus Property", subject: "Ikoyi Crescent Unit 801", status: UR, age: { text: "9 days", tone: "normal" } },
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
  // Added in batch 6, when TRX-2024-0878 became decided — keeps 20 open rows (two full pages).
  { reference: "TRX-2024-0803", service: "Register Resale", applicant: "Skyview Properties Ltd", subject: "Wuse Zone 4 Unit 2C", status: UR, age: { text: "3 days", tone: "normal" } },
  // ── Decided items (the Completed side) ──
  { reference: "TRX-2024-0796", service: "Register Initial Sale", applicant: "Victoria Crest Homes", subject: "Chevron Drive Terrace 12", status: APPROVED, age: { text: "Decided day 2", tone: "normal" } },
  { reference: "TRX-2024-0792", service: "Register Mortgage", applicant: "Enugu Royal Estates", subject: "Independence Layout Villa 9", status: REJECTED, age: { text: "Decided day 5", tone: "normal" } },
  { reference: "TRX-2024-0788", service: "Register Resale", applicant: "Atlantic Shores Ltd", subject: "Lekki Phase 2 Unit 14C", status: APPROVED, age: { text: "Decided day 3", tone: "normal" } },
  // Added with the Completed side (2026-10-19) — enough history for two pages, spread over the year.
  { reference: "TRX-2024-0784", service: "Register Mortgage", applicant: "Homebase Mortgage Bank", subject: "Lekki Phase 1 Villa 31", status: APPROVED, age: { text: "Decided day 2", tone: "normal" }, decidedAgo: 1 },
  { reference: "TRX-2024-0779", service: "Register Resale", applicant: "Grenadines Homes Ltd", subject: "Ikoyi Banana Court Unit 5A", status: REJECTED, age: { text: "Decided day 4", tone: "normal" }, decidedAgo: 6 },
  { reference: "TRX-2024-0775", service: "Register Initial Sale", applicant: "Urban Shelter Ltd", subject: "Apo Resettlement Plot 21", status: APPROVED, age: { text: "Decided day 3", tone: "normal" }, decidedAgo: 18 },
  { reference: "TRX-2024-0770", service: "Register Mortgage", applicant: "Imperial Homes Mortgage Bank", subject: "Gbagada Phase 2 House 7", status: APPROVED, age: { text: "Decided day 5", tone: "normal" }, decidedAgo: 27 },
  { reference: "TRX-2024-0766", service: "Register Resale", applicant: "Elalan Constructions", subject: "Lekki County Homes Duplex 18", status: REJECTED, age: { text: "Decided day 2", tone: "normal" }, decidedAgo: 35 },
  { reference: "TRX-2024-0761", service: "Register Initial Sale", applicant: "Echostone Development", subject: "Ibeju-Lekki Coastal Plot 92", status: APPROVED, age: { text: "Decided day 4", tone: "normal" }, decidedAgo: 48 },
  { reference: "TRX-2024-0757", service: "Register Mortgage", applicant: "Abbey Mortgage Bank", subject: "Wuse II Crescent Flat 3C", status: APPROVED, age: { text: "Decided day 3", tone: "normal" }, decidedAgo: 74 },
  { reference: "TRX-2024-0752", service: "Register Resale", applicant: "Paramount Estates Ltd", subject: "Ikeja GRA Villa 11", status: REJECTED, age: { text: "Decided day 5", tone: "normal" }, decidedAgo: 130 },
  { reference: "TRX-2024-0748", service: "Register Initial Sale", applicant: "Royal Gardens Developers", subject: "Ajah Sangotedo Plot 205", status: APPROVED, age: { text: "Decided day 2", tone: "normal" }, decidedAgo: 320 },
]));

// ── Escrow ──────────────────────────────────────────────────
export const escrowKpis: Kpi[] = [];

export type EscrowRow = {
  /** Who holds the item (claim-on-open, work-queue.md §4). null = in the pool. */
  claimedBy?: string | null;
  /** Round number when the item came back after Information Requested / Returned (G9). */
  resubmission?: number;
  /** Time since first submission, across query rounds — never resets (§3). */
  totalElapsed?: string;
  reference: string;
  escrowFlag: Status;
  applicant: string;
  subject: string;
  status: Status;
  age: Age;
  opens?: Opens;
  /** Decided items: how many days before the sample "today" the decision was recorded. */
  decidedAgo?: number;
};

const RECEIVED: Status = { label: "Received", tone: "success" };
const AWAIT_TRUSTEE: Status = { label: "Awaiting Trustee", tone: "warning" };

export const escrowRows: EscrowRow[] = a1(linked([
  { reference: "REF-ESC-1001", escrowFlag: RECEIVED, applicant: "Access Bank Trustees Ltd", subject: "Escrow Release — Plot 7, Lekki Phase 1", status: UR, age: { text: "3 days", tone: "normal" } }, // Figma linked this to the TRANSACTION review; it opens its own escrow review
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
  // ── Decided items (the Completed side) ──
  { reference: "REF-ESC-0994", escrowFlag: RECEIVED, applicant: "Access Bank Trustees Ltd", subject: "Escrow Release — Plot 2, Lekki Phase 1", status: APPROVED, age: { text: "Decided day 3", tone: "normal" } },
  { reference: "REF-ESC-0991", escrowFlag: RECEIVED, applicant: "Zenith Trust Services", subject: "Escrow Closure — Block E, Banana Island", status: REJECTED, age: { text: "Decided day 4", tone: "normal" } },
  // Added with the Completed side (2026-10-19).
  { reference: "REF-ESC-0988", escrowFlag: RECEIVED, applicant: "Stanbic IBTC Trustees", subject: "Fund Release — Block A, Ikoyi", status: APPROVED, age: { text: "Decided day 2", tone: "normal" }, decidedAgo: 2 },
  { reference: "REF-ESC-0985", escrowFlag: RECEIVED, applicant: "First Bank Trust Co", subject: "New Escrow Account — Phase 1, Maitama", status: APPROVED, age: { text: "Decided day 3", tone: "normal" }, decidedAgo: 7 },
  { reference: "REF-ESC-0981", escrowFlag: RECEIVED, applicant: "UBA Trustees Nigeria", subject: "Escrow Amendment — Tower C, Eko Atlantic", status: REJECTED, age: { text: "Decided day 4", tone: "normal" }, decidedAgo: 16 },
  { reference: "REF-ESC-0978", escrowFlag: RECEIVED, applicant: "GTBank Trustee Division", subject: "Escrow Release — Plot 9, Victoria Island", status: APPROVED, age: { text: "Decided day 2", tone: "normal" }, decidedAgo: 24 },
  { reference: "REF-ESC-0974", escrowFlag: RECEIVED, applicant: "Fidelity Trustees Ltd", subject: "Escrow Closure — Block G, Gwarinpa", status: APPROVED, age: { text: "Decided day 5", tone: "normal" }, decidedAgo: 39 },
  { reference: "REF-ESC-0970", escrowFlag: RECEIVED, applicant: "Coronation Trustees", subject: "Fund Release — Tower B, Oniru", status: REJECTED, age: { text: "Decided day 3", tone: "normal" }, decidedAgo: 55 },
  { reference: "REF-ESC-0965", escrowFlag: RECEIVED, applicant: "ARM Trustees Ltd", subject: "Escrow Setup — Block D, Katampe", status: APPROVED, age: { text: "Decided day 4", tone: "normal" }, decidedAgo: 81 },
  { reference: "REF-ESC-0961", escrowFlag: RECEIVED, applicant: "Meristem Trustees", subject: "Escrow Release — Unit 4, Ikeja GRA", status: APPROVED, age: { text: "Decided day 2", tone: "normal" }, decidedAgo: 112 },
  { reference: "REF-ESC-0957", escrowFlag: RECEIVED, applicant: "Afrinvest Trustees", subject: "Escrow Amendment — Block C, Maitama", status: REJECTED, age: { text: "Decided day 5", tone: "normal" }, decidedAgo: 160 },
  { reference: "REF-ESC-0952", escrowFlag: RECEIVED, applicant: "Union Trustees Nigeria", subject: "New Escrow Account — Phase 1, Ibeju-Lekki", status: APPROVED, age: { text: "Decided day 3", tone: "normal" }, decidedAgo: 340 },
]));

// ── Licensing (stage 3 of 3) ────────────────────────────────
// Applicants checked against the Practitioner Register (2026-10-19 review): no stage-3 applicant
// already holds the credential it asks for or has a live sanction, so "No conflict / No
// sanctions: Valid" is true; individual credentials (Practice Cards) go to individuals.

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
/** Status filter order on the licensing queue (Open side): the stage badges. */
export const LICENSING_STATUS_ORDER = ["Under Final Sign-off", "Dissent Recorded"];
export const CATEGORY_ORDER: LicensingCategory[] = ["Company Licensing & Permits", "Individual Practitioner Credentials", "Institutional Accreditation"];
const categoryOf = (service: string): LicensingCategory =>
  /Practice Card/.test(service) ? "Individual Practitioner Credentials" : /Accreditation/.test(service) ? "Institutional Accreditation" : "Company Licensing & Permits";

/** When another officer took the claim — shown on the "already claimed" pop-up and the review. */
export const claimSince = (r: Pick<LicensingRow, "reference">) => {
  const n = parseInt(r.reference.slice(-3), 10);
  return `${fmtTime(8 + (n % 3), (n * 7) % 60, (n * 13) % 60)} today`;
};

const lic = (reference: string, applicant: string, service: string, submitted: string, atStage: string, claimedBy: string | null, opens?: Opens, status: Status = FINAL_SIGNOFF): LicensingRow => ({
  reference, applicant, service, status, submitted, atStage, claimedBy, category: categoryOf(service), opens,
});

export const licensingRows: LicensingRow[] = linked([
  // Submitted 28 Sep (its review chain); claimed by the DG, as its Application Review says. Figma had "2 days ago" and unclaimed.
  lic("LIC-2026-00412", "Sahara Estates Development Co", "Real Estate Licensing Application", "13 days ago", "11 days", "Adaeze Nwosu", "review:lic-stage3"),
  lic("LIC-2026-00369", "Zenith Realty Partners Ltd", "Real Estate Permit Application", "14 days ago", "1 day", "Funke Adeyemi"),
  lic("LIC-2026-00394", "Mainland Realty Consulting Ltd", "Real Estate Licensing Application", "9 days ago", "2 days", null, undefined, DISSENT),
  lic("LIC-2026-00398", "Lagos Institute of Property Studies", "Accreditation of Training Entities", "8 days ago", "2 days", "Funke Adeyemi"),
  lic("LIC-2026-00387", "Halima Danjuma", "Cancel Professional Practice Card", "12 days ago", "6 hours", null),
  lic("LIC-2026-00376", "Ifeoma Nnaji", "Issue Professional Practice Card", "4 days ago", "1 day", null),
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
  lic("LIC-2026-00340", "Niger Delta School of Valuation", "Accreditation of Training Entities", "4 days ago", "2 hours", "Funke Adeyemi"),
  lic("LIC-2026-00337", "Cornerstone Realty Agents Ltd", "Real Estate Licensing Application", "11 days ago", "1 day", null),
  lic("LIC-2026-00333", "Yakubu Danladi", "Issue Professional Practice Card", "7 days ago", "2 days", null),
  lic("LIC-2026-00329", "Eastgate Property Developers", "Real Estate Permit Application", "3 days ago", "1 day", null),
  lic("LIC-2026-00326", "Kemi Adeyinka", "Cancel Professional Practice Card", "9 days ago", "4 hours", null),
  // ── Decided items (the Completed side). Decided 6 days after submission (reviews.ts). ──
  lic("LIC-2026-00298", "Greenfield Developers Ltd", "Real Estate Licensing Application", "26 days ago", "—", null, undefined, ACCEPTED),
  lic("LIC-2026-00291", "Yemi Olatunji", "Issue Professional Practice Card", "27 days ago", "—", null, undefined, REJECTED),
  lic("LIC-2026-00286", "Lagos School of Valuation", "Accreditation of Training Entities", "29 days ago", "—", null, undefined, APPROVED),
  // Added with the Completed side (2026-10-19).
  lic("LIC-2026-00309", "Adebayo Ogundipe", "Issue Professional Practice Card", "8 days ago", "—", null, undefined, APPROVED),
  lic("LIC-2026-00305", "Crown Point Realtors Ltd", "Real Estate Permit Application", "15 days ago", "—", null, undefined, APPROVED),
  lic("LIC-2026-00279", "Ngozi Umeh", "Amend Professional Practice Card", "34 days ago", "—", null, undefined, APPROVED),
  lic("LIC-2026-00271", "Benin Estate Surveyors Ltd", "Real Estate Licensing Application", "45 days ago", "—", null, undefined, REJECTED),
  lic("LIC-2026-00262", "Kaduna Polytechnic (Estate Management)", "Accreditation of Training Entities", "63 days ago", "—", null, undefined, APPROVED),
  lic("LIC-2026-00248", "Seyi Bankole", "Issue Professional Practice Card", "90 days ago", "—", null, undefined, REJECTED),
  lic("LIC-2026-00231", "Oasis Homes & Realty", "Real Estate Permit Application", "128 days ago", "—", null, undefined, APPROVED),
  lic("LIC-2026-00214", "Chukwudi Eze", "Cancel Professional Practice Card", "171 days ago", "—", null, undefined, APPROVED),
  lic("LIC-2026-00196", "Lekki Realty Partners", "Real Estate Licensing Application", "360 days ago", "—", null, undefined, ACCEPTED),
]);

// Counted from the rows above, so the cards and the table can't disagree (Figma's said
// "Longest waiting 12 days" while three of its own rows had waited longer).
const openLic = licensingRows.filter((r) => statusFilterValue(r.status) !== "Decided");
const daysOf = (r: LicensingRow) => parseInt(r.submitted, 10);
/** The licensing cards, counted from whichever open rows are on screen (sample data + this session's changes). */
export function licensingKpisFor(open: LicensingRow[]): Kpi[] {
  const longest = [...open].sort((a, b) => daysOf(b) - daysOf(a))[0];
  return [
    { label: "Dissents to resolve", value: String(open.filter((r) => r.status.label === DISSENT.label).length), caption: "Authorizer disagreed", filter: { status: DISSENT.label } },
    { label: "Longest waiting", value: longest ? `${daysOf(longest)} days` : "—", caption: longest?.reference ?? "Nothing waiting" },
    { label: "Waiting to be picked up", value: String(open.filter((r) => !r.claimedBy).length), caption: "Unclaimed at your stage", filter: { claimed: "Unclaimed" } },
    { label: "My open items", value: String(open.filter((r) => r.claimedBy === "Adaeze Nwosu").length), caption: "Claimed by you", filter: { claimed: "Claimed by you" } },
  ];
}
export const licensingKpis: Kpi[] = licensingKpisFor(openLic);

/** "Claimed by" filter value for any queue row (cards "Waiting" and "My open items" choose it). */
export const claimedValue = (r: { claimedBy?: string | null }) => (!r.claimedBy ? "Unclaimed" : r.claimedBy === "Adaeze Nwosu" ? "Claimed by you" : "Claimed by others");
export const CLAIMED_ORDER = ["Unclaimed", "Claimed by you", "Claimed by others"];
/** Licensing: oldest first — no SLA, so first-come-first-served (work-queue.md §1). */
export const byOldest = (a: { submitted: string }, b: { submitted: string }) => (parseInt(b.submitted, 10) || 0) - (parseInt(a.submitted, 10) || 0);
