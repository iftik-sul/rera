"use client";

import { useRole } from "@/components/shell/RoleContext";
import { href } from "@/config/roles";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { reviewId } from "@/data/director-general/work-queue";

/**
 * M-QUE-03 "This item is already claimed" (KB modals.md §9 claim rules): raised when the DG opens
 * a row another officer holds. Offers read-only; the claim returns to the pool on release or after
 * 30 minutes of inactivity. Shared by all three Work Queue views.
 */
export function ClaimedModal({ item, holderRole, since, onClose }: { item: { reference: string; claimedBy?: string | null } | null; holderRole: string; since?: string; onClose: () => void }) {
  const role = useRole();
  return (
    <Modal
      open={!!item}
      onClose={onClose}
      width={480}
      title="This item is already claimed"
      description={
        item && (
          <p>
            {item.reference} is claimed by {item.claimedBy} ({holderRole}){since ? `, since ${since}` : ""}. You can open it read-only. To decide it, wait until they
            release it or the claim lapses after 30 minutes of inactivity.
          </p>
        )
      }
      actions={
        <>
          <Button onClick={onClose}>Cancel</Button>
          {item && (
            <ButtonLink variant="primary" href={href(role, `application-review/${reviewId(item.reference)}`)}>
              Open read-only
            </ButtonLink>
          )}
        </>
      }
    />
  );
}
