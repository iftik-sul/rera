/**
 * Sample data for the DG Practitioner Register, copied from the Figma frames
 * "Practitioner Register" and "Practitioner Register — Entry Detail".
 * The first 10 entries are Figma's; entries after them are marked. 20 entries =
 * two full pages (design standard §A5a.0 rule 6a).
 */
import type { Status } from "@/components/ui/Badge";
import { daysAgo } from "@/data/sample-date";

export const registerKpis = [
  { label: "Active credentials", value: "1,284", caption: "Across all categories" },
  { label: "Suspended", value: "7", caption: "Under review" },
  { label: "Expiring in 30 days", value: "23", caption: "Renewal due" },
  { label: "Cancelled (YTD)", value: "11", caption: "This year" },
];

const ACTIVE: Status = { label: "Active", tone: "success" };
const SUSPENDED: Status = { label: "Suspended", tone: "error" };
const EXPIRED: Status = { label: "Expired", tone: "error" };
const CANCELLED: Status = { label: "Cancelled", tone: "neutral" };
export const REGISTER_STATUS_ORDER = ["Active", "Suspended", "Expired", "Cancelled"];

export type RegisterEntry = {
  credentialNo: string;
  holder: string;
  practitionerType: string;
  status: Status;
  issued: string;
  /** "—" = no expiry (e.g. cancelled) */
  validTo: string;
  /** Detail page id. Every entry has one ("CRED/PCC/26/0388" → "cred-pcc-26-0388"). */
  detail?: string;
};

/** Page id for an entry's detail. */
export const entryId = (credentialNo: string) => credentialNo.toLowerCase().replace(/\//g, "-");

const e = (credentialNo: string, holder: string, practitionerType: string, status: Status, issued: string, validTo: string): RegisterEntry => ({
  credentialNo, holder, practitionerType, status, issued, validTo, detail: entryId(credentialNo),
});

export const registerEntries: RegisterEntry[] = [
  e("CRED/LIC/26/0412", "Sahara Estates Development Co", "Real Estate Developer", ACTIVE, "12 Jan 2026", "11 Jan 2029"),
  e("CRED/PCC/26/0388", "Adeyemi Okonkwo", "Estate Surveyor & Valuer", ACTIVE, "03 Feb 2026", "02 Feb 2027"),
  e("CRED/ACC/26/0101", "Lagos Institute of Property Studies", "Training Institution", ACTIVE, "20 Mar 2026", "19 Mar 2028"),
  e("CRED/LIC/25/0298", "Zenith Realty Partners Ltd", "Estate Agency Firm", SUSPENDED, "15 Jun 2025", "14 Jun 2028"),
  e("CRED/PCC/24/0177", "Funmilayo Bello", "Estate Agent", EXPIRED, "01 Aug 2024", "31 Jul 2025"),
  e("CRED/PMT/26/0233", "Brains & Hammers Ltd", "Real Estate Developer", ACTIVE, "09 Apr 2026", "08 Apr 2027"),
  e("CRED/PCC/26/0201", "Chukwuemeka Nwankwo", "Estate Surveyor & Valuer", ACTIVE, "11 May 2026", "10 May 2027"),
  // Figma links the first row to the Entry Detail, but that frame shows THIS entry (Kano Homes, cancelled) — so this is the row that opens it.
  e("CRED/LIC/23/0044", "Kano Homes Ltd", "Real Estate Developer", CANCELLED, "02 Feb 2023", "—"),
  e("CRED/ACC/25/0067", "Delta Valuers Association", "Professional Body", ACTIVE, "18 Sep 2025", "17 Sep 2027"),
  e("CRED/PCC/26/0215", "Aisha Mohammed", "Facilities Manager", ACTIVE, "22 Jun 2026", "21 Jun 2027"),
  // ── Beyond the Figma frame: sample entries for page 2 ──
  e("CRED/LIC/24/0231", "Eko Realty Ltd", "Estate Agency Firm", ACTIVE, "14 Mar 2024", "01 Apr 2026"),
  e("CRED/PCC/25/0412", "Tunde Akinwale", "Estate Agent", ACTIVE, "29 Oct 2025", "28 Oct 2026"),
  e("CRED/LIC/26/0356", "Mainland Realty Consulting Ltd", "Estate Agency Firm", ACTIVE, "02 Jul 2026", "01 Jul 2029"),
  e("CRED/PCC/25/0390", "Ngozi Eze", "Estate Agent", ACTIVE, "21 Nov 2025", "20 Nov 2026"),
  e("CRED/PMT/25/0144", "Okafor & Sons Properties Ltd", "Real Estate Developer", SUSPENDED, "05 May 2025", "04 May 2026"),
  e("CRED/ACC/24/0052", "Abuja School of Estate Management", "Training Institution", EXPIRED, "12 Sep 2024", "11 Sep 2026"),
  e("CRED/PCC/26/0274", "Kemi Adeyinka", "Facilities Manager", ACTIVE, "17 Aug 2026", "16 Aug 2027"),
  e("CRED/LIC/22/0019", "Crestview Property Managers Ltd", "Estate Agency Firm", CANCELLED, "08 Jun 2022", "—"),
  e("CRED/PCC/26/0301", "Musa Ibrahim", "Estate Surveyor & Valuer", ACTIVE, "04 Sep 2026", "03 Sep 2027"),
  e("CRED/ACC/26/0118", "Nigerian Institution of Estate Surveyors", "Professional Body", ACTIVE, "30 Jan 2026", "29 Jan 2028"),
];

/**
 * A sample credential number that isn't already on the register — for records the register
 * doesn't list (a card someone asks to amend, a credential issued by an overturned decision).
 */
export function freeCredential(code: string, yy: string, n: number): string {
  const taken = new Set(registerEntries.map((r) => r.credentialNo));
  let k = n;
  let no = "";
  do no = `CRED/${code}/${yy}/0${String(100 + (k++ % 900)).padStart(3, "0")}`;
  while (taken.has(no));
  return no;
}

/** Expiry filter value, worked out from "Valid to" against the sample date. */
export function expiryState(validTo: string): string {
  if (validTo === "—") return "No expiry date";
  const days = -daysAgo(validTo); // days until expiry
  if (days < 0) return "Expired";
  if (days <= 30) return "Expires within 30 days";
  return "Valid beyond 30 days";
}
export const EXPIRY_ORDER = ["Expired", "Expires within 30 days", "Valid beyond 30 days", "No expiry date"];

// ── Entry Detail (Figma "Practitioner Register — Entry Detail") ──
export type EntryDetail = {
  id: string;
  title: string;
  subtitle: string;
  status: Status;
  meta: [{ label: string; value: string }, { label: string; value: string }];
  groups: { title: string; fields: { label: string; value: string }[] }[];
  history: { date: string; event: string; by: string; type: Status; reference: string }[];
  withdrawal?: { cause: string; authorisedBy: string; date: string; decisionRef: string };
  footer: string;
};

/** The detail Figma draws (Kano Homes — cancelled by overturn). Every other entry's detail is built below. */
const featuredEntries: EntryDetail[] = [
  {
    id: "cred-lic-23-0044",
    title: "CRED/LIC/23/0044 — Company Licence",
    subtitle: "Kano Homes Ltd",
    status: CANCELLED,
    meta: [
      { label: "Credential type", value: "Company Licence" },
      { label: "Category", value: "Company Licensing & Permits" },
    ],
    groups: [
      {
        title: "Holder",
        fields: [
          { label: "Entity name", value: "Kano Homes Ltd" },
          { label: "RC number", value: "RC-310557" },
          { label: "Contact", value: "registry@kanohomes.ng" },
        ],
      },
      {
        title: "Credential",
        fields: [
          { label: "Credential no.", value: "CRED/LIC/23/0044" },
          { label: "Type", value: "Company Licence" },
          { label: "Category", value: "Company Licensing" },
          { label: "Issuing decision", value: "LIC-2023-0044" },
        ],
      },
      {
        title: "Validity",
        fields: [
          { label: "Issued", value: "02 Feb 2023" },
          { label: "Cancelled on", value: "11 Oct 2026" },
          { label: "Issued by", value: "F. Adeyemi · Lic. Officer" },
        ],
      },
    ],
    history: [
      { date: "02 Feb 2023", event: "Credential issued", by: "F. Adeyemi", type: { label: "Issued", tone: "info" }, reference: "LIC-2023-0044" },
      { date: "11 Oct 2026", event: "Cancelled — cause: Overturn", by: "A. Nwosu · DG", type: CANCELLED, reference: "OVR/2026/0044" },
    ],
    withdrawal: { cause: "Overturn", authorisedBy: "Director-General / Registrar", date: "11 Oct 2026", decisionRef: "OVR/2026/0044" },
    footer: "This credential is cancelled and can no longer be amended. Register entries change only through a licensing decision.",
  },
];

// ── Every other entry's detail, built from its register row ──

const KIND: Record<string, { type: string; category: string; short: string }> = {
  LIC: { type: "Company Licence", category: "Company Licensing & Permits", short: "Company Licensing" },
  PMT: { type: "Real Estate Permit", category: "Company Licensing & Permits", short: "Company Licensing" },
  PCC: { type: "Professional Practice Card", category: "Individual Practitioner Credentials", short: "Practitioner Credentials" },
  ACC: { type: "Accreditation", category: "Institutional Accreditation", short: "Institutional Accreditation" },
};

/** Sign-off matters that changed an entry (kept here so the register and the Sign-off Queue agree). */
const SIGNED_OFF: Record<string, { cause: string; date: string; ref: string }> = {
  "CRED/LIC/22/0019": { cause: "Revocation", date: "10 Oct 2026", ref: "RRA/SO/2026/0231" }, // authorised 09 Oct (audit aud-0893), executed by Licensing next day
};

const SUSPENSIONS: Record<string, { date: string; ref: string }> = {
  "CRED/LIC/25/0298": { date: "22 Sep 2026", ref: "ENF/2026/0131" },
  "CRED/PMT/25/0144": { date: "30 Aug 2026", ref: "ENF/2026/0117" },
};

const OFFICER = "F. Adeyemi";
const digits = (s: string) => parseInt(s.replace(/\D/g, "").slice(-4), 10) || 1;
const mailSlug = (s: string) =>
  s
    .replace(/&.*$/, "")
    .split(/\s+/)
    .filter((w) => !/^(Ltd|Plc|Co|Nigeria|Limited|Association|Partners|Development)$/i.test(w))
    .slice(0, 2)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

function buildEntry(r: RegisterEntry): EntryDetail {
  const [, code, yy, serial] = r.credentialNo.split("/");
  const kind = KIND[code];
  const person = code === "PCC";
  const n = digits(r.credentialNo);
  const decision = `LIC-20${yy}-${serial}`;
  const issuedBy = `${OFFICER} · Lic. Officer`;
  const history: EntryDetail["history"] = [
    { date: r.issued, event: "Credential issued", by: OFFICER, type: { label: "Issued", tone: "info" }, reference: decision },
  ];
  let withdrawal: EntryDetail["withdrawal"];
  let footer = "Register entries change only through a licensing decision.";
  const validity: { label: string; value: string }[] = [{ label: "Issued", value: r.issued }];

  if (r.credentialNo === "CRED/LIC/26/0412") {
    history.push({ date: "11 Oct 2026", event: "Holder contact details amended", by: OFFICER, type: { label: "Amended", tone: "info" }, reference: "AMD/2026/0412" });
  }
  if (r.status.label === "Suspended") {
    const s = SUSPENSIONS[r.credentialNo];
    history.push({ date: s.date, event: "Suspended pending enforcement review", by: OFFICER, type: SUSPENDED, reference: s.ref });
    validity.push({ label: "Suspended on", value: s.date });
    footer = "This credential is suspended: the holder can't operate under it until the suspension is lifted. Register entries change only through a licensing decision.";
  } else if (r.status.label === "Expired") {
    history.push({ date: r.validTo, event: "Expired — not renewed", by: "System", type: EXPIRED, reference: "—" });
    validity.push({ label: "Expired on", value: r.validTo });
    footer = "This credential has expired and was not renewed. The holder applies for renewal through licensing.";
  } else if (r.status.label === "Cancelled") {
    const so = SIGNED_OFF[r.credentialNo];
    history.push({ date: so.date, event: `Cancelled — cause: ${so.cause}`, by: OFFICER, type: CANCELLED, reference: so.ref });
    validity.push({ label: "Cancelled on", value: so.date });
    withdrawal = { cause: so.cause, authorisedBy: "Director-General / Registrar", date: so.date, decisionRef: so.ref };
    footer = "This credential is cancelled and can no longer be amended. Register entries change only through a licensing decision.";
  } else {
    validity.push({ label: "Valid to", value: r.validTo });
  }
  validity.push({ label: "Issued by", value: issuedBy });

  return {
    id: entryId(r.credentialNo),
    title: `${r.credentialNo} — ${kind.type}`,
    subtitle: r.holder,
    status: r.status,
    meta: [
      { label: "Credential type", value: kind.type },
      { label: "Category", value: kind.category },
    ],
    groups: [
      {
        title: "Holder",
        fields: person
          ? [
              { label: "Name", value: r.holder },
              { label: "Practitioner type", value: r.practitionerType },
              { label: "Contact", value: `${mailSlug(r.holder)}@mail.ng` },
            ]
          : [
              { label: "Entity name", value: r.holder },
              { label: code === "ACC" ? "Registration no." : "RC number", value: `RC-${String(200000 + n * 61).slice(0, 6)}` },
              { label: "Contact", value: `registry@${mailSlug(r.holder)}.ng` },
            ],
      },
      {
        title: "Credential",
        fields: [
          { label: "Credential no.", value: r.credentialNo },
          { label: "Type", value: kind.type },
          { label: "Category", value: kind.short },
          { label: "Issuing decision", value: decision },
        ],
      },
      { title: "Validity", fields: validity },
    ],
    history,
    withdrawal,
    footer,
  };
}

const featuredIds = new Set(featuredEntries.map((d) => d.id));
export const entryDetails: EntryDetail[] = [...featuredEntries, ...registerEntries.filter((r) => !featuredIds.has(entryId(r.credentialNo))).map(buildEntry)];

export const findEntry = (id: string) => entryDetails.find((d) => d.id === id);
