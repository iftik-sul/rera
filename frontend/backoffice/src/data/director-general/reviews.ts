/**
 * Every Work Queue row opens its own Application Review (no dead ends). The three
 * reviews Figma draws are in applications.ts; this file builds the rest from the
 * row itself, so each review shows that row's reference, applicant, subject and
 * status — and the state the KB gives the DG for that status:
 *
 *   Awaiting / Under Review / Breaching SLA → decision bar (perform, application-review.md §6)
 *   Information Requested / Returned        → read-only: it is with the applicant (work-queue.md §3)
 *   Approved / Rejected                     → Override panel (§6c)
 *   Licensing, claimed by another officer   → read-only (claim-on-open, §5b)
 *   Escrow, trustee assessment not received → Approve / Reject explain M-BLK-02 instead of acting
 *
 * Wording follows the hand-drawn reviews; only the facts change.
 */
import type { Status } from "@/components/ui/Badge";
import { SAMPLE_TODAY } from "@/data/sample-date";
import {
  featuredApplications,
  grandeurChecks,
  pending,
  summaryFor,
  verified,
  type Application,
  type DecideActions,
  type Doc,
  type Field,
  type OverrideActions,
} from "./applications";
import { freeCredential, registerEntries } from "./register";
import {
  escrowRows,
  licensingRows,
  reviewId,
  transactionRows,
  type Age,
  type EscrowRow,
  type LicensingCategory,
  type LicensingRow,
  type TransactionRow,
} from "./work-queue";

// ── Small helpers ───────────────────────────────────────────

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT = MONTHS.map((m) => m.slice(0, 3));

/** A date `days` before the sample "today". */
const before = (days: number) => new Date(SAMPLE_TODAY.getTime() - days * 86_400_000);
const dayMonYear = (d: Date) => `${d.getUTCDate()} ${SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const monDay = (d: Date) => `${SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`;
const longDate = (d: Date) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

/** Digits of a reference, used to vary sample figures deterministically. */
const seed = (ref: string) => parseInt(ref.replace(/\D/g, "").slice(-4), 10) || 1;
const naira = (n: number) => "₦" + n.toLocaleString("en-NG");
/** Mail-domain style name: "Zenith Realty Partners Ltd" → "zenithrealty". */
const slug = (s: string) =>
  s
    .replace(/&.*$/, "")
    .split(/\s+/)
    .filter((w) => !/^(Ltd|Plc|Co|Nigeria|Limited|Trust|Services|Division|Trustees|Partners|Investment|Holdings|Development)$/i.test(w))
    .slice(0, 2)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
const ageDays = (a: Age) => parseInt(a.text.replace(/\D/g, ""), 10) || 1;

const UR: Status = { label: "Under Review", tone: "info" };
const APPROVED: Status = { label: "Approved", tone: "success" };
const REJECTED: Status = { label: "Rejected", tone: "error" };
const isDecided = (s: Status) => s.label === "Approved" || s.label === "Rejected";
const slaState = (a: Age) => (a.tone === "breach" ? "Breaching SLA" : a.tone === "warning" ? "Ageing" : "Within SLA");

const AUDITORS = ["Chukwuemeka Obi", "Bola Ogunleye"];
const ACK = "I understand this is final, that I'll re-authenticate to confirm, and that it's recorded against me as Director-General / Registrar.";
const FOOTNOTE =
  "Requires re-authentication. The audit entry records the Director-General / Registrar with action type override — never the officer whose decision it replaces.";

// ── Shared building blocks for the three item types ─────────

type Output = { artefact: string; noun: string };

function decideActions(o: {
  ref: string;
  who: string;
  output: Output;
  requestLabel: string;
  issueLine: string;
  approveExtra?: string[];
  approveTitle?: string;
  approveConfirm?: string;
  approveToast?: { title: string; body: string };
  reEntry: string;
  rejectRule: string;
}): DecideActions {
  const { ref, who, output } = o;
  return {
    requestLabel: o.requestLabel,
    approve: {
      title: o.approveTitle ?? `Approve and issue the ${output.noun}?`,
      body: [o.issueLine, ...(o.approveExtra ?? [])],
      callout: `There is no undo. The ${output.noun} is issued the moment you approve.`,
      confirm: o.approveConfirm,
      toast: o.approveToast ?? { title: `${output.noun} issued`, body: `${ref} approved — the ${output.artefact} has been sent to ${who}.` },
    },
    request: {
      title: "Request additional information?",
      body: [`${ref} returns to ${who} and ${o.reEntry} when they respond.`],
      label: "What does the applicant need to supply?",
      placeholder: "Name the document or detail that is missing.",
      confirm: "Send request",
      toast: { title: "Information requested", body: `${ref} has been sent back to ${who}.` },
    },
    return: {
      title: "Return for correction?",
      body: [`${ref} goes back to ${who} for correction, and ${o.reEntry} when resubmitted.`],
      label: "What needs correcting?",
      placeholder: "Describe what the applicant must change before resubmitting.",
      confirm: "Return application",
      toast: { title: "Application returned", body: `${ref} has gone back to ${who} for correction.` },
    },
    reject: {
      title: "Reject this application?",
      body: [`${who} is refused and no ${output.noun} is issued. The applicant is told the outcome and your reason.`],
      callout: "This decision is terminal, and it is appealable. It carries the same weight as an approval.",
      label: "Why is this application refused?",
      placeholder: o.rejectRule,
      confirm: "Reject application",
      toast: { title: "Application rejected", body: `${ref} — ${who} has been told the outcome and your reason.` },
    },
  };
}

/**
 * Override panel for a decided item (application-review.md §6c).
 * Approved → Rejected revokes the output; Rejected → Approved issues it fresh, dated today.
 */
function overrideActions(o: {
  ref: string;
  title: string;
  who: string;
  output: Output;
  outcome: Status;
  decidedBy: string;
  role: string;
  decidedOn: Date;
  reason: string;
  issuedRef: string;
  /** For a credential: the register entry is withdrawn with cause "Overturn" (M-LIC-03). */
  credential?: boolean;
}): OverrideActions {
  const approved = o.outcome.label === "Approved";
  const when = dayMonYear(o.decidedOn);
  const recordedAt = `${when}, ${10 + (seed(o.ref) % 7)}:${String(seed(o.ref) % 60).padStart(2, "0")}`;
  const onRecord = `On record: ${o.title}, filed by ${o.who}. ${o.outcome.label} by ${o.decidedBy} (${o.role}) on ${when}.`;
  const credentialNote = o.credential ? " and withdraws the register entry, recording the cause as Overturn" : "";

  return {
    recorded: { outcome: o.outcome, decidedBy: o.decidedBy, role: o.role, recordedAt, reason: o.reason },
    issued: approved
      ? [
          { label: "Artefact", value: o.output.artefact },
          { label: "Reference", value: o.issuedRef },
          { label: "Issued", value: when },
          { label: "Delivered to", value: o.who },
        ]
      : [
          { label: "Artefact", value: "None — the application was refused" },
          { label: "On overturn", value: `${o.output.artefact} issued fresh, dated today` },
        ],
    bannerTitle: "What an overturn will do to this item",
    banner: approved
      ? `The replacement outcome available here is Rejected. Overturning revokes ${o.output.artefact} ${o.issuedRef}${credentialNote}. The recorded decision above is not deleted — the item keeps both, in order, and from then on reads Overturned · Rejected. Overturned is terminal: no undo, and no second overturn.`
      : `The replacement outcome available here is Approved. Overturning issues the ${o.output.artefact} to ${o.who} fresh, dated today — never backdated to the original decision. The recorded rejection above is not deleted, and the item then reads Overturned · Approved. Overturned is terminal: no undo, and no second overturn.`,
    footnote: FOOTNOTE,
    overturn: {
      title: "Overturn this decision?",
      body: onRecord,
      callout: approved
        ? `Replacement outcome: Rejected. Overturning revokes ${o.output.artefact} ${o.issuedRef} and issues the rejection dated today. The item will then read Overturned · Rejected — final, with no undo and no second overturn.`
        : `Replacement outcome: Approved. Overturning issues the ${o.output.artefact} dated today. The item will then read Overturned · Approved — final, with no undo and no second overturn.`,
      label: "Why was this decision wrong?",
      placeholder: "Explain why the decision should not have been made — not simply that you would have decided differently.",
      acknowledge: ACK,
    },
    revoke: approved
      ? {
          title: `Revoke the issued ${o.output.noun}?`,
          body: "This follows the rejection you just confirmed. The output issued under the original approval must now be revoked.",
          callout: `${o.output.artefact} ${o.issuedRef}, issued to ${o.who} on ${when}, will be revoked and a revocation entry written against it${
            o.credential ? ". The register entry is withdrawn with the cause recorded as Overturn, not forfeiture" : ". Verification lookups will return that status from now on"
          }.`,
          confirm: o.credential ? "Revoke credential" : `Revoke ${o.output.noun.toLowerCase()}`,
          toast: { title: "Decision overturned", body: `${o.ref} now reads Overturned · Rejected. ${o.output.artefact} ${o.issuedRef} has been revoked.` },
        }
      : {
          title: `Issue the ${o.output.noun} now?`,
          body: "This follows the approval you just confirmed. The output the original rejection withheld is issued now.",
          callout: `The ${o.output.artefact} is issued to ${o.who} dated today${o.credential ? ", and the register entry is written" : ""}. It is never backdated to ${when}.`,
          confirm: `Issue ${o.output.noun.toLowerCase()}`,
          variant: "primary",
          toast: { title: "Decision overturned", body: `${o.ref} now reads Overturned · Approved. The ${o.output.artefact} has been issued, dated today.` },
        },
  };
}

/** When (days ago) and why an item went back to the applicant, where the Audit Trail records it. */
const SENT_BACK: Record<string, { days: number; by: string; reason: string }> = {
  "TRX-2024-0858": { days: 1, by: "Chukwuemeka Obi", reason: "Title deed mismatch" }, // audit aud-0897
  "REF-ESC-1016": { days: 4, by: "Chukwuemeka Obi", reason: "Trustee confirmation letter missing" }, // audit aud-0884
};

/** Read-only notice for an item that is sitting with the applicant. */
function withApplicant(status: Status, ref: string, who: string, age: Age, i: number): Application["held"] {
  const known = SENT_BACK[ref];
  const since = dayMonYear(before(known?.days ?? Math.ceil(ageDays(age) / 2)));
  const by = known?.by ?? AUDITORS[i % 2];
  const reason = known ? ` Reason given: “${known.reason}”.` : "";
  return status.label === "Returned"
    ? {
        tone: "warning",
        title: "Returned to the applicant for correction",
        body: `${by} returned ${ref} to ${who} on ${since}.${reason} It comes back to the queue when they resubmit — nothing can be decided while it is with them.`,
      }
    : {
        tone: "warning",
        title: "Waiting on the applicant",
        body: `${by} requested additional information from ${who} on ${since}.${reason} The item comes back to the queue when they respond — nothing can be decided while it is with them.`,
      };
}

// ── Transaction items ───────────────────────────────────────

const UNIT = /^(.*?)\s((?:Plot|Unit|Villa|Block|Flat|Duplex|House|Terrace|Tower|Lucrezia)\b.*)$/;
function splitSubject(subject: string) {
  const m = subject.match(UNIT);
  return m ? { project: m[1], unit: m[2] } : { project: subject, unit: "—" };
}
function propertyType(unit: string) {
  if (/^Plot/.test(unit)) return "Land plot";
  if (/^(Unit|Flat|Tower|Block|Lucrezia)/.test(unit)) return "Apartment";
  if (/^Terrace/.test(unit)) return "Terraced house";
  if (/^Duplex/.test(unit)) return "Duplex";
  return "Detached house";
}
const isMortgage = (service: string) => /Mortgage/.test(service);
const trxOutput = (service: string): Output =>
  isMortgage(service) ? { artefact: "e-Certificate of Mortgage Registration", noun: "Mortgage Certificate" } : { artefact: "e-Title Deed", noun: "Title Deed" };

function trxDocs(service: string, uploaded: string, n: number): Doc[] {
  const second = isMortgage(service) ? "Mortgage Deed" : "Sale & Purchase Agreement";
  const third = isMortgage(service) ? "Lender's Offer Letter" : "Consent from Developer";
  return [
    { name: "Title Deed Copy", type: "PDF", uploaded, status: verified },
    { name: second, type: "PDF", uploaded, status: verified },
    { name: third, type: "PDF", uploaded, status: n % 3 === 0 ? pending : verified },
    { name: "Passport / NIN Card", type: "Image", uploaded, status: verified },
  ];
}

function transactionReview(row: TransactionRow, i: number): Application {
  const ref = row.reference;
  const who = row.applicant;
  const n = seed(ref);
  const output = trxOutput(row.service);
  const days = ageDays(row.age);
  const submitted = before(days);
  const { project, unit } = splitSubject(row.subject);
  const price = (90 + (n % 41) * 11) * 1_000_000;
  const decided = isDecided(row.status);
  const title = `${ref} — ${row.service}`;

  const app: Application = {
    id: reviewId(ref),
    queue: "transaction",
    title,
    subtitle: who,
    status: row.status,
    metaSubtitle: "Review details and current status",
    meta: [
      { label: "Output", value: output.noun },
      { label: "SLA", value: decided ? `Met — ${row.age.text.toLowerCase()}` : `${slaState(row.age)} — ${row.age.text} in the queue` },
    ],
    summary: summaryFor({
      entity: who,
      rc: `RC-${(100000 + n * 37).toString().slice(0, 6)}`,
      contact: `registry@${slug(who)}.ng`,
      developer: who,
      project,
      unit,
      type: propertyType(unit),
      txn: row.service.replace("Register ", ""),
      price: naira(price),
      fee: naira(price * 0.04),
    }).map((g) =>
      isMortgage(row.service) && g.title === "Transaction details"
        ? { ...g, fields: g.fields.map((f) => (f.label === "Sale price" ? { label: "Mortgage amount", value: f.value } : f)) }
        : g,
    ),
    documents: trxDocs(row.service, monDay(submitted), n),
    checksTitle: "Registry checks",
    checks: grandeurChecks,
  };

  if (decided) {
    const decidedOn = before(Math.max(1, 14 - (i % 5)));
    app.override = overrideActions({
      ref, title, who, output, outcome: row.status,
      decidedBy: AUDITORS[i % 2], role: "Compliance & Escrow Auditor", decidedOn,
      reason:
        row.status.label === "Approved"
          ? `Registry checks returned clear on all five points; the documents were verified against the register. Approved for ${output.noun.toLowerCase()} issuance.`
          : `The ${isMortgage(row.service) ? "lender's offer letter does not match the registered title holder" : "unit is not registered to the seller named in the agreement"}; the application cannot be registered as filed. Refused.`,
      issuedRef: `RERA/${isMortgage(row.service) ? "MC" : "TD"}/2026/0${4000 + (n % 900)}`,
    });
  } else if (row.status.label === "Information Requested" || row.status.label === "Returned") {
    app.held = withApplicant(row.status, ref, who, row.age, i);
  } else {
    app.decide = decideActions({
      ref, who, output, requestLabel: "Request Info",
      issueLine: `This issues the ${output.artefact} to ${who} immediately. Issuance is instant and final.`,
      reEntry: "comes back to your queue",
      rejectRule: "State the registry rule or check the application fails, in terms the applicant can act on.",
    });
  }
  return app;
}

// ── Escrow items ────────────────────────────────────────────

const DEVELOPERS = ["Adron Homes & Properties", "Mixta Nigeria Ltd", "Lekki Gardens Estate Ltd", "Landwey Investment Ltd", "Brains & Hammers Ltd", "Palton Morgan Holdings", "UPDC Plc"];

function escrowOutput(op: string): Output {
  if (/Release/.test(op)) return { artefact: "e-Certificate of Escrow Release", noun: "Release Authorisation" };
  if (/New Escrow Account|Setup/.test(op)) return { artefact: "e-Certificate of Escrow Account Approval", noun: "Account Approval" };
  if (/Amendment/.test(op)) return { artefact: "e-Certificate of Escrow Amendment", noun: "Amendment Approval" };
  if (/Closure/.test(op)) return { artefact: "e-Certificate of Escrow Closure", noun: "Closure Approval" };
  return { artefact: "e-Certificate of Escrow Review", noun: "Review Outcome" };
}

function escrowReview(row: EscrowRow, i: number): Application {
  const ref = row.reference;
  const who = row.applicant;
  const n = seed(ref);
  const [op, where = ""] = row.subject.split(" — ");
  const output = escrowOutput(op);
  const developer = DEVELOPERS[n % DEVELOPERS.length];
  const days = ageDays(row.age);
  const submitted = before(days);
  const received = row.escrowFlag.label === "Received";
  const releasing = /Release/.test(op);
  const amount = (25 + (n % 23) * 7) * 1_000_000;
  const balance = amount * 3 + (n % 9) * 1_250_000;
  const decided = isDecided(row.status);
  const title = `${ref} — ${op}`;
  const accountNo = `ESC-${2026}-${String(400 + (n % 500)).padStart(4, "0")}`;
  const assessed = before(Math.max(1, days - 1));

  const app: Application = {
    id: reviewId(ref),
    queue: "escrow",
    title,
    subtitle: who,
    status: row.status,
    metaSubtitle: "Escrow / trust-account item · review details and current status",
    meta: [
      { label: "Output", value: output.noun },
      { label: "SLA", value: decided ? `Met — ${row.age.text.toLowerCase()}` : `${slaState(row.age)} — ${row.age.text} in the queue` },
    ],
    summary: [
      {
        title: "Trustee information",
        fields: [
          { label: "Trustee institution", value: who },
          { label: "Trustee licence", value: `FTI-TR-${String(100 + (n % 80)).padStart(3, "0")}` },
          { label: "Contact", value: `escrow@${slug(who)}.ng` },
        ],
      },
      {
        title: "Project / escrow account",
        fields: [
          { label: "Developer", value: developer },
          { label: "Project", value: where },
          { label: "Escrow account", value: accountNo },
        ],
      },
      {
        title: "Request details",
        fields: [
          { label: "Request type", value: op },
          { label: "Amount", value: releasing ? naira(amount) : "—" },
          { label: "Submitted", value: dayMonYear(submitted) },
        ],
      },
    ],
    documents: [
      { name: "Developer's request letter", type: "PDF", uploaded: monDay(submitted), status: verified },
      { name: "Escrow account statement", type: "PDF", uploaded: monDay(submitted), status: verified },
      { name: "Authorised signatories list", type: "PDF", uploaded: monDay(submitted), status: n % 2 ? verified : pending },
      ...(releasing ? [{ name: "Construction progress certificate", type: "PDF", uploaded: monDay(submitted), status: verified }] : []),
    ],
    checksTitle: "Registry & escrow checks",
    checks: ["Developer registration", "Project registration", "Escrow account registered", "Account-movement audit", "Signatory verification", "Trustee assessment review"],
    checksPending: received ? undefined : ["Trustee assessment review"],
    escrow: {
      trustee: received
        ? {
            received: true,
            summary: "Recommends approval",
            fields: [
              { label: "Received", value: dayMonYear(assessed) },
              { label: "Assessed by", value: who },
              { label: "Report", value: `TA/2026/${String(n).padStart(4, "0")}` },
            ],
          }
        : {
            received: false,
            summary: "Not yet received",
            fields: [
              { label: "Requested from", value: who },
              { label: "Requested", value: dayMonYear(submitted) },
            ],
          },
      account: [
        { label: "Account", value: accountNo },
        { label: "Held at", value: who },
        { label: "Balance", value: naira(balance) },
        { label: "Last movement", value: `${dayMonYear(before(days + 6))} · deposit` },
        { label: "Account status", value: /Closure/.test(op) && decided && row.status.label === "Approved" ? "Closed" : "Active" },
      ],
    },
  };

  if (decided) {
    app.override = overrideActions({
      ref, title, who, output, outcome: row.status,
      decidedBy: AUDITORS[(i + 1) % 2], role: "Compliance & Escrow Auditor", decidedOn: before(10 + (i % 4)),
      reason:
        row.status.label === "Approved"
          ? "Trustee assessment recommends approval; account movements reconcile to the statement and both signatories were verified. Approved."
          : "Account movements do not reconcile to the trustee's statement and one signatory is not on the mandate. Refused.",
      issuedRef: `RERA/ESC/2026/0${3100 + (n % 800)}`,
    });
  } else if (row.status.label === "Information Requested" || row.status.label === "Returned") {
    app.held = withApplicant(row.status, ref, who, row.age, i);
  } else {
    app.decide = decideActions({
      ref, who, output, requestLabel: "Request Info",
      issueLine: `This issues the ${output.artefact} to ${who} immediately${releasing ? `, authorising release of ${naira(amount)} from ${accountNo}` : ""}. Issuance is instant and final.`,
      reEntry: "comes back to your queue",
      rejectRule: "State the escrow check the request fails, in terms the trustee can act on.",
    });
    if (!received) {
      // M-BLK-02 (modals.md §8): explain, don't silently disable.
      app.decideBlock = {
        title: "The trustee's assessment hasn't arrived",
        body: `${who} hasn't forwarded its assessment of ${ref}. An escrow item can't be approved or rejected without it.`,
        helpTitle: "What would unblock this",
        help: "The decision opens as soon as the trustee's assessment is received. You can still request information or return the item now.",
      };
    }
  }
  return app;
}

// ── Licensing items (stage 3 of 3) ──────────────────────────

const REVIEWER: Record<LicensingCategory, string> = {
  "Company Licensing & Permits": "Ibrahim Musa",
  "Individual Practitioner Credentials": "Ibrahim Musa",
  "Institutional Accreditation": "Halima Garba",
};
const AUTHORIZER: Record<LicensingCategory, string> = {
  "Company Licensing & Permits": "Ngozi Eze",
  "Individual Practitioner Credentials": "Ngozi Eze",
  "Institutional Accreditation": "Ngozi Eze",
};
/** Stage-2 times the Audit Trail records: [days ago, hour, minute]. */
const ENDORSED_AT: Record<string, [number, number, number]> = { "LIC-2026-00398": [2, 10, 22] }; // audit aud-0892
/** The one stage-2 dissent behind the "Dissents to resolve" card. */
const DISSENT_REF = "LIC-2026-00394";

const SHORT_CATEGORY: Record<LicensingCategory, string> = {
  "Company Licensing & Permits": "Company Licensing",
  "Individual Practitioner Credentials": "Practitioner Credentials",
  "Institutional Accreditation": "Institutional Accreditation",
};

/** The existing practice card for an amend / cancel request: the register entry if there is one. */
const existingCard = (holder: string, n: number) =>
  registerEntries.find((e) => e.holder === holder)?.credentialNo ?? freeCredential("PCC", "25", n);

function licensingShape(row: LicensingRow) {
  const s = row.service;
  const n = seed(row.reference);
  if (/Accreditation/.test(s)) {
    const output: Output = { artefact: "Accreditation Certificate", noun: "Accreditation Certificate" };
    return {
      output,
      kind: "institution" as const,
      groups: [
        { title: "Applicant information", fields: [
          { label: "Institution", value: row.applicant },
          { label: "Registration no.", value: `RC-${(300000 + n * 41).toString().slice(0, 6)}` },
          { label: "Contact", value: `registrar@${slug(row.applicant)}.edu.ng` },
        ] },
        { title: "Accreditation details", fields: [
          { label: "Accreditation sought", value: "Training entity accreditation" },
          { label: "Application reference", value: row.reference },
          { label: "Submitted", value: dayMonYear(before(parseInt(row.submitted, 10) || 1)) },
          { label: "Category", value: SHORT_CATEGORY[row.category] },
        ] },
        { title: "Institutional standing", fields: [
          { label: "Programmes offered", value: String(2 + (n % 4)) },
          { label: "Faculty verified", value: `${4 + (n % 5)} of ${4 + (n % 5)}` },
          { label: "Accreditation meeting", value: "Held — outcome recorded" },
        ] },
      ],
      docs: ["Certificate of Registration", "Curriculum Document", "Faculty List and CVs", "Facilities Report"],
      checksTitle: "Institution register check",
      checks: ["Registration valid", "Curriculum approved", "Faculty credentials verified", "No existing accreditation conflict", "No outstanding sanctions"],
      issueLine: `This issues the Accreditation Certificate to ${row.applicant} immediately, and writes the entry to the National Practitioner Register.`,
    };
  }
  if (/Practice Card/.test(s)) {
    const card = existingCard(row.applicant, n);
    const cancel = /Cancel/.test(s);
    const amend = /Amend/.test(s);
    const output: Output = cancel
      ? { artefact: `Practice Card ${card} cancellation`, noun: "Cancellation" }
      : amend
        ? { artefact: "Amended Professional Practice Card", noun: "Amended Practice Card" }
        : { artefact: "Professional Practice Card", noun: "Practice Card" };
    return {
      output,
      kind: "practitioner" as const,
      card: cancel || amend ? card : undefined,
      cancel,
      groups: [
        { title: "Applicant information", fields: /Ltd|Plc|&|Associates|Partners/.test(row.applicant)
          ? [
              // A firm holding a practice card (e.g. a valuation practice).
              { label: "Firm name", value: row.applicant },
              { label: "CAC registration (RC)", value: `RC-${(500000 + n * 29).toString().slice(0, 6)}` },
              { label: "Contact", value: `practice@${slug(row.applicant)}.ng` },
            ]
          : [
              { label: "Name", value: row.applicant },
              { label: "NIN", value: `•••••••${String(1000 + (n % 9000))}` },
              { label: "Contact", value: `${slug(row.applicant)}@mail.ng` },
            ] },
        { title: "Credential details", fields: [
          { label: "Request", value: cancel ? "Cancel practice card" : amend ? "Amend practice card" : "Issue practice card" },
          ...(cancel || amend ? [{ label: "Existing card", value: card }] : []),
          { label: "Application reference", value: row.reference },
          { label: "Submitted", value: dayMonYear(before(parseInt(row.submitted, 10) || 1)) },
          { label: "Category", value: SHORT_CATEGORY[row.category] },
        ] },
        { title: "Professional standing", fields: [
          { label: "Professional body", value: n % 2 ? "NIESV" : "ESVARBON" },
          { label: "Membership no.", value: `M-${String(2000 + (n % 7000))}` },
          { label: "Membership", value: "Current" },
        ] },
      ],
      docs: cancel
        ? ["Cancellation Request Letter", "Current Practice Card", "NIN Verification Slip"]
        : amend
          ? ["Evidence of Change", "Current Practice Card", "NIN Verification Slip", "Passport Photograph"]
          : ["Professional Certificate", "Membership Confirmation", "NIN Verification Slip", "Passport Photograph"],
      checksTitle: "Practitioner register check",
      checks: cancel
        ? ["Identity (NIN) verified", "Card on the register", "Request made by the holder", "No pending sanction on the card", "No outstanding fees"]
        : ["Identity (NIN) verified", "Professional body membership current", amend ? "Card on the register" : "No existing card conflict", "No outstanding sanctions", "Qualifications verified"],
      issueLine: cancel
        ? `This cancels Practice Card ${card} for ${row.applicant} immediately and withdraws the register entry, recording the cause as Cancellation at the holder's request.`
        : `This issues the ${output.artefact} to ${row.applicant} immediately, and ${amend ? "updates" : "writes"} the entry ${amend ? "on" : "to"} the National Practitioner Register.`,
    };
  }
  const permit = /Permit/.test(s);
  const output: Output = permit ? { artefact: "Real Estate Permit", noun: "Permit" } : { artefact: "Real Estate Licence", noun: "Licence" };
  return {
    output,
    kind: "company" as const,
    groups: [
      { title: "Applicant information", fields: [
        { label: "Entity name", value: row.applicant },
        { label: "CAC registration (RC)", value: `RC-${(400000 + n * 53).toString().slice(0, 6)}` },
        { label: "Contact", value: `licensing@${slug(row.applicant)}.ng` },
      ] },
      { title: permit ? "Permit details" : "Licence details", fields: [
        { label: "Credential sought", value: output.artefact },
        { label: "Application reference", value: row.reference },
        { label: "Submitted", value: dayMonYear(before(parseInt(row.submitted, 10) || 1)) },
        { label: "Category", value: SHORT_CATEGORY[row.category] },
      ] },
      { title: "Company standing", fields: [
        { label: "CAC status", value: "Active" },
        { label: "Directors verified", value: `${2 + (n % 3)} of ${2 + (n % 3)}` },
        { label: "Last annual filing", value: "30 Jun 2026" },
      ] },
    ],
    docs: ["Certificate of Incorporation (CAC)", "Board Resolution authorising portal use", "Company Letterhead", "Directors' NIN Verification", ...(permit ? ["Project Approval Letter"] : [])],
    checksTitle: "Company register check",
    checks: ["CAC registration valid", "Directors match CAC record", "No existing licence conflict", "No outstanding sanctions", "Tax clearance current"],
    issueLine: `This issues the ${output.artefact} to ${row.applicant} immediately, and writes the entry to the National Practitioner Register.`,
  };
}

const at = (d: Date, h: number, m: number) => `${longDate(d)} at ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

function licensingReview(row: LicensingRow, i: number): Application {
  const ref = row.reference;
  const who = row.applicant;
  const n = seed(ref);
  const shape = licensingShape(row);
  const daysIn = parseInt(row.submitted, 10) || 1;
  const s1 = before(Math.max(1, daysIn - 2));
  const known = ENDORSED_AT[ref];
  const s2 = before(known ? known[0] : Math.max(0, daysIn - 4));
  const decided = isDecided(row.status);
  const dissent = ref === DISSENT_REF;
  const reviewer = REVIEWER[row.category];
  const authorizer = AUTHORIZER[row.category];

  const stages: NonNullable<Application["chain"]>["stages"] = [
    {
      name: "Stage 1 · Reviewer",
      outcome: { label: "Recommended Approval", tone: "success" },
      recorded: `${reviewer} recorded this on ${at(s1, 9 + (n % 3), (n * 7) % 60)}.`,
      reason: "Reason given: none required for a recommendation to approve. All five register checks passed.",
    },
    dissent
      ? {
          name: "Stage 2 · Authorizer",
          outcome: { label: "Dissented", tone: "warning" },
          recorded: `${authorizer} recorded this on ${at(s2, 11, (n * 3) % 60)}.`,
          reason: "Reason given: the professional indemnity cover lapses in five weeks; the licence should not issue until it is renewed.",
        }
      : {
          name: "Stage 2 · Authorizer",
          outcome: { label: "Endorsed", tone: "success" },
          recorded: `${authorizer} recorded this on ${at(s2, known ? known[1] : 11, known ? known[2] : (n * 3) % 60)}.`,
          reason: "Reason given: none required for an endorsement. Reviewer's checks confirmed against the register.",
        },
  ];
  if (decided) {
    stages.push({
      name: "Stage 3 · Officer",
      outcome: row.status,
      recorded: `Funke Adeyemi recorded this on ${at(before(daysIn - 6), 14, (n * 11) % 60)}.`,
      reason: row.status.label === "Approved" ? "Reason given: none required for an approval." : "Reason given: the qualifying certificate could not be verified with the issuing body.",
    });
  }

  const claimedByOther = !decided && row.claimedBy && row.claimedBy !== "Adaeze Nwosu";
  const app: Application = {
    id: reviewId(ref),
    queue: "licensing",
    title: `${ref} — ${row.service}`,
    subtitle: decided
      ? `Decided at Stage 3 — ${row.status.label}`
      : claimedByOther
        ? `Stage 3 of 3 — claimed by ${row.claimedBy}`
        : "Stage 3 of 3 — your decision issues the outcome.",
    status: decided ? row.status : UR,
    metaSubtitle: `${who} · ${row.category}`,
    meta: [
      { label: "Expected output", value: shape.output.artefact },
      { label: "Review stage", value: decided ? "Decided — Stage 3" : "Stage 3 of 3 — Awaiting Final Sign-off" },
    ],
    claim: decided
      ? undefined
      : claimedByOther
        ? { held: `Claimed by ${row.claimedBy}`, detail: "· Licensing & Registration Officer · read-only for you", mine: false }
        : { held: "Claimed by you", detail: "· since you opened it · lapses after 30 minutes of inactivity", mine: true },
    chain: {
      stages,
      path: decided
        ? `Stage 1 Reviewer ✓  →  Stage 2 Authorizer ✓  →  Stage 3 Officer — ${row.status.label}`
        : `Stage 1 Reviewer ✓  →  Stage 2 Authorizer ${dissent ? "✗ dissent" : "✓"}  →  Stage 3 Final sign-off (${claimedByOther ? row.claimedBy : "you"})`,
      noticeTitle: decided
        ? "This item is decided."
        : dissent
          ? "The Authorizer dissented — your decision settles it."
          : shape.kind === "practitioner" && "cancel" in shape && shape.cancel
            ? "Approving cancels the card immediately."
            : `Approving issues the ${shape.output.noun.toLowerCase()} immediately.`,
      notice: decided
        ? "It can't be decided again; an overturn replaces the decision and keeps it on record."
        : dissent
          ? "Both positions are on record. A dissent doesn't block — the item reaches you carrying both."
          : "The register is written at this stage and there is no undo.",
    },
    summary: shape.groups,
    documents: shape.docs.map((d, k) => ({ name: d, type: "PDF", uploaded: monDay(before(daysIn - (k > 2 ? 1 : 0))), status: k === shape.docs.length - 1 && n % 2 && !decided ? pending : verified })),
    checksTitle: shape.checksTitle,
    checks: shape.checks,
  };

  const cancel = "cancel" in shape && shape.cancel;
  if (decided) {
    app.override = overrideActions({
      ref, title: app.title, who, output: shape.output, outcome: row.status,
      decidedBy: "Funke Adeyemi", role: "Licensing & Registration Officer", decidedOn: before(daysIn - 6),
      reason: stages[2].reason.replace("Reason given: ", ""),
      issuedRef: freeCredential(shape.kind === "institution" ? "ACC" : shape.kind === "practitioner" ? "PCC" : "LIC", "26", 500 + n),
      credential: true,
    });
  } else if (claimedByOther) {
    app.held = {
      tone: "neutral",
      title: `${row.claimedBy} is working on this item`,
      body: `It's claimed at Stage 3 by ${row.claimedBy} (Licensing & Registration Officer), so you can read it but not decide it. It returns to the pool when they release it, or after 30 minutes of inactivity.`,
    };
  } else {
    app.decide = decideActions({
      ref, who, output: shape.output, requestLabel: "Request additional information",
      issueLine: shape.issueLine,
      approveExtra: dissent ? ["The Reviewer recommended approval; the Authorizer dissented."] : ["Both prior stages recommended approval."],
      approveTitle: cancel ? "Approve the cancellation?" : undefined,
      approveConfirm: cancel ? "Approve cancellation" : undefined,
      approveToast: cancel
        ? { title: "Practice card cancelled", body: `${ref} — Practice Card ${"card" in shape ? shape.card : ""} for ${who} is cancelled and its register entry withdrawn.` }
        : { title: `${shape.output.noun} issued`, body: `${ref} — ${shape.output.artefact} issued to ${who}.` },
      reEntry: "re-enters the queue at Stage 1",
      rejectRule: "State the eligibility rule the application fails, in terms the applicant can act on.",
    });
    if (cancel) app.decide.approve.callout = "There is no undo. The card is cancelled and the register entry withdrawn the moment you approve.";
    else app.decide.approve.callout = "There is no undo. Issuance is immediate and the register is written at this stage.";
    app.decide.request.body.push("The review chain starts again from the Reviewer.");
    app.decide.return.body.push("The review chain starts again from the Reviewer.");
  }
  return app;
}

// ── All reviews ─────────────────────────────────────────────

const featuredIds = new Set(featuredApplications.map((a) => a.id));
const generated = (rows: { opens?: string }[], build: (r: never, i: number) => Application) =>
  rows
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => r.opens?.startsWith("review:") && !featuredIds.has(r.opens.slice(7)))
    .map(({ r, i }) => build(r as never, i));

export const applications: Application[] = [
  ...featuredApplications,
  ...generated(transactionRows, transactionReview),
  ...generated(escrowRows, escrowReview),
  ...generated(licensingRows, licensingReview),
];

export const findApplication = (id: string) => applications.find((a) => a.id === id);
