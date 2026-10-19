"use client";

import { Checkbox } from "@/components/ui/Form";
import { ALL_CATEGORY_ROLES, CATEGORIES, ROLES, SCOPED_ROLES, type Category, type RoleName } from "@/data/director-general/staff";

/** Tick boxes for role(s) and, when a scoped licensing role is ticked, its category scope. */
export function RoleScopeFields({
  roles,
  scope,
  onRoles,
  onScope,
}: {
  roles: RoleName[];
  scope: Category[];
  onRoles: (r: RoleName[]) => void;
  onScope: (c: Category[]) => void;
}) {
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const needsScope = roles.some((r) => SCOPED_ROLES.includes(r));
  const allByRole = roles.some((r) => ALL_CATEGORY_ROLES.includes(r));

  return (
    <>
      <fieldset className="flex flex-col gap-1.5">
        <legend className="pb-1.5 type-label text-strong">Role</legend>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {ROLES.map((r) => (
            <Checkbox key={r} checked={roles.includes(r)} onChange={() => onRoles(toggle(roles, r))}>
              {r}
            </Checkbox>
          ))}
        </div>
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
      {!needsScope && allByRole && <p className="type-caption text-muted">This role covers every licensing category — no scope to set.</p>}
    </>
  );
}
