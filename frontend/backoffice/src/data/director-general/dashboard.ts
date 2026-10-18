/**
 * Sample data for the DG Dashboard, copied from the Figma frame
 * "Director-General / Registrar - Dashboard". When the backend exists,
 * this file is replaced by an API call; the page itself does not change.
 */

export const kpis = [
  { label: "Pending sign-off", value: "9", caption: "Awaiting your authorisation" },
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
];
