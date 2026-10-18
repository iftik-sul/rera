"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Page } from "@/components/shell/Page";
import { showToastOnNextPage } from "@/components/shell/Toast";
import { directorGeneral, href } from "@/config/roles";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Breadcrumb, Card, FieldGroup, Notice } from "@/components/ui/Cards";
import { Acknowledge, Modal, ReasonField } from "@/components/ui/Modal";
import { StepUpModal } from "@/components/ui/StepUpModal";
import type { SignoffDetail } from "@/data/director-general/signoff";

type Step = "authorise" | "stepup" | "decline" | null;

/**
 * Sign-off Detail (Figma "Sign-off Detail") and its decisions:
 *  - Authorise (KB M-GOV-01, destructive pattern): optional note + "I understand" tick,
 *    then step-up re-authentication, then back to the queue with a toast.
 *  - Decline (KB M-GOV-02, reason-required pattern): returns the matter to Licensing.
 * Figma doesn't draw these pop-ups; their wording follows the KB modal spec.
 * The decision panel closes the page and is never pinned (KB signoff-detail.md §5).
 */
export function SignoffDetailView({ matter }: { matter: SignoffDetail }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(null);
  const [note, setNote] = useState("");
  const [ack, setAck] = useState(false);
  const [reason, setReason] = useState("");
  const pending = matter.status.label === "Pending Sign-off";

  const open = (s: Step) => {
    setNote("");
    setAck(false);
    setReason("");
    setStep(s);
  };
  const close = () => setStep(null);
  const done = (toast: { title: string; body: string }) => {
    showToastOnNextPage(toast);
    router.push(href(directorGeneral, "sign-off-queue"));
  };

  return (
    <Page title={matter.title} subtitle={matter.subtitle} bodyClassName="gap-4 px-8 py-5">
      <Breadcrumb items={[{ label: "Sign-off Queue", href: href(directorGeneral, "sign-off-queue") }, { label: "Sign-off Detail" }]} />

      <section className="flex flex-col gap-4 rounded-xl border border-n30 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold text-n900">{matter.subtitle}</h2>
            <p className="text-xs text-n400">{matter.reference}</p>
          </div>
          <StatusBadge status={matter.status} />
        </div>
        <div className="flex gap-6">
          {matter.meta.map((m) => (
            <div key={m.label} className="flex flex-1 flex-col gap-1">
              <span className="text-xs font-medium text-n400">{m.label}</span>
              <span className="text-sm font-medium text-n900">{m.value}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-start gap-6">
        <Card title="Matter" className="min-w-0 flex-1">
          {matter.groups.map((g) => (
            <FieldGroup key={g.title} title={g.title} fields={g.fields} />
          ))}
        </Card>

        <Card title="Recommendation" gap="gap-3" className="w-[360px] shrink-0" aside={<Badge tone="error">{matter.recommendation.badge}</Badge>}>
          <p className="text-[13px] font-semibold text-n900">{matter.recommendation.headline}</p>
          <p className="text-[13px] leading-5 text-n400">{matter.recommendation.body}</p>
          <p className="border-t border-n30 pt-3 text-xs text-n400">{matter.recommendation.by}</p>
        </Card>
      </div>

      {pending && (
        <div className="flex items-center gap-6 rounded-xl border border-n40 bg-white px-6 py-4">
          <p className="flex-1 text-xs text-n400">{matter.panelNote}</p>
          <Button variant="danger" onClick={() => open("decline")}>
            Decline
          </Button>
          <Button variant="primary" onClick={() => open("authorise")}>
            Authorise
          </Button>
        </div>
      )}

      <Modal
        open={step === "authorise"}
        onClose={close}
        title={matter.authorise.title}
        description={<p>{matter.authorise.body}</p>}
        actions={
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="danger" disabled={!ack} onClick={() => setStep("stepup")}>
              {matter.authorise.confirm}
            </Button>
          </>
        }
      >
        <Notice>{matter.authorise.callout}</Notice>
        <ReasonField optional label="Note (optional)" placeholder="Add a note for Licensing, if any." value={note} onChange={setNote} />
        <Acknowledge checked={ack} onChange={setAck}>
          I understand this authorises the revocation and cannot be undone from this screen.
        </Acknowledge>
      </Modal>

      <StepUpModal open={step === "stepup"} action="Authorising a sign-off" onCancel={close} onConfirmed={() => done(matter.authorise.toast)} />

      <Modal
        open={step === "decline"}
        onClose={close}
        width={480}
        title={matter.decline.title}
        description={<p>{matter.decline.body}</p>}
        actions={
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="danger" disabled={!reason.trim()} onClick={() => done(matter.decline.toast)}>
              {matter.decline.confirm}
            </Button>
          </>
        }
      >
        <ReasonField label={matter.decline.label} placeholder={matter.decline.placeholder} value={reason} onChange={setReason} />
      </Modal>
    </Page>
  );
}
