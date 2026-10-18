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
  /** Detail page id, when one exists in the sample data. */
  detail?: string;
};

const m = (reference: string, matter: string, recommendation: string, status: Status, escalated: string, origin: string, detail?: string): SignoffMatter => ({
  reference, matter, recommendation, status, escalated, source: "Licensing", origin, detail,
});

export const signoffMatters: SignoffMatter[] = [
  m("RRA/SO/2026/0218", "Licence revocation — Eko Realty Ltd", "Recommend revoke — licence lapsed", PENDING, "05 Oct 2026", "Lagos", "rra-so-2026-0218"),
  m("RRA/SO/2026/0224", "Developer suspension — Zenith Estates Plc", "Recommend suspend — unresolved breach", PENDING, "07 Oct 2026", "Abuja"),
  m("RRA/SO/2026/0229", "Accreditation withdrawal — Delta Valuers", "Recommend withdraw accreditation", PENDING, "08 Oct 2026", "Port Harcourt"),
  m("RRA/SO/2026/0231", "Licence revocation — Kano Homes Ltd", "Recommend revoke", AUTHORISED, "02 Oct 2026", "Kano"),
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
  m("RRA/SO/2026/0247", "Practitioner de-listing — Ibrahim M.", "Recommend de-list", PENDING, "11 Oct 2026", "Kano"),
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
  authorise: { title: string; body: string; callout: string; confirm: string; toast: { title: string; body: string } };
  decline: { title: string; body: string; label: string; placeholder: string; confirm: string; toast: { title: string; body: string } };
};

export const signoffDetails: SignoffDetail[] = [
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
        title: "Underlying Record",
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
      confirm: "Authorise Revocation",
      toast: { title: "Sign-off authorised", body: "RRA/SO/2026/0218 has returned to Licensing to execute the revocation." },
    },
    decline: {
      title: "Decline this sign-off?",
      body: "RRA/SO/2026/0218 returns to Licensing with your reason. Nothing is revoked.",
      label: "Why are you declining?",
      placeholder: "Explain what Licensing should do instead, or what is missing from the recommendation.",
      confirm: "Decline Sign-off",
      toast: { title: "Sign-off declined", body: "RRA/SO/2026/0218 has returned to Licensing with your reason." },
    },
  },
];

export const findSignoff = (id: string) => signoffDetails.find((d) => d.id === id);
