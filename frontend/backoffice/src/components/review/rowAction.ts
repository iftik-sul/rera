import { href, type Role } from "@/config/roles";
import type { RowAction } from "@/components/ui/Table";
import type { BlockerId, Opens } from "@/data/director-general/work-queue";

/** Turns a row's `opens` value into what clicking it does. */
export function rowAction(role: Role, opens: Opens | undefined, showBlocker: (id: BlockerId) => void): RowAction {
  if (!opens) return null;
  const [kind, id] = opens.split(":");
  if (kind === "review") return { href: href(role, `application-review/${id}`) };
  return { onClick: () => showBlocker(id as BlockerId) };
}
