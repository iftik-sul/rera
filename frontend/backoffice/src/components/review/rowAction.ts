import { href, type Role } from "@/config/roles";
import type { RowAction } from "@/components/ui/Table";
import type { Opens } from "@/data/director-general/work-queue";

/** Turns a row's `opens` value ("review:<id>") into the link clicking it follows. */
export function rowAction(role: Role, opens: Opens | undefined): RowAction {
  if (!opens) return null;
  return { href: href(role, `application-review/${opens.slice("review:".length)}`) };
}
