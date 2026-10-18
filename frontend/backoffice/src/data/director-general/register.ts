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
  /** Detail page id, when one exists in the sample data. */
  detail?: string;
};

const e = (credentialNo: string, holder: string, practitionerType: string, status: Status, issued: string, validTo: string, detail?: string): RegisterEntry => ({
  credentialNo, holder, practitionerType, status, issued, validTo, detail,
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
  e("CRED/LIC/23/0044", "Kano Homes Ltd", "Real Estate Developer", CANCELLED, "02 Feb 2023", "—", "cred-lic-23-0044"),
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

export const entryDetails: EntryDetail[] = [
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

export const findEntry = (id: string) => entryDetails.find((d) => d.id === id);
