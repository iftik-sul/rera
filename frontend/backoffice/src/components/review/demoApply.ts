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
  const said = change.reason ? (/[.!?]$/.test(change.reason.trim()) ? change.reason.trim() : `${change.reason.trim()}.`) : "";
  const reason = said ? ` Reason: “${said}”` : "";
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
            body: `Recorded in the audit trail${said ? ` with your reason: “${said}”` : "."} ${ref} is now on the queue's Completed side.`,
          }
        : change.kind === "chain"
          ? { tone: "neutral", title: `${change.status.label} on ${change.on}`, body: `You sent ${ref} back down the chain.${reason} It has left the stage-3 pool.` }
          : {
              tone: "warning",
              title: change.status.label === "Returned" ? "Returned to the applicant for correction" : "Waiting on the applicant",
              body: `You ${change.status.label === "Returned" ? "returned" : "requested additional information on"} ${ref} on ${change.on}.${reason} It comes back to the queue when they respond — nothing can be decided while it is with them.`,
            };
  return { ...app, ...licensingAfter(app, change), status: change.status, claim: undefined, decide: undefined, decideBlock: undefined, override: undefined, held };
}

/**
 * A licensing item's subtitle and review chain describe its stage, so they must move on too:
 * the DG's decision or overturn joins the chain as its own entry (both decisions stay on record),
 * and the chain's notice stops offering what can no longer be done.
 */
function licensingAfter(app: Application, change: AppChange): Partial<Application> {
  if (app.queue !== "licensing" || !app.chain) return {};
  const said = change.reason ? ` Reason given: “${/[.!?]$/.test(change.reason.trim()) ? change.reason.trim() : `${change.reason.trim()}.`}”` : "";
  const entry = (name: string) => ({ name, outcome: change.status, recorded: `${change.by} recorded this on ${change.at ?? change.on}.`, reason: said.trim() || "Reason given: none required." });
  const path = app.chain.path.replace(/→\s+Stage 3[^→]*$/, "→  ");
  if (change.kind === "overturned")
    return {
      subtitle: `Overturned — now ${change.status.label}`,
      chain: {
        stages: [...app.chain.stages, entry("Override · Director-General / Registrar")],
        path: `${app.chain.path}  →  Overturned — ${change.status.label}`,
        noticeTitle: "Overturned — this is final.",
        notice: "Both decisions stay on record. There is no undo and no second overturn.",
      },
    };
  if (change.kind === "decided")
    return {
      subtitle: `Decided at Stage 3 — ${change.status.label}`,
      chain: {
        stages: [...app.chain.stages, entry("Stage 3 · Director-General / Registrar")],
        path: `${path}Stage 3 Director-General — ${change.status.label}`,
        noticeTitle: "This item is decided.",
        notice: "It can't be decided again; an overturn replaces the decision and keeps it on record.",
      },
    };
  return { subtitle: change.kind === "chain" ? `${change.status.label} — no longer at Stage 3` : `With the applicant — ${change.status.label}` };
}
