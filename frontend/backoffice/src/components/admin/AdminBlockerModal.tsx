"use client";

import { Button } from "@/components/ui/Button";
import { HelpBox, Modal } from "@/components/ui/Modal";

/**
 * The assignment the Account Editor must refuse (KB admin-console.md §2; Figma "M-BLK — …").
 * The separation-of-duties refusal (M-BLK-26) is retired: with one role per person it can't arise.
 */
const copy = {
  category: {
    title: "A licensing role needs a category",
    body: "A licensing role can't be saved without at least one category scope. Reviewer and Authorizer only see items in the categories they're scoped to.",
    help: "Select at least one category — Company Licensing & Permits, Individual Practitioner Credentials, or Institutional Accreditation — then save.",
  },
};

export function AdminBlockerModal({ which, onClose }: { which: "category" | null; onClose: () => void }) {
  const b = which ? copy[which] : null;
  return (
    <Modal open={!!b} onClose={onClose} title={b?.title ?? ""} description={b && <p>{b.body}</p>} actions={<Button onClick={onClose}>Go back</Button>}>
      {b && <HelpBox title="What to do">{b.help}</HelpBox>}
    </Modal>
  );
}
