import Link from "next/link";
import { subjectLink } from "@/data/director-general/audit";

/**
 * Field values that name another record in the sample — a credential, a sign-off, an
 * application — become links to it (2026-10-19 review: references were plain text).
 * `self` is the page being shown, so a record never links to itself.
 */
export function linkRefs(fields: { label: string; value: string }[], self?: string) {
  return fields.map((f) => {
    const to = subjectLink(f.value);
    return to && to.replace(/\/$/, "") !== self?.replace(/\/$/, "")
      ? { ...f, value: <Link href={to} className="type-body-strong text-link hover:underline">{f.value}</Link> }
      : f;
  });
}
