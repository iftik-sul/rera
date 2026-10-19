/**
 * "You can't overturn this" pop-ups, copied from Figma M-BLK-22 / M-BLK-23 / M-BLK-24.
 * They guard the Overturn action against stale tabs and direct links; in normal use the action
 * is simply absent (modals.md §8), so no click in the app reaches them. Figma opened them from
 * three Work Queue rows; from batch 6 they are shown on the style guide instead.
 */
export type BlockerId = "not-decided" | "already-overturned" | "not-an-application";

export const blockers: Record<BlockerId, { title: string; body: string; helpTitle: string; help: string }> = {
  "not-decided": {
    title: "There's no decision to overturn",
    body: "This item hasn't been decided yet — it's still Under review, so there is no decision to replace.",
    helpTitle: "What would unblock this",
    help: "Wait until the item is decided. If it's sitting at the final review stage, you can decide it here directly instead of overturning.",
  },
  "already-overturned": {
    title: "This item is already overturned",
    body: "TRX-2024-0878 was overturned by Adaeze Nwosu (Director-General / Registrar) on 5 Oct 2026. Overturned is final — a decision can't be reversed twice, or the record could never say what it currently stands at.",
    helpTitle: "What happens instead",
    help: "There is no second overturn. If the applicant disputes the outcome, they submit a fresh application.",
  },
  "not-an-application": {
    title: "Overturn applies to application decisions only",
    body: "This is a dispute judgment. The override covers transaction and licensing application decisions — it doesn't reach dispute judgments.",
    helpTitle: "What happens instead",
    help: "A dispute judgment changes on appeal, not by override — and there's no appeal process on the platform. Finance and inspection actions are out of scope too.",
  },
};
