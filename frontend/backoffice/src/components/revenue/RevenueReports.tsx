"use client";

import { useEffect, useState } from "react";
import { Page } from "@/components/shell/Page";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { Banner } from "@/components/ui/Cards";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { FilterDropdown } from "@/components/ui/Filters";
import { KpiCard, KpiRow } from "@/components/ui/KpiCard";
import { TableCard, type Column } from "@/components/ui/Table";
import {
  COMPONENTS,
  DEFAULT_PERIOD,
  DESTINATION,
  METHOD,
  SEGMENT_DEFS,
  costOf,
  groupBy,
  inPeriod,
  less,
  money,
  of,
  passes,
  paymentCount,
  periodBanner,
  periods,
  remitted,
  sum,
  totalOf,
  type Line,
  type Period,
  type PeriodStatus,
  type Segments,
} from "@/data/director-general/revenue";

type Tab = "collections" | "revenue" | "tax";
const TABS: { id: Tab; label: string }[] = [
  { id: "collections", label: "Collections" },
  { id: "revenue", label: "Revenue" },
  { id: "tax", label: "Tax & remittance" },
];
const STATUS_TONE: Record<PeriodStatus, BadgeTone> = {
  Open: "info",
  Reconciled: "success",
  Filed: "neutral",
};

/**
 * Revenue Reports (KB revenue-reports.md; Figma "Revenue Reports, … — read-only").
 * Report bar (period · segmentation · export) governs all three tabs. Period, tab and
 * segments are kept in the web address. The DG reads and exports; it never files.
 */
export function RevenueReports() {
  const [periodId, setPeriodId] = useState(DEFAULT_PERIOD);
  const [tab, setTab] = useState<Tab>("collections");
  const [seg, setSeg] = useState<Segments>({});

  // Read the web address on arrival (e.g. a notification linking to ?period=2026-09).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const p = q.get("period");
    if (p && periods.some((x) => x.id === p)) setPeriodId(p);
    const t = q.get("tab") as Tab | null;
    if (t && TABS.some((x) => x.id === t)) setTab(t);
    const s: Segments = {};
    for (const d of SEGMENT_DEFS) {
      const v = q.get(d.key);
      if (v) s[d.key] = v;
    }
    setSeg(s);
  }, []);
  const writeUrl = (p: string, t: Tab, s: Segments) => {
    const url = new URL(window.location.href);
    url.search = "";
    if (p !== DEFAULT_PERIOD) url.searchParams.set("period", p);
    if (t !== "collections") url.searchParams.set("tab", t);
    for (const d of SEGMENT_DEFS)
      if (s[d.key]) url.searchParams.set(d.key, s[d.key]!);
    window.history.replaceState(window.history.state, "", url);
  };
  const choosePeriod = (p: string) => {
    setPeriodId(p);
    writeUrl(p, tab, seg);
  };
  const chooseTab = (t: Tab) => {
    setTab(t);
    writeUrl(periodId, t, seg);
  };
  const chooseSeg = (s: Segments) => {
    setSeg(s);
    writeUrl(periodId, tab, s);
  };

  const period = periods.find((p) => p.id === periodId)!;
  const all = inPeriod(period);
  const ls = all.filter((l) => passes(l, seg));
  const segmented = Object.values(seg).some(Boolean);
  const banner = periodBanner(period);

  return (
    <Page
      title="Revenue Reports"
      subtitle="Collections, government revenue and tax for the period."
    >
      {/* Report bar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <PeriodPicker period={period} onChange={choosePeriod} />
          {period.months.length === 1 && (
            <Badge tone={STATUS_TONE[period.months[0].status]}>
              {period.months[0].status}
            </Badge>
          )}
          <span className="flex-1" />
          <ExportMenu title="Report exported" message={(kind) => `The ${kind === "PDF" ? "PDF" : "spreadsheet"} is recorded in the audit trail.`} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="pr-1 type-caption text-muted">Segment by</span>
          {SEGMENT_DEFS.map((d) => {
            const counts = new Map<string, Line[]>();
            for (const l of all)
              if (passes(l, seg, d.key))
                counts.set(d.value(l), [...(counts.get(d.value(l)) ?? []), l]);
            const values = d.order
              ? d.order.filter((v) => counts.has(v))
              : [...counts.keys()].sort();
            return (
              <FilterDropdown
                key={d.key}
                label={d.label}
                value={seg[d.key] ?? null}
                options={values.map((v) => ({
                  value: v,
                  count: paymentCount(counts.get(v)!),
                }))}
                onChange={(v) => chooseSeg({ ...seg, [d.key]: v ?? undefined })}
              />
            );
          })}
          {segmented && (
            <Button variant="link" onClick={() => chooseSeg({})} className="pl-1">
              Clear segments
            </Button>
          )}
        </div>
      </div>

      <Banner tone={banner.tone}>{banner.text}</Banner>

      <Tabs tabs={TABS} value={tab} onChange={chooseTab} />

      {ls.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-card border border-card bg-white px-6 py-10 type-body text-muted">
          No payments match this segmentation.
          <Button variant="link" onClick={() => chooseSeg({})}>
            Clear segments
          </Button>
        </div>
      ) : tab === "collections" ? (
        <Collections
          ls={ls}
          period={period}
          segmented={segmented}
          key={`c-${periodId}`}
        />
      ) : tab === "revenue" ? (
        <Revenue
          ls={ls}
          period={period}
          segmented={segmented}
          key={`r-${periodId}`}
        />
      ) : (
        <Tax ls={ls} period={period} />
      )}
    </Page>
  );
}

// ── Report bar pieces ──

function PeriodPicker({ period, onChange }: { period: Period; onChange: (id: string) => void }) {
  return (
    <Select
      label="Period"
      value={period.id}
      onChange={onChange}
      options={periods.map((x) => ({
        value: x.id,
        label: x.label,
        trailing: x.months.length === 1 ? <Badge tone={STATUS_TONE[x.months[0].status]}>{x.months[0].status}</Badge> : undefined,
      }))}
    />
  );
}

/** Export menu (PDF · Spreadsheet). DEMO: no file is produced; the real export is written to the audit trail. */
// ── Tabs ──

type ServiceRow = { service: string; module: string; ls: Line[] };
const byService = (ls: Line[]): ServiceRow[] =>
  [...groupBy(ls, "service").entries()]
    .map(([service, g]) => ({ service, module: g[0].module, ls: g }))
    .sort((a, b) => sum(b.ls) - sum(a.ls));

function Collections({
  ls,
  period,
  segmented,
}: {
  ls: Line[];
  period: Period;
  segmented: boolean;
}) {
  const gateway = sum(ls.filter((l) => l.channel === "Gateway"));
  const manual = sum(ls.filter((l) => l.channel === "Manual"));
  const pays = paymentCount(ls);
  const rows = byService(ls);
  const columns: Column<ServiceRow>[] = [
    {
      header: "Service",
      width: 27,
      cell: (r) => <span className="type-group-title">{r.service}</span>,
    },
    { header: "Module", width: 23, cell: (r) => r.module },
    {
      header: "Payments",
      width: 9,
      align: "right",
      cell: (r) => paymentCount(r.ls),
    },
    {
      header: "Gateway",
      width: 14,
      align: "right",
      cell: (r) =>
        money(sum(r.ls.filter((l) => l.channel === "Gateway")), true),
    },
    {
      header: "Manual",
      width: 13,
      align: "right",
      cell: (r) => money(sum(r.ls.filter((l) => l.channel === "Manual")), true),
    },
    {
      header: "Total",
      width: 14,
      align: "right",
      cell: (r) => money(sum(r.ls)),
    },
  ];
  type TenderRow = { tender: string; channel: string; ls: Line[] };
  const tenders: TenderRow[] = [...groupBy(ls, "tender").entries()].map(
    ([tender, g]) => ({ tender, channel: g[0].channel, ls: g }),
  );
  const tenderCols: Column<TenderRow>[] = [
    {
      header: "Tender",
      width: 30,
      cell: (r) => <span className="type-group-title">{r.tender}</span>,
    },
    { header: "Channel", width: 25, cell: (r) => r.channel },
    {
      header: "Payments",
      width: 20,
      align: "right",
      cell: (r) => paymentCount(r.ls),
    },
    {
      header: "Value",
      width: 25,
      align: "right",
      cell: (r) => money(sum(r.ls)),
    },
  ];
  const wholePeriod = segmented
    ? "Whole period — can't be segmented"
    : undefined;

  return (
    <>
      <KpiRow>
        <KpiCard
          label="Payments"
          value={String(pays)}
          caption="Cleared in the period"
        />
        <KpiCard
          label="Gross collected"
          value={money(sum(ls))}
          caption="All channels and tenders"
        />
        <KpiCard
          label="In transit"
          value={money(totalOf(period, (m) => m.inTransit))}
          caption={
            wholePeriod ?? "Not yet settled — never added to the figures"
          }
        />
        <KpiCard
          label="Failed at the gateway"
          value={String(totalOf(period, (m) => m.failed))}
          caption={wholePeriod ?? "Failed and abandoned checkouts"}
        />
      </KpiRow>
      <TableCard
        title="Collections by service"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.service}
        paginate={{ one: "service", many: "services" }}
        note={`Totals: ${pays} payments · gateway ${money(gateway)} · manual ${money(manual)} · ${money(sum(ls))}. A reversed payment is not counted.`}
      />
      <TableCard
        title="Collections by tender"
        columns={tenderCols}
        rows={tenders}
        rowKey={(r) => r.tender}
        note="One row per tender. Card, Bank Transfer and USSD are the gateway's; Cash is the one manual tender, recorded by the officer."
      />
    </>
  );
}

function Revenue({
  ls,
  period,
  segmented,
}: {
  ls: Line[];
  period: Period;
  segmented: boolean;
}) {
  const gross = sum(ls);
  const vat = of(ls, "VAT");
  const gwf = of(ls, "GWF");
  const cost = costOf(period);
  const costTotal = cost.absorbed + cost.mismatches + cost.shortfalls;
  const net = gross - vat - gwf - (segmented ? 0 : costTotal);
  const versions = [
    ...new Map(period.months.map((m) => [m.version.name, m])).values(),
  ];

  const rows = byService(ls);
  const columns: Column<ServiceRow>[] = [
    {
      header: "Service",
      width: 22,
      cell: (r) => <span className="type-group-title">{r.service}</span>,
    },
    { header: "Module", width: 19, cell: (r) => r.module },
    {
      header: "Payments",
      width: 8,
      align: "right",
      cell: (r) => paymentCount(r.ls),
    },
    {
      header: "Gross",
      width: 13,
      align: "right",
      cell: (r) => money(sum(r.ls)),
    },
    {
      header: "VAT",
      width: 12,
      align: "right",
      cell: (r) => money(of(r.ls, "VAT"), true),
    },
    {
      header: "Gateway fee",
      width: 12,
      align: "right",
      cell: (r) => money(of(r.ls, "GWF"), true),
    },
    {
      header: "Net revenue",
      width: 14,
      align: "right",
      cell: (r) => money(of(r.ls, "Main Fee")),
    },
  ];
  const exempt = rows.filter((r) => r.ls[0].vatExempt);
  const exemptCols: Column<ServiceRow>[] = [
    {
      header: "Service",
      width: 28,
      cell: (r) => <span className="type-group-title">{r.service}</span>,
    },
    {
      header: "Payments",
      width: 10,
      align: "right",
      cell: (r) => paymentCount(r.ls),
    },
    {
      header: "Gross",
      width: 16,
      align: "right",
      cell: (r) => money(sum(r.ls)),
    },
    {
      header: "Exemption reason",
      width: 46,
      tone: "muted",
      cell: (r) => r.ls[0].vatExempt,
    },
  ];

  return (
    <>
      <section className="flex flex-col gap-4 rounded-card border border-card bg-white px-6 py-5">
        <h2 className="type-section-title text-strong">Revenue statement</h2>
        <div className="flex flex-col gap-2 rounded-control border border-control p-4 type-body">
          <StatementLine label="Gross collected" value={money(gross)} />
          <StatementLine label="less VAT — owed to FIRS" value={less(vat)} />
          <StatementLine
            label="less GWF — the collection rail's fee"
            value={less(gwf)}
          />
          {segmented ? (
            <StatementLine
              label="less cost of collection"
              value="Not allocated to a segment"
              muted
            />
          ) : (
            <>
              <StatementLine
                label="less cost of collection"
                value={less(costTotal)}
              />
              <StatementLine
                label="of which — gateway fee absorbed under a cap"
                value={money(cost.absorbed)}
                indent
              />
              <StatementLine
                label="of which — resolved fee mismatches"
                value={money(cost.mismatches)}
                indent
              />
              <StatementLine
                label="of which — settlement shortfalls written off"
                value={money(cost.shortfalls)}
                indent
              />
            </>
          )}
          <div className="mt-1 flex justify-between border-t border-control pt-3 type-group-title text-strong">
            <span>Net government revenue</span>
            <span>{money(net)}</span>
          </div>
        </div>
        <p className="type-caption text-muted">
          Cleared money only. {money(totalOf(period, (m) => m.inTransit))} in
          transit is not included.
          {segmented &&
            " Cost of collection is borne at period level, so a segment's net excludes it."}
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-card border border-card bg-white px-6 py-5">
        <h2 className="type-section-title text-strong">
          Schedule versions in force
        </h2>
        {versions.map((m) => {
          const used = period.months
            .filter((x) => x.version.name === m.version.name)
            .map((x) => x.short);
          return (
            <p key={m.version.name} className="type-body text-muted">
              <span className="pr-2 type-group-title text-strong">
                {m.version.name}
              </span>
              in force from {m.version.from} — applied to{" "}
              {versions.length === 1
                ? "every payment in the period"
                : `payments in ${used.join(" and ")}`}
            </p>
          );
        })}
        <p className="type-caption text-muted">
          Each payment is reported under the version it was charged at. Nothing
          here is recomputed against the current schedule, which is why a past
          period reads the same after rates change.
        </p>
      </section>

      <TableCard
        title="Revenue by service"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.service}
        paginate={{ one: "service", many: "services" }}
        note={
          <>
            Net revenue by service sums to {money(of(ls, "Main Fee"))}.
            {!segmented &&
              ` Cost of collection — ${money(costTotal)} — is borne at period level and is not allocated to a service, which is why the statement's net is ${money(net)}.`}
          </>
        }
      />

      {exempt.length > 0 && (
        <TableCard
          title="VAT-exempt services"
          columns={exemptCols}
          rows={exempt}
          rowKey={(r) => r.service}
          note={
            <>
              A service earning with no VAT line is explained here, by its
              recorded exemption reason.
            </>
          }
        />
      )}
    </>
  );
}

function StatementLine({
  label,
  value,
  indent,
  muted,
}: {
  label: string;
  value: string;
  indent?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 ${indent ? "pl-4 text-muted" : "text-strong"}`}
    >
      <span>{label}</span>
      <span className={muted ? "text-muted" : ""}>{value}</span>
    </div>
  );
}

function Tax({ ls, period }: { ls: Line[]; period: Period }) {
  type DestRow = {
    component: (typeof COMPONENTS)[number];
    collected: number;
    remitted: number;
  };
  const rows: DestRow[] = COMPONENTS.filter((c) =>
    ls.some((l) => l.component === c),
  ).map((c) => ({
    component: c,
    collected: of(ls, c),
    remitted: remitted(ls, period, c),
  }));
  const vat = rows.find((r) => r.component === "VAT");
  const vatCollected = vat?.collected ?? 0;
  const vatRemitted = vat?.remitted ?? 0;
  const cols: Column<DestRow>[] = [
    {
      header: "Destination",
      width: 24,
      cell: (r) => (
        <span className="type-group-title">{DESTINATION[r.component]}</span>
      ),
    },
    { header: "Component", width: 12, cell: (r) => r.component },
    {
      header: "Collected",
      width: 16,
      align: "right",
      cell: (r) => money(r.collected),
    },
    {
      header: "Remitted",
      width: 16,
      align: "right",
      cell: (r) => money(r.remitted),
    },
    {
      header: "Outstanding",
      width: 16,
      align: "right",
      cell: (r) => money(r.collected - r.remitted),
    },
    { header: "Method", width: 16, cell: (r) => METHOD[r.component] },
  ];
  return (
    <>
      <KpiRow>
        <KpiCard
          label="VAT collected"
          value={money(vatCollected)}
          caption="Arrived in the period"
        />
        <KpiCard
          label="VAT remitted"
          value={money(vatRemitted)}
          caption="Paid over to FIRS"
        />
        <KpiCard
          label="VAT outstanding"
          value={money(vatCollected - vatRemitted)}
          caption="The By Transfer rows only"
        />
      </KpiRow>
      <TableCard
        title="Liability by destination"
        columns={cols}
        rows={rows}
        rowKey={(r) => r.component}
        note={
          <>
            Only the By Transfer row is a debt. Remittances are recorded by the
            Revenue &amp; Finance Officer in Reconciliation; this view is
            read-only.
          </>
        }
      />
    </>
  );
}
