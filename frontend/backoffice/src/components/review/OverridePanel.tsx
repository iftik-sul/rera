"use client";

import { useState } from "react";
import { showToast } from "@/components/shell/Toast";
import { DG_NAME, DG_ROLE, demoToday, recordApp } from "@/lib/demo";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Cards";
import { Acknowledge, Modal, ReasonField } from "@/components/ui/Modal";
import { StepUpModal } from "@/components/ui/StepUpModal";
import type { Application, OverrideActions } from "@/data/director-general/applications";

/**
 * Override panel on a decided item, and its flow (KB modals.md §9, revised 2026-10-19):
 *   Overturn decision (M-GOV-03: reason + tick box) → the consequence — revoke the issued output
 *   (M-GOV-04, or M-LIC-03 for a credential) or issue it fresh dated today (M-GOV-05) →
 *   step-up re-authentication (M-SYS-02), once, at the end → recorded.
 * Nothing is recorded until the code is entered; cancelling any step before it says so.
 * Once recorded the item stays on screen, now read-only and Overturned (lib/demo.ts).
 */
export function OverridePanel({ app, actions }: { app: Application; actions: OverrideActions }) {
  const [step, setStep] = useState<"overturn" | "stepup" | "revoke" | null>(null);
  const [reason, setReason] = useState("");
  const [ack, setAck] = useState(false);
  const { recorded } = actions;

  const startOverturn = () => {
    setReason("");
    setAck(false);
    setStep("overturn");
  };
  const close = () => setStep(null);
  // Leaving after the first pop-up: nothing was recorded, and the officer is told so.
  const abandon = () => {
    setStep(null);
    showToast({ title: "Overturn not recorded", body: "Nothing changed — the recorded decision stands." });
  };
  const ref = app.title.split(" — ")[0];
  const record = () => {
    const to = recorded.outcome.label === "Rejected" ? "Approved" : "Rejected";
    recordApp(
      app.id,
      { status: { label: to, tone: to === "Approved" ? "success" : "error", overturned: true }, kind: "overturned", replaced: `${recorded.outcome.label} by ${recorded.decidedBy}`, on: demoToday(), by: DG_NAME, role: DG_ROLE, reason: reason.trim() },
      { action: "Decision overturned", type: "Override", subsystem: app.queue === "licensing" ? "Licensing" : app.queue === "escrow" ? "Escrow" : "Transaction", subject: ref, reason: reason.trim() },
    );
    setStep(null);
    showToast(actions.revoke.toast);
  };

  return (
    <section className="flex flex-col gap-4 rounded-card border border-card bg-white px-6 py-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="type-section-title text-strong">Override</h2>
        <Badge tone="warning">Step-up required</Badge>
      </div>

      {/* Fields sit on an even four-column grid, so the two cards line up column for column. */}
      <div className="flex flex-col gap-4 rounded-control border border-control p-5">
        <h3 className="type-group-title text-strong">Recorded decision</h3>
        <div className="grid grid-cols-4 gap-x-6 gap-y-4">
          <Pair label="Outcome" value={<StatusBadge status={recorded.outcome} />} />
          <Pair label="Decided by" value={recorded.decidedBy} />
          <Pair label="Role" value={recorded.role} />
          <Pair label="Recorded" value={recorded.recordedAt} />
          <div className="col-span-4">
            <Pair label="Reason recorded" value={recorded.reason} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-control border border-control p-5">
        <h3 className="type-group-title text-strong">Issued output</h3>
        <div className="grid grid-cols-4 gap-x-6 gap-y-4">
          {actions.issued.map((f) => (
            <Pair key={f.label} label={f.label} value={f.value} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 rounded-card bg-warning-bg px-4 py-3">
        <p className="type-group-title text-ageing">{actions.bannerTitle}</p>
        <p className="type-caption text-strong">{actions.banner}</p>
      </div>

      <div className="flex items-center gap-16 border-t border-card pt-4">
        <p className="flex-1 type-caption text-muted">{actions.footnote}</p>
        <Button variant="primary" onClick={startOverturn}>
          Overturn decision
        </Button>
      </div>

      <Modal
        open={step === "overturn"}
        onClose={close}
        title={actions.overturn.title}
        description={<p>{actions.overturn.body}</p>}
        actions={
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="danger" disabled={!reason.trim() || !ack} onClick={() => setStep("revoke")}>
              Overturn decision
            </Button>
          </>
        }
      >
        <Notice>{actions.overturn.callout}</Notice>
        <ReasonField label={actions.overturn.label} placeholder={actions.overturn.placeholder} value={reason} onChange={setReason} />
        <Acknowledge checked={ack} onChange={setAck}>
          {actions.overturn.acknowledge}
        </Acknowledge>
      </Modal>

      <Modal
        open={step === "revoke"}
        onClose={abandon}
        title={actions.revoke.title}
        description={<p>{actions.revoke.body}</p>}
        actions={
          <>
            <Button onClick={abandon}>Cancel</Button>
            <Button variant={actions.revoke.variant ?? "danger"} onClick={() => setStep("stepup")}>
              {actions.revoke.confirm}
            </Button>
          </>
        }
      >
        <Notice>{actions.revoke.callout}</Notice>
        <Notice>Next you&apos;ll re-authenticate. Nothing is recorded until you do.</Notice>
      </Modal>

      <StepUpModal open={step === "stepup"} action="Overturning a decision" onCancel={abandon} onConfirmed={record} />
    </section>
  );
}

function Pair({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="type-caption text-muted">{label}</span>
      <span className="type-body text-strong">{value}</span>
    </div>
  );
}
