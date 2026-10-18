"use client";

import { Button } from "@/components/ui/Button";
import { HelpBox, Modal } from "@/components/ui/Modal";

/** The two assignments the Account Editor must refuse (KB admin-console.md §2; Figma "M-BLK — …"). */
const copy = {
  category: {
    title: "A licensing role needs a category",
    body: "A licensing role can't be saved without at least one category scope. Reviewer and Authorizer only see items in the categories they're scoped to.",
    help: "Select at least one category — Company Licensing & Permits, Individual Practitioner Credentials, or Institutional Accreditation — then save.",
  },
  separation: {
    title: "These roles can't be combined",
    body: "One person can't hold the Licensing & Registration Officer role together with Reviewer or Authorizer. The chain requires a different person at each of its three stages.",
    help: "Remove the conflicting role, or assign this role to a different account.",
  },
};

export function AdminBlockerModal({ which, onClose }: { which: "category" | "separation" | null; onClose: () => void }) {
  const b = which ? copy[which] : null;
  return (
    <Modal open={!!b} onClose={onClose} title={b?.title ?? ""} description={b && <p>{b.body}</p>} actions={<Button onClick={onClose}>Go back</Button>}>
      {b && <HelpBox title="What to do">{b.help}</HelpBox>}
    </Modal>
  );
}
