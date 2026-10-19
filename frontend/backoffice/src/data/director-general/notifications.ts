/**
 * Sample data for the DG Notifications screen. Figma's frame was copied from the Revenue &
 * Finance Officer's: its five types are the DG's, but every message underneath is a
 * finance message ("The Ministry approved ₦268,750.00…"). Messages here are rewritten to
 * match their type (KB notifications.md §2, DG row), and every related item opens the
 * screen that deals with it. 20 notifications = two full pages.
 */
import { directorGeneral, href } from "@/config/roles";
import { signoffMatters } from "./signoff";

export type NotificationType = "Escalated for sign-off" | "Period filed" | "Account locked out" | "MFA reset requested" | "Permission change";
export const TYPE_ORDER: NotificationType[] = ["Escalated for sign-off", "Period filed", "Account locked out", "MFA reset requested", "Permission change"];

export type Notification = {
  id: string;
  type: NotificationType;
  message: string;
  related: string;
  link: string;
  received: string;
  /** Days before the sample "today" (11 Oct 2026) — drives the Date range filter. */
  daysAgo: number;
  unread: boolean;
};

const dg = (p: string) => href(directorGeneral, p);

/** One notification per escalation, from the Sign-off Queue data so the two never disagree. */
const escalation = (ref: string, received: string, daysAgo: number, unread: boolean): Notification => {
  const m = signoffMatters.find((s) => s.reference === ref)!;
  return {
    id: `ntf-${ref}`,
    type: "Escalated for sign-off",
    message: `${m.matter} awaits your sign-off`,
    related: ref,
    link: dg(m.detail ? `sign-off-queue/${m.detail}` : "sign-off-queue"),
    received,
    daysAgo,
    unread,
  };
};

const n = (id: string, type: NotificationType, message: string, related: string, link: string, received: string, daysAgo: number, unread: boolean): Notification => ({
  id, type, message, related, link, received, daysAgo, unread,
});

export const notifications: Notification[] = [
  escalation("RRA/SO/2026/0251", "12 minutes ago", 0, true),
  n("ntf-p-2026-09", "Period filed", "September collections marked Filed by the Revenue & Finance Officer", "Sep 2026", dg("revenue-reports") + "?period=2026-09", "03 Oct 2026", 8, false), // audit aud-0868: filed 03 Oct 16:40
  n("ntf-lock-168", "Account locked out", "Emeka Nwankwo's staff account locked after repeated failed sign-in", "STF-00168", dg("admin-console/stf-00168"), "5 hours ago", 0, true),
  escalation("RRA/SO/2026/0249", "6 hours ago", 0, true),
  escalation("RRA/SO/2026/0247", "8 hours ago", 0, false),
  n("ntf-mfa-188", "MFA reset requested", "Chidi Okafor requested a multi-factor reset", "STF-00188", dg("admin-console/stf-00188"), "Yesterday", 1, false),
  escalation("RRA/SO/2026/0244", "Yesterday", 1, false),
  escalation("RRA/SO/2026/0243", "Yesterday", 1, false),
  // "Another post-holder changed …" removed 2026-10-19: RERA has one DG post-holder in the sample, so the
  // notification can't fire (notifications.md §3) — and it had no audit entry behind it.
  escalation("RRA/SO/2026/0237", "2 days ago", 2, false),
  // ── Beyond the Figma frame: sample notifications for page 2 ──
  escalation("RRA/SO/2026/0235", "2 days ago", 2, false),
  n("ntf-mfa-145", "MFA reset requested", "Yusuf Abdullahi requested a multi-factor reset", "STF-00145", dg("admin-console/stf-00145"), "3 days ago", 3, false),
  escalation("RRA/SO/2026/0233", "3 days ago", 3, false),
  escalation("RRA/SO/2026/0229", "3 days ago", 3, false),
  escalation("RRA/SO/2026/0226", "4 days ago", 4, false),
  escalation("RRA/SO/2026/0224", "4 days ago", 4, false),
  escalation("RRA/SO/2026/0220", "5 days ago", 5, false),
  escalation("RRA/SO/2026/0218", "6 days ago", 6, false),
  n("ntf-lock-231", "Account locked out", "Tolani Bankole's staff account locked after repeated failed sign-in", "STF-00231", dg("admin-console/stf-00231"), "9 days ago", 9, false),
  n("ntf-p-2026-08", "Period filed", "August collections marked Filed by the Revenue & Finance Officer", "Aug 2026", dg("revenue-reports") + "?period=2026-08", "04 Sep 2026", 37, false), // filed 04 Sep (revenue.ts)
];

export const dateBucket = (x: Notification) => (x.daysAgo === 0 ? "Today" : x.daysAgo <= 7 ? "Last 7 days" : "Earlier");
export const DATE_ORDER = ["Today", "Last 7 days", "Earlier"];
