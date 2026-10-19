"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/components/shell/RoleContext";
import { showToastOnNextPage } from "@/components/shell/Toast";
import { href } from "@/config/roles";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Cards";
import { RadioGroup } from "@/components/ui/Form";
import { HelpBox, Modal, ReasonField } from "@/components/ui/Modal";
import type { Application, DecideActions } from "@/data/director-general/applications";

type Which = "approve" | "request" | "return" | "reject" | "blocked" | "chain" | null;

/**
 * Decision bar pinned to the bottom of Application Review, plus its four
 * pop-ups (Figma M-DEC-01 … M-DEC-04). Confirming goes to the Dashboard
 * (as in the Figma prototype) and shows a confirmation toast there.
 * Request / Return / Reject need a reason before they can be confirmed.
 * A guard on the item (app.decideBlock — e.g. M-BLK-02, no trustee assessment) makes
 * Approve and Reject explain why instead of acting; Request and Return still work.
 * Licensing items at stage 3 add "Return to stage 1 or 2" (M-CHN-05): back down the chain with a
 * reason, superseding the positions from that stage on. It is not a decision and nothing is issued.
 */
export function DecisionPanel({ app, actions }: { app: Application; actions: DecideActions }) {
  const role = useRole();
  const router = useRouter();
  const [open, setOpen] = useState<Which>(null);
  const [reason, setReason] = useState("");
  const [stage, setStage] = useState<"1" | "2" | null>(null);
  const licensing = app.queue === "licensing";
  const ref = app.title.split(" — ")[0];
  const officer = (i: number) => app.chain?.stages[i]?.recorded.split(" recorded")[0] ?? "";

  const show = (w: Which) => {
    setReason("");
    setStage(null);
    setOpen(app.decideBlock && (w === "approve" || w === "reject") ? "blocked" : w);
  };
  const close = () => setOpen(null);
  const done = (toast: { title: string; body: string }) => {
    showToastOnNextPage(toast);
    router.push(href(role, "dashboard"));
  };
  const hasReason = reason.trim().length > 0;

  const paragraphs = (lines: string[]) => lines.map((l) => <p key={l}>{l}</p>);

  return (
    <>
      <div className="flex items-center gap-3 rounded-card border border-control bg-white px-6 py-4">
        <Button variant="primary" onClick={() => show("approve")}>
          Approve
        </Button>
        <Button onClick={() => show("request")}>{actions.requestLabel}</Button>
        <Button onClick={() => show("return")}>Return</Button>
        {licensing && <Button onClick={() => show("chain")}>Return to stage 1 or 2</Button>}
        <span className="flex-1" />
        <Button variant="danger" onClick={() => show("reject")}>
          Reject
        </Button>
      </div>

      <Modal
        open={open === "approve"}
        onClose={close}
        title={actions.approve.title}
        description={paragraphs(actions.approve.body)}
        actions={
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="primary" onClick={() => done(actions.approve.toast)}>
              {actions.approve.confirm ?? "Approve and issue"}
            </Button>
          </>
        }
      >
        <Notice>{actions.approve.callout}</Notice>
      </Modal>

      {app.decideBlock && (
        <Modal
          open={open === "blocked"}
          onClose={close}
          title={app.decideBlock.title}
          description={app.decideBlock.body}
          actions={<Button onClick={close}>Dismiss</Button>}
        >
          <HelpBox title={app.decideBlock.helpTitle}>{app.decideBlock.help}</HelpBox>
        </Modal>
      )}

      {licensing && (
        <Modal
          open={open === "chain"}
          onClose={close}
          title="Return this item down the chain?"
          description={
            <p>
              {ref} goes back to the stage you choose, with your reason. This isn&apos;t a decision: nothing is issued, and the applicant isn&apos;t told.
            </p>
          }
          actions={
            <>
              <Button onClick={close}>Cancel</Button>
              <Button
                variant="primary"
                disabled={!stage || !hasReason}
                onClick={() =>
                  done({ title: `Returned to stage ${stage}`, body: `${ref} is back in the stage ${stage} pool with your reason.` })
                }
              >
                Return item
              </Button>
            </>
          }
        >
          <RadioGroup
            name="return-stage"
            value={stage}
            onChange={setStage}
            options={[
              {
                value: "1",
                label: "Stage 1 — Reviewer",
                hint: `${officer(0)}'s recommendation and ${officer(1)}'s position are both superseded. The chain runs again from the start.`,
              },
              { value: "2", label: "Stage 2 — Authorizer", hint: `${officer(1)}'s position is superseded. ${officer(0)}'s recommendation stands.` },
            ]}
          />
          <ReasonField
            label="What should that stage look at again?"
            placeholder="Name the check or document the earlier stage should revisit."
            value={reason}
            onChange={setReason}
          />
        </Modal>
      )}

      {(["request", "return"] as const).map((w) => {
        const d = actions[w];
        return (
          <Modal
            key={w}
            open={open === w}
            onClose={close}
            width={480}
            title={d.title}
            description={paragraphs(d.body)}
            actions={
              <>
                <Button onClick={close}>Cancel</Button>
                <Button variant="primary" disabled={!hasReason} onClick={() => done(d.toast)}>
                  {d.confirm}
                </Button>
              </>
            }
          >
            <ReasonField label={d.label} placeholder={d.placeholder} value={reason} onChange={setReason} />
          </Modal>
        );
      })}

      <Modal
        open={open === "reject"}
        onClose={close}
        title={actions.reject.title}
        description={paragraphs(actions.reject.body)}
        actions={
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="danger" disabled={!hasReason} onClick={() => done(actions.reject.toast)}>
              {actions.reject.confirm}
            </Button>
          </>
        }
      >
        <Notice>{actions.reject.callout}</Notice>
        <ReasonField label={actions.reject.label} placeholder={actions.reject.placeholder} value={reason} onChange={setReason} />
      </Modal>
    </>
  );
}
