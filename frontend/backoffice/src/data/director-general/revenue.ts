/**
 * Sample data for the DG's read-only Revenue Reports (Figma "Revenue Reports, … — read-only").
 *
 * Unlike the other screens, nothing here is typed in as a finished figure. Each service has a
 * fee and a count of payments per tender; every number on all three tabs — totals, VAT, the
 * gateway fee, net revenue, tax owed — is ADDED UP from those payments. So the tabs always
 * agree with each other, segmentation recalculates everything, and a range of months is just
 * the sum of its months (KB revenue-reports.md: "a range is a read-only sum of its months").
 *
 * October's first 10 services reproduce Figma's rows exactly. The fee model, read off Figma:
 *   Main Fee  → RERA Operating Account   (the service's fee)
 *   VAT 7.5%  → FIRS, By Transfer         (none on the VAT-exempt penalty)
 *   GWF 1%    → Remita, By Deduction      (gateway payments only; cash has no gateway fee)
 */

export type Channel = "Gateway" | "Manual";
export type Tender = "Card" | "Bank Transfer" | "USSD" | "Cash";
export type Component = "Main Fee" | "VAT" | "GWF";
export const TENDERS: Tender[] = ["Card", "Bank Transfer", "USSD", "Cash"];
export const COMPONENTS: Component[] = ["Main Fee", "VAT", "GWF"];
export const DESTINATION: Record<Component, string> = {
  "Main Fee": "RERA Operating Account",
  VAT: "Federal Inland Revenue Service",
  GWF: "Remita (gateway)",
};
export const METHOD: Record<Component, string> = { "Main Fee": "Retained", VAT: "By Transfer", GWF: "By Deduction" };
export const channelOf = (t: Tender): Channel => (t === "Cash" ? "Manual" : "Gateway");

const VAT_RATE = 0.075;
const GWF_RATE = 0.01;

type ServiceDef = {
  service: string;
  module: string;
  fee: number;
  /** October: payments through the gateway, and in cash. Other months are scaled from these. */
  gateway: number;
  cash: number;
  vatExempt?: string;
};

const services: ServiceDef[] = [
  { service: "Real Estate Licensing Application", module: "Real Estate Developers", fee: 250_000, gateway: 8, cash: 1 },
  { service: "Project Registration", module: "Real Estate Developers", fee: 100_000, gateway: 20, cash: 0 },
  { service: "Agency Licence Renewal", module: "Real Estate Service Companies", fee: 120_000, gateway: 10, cash: 0 },
  { service: "Practitioner Renewal", module: "Real Estate Service Companies", fee: 40_000, gateway: 25, cash: 0 },
  { service: "Developer Annual Return", module: "Real Estate Developers", fee: 75_000, gateway: 12, cash: 0 },
  { service: "Estate Surveyor Registration", module: "Real Estate Service Companies", fee: 100_000, gateway: 8, cash: 0 },
  { service: "Facility Manager Licence", module: "Real Estate Service Companies", fee: 80_000, gateway: 5, cash: 0 },
  { service: "Valuation Report Filing", module: "Financial & Trust Institutions", fee: 40_000, gateway: 10, cash: 0 },
  { service: "Property Transaction Filing", module: "Individual User", fee: 20_000, gateway: 15, cash: 0 },
  { service: "Enforcement Penalty", module: "Enforcement", fee: 150_000, gateway: 0, cash: 1, vatExempt: "A penalty is not consideration for a service, so VAT does not apply" },
  // ── Beyond the Figma frame: sample services for page 2 ──
  { service: "Escrow Account Registration", module: "Real Estate Developers", fee: 50_000, gateway: 6, cash: 0 },
  { service: "Off-plan Sales Approval", module: "Real Estate Developers", fee: 150_000, gateway: 4, cash: 0 },
  { service: "Practice Card Issuance", module: "Allied Professionals", fee: 30_000, gateway: 18, cash: 0 },
  { service: "Practice Card Renewal", module: "Allied Professionals", fee: 25_000, gateway: 14, cash: 1 },
  { service: "Training Entity Accreditation", module: "Allied Professionals", fee: 200_000, gateway: 2, cash: 0 },
  { service: "Mortgage Registration", module: "Financial & Trust Institutions", fee: 35_000, gateway: 9, cash: 0 },
  { service: "Trustee Registration", module: "Financial & Trust Institutions", fee: 120_000, gateway: 3, cash: 0 },
  { service: "Tenancy Agreement Filing", module: "Individual User", fee: 5_000, gateway: 22, cash: 0 },
  { service: "Dispute Filing", module: "Individual User", fee: 15_000, gateway: 6, cash: 0 },
  { service: "Late Filing Penalty", module: "Enforcement", fee: 50_000, gateway: 0, cash: 2, vatExempt: "A penalty is not consideration for a service, so VAT does not apply" },
];
export const MODULE_ORDER = ["Real Estate Developers", "Real Estate Service Companies", "Financial & Trust Institutions", "Allied Professionals", "Individual User", "Enforcement"];

// ── Periods ──
export type PeriodStatus = "Open" | "Reconciled" | "Filed";
type Month = {
  id: string;
  label: string;
  short: string;
  status: PeriodStatus;
  /** Multiplies October's payment counts, so each month differs a little. */
  scale: number;
  inTransit: number;
  failed: number;
  cost: { absorbed: number; mismatches: number; shortfalls: number };
  vatRemitted: boolean;
  version: { name: string; from: string };
  filedBy?: string;
};

export const months: Month[] = [
  {
    id: "2026-08", label: "August 2026", short: "August", status: "Filed", scale: 1.1, inTransit: 0, failed: 16,
    cost: { absorbed: 0, mismatches: 0, shortfalls: 5_000 }, vatRemitted: true,
    version: { name: "v2", from: "1 April 2026" }, filedBy: "Amaka Okeke · 04 Sep 2026",
  },
  {
    id: "2026-09", label: "September 2026", short: "September", status: "Filed", scale: 0.9, inTransit: 0, failed: 11,
    cost: { absorbed: 0, mismatches: 1_500, shortfalls: 0 }, vatRemitted: true,
    version: { name: "v2", from: "1 April 2026" }, filedBy: "Amaka Okeke · 03 Oct 2026",
  },
  {
    id: "2026-10", label: "October 2026", short: "October", status: "Reconciled", scale: 1, inTransit: 2_372_000, failed: 14,
    cost: { absorbed: 0, mismatches: 2_832.5, shortfalls: 10_000 }, vatRemitted: false,
    version: { name: "v3", from: "1 October 2026" },
  },
];

export type Period = { id: string; label: string; months: Month[] };
export const periods: Period[] = [
  ...[...months].reverse().map((m) => ({ id: m.id, label: m.label, months: [m] })),
  { id: "2026-08..10", label: "Aug – Oct 2026 (3 months)", months },
];
export const DEFAULT_PERIOD = "2026-10";

/** The banner under the report bar (KB revenue-reports.md "States to build"). */
export function periodBanner(p: Period): { tone: "success" | "warning" | "neutral"; text: string } {
  if (p.months.length > 1) {
    const filed = p.months.filter((m) => m.status === "Filed").map((m) => m.short);
    const rest = p.months.filter((m) => m.status !== "Filed");
    return {
      tone: "neutral",
      text: `${p.months.length === 3 ? "Three" : p.months.length} months — ${filed.join(" and ")} ${filed.length === 1 ? "is" : "are"} Filed, ${rest.map((m) => `${m.short} is ${m.status}`).join(", ")}.`,
    };
  }
  const s = p.months[0].status;
  if (s === "Filed") return { tone: "neutral", text: "Filed — locked." };
  if (s === "Reconciled") return { tone: "success", text: "Reconciled — these figures are final unless the period is reopened." };
  return { tone: "warning", text: "Provisional — this period has not been reconciled. Figures may change." };
}

// ── The payment lines everything is added up from ──
export type Line = {
  month: string;
  service: string;
  module: string;
  tender: Tender;
  channel: Channel;
  component: Component;
  destination: string;
  /** Payments on this line */
  count: number;
  amount: number;
  vatExempt?: string;
};

function split(n: number): Record<Exclude<Tender, "Cash">, number> {
  const card = Math.round(n * 0.54);
  const bank = Math.round(n * 0.34);
  return { Card: card, "Bank Transfer": bank, USSD: Math.max(0, n - card - bank) };
}

export const lines: Line[] = months.flatMap((m) =>
  services.flatMap((s) => {
    const gw = Math.round(s.gateway * m.scale);
    const cash = s.cash === 0 ? 0 : Math.max(1, Math.round(s.cash * m.scale));
    const counts: [Tender, number][] = [...Object.entries(split(gw)), ["Cash", cash]] as [Tender, number][];
    return counts
      .filter(([, c]) => c > 0)
      .flatMap(([tender, count]) => {
        const channel = channelOf(tender);
        const parts: [Component, number][] = [["Main Fee", s.fee]];
        if (!s.vatExempt) parts.push(["VAT", s.fee * VAT_RATE]);
        if (channel === "Gateway" && !s.vatExempt) parts.push(["GWF", s.fee * GWF_RATE]);
        return parts.map(([component, each]) => ({
          month: m.id,
          service: s.service,
          module: s.module,
          tender,
          channel,
          component,
          destination: DESTINATION[component],
          count,
          amount: count * each,
          vatExempt: s.vatExempt,
        }));
      });
  }),
);

// ── Segmentation ──
export type Segments = Partial<Record<"module" | "service" | "channel" | "tender" | "destination" | "component", string>>;
export const SEGMENT_DEFS: { key: keyof Segments; label: string; value: (l: Line) => string; order?: string[] }[] = [
  { key: "module", label: "Module", value: (l) => l.module, order: MODULE_ORDER },
  { key: "service", label: "Service", value: (l) => l.service },
  { key: "channel", label: "Channel", value: (l) => l.channel, order: ["Gateway", "Manual"] },
  { key: "tender", label: "Tender", value: (l) => l.tender, order: TENDERS },
  { key: "destination", label: "Destination", value: (l) => l.destination, order: COMPONENTS.map((c) => DESTINATION[c]) },
  { key: "component", label: "Component", value: (l) => l.component, order: COMPONENTS },
];

export const inPeriod = (p: Period) => lines.filter((l) => p.months.some((m) => m.id === l.month));
export const passes = (l: Line, seg: Segments, except?: keyof Segments) =>
  SEGMENT_DEFS.every((d) => d.key === except || !seg[d.key] || d.value(l) === seg[d.key]);

/**
 * How many payments a set of lines represents. Each payment has a line per component, so
 * count one component only: the Main Fee — or, when a component is chosen, that one.
 */
export function paymentCount(ls: Line[]): number {
  const comps = new Set(ls.map((l) => l.component));
  const counted: Component = comps.has("Main Fee") ? "Main Fee" : comps.has("VAT") ? "VAT" : "GWF";
  return ls.filter((l) => l.component === counted).reduce((t, l) => t + l.count, 0);
}
export const sum = (ls: Line[]) => ls.reduce((t, l) => t + l.amount, 0);
export const of = (ls: Line[], c: Component) => sum(ls.filter((l) => l.component === c));

export function groupBy<K extends keyof Line>(ls: Line[], key: K): Map<Line[K], Line[]> {
  const m = new Map<Line[K], Line[]>();
  for (const l of ls) m.set(l[key], [...(m.get(l[key]) ?? []), l]);
  return m;
}

/** Period-level figures — not attributable to a segment. */
export const totalOf = (p: Period, f: (m: Month) => number) => p.months.reduce((t, m) => t + f(m), 0);
export const costOf = (p: Period) => ({
  absorbed: totalOf(p, (m) => m.cost.absorbed),
  mismatches: totalOf(p, (m) => m.cost.mismatches),
  shortfalls: totalOf(p, (m) => m.cost.shortfalls),
});

/** VAT paid over to FIRS. The Main Fee is retained and the gateway fee deducted at source, so both are always settled. */
export function remitted(ls: Line[], p: Period, c: Component): number {
  if (c !== "VAT") return of(ls, c);
  return p.months.filter((m) => m.vatRemitted).reduce((t, m) => t + of(ls.filter((l) => l.month === m.id), "VAT"), 0);
}

const naira = new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** ₦2,438,750.00 · "—" for zero where Figma shows a dash */
export const money = (n: number, dashZero = false) => (dashZero && n === 0 ? "—" : `₦${naira.format(n)}`);
export const less = (n: number) => `(${money(n)})`;
