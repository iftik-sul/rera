/**
 * Sample applications for the DG Application Review page, copied from Figma:
 *   trx-undecided → "Application Review — Undecided (Perform)"
 *   trx-decided   → "Application Review — Decided item (Override)"
 *   lic-stage3    → "Application Review — Licensing (Stage 3, Perform)"
 * Pop-up wording comes from the matching M-DEC / M-GOV frames.
 * `toast` lines are not in Figma — they're the confirmation shown after
 * the action (Figma "Toast" component), written to match each outcome.
 */
import type { Status } from "@/components/ui/Badge";

export type Field = { label: string; value: string };
export type Doc = { name: string; type: string; uploaded: string; status: Status };
type Toast = { title: string; body: string };

type ReasonDialog = { title: string; body: string[]; label: string; placeholder: string; confirm: string; toast: Toast };

export type DecideActions = {
  /** Label on the request button: "Request additional information" on every queue (2026-10-19 review). */
  requestLabel: string;
  approve: { title: string; body: string[]; callout: string; toast: Toast; /** Confirm button; default "Approve and issue". */ confirm?: string; /** Pay-after service (RED #22): the decision records Accepted, the licence issues on payment (KB A-2 §9). */ outcome?: "Accepted" };
  request: ReasonDialog;
  return: ReasonDialog;
  reject: ReasonDialog & { callout: string };
};

export type OverrideActions = {
  recorded: { outcome: Status; decidedBy: string; role: string; recordedAt: string; reason: string };
  issued: Field[];
  bannerTitle: string;
  banner: string;
  footnote: string;
  overturn: { title: string; body: string; callout: string; label: string; placeholder: string; acknowledge: string };
  /** The step after re-authentication: revoke the output (Approved → Rejected) or issue it fresh (Rejected → Approved). */
  revoke: { title: string; body: string; callout: string; confirm: string; toast: Toast; variant?: "danger" | "primary" };
};

/** Why the decision bar is replaced by a notice (the item is with the applicant, or another officer holds it). */
export type Held = { tone: "warning" | "neutral"; title: string; body: string };

/** A guard on Approve / Reject (e.g. M-BLK-02: escrow item with no trustee assessment). */
export type DecideBlock = {
  title: string;
  body: string;
  helpTitle: string;
  help: string;
  /** Which decisions the guard stops. Default both; M-BLK-03 stops only an approval. */
  blocks?: ("approve" | "reject")[];
};

export type Queue = "transaction" | "escrow" | "licensing";

export type Application = {
  id: string;
  /** Which Work Queue tab the item belongs to (breadcrumb target). */
  queue: Queue;
  /** Top bar */
  title: string;
  subtitle: string;
  /** "Application Metadata" card */
  status: Status;
  metaSubtitle: string;
  meta: [Field, Field];
  /** Claim strip. `mine` = held by the DG (Release item shows); otherwise it is read-only for the DG. */
  claim?: { held: string; detail: string; mine?: boolean };
  /** Licensing only: "Review chain" card */
  chain?: {
    stages: { name: string; outcome: Status; recorded: string; reason: string }[];
    path: string;
    noticeTitle: string;
    notice: string;
  };
  summary: { title: string; fields: Field[] }[];
  documents: Doc[];
  checksTitle: string;
  checks: string[];
  /** Checks still waiting (shown as "Awaiting", and the card reads Attention instead of All Clear). */
  checksPending?: string[];
  /** What a pending check reads instead of "Awaiting" — "Unavailable" (M-BLK-01), "Not verified" (M-BLK-03). */
  checksPendingLabel?: string;
  /** A line under the checks explaining the state. */
  checksNote?: string;
  /** Escrow items only (application-review.md §5). */
  escrow?: { trustee: { received: boolean; summary: string; fields: Field[] }; account: Field[] };
  decide?: DecideActions;
  decideBlock?: DecideBlock;
  held?: Held;
  override?: OverrideActions;
};

export const verified: Status = { label: "Verified", tone: "success" };
export const pending: Status = { label: "Pending", tone: "warning" };
export const rejected: Status = { label: "Rejected", tone: "error" };
export const underReview: Status = { label: "Under Review", tone: "info" };
export const approved: Status = { label: "Approved", tone: "success" };

// Two transaction screens, one per Work Queue row that opens them (Figma reused one
// "Grandeur Properties / TRX-2024-00891" frame for both rows — corrected 2026-10-19).
export const summaryFor = (o: { entity: string; rc: string; contact: string; developer: string; project: string; unit: string; type: string; txn: string; price: string; fee: string; submitted?: string }): Application["summary"] => [
  {
    title: "Applicant information",
    fields: [
      { label: "Entity name", value: o.entity },
      { label: "CAC registration (RC)", value: o.rc },
      { label: "Contact", value: o.contact },
    ],
  },
  {
    title: "Property / project information",
    fields: [
      { label: "Developer", value: o.developer },
      { label: "Project", value: o.project },
      { label: "Unit / Plot", value: o.unit },
      { label: "Type", value: o.type },
    ],
  },
  {
    title: "Transaction details",
    fields: [
      { label: "Transaction type", value: o.txn },
      { label: "Sale price", value: o.price },
      { label: "Fee payable", value: o.fee },
      // The date the application was lodged (2026-10-19 review: transaction reviews showed none).
      ...(o.submitted ? [{ label: "Submitted", value: o.submitted }] : []),
    ],
  },
];

const adronSummary = summaryFor({
  entity: "Adron Homes & Properties", rc: "RC-20198", contact: "registry@adronhomes.ng",
  developer: "Adron Homes & Properties", project: "Victoria Island", unit: "Plot A-12", type: "Detached house",
  txn: "Initial Sale", price: "₦485,000,000", fee: "₦19,400,000", submitted: "8 Oct 2026",
});
const mixtaSummary = summaryFor({
  entity: "Mixta Nigeria Ltd", rc: "RC-114502", contact: "conveyancing@mixtanigeria.com",
  developer: "Eko Atlantic City Developers", project: "Eko Atlantic Tower", unit: "Unit 2304", type: "Apartment",
  txn: "Resale", price: "₦310,000,000", fee: "₦12,400,000", submitted: "28 Sep 2026",
});

const grandeurDocs: Doc[] = [
  { name: "Title Deed Copy", type: "PDF", uploaded: "8 Oct 2026", status: verified },
  { name: "Sale & Purchase Agreement", type: "PDF", uploaded: "8 Oct 2026", status: verified },
  { name: "Consent from Developer", type: "PDF", uploaded: "9 Oct 2026", status: pending },
  { name: "Passport / NIN Card", type: "Image", uploaded: "8 Oct 2026", status: verified },
];
/** TRX-2024-0887 was submitted on 28 Sep and decided on 2 Oct. */
const decidedDocs: Doc[] = grandeurDocs.map((d) => ({ ...d, uploaded: d.uploaded.startsWith("9") ? "29 Sep 2026" : "28 Sep 2026", status: verified }));

export const grandeurChecks = ["Developer registration", "Project registration", "Unit/plot registration", "Title deed status", "Applicant validity"];

/** The three hand-drawn reviews from Figma. Every other queue row gets a review built in reviews.ts. */
export const featuredApplications: Application[] = [
  {
    id: "trx-undecided",
    queue: "transaction",
    title: "TRX-2024-0891 — Register Initial Sale",
    subtitle: "Adron Homes & Properties",
    status: underReview,
    metaSubtitle: "Review details and current status",
    meta: [
      { label: "Output", value: "Title Deed" },
      { label: "SLA", value: "Day 3 of 5" },
    ],
    claim: { held: "Claimed by you", detail: "· since you opened it · lapses after 30 minutes of inactivity", mine: true },
    summary: adronSummary,
    documents: grandeurDocs,
    checksTitle: "Registry checks",
    checks: grandeurChecks,
    decide: {
      requestLabel: "Request additional information",
      approve: {
        title: "Approve and issue the Title Deed?",
        body: ["This issues the e-Title Deed to Adron Homes & Properties immediately. Issuance is instant and final."],
        callout: "There is no undo. The Title Deed is issued the moment you approve.",
        toast: { title: "Title Deed issued", body: "TRX-2024-0891 approved — the e-Title Deed has been sent to Adron Homes & Properties." },
      },
      request: {
        title: "Request additional information?",
        body: ["TRX-2024-0891 returns to Adron Homes & Properties and comes back to your queue when they respond."],
        label: "What does the applicant need to supply?",
        placeholder: "Name the document or detail that is missing.",
        confirm: "Send request",
        toast: { title: "Information requested", body: "TRX-2024-0891 has been sent back to Adron Homes & Properties." },
      },
      return: {
        title: "Return for correction?",
        body: ["TRX-2024-0891 goes back to Adron Homes & Properties for correction, and returns to your queue when resubmitted."],
        label: "What needs correcting?",
        placeholder: "Describe what the applicant must change before resubmitting.",
        confirm: "Return application",
        toast: { title: "Application returned", body: "TRX-2024-0891 has gone back to Adron Homes & Properties for correction." },
      },
      reject: {
        title: "Reject this application?",
        body: ["Adron Homes & Properties is refused and no Title Deed is issued. The applicant is told the outcome and your reason."],
        callout: "This decision is terminal, and it is appealable. It carries the same weight as an approval.",
        label: "Why is this application refused?",
        placeholder: "State the registry rule or check the application fails, in terms the applicant can act on.",
        confirm: "Reject application",
        toast: { title: "Application rejected", body: "TRX-2024-0891 — Adron Homes & Properties has been told the outcome and your reason." },
      },
    },
  },
  {
    id: "trx-decided",
    queue: "transaction",
    title: "TRX-2024-0887 — Register Resale",
    subtitle: "Mixta Nigeria Ltd",
    status: approved,
    metaSubtitle: "Review details and current status",
    meta: [
      { label: "Output", value: "Title Deed" },
      { label: "SLA", value: "Met — decided day 4 of 5" },
    ],
    summary: mixtaSummary,
    documents: decidedDocs,
    checksTitle: "Registry checks",
    checks: grandeurChecks,
    override: {
      recorded: {
        outcome: approved,
        decidedBy: "Chukwuemeka Obi",
        role: "Compliance & Escrow Auditor",
        recordedAt: "2 Oct 2026, 11:42",
        reason:
          "Registry checks returned clear on all five points; developer consent and the title deed copy were verified against the register. Approved for title deed issuance.",
      },
      issued: [
        { label: "Artefact", value: "e-Title Deed" },
        { label: "Reference", value: "RERA/TD/2026/04418" },
        { label: "Issued", value: "2 Oct 2026" },
        { label: "Delivered to", value: "Mixta Nigeria Ltd" },
      ],
      bannerTitle: "What an overturn will do to this item",
      banner:
        "The replacement outcome available here is Rejected. Overturning revokes e-Title Deed RERA/TD/2026/04418 and writes a revocation entry against it. The recorded decision above is not deleted — the item keeps both, in order, and from then on reads Rejected, marked Overturned. Overturned is terminal: no undo, and no second overturn.",
      footnote:
        "Requires re-authentication. The audit entry records the Director-General / Registrar with action type override — never the officer whose decision it replaces.",
      overturn: {
        title: "Overturn this decision?",
        body: "On record: TRX-2024-0887 — Register Resale, filed by Mixta Nigeria Ltd. Approved by Chukwuemeka Obi (Compliance & Escrow Auditor) on 2 Oct 2026.",
        callout:
          "Replacement outcome: Rejected. Overturning revokes e-Title Deed RERA/TD/2026/04418 and issues the rejection dated today. The item will then read Rejected, marked Overturned — final, with no undo and no second overturn.",
        label: "Why was this decision wrong?",
        placeholder: "Explain why the decision should not have been made — not simply that you would have decided differently.",
        acknowledge: "I understand this is final, that I'll re-authenticate to confirm, and that it's recorded against me as Director-General / Registrar.",
      },
      revoke: {
        title: "Revoke the issued Title Deed?",
        body: "This follows the rejection you just confirmed. The output issued under the original approval must now be revoked.",
        callout:
          "e-Title Deed RERA/TD/2026/04418, issued to Mixta Nigeria Ltd on 2 Oct 2026, will be revoked and a revocation entry written against it. Verification lookups will return that status from now on.",
        confirm: "Revoke title deed",
        toast: { title: "Decision overturned", body: "TRX-2024-0887 now reads Rejected, marked Overturned. e-Title Deed RERA/TD/2026/04418 has been revoked." },
      },
    },
  },
  {
    id: "lic-stage3",
    queue: "licensing",
    title: "LIC-2026-00412 — Real Estate Licensing Application",
    subtitle: "Stage 3 of 3 — accepting sends a notice; the licence issues on payment.",
    status: { label: "Under Final Sign-off", tone: "purple" }, // Review Stage badge, in place of the status (status-badges.md §6)
    metaSubtitle: "Sahara Estates Development Co · Company Licensing & Permits",
    meta: [
      { label: "Expected output", value: "Real Estate Developer Licence" },
      { label: "Review stage", value: "Stage 3 of 3 — Licensing & Registration Officer" },
    ],
    claim: { held: "Claimed by you", detail: "· since 11:46 today · lapses after 30 minutes of inactivity", mine: true },
    chain: {
      stages: [
        {
          name: "Stage 1 · Reviewer",
          outcome: { label: "Recommended Approval", tone: "success" },
          recorded: "Ibrahim Musa recorded this on 30 Sep 2026, 09:42.",
          reason: "Reason given: none required for a recommendation to approve. All five register checks passed.",
        },
        {
          name: "Stage 2 · Authorizer",
          outcome: { label: "Endorsed", tone: "success" },
          recorded: "Ngozi Eze recorded this on 30 Sep 2026, 11:18.",
          reason: "Reason given: none required for an endorsement. Reviewer's checks confirmed against the CAC record.",
        },
      ],
      path: "Stage 1 Reviewer ✓  →  Stage 2 Authorizer ✓  →  Stage 3 Final sign-off (you)",
      // RED #22 is paid after the decision (open-questions A12): nothing is issued at this stage.
      noticeTitle: "Accepting doesn't issue the licence yet.",
      notice: "A notice of acceptance goes to the applicant; the licence issues and the register is written when they pay. There is no undo.",
    },
    summary: [
      {
        title: "Applicant information",
        fields: [
          { label: "Entity name", value: "Sahara Estates Development Co" },
          { label: "CAC registration (RC)", value: "RC-482910" },
          { label: "Contact", value: "licensing@saharaestates.ng" },
        ],
      },
      {
        title: "Licence details",
        fields: [
          { label: "Credential sought", value: "Developer Licence" },
          { label: "Application reference", value: "LIC-2026-00412" },
          { label: "Submitted", value: "28 Sep 2026" },
          { label: "Category", value: "Company Licensing" },
        ],
      },
      {
        title: "Company standing",
        fields: [
          { label: "CAC status", value: "Active" },
          { label: "Directors verified", value: "3 of 3" },
          { label: "Last annual filing", value: "30 Jun 2026" },
        ],
      },
    ],
    documents: [
      { name: "Certificate of Incorporation (CAC)", type: "PDF", uploaded: "28 Sep 2026", status: verified },
      { name: "Board Resolution authorising portal use", type: "PDF", uploaded: "28 Sep 2026", status: verified },
      { name: "Company Letterhead", type: "PDF", uploaded: "28 Sep 2026", status: verified },
      { name: "Directors' NIN Verification", type: "PDF", uploaded: "28 Sep 2026", status: verified },
      { name: "Sector Accreditation Certificate", type: "PDF", uploaded: "29 Sep 2026", status: pending },
    ],
    checksTitle: "Company register check",
    checks: ["CAC registration valid", "Directors match CAC record", "No existing licence conflict", "No outstanding sanctions", "Tax clearance current"],
    decide: {
      requestLabel: "Request additional information",
      approve: {
        // RED #22 is paid after RERA's decision (KB A-2 §9, open-questions A12 resolved 2026-10-19).
        title: "Accept this application?",
        body: [
          "A notice of acceptance goes to Sahara Estates Development Co. The Real Estate Developer Licence issues — and its register entry is written — when they pay the licence fee, not now.",
          "Both prior stages recommended approval.",
        ],
        callout: "There is no undo. The application is accepted now; the licence follows payment.",
        confirm: "Accept application",
        outcome: "Accepted",
        toast: { title: "Application accepted", body: "LIC-2026-00412 — Sahara Estates Development Co has been sent a notice of acceptance. The licence issues when the fee is paid." },
      },
      request: {
        title: "Request additional information?",
        body: [
          "LIC-2026-00412 returns to Sahara Estates Development Co and re-enters the queue at Stage 1 when they respond.",
          "The review chain starts again from the Reviewer.",
        ],
        label: "What does the applicant need to supply?",
        placeholder: "Name the document or detail that is missing.",
        confirm: "Send request",
        toast: { title: "Information requested", body: "LIC-2026-00412 has been sent back to Sahara Estates Development Co." },
      },
      return: {
        title: "Return for correction?",
        body: [
          "LIC-2026-00412 goes back to Sahara Estates Development Co for correction, and re-enters at Stage 1 when resubmitted.",
          "The review chain starts again from the Reviewer.",
        ],
        label: "What needs correcting?",
        placeholder: "Describe what the applicant must change before resubmitting.",
        confirm: "Return application",
        toast: { title: "Application returned", body: "LIC-2026-00412 has gone back to Sahara Estates Development Co for correction." },
      },
      reject: {
        title: "Reject this application?",
        body: ["Sahara Estates Development Co is refused and no licence is issued. The applicant is told the outcome and your reason."],
        callout: "This decision is terminal, and it is appealable. It carries the same weight as an approval.",
        label: "Why is this application refused?",
        placeholder: "State the eligibility rule the application fails, in terms the applicant can act on.",
        confirm: "Reject application",
        toast: { title: "Application rejected", body: "LIC-2026-00412 — Sahara Estates Development Co has been told the outcome and your reason." },
      },
    },
  },
];

