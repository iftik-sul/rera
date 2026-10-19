"use client";

import { Checkbox, Radio } from "@/components/ui/Form";
import { ALL_CATEGORY_ROLES, CATEGORIES, ROLES, SCOPED_ROLES, type Category, type RoleName } from "@/data/director-general/staff";

/**
 * The account's one role (project lead 2026-10-19: one role per person — a single choice, not
 * tick boxes) and, for a Reviewer or Authorizer, its category scope.
 */
export function RoleScopeFields({
  role,
  scope,
  onRole,
  onScope,
}: {
  role: RoleName | null;
  scope: Category[];
  onRole: (r: RoleName) => void;
  onScope: (c: Category[]) => void;
}) {
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const needsScope = !!role && SCOPED_ROLES.includes(role);
  const allByRole = !!role && ALL_CATEGORY_ROLES.includes(role);

  return (
    <>
      <fieldset className="flex flex-col gap-1.5">
        <legend className="pb-1.5 type-label text-strong">Role</legend>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {ROLES.map((r) => (
            <Radio key={r} name="role" checked={role === r} onChange={() => onRole(r)}>
              {r}
            </Radio>
          ))}
        </div>
        <p className="type-caption text-muted">One role per account.</p>
      </fieldset>
      {needsScope && (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="pb-1.5 type-label text-strong">Licensing category scope</legend>
          {CATEGORIES.map((c) => (
            <Checkbox key={c} checked={scope.includes(c)} onChange={() => onScope(toggle(scope, c))}>
              {c}
            </Checkbox>
          ))}
          <p className="type-caption text-muted">A Reviewer or Authorizer only sees items in the categories ticked here.</p>
        </fieldset>
      )}
      {allByRole && <p className="type-caption text-muted">This role covers every licensing category — no scope to set.</p>}
    </>
  );
}
