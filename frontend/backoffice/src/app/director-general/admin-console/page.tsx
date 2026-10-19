"use client";

import { useState } from "react";
import { Page } from "@/components/shell/Page";
import { directorGeneral, href } from "@/config/roles";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableCard, type Column, type FilterDef } from "@/components/ui/Table";
import { InviteModal } from "@/components/admin/InviteModal";
import { ACCOUNT_STATUS_ORDER, ROLES, ROLE_TAG, accountStatus, mfaStatus, scopeText, staff, type StaffMember } from "@/data/director-general/staff";

// Widths are % of the row (design standard §A5a.0 rule 5).
const columns: Column<StaffMember>[] = [
  { header: "Staff member", width: 17, tone: "link", cell: (m) => m.name },
  { header: "Email", width: 20, tone: "muted", cell: (m) => m.email },
  {
    header: "Role",
    width: 19,
    cell: (m) => (
      <span className="flex gap-1.5">
        {m.roles.map((r) => (
          <Badge key={r} tone="info">
            {ROLE_TAG[r]}
          </Badge>
        ))}
      </span>
    ),
  },
  { header: "Category scope", width: 18, tone: "muted", cell: (m) => scopeText(m) },
  { header: "Status", width: 12, cell: (m) => <StatusBadge status={accountStatus(m.status)} /> },
  { header: "MFA", width: 14, cell: (m) => <StatusBadge status={mfaStatus(m.mfa)} /> },
];

const filters: FilterDef<StaffMember>[] = [
  { label: "Role", key: "role", value: (m) => m.roles[0], order: [...ROLES] },
  { label: "Status", key: "status", value: (m) => m.status, order: ACCOUNT_STATUS_ORDER },
  { label: "MFA", key: "mfa", value: (m) => m.mfa, order: ["Enrolled", "Not enrolled"] },
];

/** Admin Console — Staff Directory (Figma "Admin Console"). DG only; assigns roles, never defines them. */
export default function AdminConsole() {
  const [inviting, setInviting] = useState(false);
  return (
    <Page title="Admin Console" subtitle="Manage staff accounts, role assignments and MFA.">
      <TableCard
        title="Staff directory"
        action={
          <Button variant="primary" onClick={() => setInviting(true)}>
            Invite staff
          </Button>
        }
        filters={filters}
        columns={columns}
        rows={staff}
        rowKey={(m) => m.id}
        rowAction={(m) => ({ href: href(directorGeneral, `admin-console/${m.id}`) })}
        searchText={(m) => `${m.name} ${m.email}`}
        paginate={{ one: "staff account", many: "staff accounts" }}
      />
      <InviteModal open={inviting} onClose={() => setInviting(false)} />
    </Page>
  );
}
