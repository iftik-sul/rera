"use client";

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
        <legend className="pb-1.5 text-xs font-medium text-n900">Role</legend>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {ROLES.map((r) => (
            <Check key={r} label={r} checked={roles.includes(r)} onChange={() => onRoles(toggle(roles, r))} />
          ))}
        </div>
      </fieldset>
      {needsScope && (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="pb-1.5 text-xs font-medium text-n900">Licensing category scope</legend>
          {CATEGORIES.map((c) => (
            <Check key={c} label={c} checked={scope.includes(c)} onChange={() => onScope(toggle(scope, c))} />
          ))}
          <p className="text-xs text-n400">A Reviewer or Authorizer only sees items in the categories ticked here.</p>
        </fieldset>
      )}
      {!needsScope && allByRole && <p className="text-xs text-n400">This role covers every licensing category — no scope to set.</p>}
    </>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-[13px] leading-5 text-n900">
      <input type="checkbox" checked={checked} onChange={onChange} className="mt-0.5 size-4 shrink-0 accent-blue-600" />
      <span>{label}</span>
    </label>
  );
}
