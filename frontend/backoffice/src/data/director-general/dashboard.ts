/**
 * Sample data for the DG Dashboard (Figma "Director-General / Registrar - Dashboard").
 * Sign-off figures and the "Oldest pending sign-offs" table are worked out from
 * the Sign-off Queue's data (signoff.ts), so the two screens always agree.
 * When the backend exists, this file is replaced by an API call.
 */
import { oldestPending, oldestPendingAge, pendingCount, waited } from "./signoff";

export const kpis = [
  { label: "Pending sign-off", value: String(pendingCount), caption: "Awaiting your authorisation" },
  { label: "Oldest pending", value: oldestPendingAge, caption: "Longest in the queue" },
  { label: "Active staff", value: "41", caption: "Across 9 roles" },
  { label: "Pending invites", value: "3", caption: "Awaiting acceptance" },
  { label: "Recent access changes", value: "7", caption: "In the last 7 days" },
];

export type PendingSignOff = { reference: string; item: string; origin: string; waiting: string; detail?: string };

/** The 10 longest-waiting pending sign-offs (design standard §A5a.0 rule 7: 10 rows). */
export const oldestPendingSignOffs: PendingSignOff[] = oldestPending.map((s) => ({
  reference: s.reference,
  item: s.matter,
  origin: s.origin,
  waiting: waited(s),
  detail: s.detail,
}));
