"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Page } from "@/components/shell/Page";
import { showToastOnNextPage } from "@/components/shell/Toast";
import { demoToday, recordSignoff, useDemo, type SignoffChange } from "@/lib/demo";
import { directorGeneral, href } from "@/config/roles";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Banner, Breadcrumb, Card, DetailHeader, FieldGroup, Notice } from "@/components/ui/Cards";
import { Acknowledge, Modal, ReasonField } from "@/components/ui/Modal";
import { StepUpModal } from "@/components/ui/StepUpModal";
import type { SignoffDetail } from "@/data/director-general/signoff";
import { Activity, type ActivityItem } from "@/components/ui/Activity";
import { auditFor } from "@/components/review/activity";
import { linkRefs } from "@/components/ui/RefLink";

type Step = "authorise" | "stepup" | "decline" | null;

/**
 * Sign-off Detail (Figma "Sign-off Detail") and its decisions:
 *  - Authorise (KB M-GOV-01, destructive pattern): optional note + "I understand" tick,
 *    then step-up re-authentication, then back to the queue with a toast.
 *  - Decline (KB M-GOV-02, reason-required pattern): returns the matter to Licensing.
 * Figma doesn't draw these pop-ups; their wording follows the KB modal spec.
 * The decision panel closes the page and is never pinned (KB signoff-detail.md §5).
 */
export function SignoffDetailView({ matter: sample }: { matter: SignoffDetail }) {
  // A decision taken on this matter in this session (lib/demo.ts) turns the page read-only.
  const demo = useDemo();
  const matter = applySignoff(sample, demo.signoffs[sample.id]);
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
  const done = (what: "Authorised" | "Declined", toast: { title: string; body: string }) => {
    const why = what === "Declined" ? reason.trim() : note.trim() || undefined;
    recordSignoff(matter.id, { status: what, on: demoToday(), reason: why }, { action: what === "Authorised" ? "Sign-off authorised" : "Sign-off declined", type: "Decision", subsystem: "Sign-off", subject: matter.reference, reason: why ?? "—" });
    showToastOnNextPage({ ...toast, link: { label: `View ${matter.reference}`, href: href(directorGeneral, `sign-off-queue/${matter.id}`) } });
    router.push(href(directorGeneral, "sign-off-queue"));
  };

  return (
    <Page title={matter.title} subtitle={matter.subtitle} bodyClassName="gap-4 px-8 py-5">
      <Breadcrumb items={[{ label: "Sign-off Queue", href: href(directorGeneral, "sign-off-queue") + (pending ? "" : "?view=completed") }, { label: matter.reference }]} />

      <DetailHeader title={matter.subtitle} subtitle={matter.reference} status={matter.status} meta={matter.meta} />

      <div className="flex items-start gap-6">
        <Card title="Matter" className="min-w-0 flex-1">
          {matter.groups.map((g) => (
            <FieldGroup key={g.title} title={g.title} fields={linkRefs(g.fields)} />
          ))}
        </Card>

        <Card title="Recommendation" gap="gap-3" className="w-panel shrink-0" aside={<Badge tone="error">{matter.recommendation.badge}</Badge>}>
          <p className="type-group-title text-strong">{matter.recommendation.headline}</p>
          <p className="type-body text-muted">{matter.recommendation.body}</p>
          <p className="border-t border-card pt-3 type-caption text-muted">{matter.recommendation.by}</p>
        </Card>
      </div>

      {pending && (
        <div className="flex items-center gap-6 rounded-card border border-control bg-white px-6 py-4">
          <p className="flex-1 type-caption text-muted">{matter.panelNote}</p>
          <Button variant="danger" onClick={() => open("decline")}>
            Decline
          </Button>
          <Button variant="primary" onClick={() => open("authorise")}>
            Authorise
          </Button>
        </div>
      )}

      {matter.outcome && (
        <div className="flex flex-col gap-2">
          <Banner tone={matter.outcome.tone} icon={matter.outcome.tone === "success" ? "check-circle" : "x-circle"}>{matter.outcome.title}</Banner>
          <p className="px-1 type-caption text-muted">{matter.outcome.body}</p>
        </div>
      )}

      <Activity items={signoffActivity(sample, matter, demo)} />

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
          {matter.authorise.acknowledge}
        </Acknowledge>
      </Modal>

      <StepUpModal open={step === "stepup"} action="Authorising a sign-off" onCancel={close} onConfirmed={() => done("Authorised", matter.authorise.toast)} />

      <Modal
        open={step === "decline"}
        onClose={close}
        width={480}
        title={matter.decline.title}
        description={<p>{matter.decline.body}</p>}
        actions={
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="danger" disabled={!reason.trim()} onClick={() => done("Declined", matter.decline.toast)}>
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

/** A matter decided in this session reads like one decided in the sample data: status + outcome banner, no panel. */
function applySignoff(m: SignoffDetail, c: SignoffChange | undefined): SignoffDetail {
  if (!c) return m;
  const authorised = c.status === "Authorised";
  return {
    ...m,
    status: { label: c.status, tone: authorised ? "success" : "error" },
    outcome: authorised
      ? { tone: "success", title: `Authorised by you on ${c.on}`, body: "Returned to Licensing to execute. A decided sign-off can't be changed from this screen." }
      : { tone: "neutral", title: `Declined by you on ${c.on}`, body: `Returned to Licensing with the reason: “${c.reason}” Nothing was changed on the register.` },
  };
}

/** The matter's history (KB signoff-detail.md §6): the escalation, the recommendation, the DG's decision and every Audit Trail entry about it. */
function signoffActivity(sample: SignoffDetail, matter: SignoffDetail, demo: ReturnType<typeof useDemo>): ActivityItem[] {
  const f = (label: string) => sample.groups.flatMap((g) => g.fields).find((x) => x.label === label)?.value;
  const items: ActivityItem[] = [];
  const by = f("Escalated by");
  const on = f("Date");
  if (by && on) items.push({ at: on, who: by, role: f("Role"), what: "Escalated for sign-off", note: sample.recommendation.headline });
  const decided = sample.outcome?.title.match(/^(Authorised|Declined) by (.+?) on (.+)$/);
  if (decided) items.push({ at: decided[3], who: decided[2], role: "Director-General / Registrar", what: `Sign-off ${decided[1].toLowerCase()}` });
  return [...items, ...auditFor(matter.reference, demo)];
}
