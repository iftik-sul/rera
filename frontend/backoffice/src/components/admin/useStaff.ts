"use client";

import { useDemo } from "@/lib/demo";
import { staff, type StaffMember } from "@/data/director-general/staff";

/** The staff list with this session's account changes applied (lib/demo.ts). */
export function useStaff(): StaffMember[] {
  const demo = useDemo();
  return staff.map((m) => applyStaff(m, demo.staff[m.id]));
}

export function applyStaff(m: StaffMember, c: ReturnType<typeof useDemo>["staff"][string] | undefined): StaffMember {
  if (!c) return m;
  const next = { ...m, ...c } as Record<string, unknown>;
  for (const k of Object.keys(next)) if (next[k] === null) delete next[k];
  return next as StaffMember;
}
