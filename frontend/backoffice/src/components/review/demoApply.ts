import type { Status } from "@/components/ui/Badge";
import type { Application } from "@/data/director-general/applications";
import type { AppChange, Demo } from "@/lib/demo";

/**
 * Apply this session's changes (lib/demo.ts) to the sample data, so a decision the DG takes
 * shows everywhere: the queue row's status, which side of Open · Completed it sits on, its
 * decided date and decider, and the review page itself.
 */

/** Page id of a row's review: "review:trx-2024-0891" → "trx-2024-0891". */
export const idOf = (opens: string | undefined) => (opens ? opens.slice("review:".length) : "");

/** A queue row with this session's change applied. `demo` carries the change for the Completed side. */
export function applyRow<T extends { status: Status; opens?: string }>(row: T, demo: Demo): T & { demo?: AppChange } {
  const change = demo.apps[idOf(row.opens)];
  return change ? { ...row, status: change.status, demo: change } : row;
}

/** Rows sent back down the licensing chain leave the stage-3 pool entirely (work-queue.md §4b). */
export const leftStage = (r: { demo?: AppChange }) => r.demo?.kind === "chain";

/** The review page with this session's change applied: the panels give way to what was done. */
export function applyApp(app: Application, demo: Demo): Application {
  const change = demo.apps[app.id];
  if (!change) return app;
  const ref = app.title.split(" — ")[0];
  const reason = change.reason ? ` Reason: “${change.reason}”.` : "";
  const held: Application["held"] =
    change.kind === "overturned"
      ? {
          tone: "neutral",
          title: `Overturned by you on ${change.on} — this is final`,
          body: `${change.replaced} replaced by ${change.status.label}.${reason} Both decisions stay on record. There is no undo and no second overturn.`,
        }
      : change.kind === "decided"
        ? {
            tone: "neutral",
            title: `${change.status.label} by you on ${change.on}`,
            body: `Recorded in the audit trail${change.reason ? ` with your reason: “${change.reason}”` : ""}. ${ref} is now on the queue's Completed side.`,
          }
        : change.kind === "chain"
          ? { tone: "neutral", title: `${change.status.label} on ${change.on}`, body: `You sent ${ref} back down the chain.${reason} It has left the stage-3 pool.` }
          : {
              tone: "warning",
              title: change.status.label === "Returned" ? "Returned to the applicant for correction" : "Waiting on the applicant",
              body: `You ${change.status.label === "Returned" ? "returned" : "requested additional information on"} ${ref} on ${change.on}.${reason} It comes back to the queue when they respond — nothing can be decided while it is with them.`,
            };
  return { ...app, status: change.status, claim: undefined, decide: undefined, decideBlock: undefined, override: undefined, held };
}
