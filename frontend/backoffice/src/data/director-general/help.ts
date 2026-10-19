/**
 * Help & Support content for the Director-General / Registrar (KB help-and-support.md §1).
 * Guides describe what the DG's screens already do — content, not permission. Other roles'
 * guide lists are written when their screens are built.
 */
export type Guide = { title: string; summary: string; body: string[] };

export const dgGuides: Guide[] = [
  {
    title: "Deciding or overturning an application",
    summary: "When you decide an item yourself, and when you overturn a decision already made.",
    body: [
      "An item nobody has decided yet opens with the ordinary decision bar — Approve, Request additional information, Return and Reject — and you act exactly as the officer would. For licensing you act at stage 3 only: the Reviewer and Authorizer stages stay with them.",
      "An item that is already Approved or Rejected opens with the Override panel instead. It shows the decision on record, who made it and why, and what was issued.",
      "Overturning needs a written reason that says why the decision was wrong — not that you would have decided differently — and asks you to confirm it's you. Overturning an approval revokes what was issued; overturning a rejection issues the output fresh, dated today.",
      "An overturn is final: there's no undo and no second overturn. If the applicant disputes it, they make a fresh application.",
    ],
  },
  {
    title: "Executive sign-off",
    summary: "Authorising or declining a credential revocation (licence, permit, practice card or accreditation) escalated to you.",
    body: [
      "Licensing escalates these to the Sign-off Queue with a recommendation. Open a matter to read the record, the grounds and the recommendation.",
      "Authorise asks you to tick that you understand, then to confirm it's you, and returns the matter to Licensing to carry out. Decline needs a reason and returns it to Licensing with nothing changed on the register.",
      "Decided matters stay in the queue, showing who decided and when.",
    ],
  },
  {
    title: "Managing staff accounts",
    summary: "Inviting staff, changing roles and licensing scope, MFA, suspension and deactivation.",
    body: [
      "Everything is in the Admin Console. Invite staff gives a new account its role; it can act once its holder has set up multi-factor sign-in.",
      "A Licensing Reviewer or Authorizer needs at least one licensing category. One person can't hold the Licensing & Registration Officer role together with a junior licensing role — the chain needs a different person at each stage.",
      "Suspension takes access away at once and can be reversed with Reactivate. Deactivation is permanent and asks you to confirm it's you. Your own account can't be changed from your own session.",
    ],
  },
  {
    title: "Confirming it's you",
    summary: "Which five actions ask for a code, and why.",
    body: [
      "Five actions with the widest effect ask for the 6-digit code from your authenticator app first: overturning a decision, authorising a sign-off, deactivating an account, revoking a credential and publishing the fee schedule.",
      "If you cancel, or the code is wrong, nothing happens and you stay where you were.",
    ],
  },
  {
    title: "Claiming and releasing items",
    summary: "How the shared pool works, and what happens when a claim lapses.",
    body: [
      "Opening an item from a queue claims it to you, so two people never decide the same thing. An item someone else holds opens read-only.",
      "A claim lapses after 30 minutes without activity and the item goes back to the pool; you can claim it again if it's still free. Release item hands it back on purpose, with a reason — and discards your draft note.",
      "Your draft note is only visible to you. Save it before you leave, or you'll be asked whether to discard it.",
    ],
  },
];

export const serviceDesk = [
  { label: "Email", value: "servicedesk@rera.gov.ng", href: "mailto:servicedesk@rera.gov.ng" },
  { label: "Telephone", value: "+234 9 461 0000" },
  { label: "Hours", value: "Monday to Friday, 08:00–17:00 WAT" },
  { label: "Response target", value: "Within one business day" },
];

export const systemInfo = [
  { label: "Application", value: "RERAN Back-Office" },
  { label: "Version", value: "1.0.0" },
  { label: "Environment", value: "Staging" },
  { label: "Last updated", value: "19 October 2026" },
];
