/**
 * Sample data for the DG Sign-off Queue and Sign-off Detail, copied from Figma.
 * The first 10 matters are Figma's; the rest are marked. 20 matters = two full
 * pages (design standard §A5a.0 rule 6a).
 *
 * This is the ONE list of sign-off matters: the Dashboard's "Oldest pending
 * sign-offs" table and its KPI cards are worked out from it, so the two screens
 * can never disagree (in Figma they did — e.g. 0231 pending on one, Authorised
 * on the other).
 */
import type { Status } from "@/components/ui/Badge";
import { daysAgo, plural } from "@/data/sample-date";
import { freeCredential, registerEntries } from "./register";

const PENDING: Status = { label: "Pending Sign-off", tone: "warning" };
const AUTHORISED: Status = { label: "Authorised", tone: "success" };
const DECLINED: Status = { label: "Declined", tone: "error" };
export const SIGNOFF_STATUS_ORDER = ["Pending Sign-off", "Authorised", "Declined"];

export type SignoffMatter = {
  reference: string;
  matter: string;
  recommendation: string;
  status: Status;
  escalated: string;
  /** Originating service, in plain words (never a module code in the UI). Only licensing is live today. */
  source: string;
  /** Where the matter comes from — shown on the Dashboard. */
  origin: string;
  /** Detail page id. Every matter has one ("RRA/SO/2026/0224" → "rra-so-2026-0224"). */
  detail?: string;
};

export const signoffId = (reference: string) => reference.toLowerCase().replace(/\//g, "-");

const m = (reference: string, matter: string, recommendation: string, status: Status, escalated: string, origin: string): SignoffMatter => ({
  reference, matter, recommendation, status, escalated, source: "Licensing", origin, detail: signoffId(reference),
});

export const signoffMatters: SignoffMatter[] = [
  m("RRA/SO/2026/0218", "Licence revocation — Eko Realty Ltd", "Recommend revoke — licence lapsed", PENDING, "05 Oct 2026", "Lagos"),
  m("RRA/SO/2026/0224", "Developer suspension — Zenith Estates Plc", "Recommend suspend — unresolved breach", PENDING, "07 Oct 2026", "Abuja"),
  m("RRA/SO/2026/0229", "Accreditation withdrawal — Delta Valuers", "Recommend withdraw accreditation", PENDING, "08 Oct 2026", "Port Harcourt"),
  // Figma: Kano Homes — but Kano Homes' licence was withdrawn by OVERTURN (its register entry), not revocation.
  m("RRA/SO/2026/0231", "Licence revocation — Crestview Property Managers Ltd", "Recommend revoke", AUTHORISED, "02 Oct 2026", "Lagos"),
  m("RRA/SO/2026/0235", "Practitioner de-listing — Adeyemi O.", "Recommend de-list", PENDING, "09 Oct 2026", "Ibadan"),
  m("RRA/SO/2026/0209", "Licence revocation — Lagos Prime Ltd", "Recommend revoke", DECLINED, "28 Sep 2026", "Lagos"),
  m("RRA/SO/2026/0241", "Developer suspension — Suru Group Ltd", "Recommend suspend", PENDING, "10 Oct 2026", "Lagos"),
  m("RRA/SO/2026/0244", "Practitioner de-listing — Bello F.", "Recommend de-list", PENDING, "10 Oct 2026", "Kaduna"),
  m("RRA/SO/2026/0198", "Licence revocation — Mixta Nigeria Ltd", "Recommend revoke", AUTHORISED, "24 Sep 2026", "Lagos"),
  m("RRA/SO/2026/0251", "Accreditation withdrawal — PGD Institute", "Recommend withdraw", PENDING, "11 Oct 2026", "Abuja"),
  // ── Beyond the Figma frame: sample matters for page 2 ──
  m("RRA/SO/2026/0220", "Licence revocation — Sapphire Realty Consultants", "Recommend revoke — repeated breach", PENDING, "06 Oct 2026", "Abuja"),
  m("RRA/SO/2026/0226", "Developer suspension — Lakeside Homes Ltd", "Recommend suspend — escrow default", PENDING, "07 Oct 2026", "Lagos"),
  m("RRA/SO/2026/0233", "Practitioner de-listing — Okeke C.", "Recommend de-list — false declaration", PENDING, "08 Oct 2026", "Enugu"),
  m("RRA/SO/2026/0237", "Accreditation withdrawal — Northern Surveyors Guild", "Recommend withdraw — curriculum lapsed", PENDING, "09 Oct 2026", "Kaduna"),
  m("RRA/SO/2026/0239", "Licence revocation — Niger Delta Estates Ltd", "Recommend revoke — licence lapsed", PENDING, "09 Oct 2026", "Port Harcourt"),
  m("RRA/SO/2026/0243", "Developer suspension — Eastgate Property Developers", "Recommend suspend", PENDING, "10 Oct 2026", "Onitsha"),
  m("RRA/SO/2026/0247", "Practitioner de-listing — Ibrahim K.", "Recommend de-list", PENDING, "11 Oct 2026", "Kano"),
  m("RRA/SO/2026/0249", "Licence revocation — Royal Crest Facility Managers", "Recommend revoke", PENDING, "11 Oct 2026", "Lagos"),
  m("RRA/SO/2026/0187", "Licence revocation — Haven Homes Nigeria Ltd", "Recommend revoke", AUTHORISED, "19 Sep 2026", "Lagos"),
  m("RRA/SO/2026/0179", "Developer suspension — Garden City Homes Ltd", "Recommend suspend", AUTHORISED, "15 Sep 2026", "Port Harcourt"),
];

/** "6 days" / "1 day" / "Today" — how long a matter has waited. */
export const waited = (s: SignoffMatter) => {
  const d = daysAgo(s.escalated);
  return d === 0 ? "Today" : plural(d, "day");
};

/** Age filter buckets, by days since escalation. */
export function ageBucket(s: SignoffMatter): string {
  const d = daysAgo(s.escalated);
  return d <= 2 ? "0–2 days" : d <= 5 ? "3–5 days" : "6 days or more";
}
export const AGE_BUCKETS = ["0–2 days", "3–5 days", "6 days or more"];

const pending = signoffMatters.filter((s) => s.status === PENDING);
const oldest = [...pending].sort((a, b) => daysAgo(b.escalated) - daysAgo(a.escalated))[0];

export const signoffKpis = [
  { label: "Pending sign-off", value: String(pending.length), caption: "Awaiting your authorisation" },
  { label: "Authorised", value: String(signoffMatters.filter((s) => s.status === AUTHORISED).length), caption: "This month" },
  { label: "Declined", value: String(signoffMatters.filter((s) => s.status === DECLINED).length), caption: "This month" },
  { label: "Oldest pending", value: waited(oldest), caption: oldest.reference },
];

/** Dashboard: pending matters, oldest first — the 10 longest-waiting. */
export const oldestPending = [...pending].sort((a, b) => daysAgo(b.escalated) - daysAgo(a.escalated)).slice(0, 10);
export const pendingCount = pending.length;
export const oldestPendingAge = waited(oldest);

// ── Sign-off Detail (Figma "Sign-off Detail") ──
export type SignoffDetail = {
  id: string;
  reference: string;
  title: string;
  subtitle: string;
  status: Status;
  meta: [{ label: string; value: string }, { label: string; value: string }];
  groups: { title: string; fields: { label: string; value: string }[] }[];
  recommendation: { badge: string; headline: string; body: string; by: string };
  panelNote: string;
  /** Pop-up wording — not drawn in Figma; follows KB modals.md M-GOV-01 / M-GOV-02. */
  authorise: { title: string; body: string; callout: string; confirm: string; toast: { title: string; body: string }; acknowledge: string };
  decline: { title: string; body: string; label: string; placeholder: string; confirm: string; toast: { title: string; body: string } };
  /** A matter already decided: what was decided, shown in place of the decision panel. */
  outcome?: { tone: "success" | "neutral"; title: string; body: string };
};

/** The detail Figma draws. Every other matter's detail is built below. */
const featuredSignoffs: SignoffDetail[] = [
  {
    id: "rra-so-2026-0218",
    reference: "RRA/SO/2026/0218",
    title: "RRA/SO/2026/0218 — Executive Sign-off",
    subtitle: "Licence revocation — Eko Realty Ltd",
    status: PENDING,
    // Figma says "A-2 Licensing"; module codes never appear in the UI, so it reads "Licensing".
    meta: [
      { label: "Source", value: "Licensing" },
      { label: "Escalated", value: "6 days ago" },
    ],
    groups: [
      {
        title: "Escalation",
        fields: [
          { label: "Escalated by", value: "Funke Adeyemi" },
          { label: "Role", value: "Licensing & Registration Officer" },
          { label: "Date", value: "05 Oct 2026" },
        ],
      },
      {
        title: "Underlying record",
        fields: [
          { label: "Practitioner / Company", value: "Eko Realty Ltd" },
          { label: "Credential", value: "CRED/LIC/24/0231" },
          { label: "Original decision", value: "LIC-2024-0231" },
          { label: "Decided", value: "14 Mar 2024" },
        ],
      },
      {
        title: "Grounds for escalation",
        fields: [
          { label: "Reason", value: "Licence lapsed; renewal window closed" },
          { label: "Breach reference", value: "ENF/2026/0142" },
          { label: "Prior notices", value: "2 served" },
        ],
      },
    ],
    recommendation: {
      badge: "Revoke",
      headline: "Revoke licence LIC-2024-0231 — Eko Realty Ltd.",
      body: "The company's operating licence lapsed on 01 Apr 2026 and the renewal window closed unremedied. Two notices were served (last on 20 Sep 2026) with no response. The Licensing Officer recommends revocation and withdrawal of the register entry.",
      by: "Funke Adeyemi · Licensing Officer · 05 Oct 2026",
    },
    panelNote: "Authorising requires re-authentication and returns the revocation to Licensing to execute.",
    authorise: {
      title: "Authorise this revocation?",
      body: "This authorises revocation of licence LIC-2024-0231 — Eko Realty Ltd — and returns it to Licensing to execute. The register entry will be withdrawn with the cause recorded as Revocation.",
      callout: "This is final. Once Licensing executes it, the licence is revoked and the holder is notified.",
      confirm: "Authorise revocation",
      toast: { title: "Sign-off authorised", body: "RRA/SO/2026/0218 has returned to Licensing to execute the revocation." },
      acknowledge: "I understand this authorises the revocation and cannot be undone from this screen.",
    },
    decline: {
      title: "Decline this sign-off?",
      body: "RRA/SO/2026/0218 returns to Licensing with your reason. Nothing is revoked.",
      label: "Why are you declining?",
      placeholder: "Explain what Licensing should do instead, or what is missing from the recommendation.",
      confirm: "Decline sign-off",
      toast: { title: "Sign-off declined", body: "RRA/SO/2026/0218 has returned to Licensing with your reason." },
    },
  },
];

// ── Every other matter's detail, built from its queue row ──

type Kind = { badge: string; verb: string; noun: string; effect: string; done: string; credential: string; grounds: string };
const KINDS: Record<string, Kind> = {
  "Licence revocation": {
    badge: "Revoke", verb: "revoke", noun: "revocation", credential: "LIC",
    effect: "The register entry will be withdrawn with the cause recorded as Revocation.",
    done: "the licence is revoked and the holder is notified", grounds: "Licence conditions breached; notices unanswered",
  },
  "Developer suspension": {
    badge: "Suspend", verb: "suspend", noun: "suspension", credential: "PMT",
    effect: "The register entry will be marked Suspended until Licensing lifts it.",
    done: "the developer can't operate under its permit until the suspension is lifted", grounds: "Unresolved breach of permit conditions",
  },
  "Accreditation withdrawal": {
    badge: "Withdraw", verb: "withdraw", noun: "withdrawal", credential: "ACC",
    effect: "The register entry will be withdrawn with the cause recorded as Withdrawal.",
    done: "the accreditation is withdrawn and the institution is notified", grounds: "Accreditation standards no longer met",
  },
  "Practitioner de-listing": {
    badge: "De-list", verb: "de-list", noun: "de-listing", credential: "PCC",
    effect: "The practice card will be cancelled and the register entry withdrawn with the cause recorded as De-listing.",
    done: "the practitioner is removed from the register and notified", grounds: "Professional misconduct finding",
  },
};

/** Decisions already on record (kept in step with the audit trail where it names them). */
const DECIDED_ON: Record<string, { date: string; reason?: string }> = {
  "RRA/SO/2026/0231": { date: "09 Oct 2026" },
  "RRA/SO/2026/0198": { date: "26 Sep 2026" },
  "RRA/SO/2026/0187": { date: "22 Sep 2026" },
  "RRA/SO/2026/0179": { date: "17 Sep 2026" },
  "RRA/SO/2026/0209": { date: "30 Sep 2026", reason: "The renewal application was lodged inside the window; Licensing should decide the renewal before any revocation." },
};

const serial = (ref: string) => parseInt(ref.slice(-4), 10);

function buildSignoff(row: SignoffMatter): SignoffDetail {
  const [kindName, subject] = row.matter.split(" — ");
  const k = KINDS[kindName];
  const n = serial(row.reference);
  const [, why] = row.recommendation.split(" — ");
  const reason = why ? why[0].toUpperCase() + why.slice(1) : k.grounds;
  // The holder's real register entry when the register has one ("Bello F." → Funmilayo Bello).
  const person = subject.match(/^(\S+) (\S)\.$/);
  const entry = registerEntries.find((e) => (person ? e.holder.endsWith(person[1]) && e.holder.startsWith(person[2]) : e.holder.startsWith(subject)));
  const credential = entry?.credentialNo ?? freeCredential(k.credential, `2${3 + (n % 3)}`, n);
  const [, , yy, num] = credential.split("/");
  const decisionRef = `LIC-20${yy}-${num}`;
  const age = daysAgo(row.escalated);
  const subjectShort = subject.replace(/ (Ltd|Plc)$/, "");
  const decided = DECIDED_ON[row.reference];
  const authorised = row.status === AUTHORISED;

  return {
    id: signoffId(row.reference),
    reference: row.reference,
    title: `${row.reference} — Executive Sign-off`,
    subtitle: row.matter,
    status: row.status,
    meta: [
      { label: "Source", value: row.source },
      { label: "Escalated", value: age === 0 ? "Today" : `${plural(age, "day")} ago` },
    ],
    groups: [
      {
        title: "Escalation",
        fields: [
          { label: "Escalated by", value: "Funke Adeyemi" },
          { label: "Role", value: "Licensing & Registration Officer" },
          { label: "Date", value: row.escalated },
        ],
      },
      {
        title: "Underlying record",
        fields: [
          { label: "Practitioner / Company", value: subject },
          { label: "Credential", value: credential },
          { label: "Original decision", value: decisionRef },
          { label: "Office", value: row.origin },
        ],
      },
      {
        title: "Grounds for escalation",
        fields: [
          { label: "Reason", value: reason },
          { label: "Breach reference", value: `ENF/2026/0${100 + (n % 90)}` },
          { label: "Prior notices", value: `${1 + (n % 3)} served` },
        ],
      },
    ],
    recommendation: {
      badge: k.badge,
      headline: `${k.badge} ${kindName === "Licence revocation" ? "licence " : ""}${credential} — ${subjectShort}.`,
      body: `${reason}. The Licensing Officer recommends that RERA ${k.verb} ${subjectShort}. ${k.effect}`,
      by: `Funke Adeyemi · Licensing Officer · ${row.escalated}`,
    },
    panelNote: `Authorising requires re-authentication and returns the ${k.noun} to Licensing to execute.`,
    authorise: {
      title: `Authorise this ${k.noun}?`,
      body: `This authorises the ${k.noun} of ${credential} — ${subjectShort} — and returns it to Licensing to execute. ${k.effect}`,
      callout: `This is final. Once Licensing executes it, ${k.done}.`,
      confirm: `Authorise ${k.noun}`,
      toast: { title: "Sign-off authorised", body: `${row.reference} has returned to Licensing to execute the ${k.noun}.` },
      acknowledge: `I understand this authorises the ${k.noun} and cannot be undone from this screen.`,
    },
    decline: {
      title: "Decline this sign-off?",
      body: `${row.reference} returns to Licensing with your reason. Nothing is ${k.verb === "de-list" ? "de-listed" : k.verb + "d"}.`,
      label: "Why are you declining?",
      placeholder: "Explain what Licensing should do instead, or what is missing from the recommendation.",
      confirm: "Decline sign-off",
      toast: { title: "Sign-off declined", body: `${row.reference} has returned to Licensing with your reason.` },
    },
    outcome:
      row.status === PENDING
        ? undefined
        : authorised
          ? {
              tone: "success",
              title: `Authorised by Adaeze Nwosu on ${decided?.date ?? row.escalated}`,
              body: `The ${k.noun} was returned to Licensing to execute. A decided sign-off can't be changed from this screen.`,
            }
          : {
              tone: "neutral",
              title: `Declined by Adaeze Nwosu on ${decided?.date ?? row.escalated}`,
              body: `Returned to Licensing with the reason: “${decided?.reason ?? "The recommendation is not supported by the record."}” Nothing was changed on the register.`,
            },
  };
}

const featuredSignoffIds = new Set(featuredSignoffs.map((d) => d.id));
export const signoffDetails: SignoffDetail[] = [
  ...featuredSignoffs,
  ...signoffMatters.filter((r) => !featuredSignoffIds.has(signoffId(r.reference))).map(buildSignoff),
];

export const findSignoff = (id: string) => signoffDetails.find((d) => d.id === id);
