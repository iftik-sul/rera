/**
 * Sample data for the DG Dashboard. The first five sign-offs are copied from the Figma frame
 * "Director-General / Registrar - Dashboard". When the backend exists,
 * this file is replaced by an API call; the page itself does not change.
 */

export const kpis = [
  { label: "Pending sign-off", value: "10", caption: "Awaiting your authorisation" },
  { label: "Oldest pending", value: "6 days", caption: "Longest in the queue" },
  { label: "Active staff", value: "41", caption: "Across 9 roles" },
  { label: "Pending invites", value: "3", caption: "Awaiting acceptance" },
  { label: "Recent access changes", value: "7", caption: "In the last 7 days" },
];

export type PendingSignOff = { reference: string; item: string; origin: string; waiting: string };

export const oldestPendingSignOffs: PendingSignOff[] = [
  { reference: "RRA/SO/2026/0218", item: "Licence revocation — Eko Realty Ltd", origin: "Lagos", waiting: "6 days" },
  { reference: "RRA/SO/2026/0224", item: "Developer suspension — Zenith Estates Plc", origin: "Abuja", waiting: "4 days" },
  { reference: "RRA/SO/2026/0229", item: "Accreditation withdrawal — Delta Valuers Assoc.", origin: "Port Harcourt", waiting: "3 days" },
  { reference: "RRA/SO/2026/0231", item: "Licence revocation — Kano Homes Ltd", origin: "Kano", waiting: "2 days" },
  { reference: "RRA/SO/2026/0235", item: "Practitioner de-listing — Adeyemi O. (RC-44821)", origin: "Ibadan", waiting: "1 day" },
  // ── Beyond the Figma frame: 10 rows minimum for every table (design standard §A5a.0 rule 7) ──
  { reference: "RRA/SO/2026/0237", item: "Licence revocation — Sapphire Realty Consultants", origin: "Abuja", waiting: "22 hours" },
  { reference: "RRA/SO/2026/0239", item: "Developer suspension — Lakeside Homes Ltd", origin: "Lagos", waiting: "19 hours" },
  { reference: "RRA/SO/2026/0240", item: "Accreditation withdrawal — Northern Surveyors Guild", origin: "Kaduna", waiting: "14 hours" },
  { reference: "RRA/SO/2026/0242", item: "Practitioner de-listing — Bello A. (RC-51207)", origin: "Kano", waiting: "8 hours" },
  { reference: "RRA/SO/2026/0244", item: "Licence revocation — Niger Delta Estates Ltd", origin: "Port Harcourt", waiting: "3 hours" },
];
