"use client";

import { useState } from "react";
import { recordStaff, useDemo } from "@/lib/demo";
import { applyStaff } from "./useStaff";
import { Page } from "@/components/shell/Page";
import { showToast } from "@/components/shell/Toast";
import { directorGeneral, href } from "@/config/roles";
import { Button } from "@/components/ui/Button";
import { Breadcrumb, DetailHeader, Notice } from "@/components/ui/Cards";
import { Acknowledge, Modal, ReasonField } from "@/components/ui/Modal";
import { StepUpModal } from "@/components/ui/StepUpModal";
import {
  ALL_CATEGORY_ROLES,
  CATEGORIES,
  accountStatus,
  SCOPED_ROLES,
  assignmentBlocker,
  type AccountStatus,
  type Category,
  type Mfa,
  type RoleName,
  type StaffMember,
} from "@/data/director-general/staff";
import { AdminBlockerModal } from "./AdminBlockerModal";
import { RoleScopeFields } from "./RoleScopeFields";

type Step = "role" | "mfa" | "unlock" | "suspend" | "reactivate" | "deactivate" | "stepup" | null;

const list = (items: string[]) => (items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);

/**
 * Admin Console — Account Editor (Figma) and its pop-ups:
 *   M-ADM-02 Change role & scope (reason required) · M-ADM-04 Reset MFA ·
 *   M-ADM-05 Suspend (tick box) · M-ADM-06 Deactivate (tick box + step-up) ·
 *   plus the one refusal (a licensing role with no category). One role per account.
 * DEMO: changes last until you leave the page — there is no server to save them to.
 */
export function AccountEditor({ member }: { member: StaffMember }) {
  // The account as it stands in this session: sample data + changes made here (lib/demo.ts),
  // so the Admin Console list, the Dashboard and the Audit Trail all see them.
  const demo = useDemo();
  const current = applyStaff(member, demo.staff[member.id]);
  const { role, scope, status, mfa, lockedOut, mfaRequest } = current;
  const [step, setStep] = useState<Step>(null);
  const [blocked, setBlocked] = useState<"category" | null>(null);
  // Draft values inside the pop-ups
  const [draftRole, setDraftRole] = useState<RoleName | null>(null);
  const [draftScope, setDraftScope] = useState<Category[]>([]);
  const [reason, setReason] = useState("");
  const [ack, setAck] = useState(false);

  const first = member.name.split(" ")[0];
  const scoped = SCOPED_ROLES.includes(role);
  const allByRole = ALL_CATEGORY_ROLES.includes(role);
  const closed = status === "Deactivated";
  const locked = member.self || closed;

  const open = (s: Step) => {
    setDraftRole(role);
    setDraftScope(scope);
    setReason("");
    setAck(false);
    setStep(s);
  };
  const close = () => setStep(null);

  const saveRole = () => {
    if (!draftRole) return;
    const b = assignmentBlocker(draftRole, draftScope);
    if (b) return setBlocked(b);
    const nextScope = SCOPED_ROLES.includes(draftRole) ? draftScope : [];
    recordStaff(member.id, { role: draftRole, scope: nextScope }, { action: "Role assignment changed", type: "Access", subsystem: "Access", subject: member.email, reason: reason.trim() });
    close();
    showToast({ title: "Role updated", body: `${member.name}'s role and category scope were changed. Recorded in the audit trail.` });
  };
  const setAccount = (s: AccountStatus, title: string, body: string) => {
    const action = { Active: "Account reactivated", Suspended: "Account suspended", Deactivated: "Account deactivated", Invited: "Invitation sent" }[s];
    recordStaff(member.id, { status: s }, { action, type: "Access", subsystem: "Access", subject: member.email, reason: reason.trim() || "—" });
    close();
    showToast({ title, body });
  };

  const currently = `${member.name} currently holds ${role}${scoped ? `, scoped to ${list(scope)}` : ""}.`;

  return (
    <Page title={member.name} subtitle="Edit staff account" bodyClassName="gap-4 px-8 py-5">
      <Breadcrumb items={[{ label: "Admin Console", href: href(directorGeneral, "admin-console") }, { label: "Staff Account" }]} />

      <DetailHeader
        title={member.name}
        subtitle={member.email}
        status={accountStatus(status)}
        meta={[
          { label: "Role", value: role },
          { label: "MFA", value: mfa === "Enrolled" ? "Enrolled" : "Not enrolled" },
        ]}
      />

      {member.self && <Notice>This is your own account. Your role and account status can&apos;t be changed from your own session.</Notice>}
      {closed && <Notice>This account is deactivated. Deactivation is permanent — nothing on it can be changed.</Notice>}
      {!locked && lockedOut && (
        <Notice>
          Sign-in locked on {lockedOut} after repeated failed attempts. The account is still {status} — only sign-in is blocked until you unlock it.
        </Notice>
      )}
      {!locked && mfaRequest && <Notice>{first} asked for an MFA reset on {mfaRequest}. Reset MFA below to send a new enrolment link.</Notice>}

      <Section title="Role" rows={[["Assigned role", role]]}>
        {!locked && <Button onClick={() => open("role")}>Change role</Button>}
      </Section>

      {(scoped || allByRole) && (
        <Section
          title="Licensing category scope"
          rows={
            allByRole
              ? [["In scope", "All categories — covered by the role"]]
              : [
                  ["In scope", scope.join(" · ")],
                  ["Not in scope", CATEGORIES.filter((c) => !scope.includes(c)).join(" · ") || "—"],
                ]
          }
        >
          {!locked && scoped && <Button onClick={() => open("role")}>Edit scope</Button>}
        </Section>
      )}

      {!locked && lockedOut && (
        <Section title="Sign-in" rows={[["Status", `Locked out since ${lockedOut}`]]}>
          <Button variant="primary" onClick={() => open("unlock")}>Unlock sign-in</Button>
        </Section>
      )}

      <Section title="Multi-factor authentication" rows={[["Status", mfaRequest ? `${mfa} · reset requested` : mfa]]}>
        {!locked && <Button onClick={() => open("mfa")}>{mfa === "Enrolled" ? "Reset MFA" : "Resend enrolment link"}</Button>}
      </Section>

      <Section title="Account status" rows={[["Status", status]]}>
        {!locked && (
          <>
            {status === "Active" && <Button onClick={() => open("suspend")}>Suspend</Button>}
            {status === "Suspended" && <Button onClick={() => open("reactivate")}>Reactivate</Button>}
            <Button variant="danger" onClick={() => open("deactivate")}>
              Deactivate
            </Button>
          </>
        )}
      </Section>

      {/* M-ADM-02 — Change role & scope (reason required) */}
      <Modal
        open={step === "role" && !blocked}
        onClose={close}
        width={520}
        title="Change role & category scope?"
        description={<p>{currently} An account holds one role. Changing it updates which screens the account can reach; a licensing role must keep at least one category.</p>}
        actions={
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="primary" disabled={!reason.trim() || !draftRole} onClick={saveRole}>
              Save changes
            </Button>
          </>
        }
      >
        <RoleScopeFields role={draftRole} scope={draftScope} onRole={setDraftRole} onScope={setDraftScope} />
        <ReasonField label="Why is the role or scope changing?" placeholder="Record the reason for the change." value={reason} onChange={setReason} />
      </Modal>
      <AdminBlockerModal which={step === "role" ? blocked : null} onClose={() => setBlocked(null)} />

      {/* M-ADM-04 — Reset MFA / resend enrolment */}
      <Modal
        open={step === "mfa"}
        onClose={close}
        title={mfa === "Enrolled" ? "Reset multi-factor authentication?" : "Resend the enrolment link?"}
        description={
          <p>
            {mfa === "Enrolled"
              ? `This invalidates ${member.name}'s current MFA factor and sends a new enrolment link. The account stays ${status} but can't act until they re-enrol.`
              : `${member.name} gets a new link to enrol MFA. The account can't act until they do.`}
          </p>
        }
        actions={
          <>
            <Button onClick={close}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                recordStaff(member.id, { mfa: "Not enrolled", ...(mfaRequest ? { mfaRequest: null } : {}) }, { action: mfa === "Enrolled" ? "MFA reset" : "Enrolment link resent", type: "Access", subsystem: "Access", subject: member.email, reason: "—" });
                close();
                showToast({ title: mfa === "Enrolled" ? "MFA reset" : "Enrolment link sent", body: `${member.name} has been sent a new enrolment link.` });
              }}
            >
              {mfa === "Enrolled" ? "Reset MFA" : "Send link"}
            </Button>
          </>
        }
      >
        <Notice>Only the MFA factor is reset — roles and category scope are unchanged.</Notice>
      </Modal>

      {/* M-ADM-08 — Unlock sign-in (open-questions A16, decided 2026-10-19). */}
      <Modal
        open={step === "unlock"}
        onClose={close}
        width={480}
        title="Unlock sign-in?"
        description={<p>{member.name} can sign in again straight away. Role, category scope and MFA are unchanged.</p>}
        actions={
          <>
            <Button onClick={close}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                recordStaff(member.id, { lockedOut: null }, { action: "Sign-in unlocked", type: "Access", subsystem: "Access", subject: member.email, reason: "—" });
                close();
                showToast({ title: "Sign-in unlocked", body: `${first} can sign in again. Recorded in the audit trail.` });
              }}
            >
              Unlock sign-in
            </Button>
          </>
        }
      >
        <Notice>If you don&apos;t recognise the failed attempts, suspend the account instead and reset MFA.</Notice>
      </Modal>

      {/* M-ADM-05 — Suspend (destructive, tick box) */}
      <Modal
        open={step === "suspend"}
        onClose={close}
        title="Suspend this account?"
        description={<p>{member.name} loses access immediately. Suspension is reversible — you can reactivate the account later.</p>}
        actions={
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="danger" disabled={!ack || !reason.trim()} onClick={() => setAccount("Suspended", "Account suspended", `${member.name} no longer has access. Recorded in the audit trail.`)}>
              Suspend account
            </Button>
          </>
        }
      >
        <Notice>Any item the account currently holds returns to the pool.</Notice>
        <ReasonField label="Why is this account being suspended?" placeholder="For example: pending an investigation." value={reason} onChange={setReason} />
        <Acknowledge checked={ack} onChange={setAck}>
          I understand access is withdrawn immediately.
        </Acknowledge>
      </Modal>

      {/* Reactivate — not drawn in Figma; the KB says suspension is reversible. */}
      <Modal
        open={step === "reactivate"}
        onClose={close}
        width={480}
        title="Reactivate this account?"
        description={<p>{member.name} gets their access back with the same role and category scope.</p>}
        actions={
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="primary" onClick={() => setAccount("Active", "Account reactivated", `${first} has access again. Recorded in the audit trail.`)}>
              Reactivate account
            </Button>
          </>
        }
      />

      {/* M-ADM-06 — Deactivate (destructive, tick box, then step-up) */}
      <Modal
        open={step === "deactivate"}
        onClose={close}
        title="Deactivate this account?"
        description={<p>{member.name} loses access immediately. Deactivation is treated as permanent.</p>}
        actions={
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="danger" disabled={!ack || !reason.trim()} onClick={() => setStep("stepup")}>
              Deactivate account
            </Button>
          </>
        }
      >
        <Notice>You&apos;ll be asked to re-authenticate. This is recorded against you in the audit trail.</Notice>
        <ReasonField label="Why is this account being deactivated?" placeholder="For example: left the authority." value={reason} onChange={setReason} />
        <Acknowledge checked={ack} onChange={setAck}>
          I understand this is permanent.
        </Acknowledge>
      </Modal>
      <StepUpModal
        open={step === "stepup"}
        action="Deactivating an account"
        onCancel={close}
        onConfirmed={() => setAccount("Deactivated", "Account deactivated", `${member.name}'s access has been withdrawn permanently.`)}
      />
    </Page>
  );
}

function Section({ title, rows, children }: { title: string; rows: [string, string][]; children?: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-card border border-card bg-white px-6 py-5">
      <h3 className="type-group-title text-strong">{title}</h3>
      {rows.map(([label, value]) => (
        <div key={label} className="flex gap-6 type-body">
          <span className="w-50 shrink-0 text-muted">{label}</span>
          <span className="text-strong">{value}</span>
        </div>
      ))}
      {children && <div className="flex gap-2 pt-1">{children}</div>}
    </section>
  );
}
