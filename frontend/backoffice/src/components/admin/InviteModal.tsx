"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/components/shell/Toast";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Cards";
import { Modal } from "@/components/ui/Modal";
import { assignmentBlocker, type Category, type RoleName } from "@/data/director-general/staff";
import { AdminBlockerModal } from "./AdminBlockerModal";
import { RoleScopeFields } from "./RoleScopeFields";

/**
 * M-ADM-01 Invite staff account (form pattern). Figma shows a single "Initial role" picker;
 * the role tick boxes and category scope are added so its callout ("a licensing role also
 * needs at least one category scope, set here") can actually be met.
 * DEMO: no account is created and no email is sent — the toast confirms what would happen.
 */
export function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<RoleName[]>([]);
  const [scope, setScope] = useState<Category[]>([]);
  const [blocked, setBlocked] = useState<"category" | "separation" | null>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setEmail("");
    setRoles([]);
    setScope([]);
  }, [open]);

  const valid = name.trim() !== "" && /^[^\s@]+@rera\.gov\.ng$/i.test(email.trim()) && roles.length > 0;
  const send = () => {
    const b = assignmentBlocker(roles, scope);
    if (b) return setBlocked(b);
    onClose();
    showToast({ title: "Invite sent", body: `${name.trim()} will get an email to set a password and enrol MFA.` });
  };

  return (
    <>
      <Modal
        open={open && !blocked}
        onClose={onClose}
        title="Invite a staff account"
        description={<p>Create an account and assign its first role. The person gets an email to set a password and enrol MFA — until MFA is enrolled, the account can&apos;t act.</p>}
        actions={
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" disabled={!valid} onClick={send}>
              Send invite
            </Button>
          </>
        }
      >
        <Field label="Full name" value={name} onChange={setName} placeholder="e.g. Amina Bello" />
        <Field label="Work email" value={email} onChange={setEmail} placeholder="name@rera.gov.ng" hint="Must be a rera.gov.ng address." />
        <RoleScopeFields roles={roles} scope={scope} onRoles={setRoles} onScope={setScope} />
        <Notice>A licensing role also needs at least one category scope, set here.</Notice>
      </Modal>
      <AdminBlockerModal which={open ? blocked : null} onClose={() => setBlocked(null)} />
    </>
  );
}

function Field({ label, value, onChange, placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-n900">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-n40 bg-white px-3 py-2.5 text-[13px] leading-5 text-n900 outline-none placeholder:text-n400 focus:border-blue-600"
      />
      {hint && <span className="text-xs text-n400">{hint}</span>}
    </label>
  );
}
