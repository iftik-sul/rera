/**
 * "You can't overturn this" pop-ups, copied from Figma
 * M-BLK-22 / M-BLK-23 / M-BLK-24. In the Figma prototype each is opened from
 * a Work Queue row (TRX-2024-0882 / 0878 / 0871) so reviewers can see them.
 */
import type { BlockerId } from "./work-queue";

export const blockers: Record<BlockerId, { title: string; body: string; helpTitle: string; help: string }> = {
  "not-decided": {
    title: "There's no decision to overturn",
    body: "This item hasn't been decided yet — it's still Under review, so there is no decision to replace.",
    helpTitle: "What would unblock this",
    help: "Wait until the item is decided. If it's sitting at the final review stage, you can decide it here directly instead of overturning.",
  },
  "already-overturned": {
    title: "This item is already overturned",
    body: "This decision was overturned by Adaeze Nwosu (Director-General / Registrar) on 5 Oct 2026. Overturned is final — a decision can't be reversed twice, or the record could never say what it currently stands at.",
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
