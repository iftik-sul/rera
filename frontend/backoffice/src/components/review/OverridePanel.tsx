"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/components/shell/RoleContext";
import { showToastOnNextPage } from "@/components/shell/Toast";
import { href } from "@/config/roles";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Cards";
import { Acknowledge, Modal, ReasonField } from "@/components/ui/Modal";
import type { Application, OverrideActions } from "@/data/director-general/applications";

/**
 * Override panel on a decided item, and its two-step flow:
 *   Overturn decision (Figma M-GOV-03) → Revoke the issued output (M-GOV-04) → Dashboard.
 * Overturn needs a reason and the tick box before it can be confirmed.
 */
export function OverridePanel({ app, actions }: { app: Application; actions: OverrideActions }) {
  const role = useRole();
  const router = useRouter();
  const [step, setStep] = useState<"overturn" | "revoke" | null>(null);
  const [reason, setReason] = useState("");
  const [ack, setAck] = useState(false);
  const { recorded } = actions;

  const startOverturn = () => {
    setReason("");
    setAck(false);
    setStep("overturn");
  };
  const close = () => setStep(null);

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-n30 bg-white px-6 py-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-medium text-n900">Override</h2>
        <Badge tone="warning">Step-up required</Badge>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-n40 p-4">
        <h3 className="text-[13px] font-semibold text-n900">Recorded Decision</h3>
        <div className="flex gap-6">
          <Pair label="Outcome" value={<StatusBadge status={recorded.outcome} />} />
          <Pair label="Decided by" value={recorded.decidedBy} />
          <Pair label="Role" value={recorded.role} />
          <Pair label="Recorded" value={recorded.recordedAt} />
        </div>
        <Pair label="Reason recorded" value={recorded.reason} />
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-n40 p-4">
        <h3 className="text-[13px] font-semibold text-n900">Issued Output</h3>
        <div className="flex gap-6">
          {actions.issued.map((f) => (
            <Pair key={f.label} label={f.label} value={f.value} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 rounded-xl bg-warning-bg px-4 py-3">
        <p className="text-[13px] font-semibold text-age-warning">{actions.bannerTitle}</p>
        <p className="text-xs text-n900">{actions.banner}</p>
      </div>

      <div className="flex items-center gap-16 border-t border-n30 pt-4">
        <p className="flex-1 text-xs text-n400">{actions.footnote}</p>
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
        onClose={close}
        title={actions.revoke.title}
        description={<p>{actions.revoke.body}</p>}
        actions={
          <>
            <Button onClick={close}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                showToastOnNextPage(actions.revoke.toast);
                router.push(href(role, "dashboard"));
              }}
            >
              {actions.revoke.confirm}
            </Button>
          </>
        }
      >
        <Notice>{actions.revoke.callout}</Notice>
      </Modal>
    </section>
  );
}

function Pair({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-n400">{label}</span>
      <span className="text-[13px] text-n900">{value}</span>
    </div>
  );
}
