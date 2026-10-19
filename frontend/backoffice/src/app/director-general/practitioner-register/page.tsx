"use client";

import { Page } from "@/components/shell/Page";
import { directorGeneral, href } from "@/config/roles";
import { StatusBadge } from "@/components/ui/Badge";
import { KpiCard, KpiRow } from "@/components/ui/KpiCard";
import { TableCard, type Column, type FilterDef } from "@/components/ui/Table";
import { EXPIRY_ORDER, REGISTER_STATUS_ORDER, expiryState, registerEntries, registerKpis, type RegisterEntry } from "@/data/director-general/register";

// Widths are % of the row (design standard §A5a.0 rule 5).
const columns: Column<RegisterEntry>[] = [
  { header: "Credential No.", width: 16, tone: "link", cell: (r) => r.credentialNo },
  { header: "Holder", width: 25, cell: (r) => r.holder },
  { header: "Practitioner Type", width: 19, cell: (r) => r.practitionerType },
  { header: "Status", width: 12, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Issued", width: 14, tone: "muted", cell: (r) => r.issued },
  { header: "Valid To", width: 14, tone: "muted", cell: (r) => r.validTo },
];

// Figma names the first filter "Credential type" but the column is "Practitioner Type" — the filter follows the column.
const filters: FilterDef<RegisterEntry>[] = [
  { label: "Practitioner type", key: "type", value: (r) => r.practitionerType },
  { label: "Status", key: "status", value: (r) => r.status.label, order: REGISTER_STATUS_ORDER },
  { label: "Expiry", key: "expiry", value: (r) => expiryState(r.validTo), order: EXPIRY_ORDER },
];

/** Practitioner Register (Figma "Practitioner Register") — read-only; entries change only through licensing decisions. */
export default function PractitionerRegister() {
  return (
    <Page title="Practitioner Register" subtitle="Every credential issued through licensing — read-only.">
      <KpiRow>
        {registerKpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </KpiRow>
      <TableCard
        title="Register entries"
        filters={filters}
        columns={columns}
        rows={registerEntries}
        rowKey={(r) => r.credentialNo}
        rowAction={(r) => (r.detail ? { href: href(directorGeneral, `practitioner-register/${r.detail}`) } : null)}
        searchText={(r) => `${r.credentialNo} ${r.holder} ${r.practitionerType}`}
        paginate={{ one: "entry", many: "entries" }}
      />
    </Page>
  );
}
