"use client";

import { Button } from "@/components/ui/Button";
import { HelpBox, Modal } from "@/components/ui/Modal";
import { blockers } from "@/data/director-general/blockers";
import type { BlockerId } from "@/data/director-general/work-queue";

/** Shows one of the "can't overturn" pop-ups; Dismiss returns to the queue. */
export function BlockerModal({ id, onClose }: { id: BlockerId | null; onClose: () => void }) {
  const b = id ? blockers[id] : null;
  return (
    <Modal open={!!b} onClose={onClose} title={b?.title ?? ""} description={b?.body} actions={<Button onClick={onClose}>Dismiss</Button>}>
      {b && <HelpBox title={b.helpTitle}>{b.help}</HelpBox>}
    </Modal>
  );
}
