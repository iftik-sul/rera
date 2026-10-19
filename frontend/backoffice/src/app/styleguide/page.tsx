"use client";

import { useEffect, useState } from "react";
import { ToastHost, showToast } from "@/components/shell/Toast";
import { Badge, StatusBadge, type BadgeTone } from "@/components/ui/Badge";
import { Button, ButtonLink, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { Banner, Card, DetailHeader, FieldGroup, Notice } from "@/components/ui/Cards";
import { FilterDropdown, SearchBox } from "@/components/ui/Filters";
import { Checkbox, CodeInput, Field, TextArea, TextInput } from "@/components/ui/Form";
import { KpiCard, KpiRow } from "@/components/ui/KpiCard";
import { Acknowledge, HelpBox, Modal, ReasonField } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { StepUpModal } from "@/components/ui/StepUpModal";
import { TableCard, type Column, type FilterDef } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";

/**
 * STYLE GUIDE — the live reference for the back office (design standard Section D0).
 * Everything here is the real component or token, rendered by the real code, so
 * this page can never disagree with the screens. Not linked from any menu:
 * open /styleguide/ directly.
 */

const COLOURS: [string, string][] = [
  ["strong", "Headings, body text, table cells, KPI values"],
  ["muted", "Subtitles, captions, column headers, hints"],
  ["link", "Links, link-style actions, reference column"],
  ["action", "Primary buttons, current page, ticked boxes, focus ring"],
  ["danger", "The one red: destructive buttons, errors, required *"],
  ["secondary", "Secondary-button label"],
  ["page", "Back-office workspace backdrop"],
  ["signin", "Sign-in page backdrop"],
  ["card", "Card and KPI outline"],
  ["control", "Inputs, dividers, table row lines, secondary buttons"],
  ["valid", "Inline \"Valid\", toast tick"],
  ["ageing", "Inline ageing text, warning banner heading"],
];
const PAIRS: [BadgeTone, string][] = [
  ["info", "Info"],
  ["warning", "Warning"],
  ["success", "Success"],
  ["error", "Error"],
  ["neutral", "Neutral"],
];
const TYPES: [string, string, string][] = [
  ["type-display", "24 / 32 · Semi Bold", "Sign-in title, KPI value, editor name"],
  ["type-page-title", "18 / 27 · Medium", "Top-bar title, modal title"],
  ["type-section-title", "16 / 24 · Medium", "Card titles, embedded-table titles"],
  ["type-group-title", "13 / 20 · Semi Bold", "Main-table title, field-group title, reference column"],
  ["type-body", "13 / 20 · Regular", "Table cells, paragraphs, values"],
  ["type-body-strong", "13 / 20 · Medium", "Emphasis, link actions, filter labels"],
  ["type-column-header", "13 / 20 · Medium · UPPERCASE", "Table headers"],
  ["type-label", "12 / 18 · Medium", "Form labels, KPI labels, badges"],
  ["type-caption", "12 / 18 · Regular", "Subtitles, hints, pagination label"],
  ["type-button", "14 / 20 · Semi Bold", "Button labels"],
];

type Row = { reference: string; applicant: string; status: { label: string; tone: BadgeTone }; amount: string };
const ROWS: Row[] = Array.from({ length: 23 }, (_, i) => ({
  reference: `TRX-2024-${String(900 - i).padStart(4, "0")}`,
  applicant: ["Adron Homes & Properties", "Mixta Nigeria Ltd", "UPDC Plc", "Landwey Investment Ltd"][i % 4],
  status: [
    { label: "Under Review", tone: "info" as const },
    { label: "Returned", tone: "warning" as const },
    { label: "Approved", tone: "success" as const },
    { label: "Breaching SLA", tone: "error" as const },
  ][i % 4],
  amount: `₦${(1250000 + i * 37500).toLocaleString("en-NG")}.00`,
}));
const COLUMNS: Column<Row>[] = [
  { header: "Reference", width: 20, tone: "link", cell: (r) => r.reference },
  { header: "Applicant", width: 40, cell: (r) => r.applicant },
  { header: "Status", width: 20, cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Amount", width: 20, align: "right", cell: (r) => r.amount },
];
const FILTERS: FilterDef<Row>[] = [{ label: "Status", key: "status", value: (r) => r.status.label }];

function useToken(name: string) {
  const [v, setV] = useState("");
  useEffect(() => setV(getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()), [name]);
  return v;
}

function Swatch({ name, job, fill }: { name: string; job: string; fill: string }) {
  const value = useToken(`color-${name}`);
  return (
    <div className="flex items-center gap-3">
      <span className={`size-10 shrink-0 rounded-control border border-card ${fill}`} />
      <div className="flex min-w-0 flex-col">
        <span className="type-body-strong text-strong">
          {name} <span className="type-caption text-muted">{value}</span>
        </span>
        <span className="type-caption text-muted">{job}</span>
      </div>
    </div>
  );
}
const FILL: Record<string, string> = {
  strong: "bg-strong", muted: "bg-muted", link: "bg-link", action: "bg-action", danger: "bg-danger", secondary: "bg-secondary",
  page: "bg-page", signin: "bg-signin", card: "bg-card", control: "bg-control", valid: "bg-valid", ageing: "bg-ageing",
};

function Section({ id, title, intro, children }: { id: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <Card title={title}>
      <p id={id} className="-mt-2 type-caption text-muted">
        {intro}
      </p>
      {children}
    </Card>
  );
}

export default function StyleGuide() {
  const [tab, setTab] = useState<"a" | "b" | "c">("a");
  const [sel, setSel] = useState("2026-10");
  const [filter, setFilter] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [code, setCode] = useState("");
  const [tick, setTick] = useState(true);
  const [modal, setModal] = useState<null | "p1" | "p2" | "p3" | "p4" | "p5" | "stepup">(null);
  const [reason, setReason] = useState("");
  const [ack, setAck] = useState(false);
  const close = () => setModal(null);

  return (
    <div className="min-h-full bg-page">
      <header className="flex h-topbar items-center border-b border-card bg-white px-8">
        <div>
          <h1 className="type-page-title text-strong">RERAN back office — style guide</h1>
          <p className="type-caption text-muted">Design standard Section D0. The code is the reference design; Figma follows it.</p>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-8 py-6">
        <Section id="colours" title="Colours" intro="Named by job. No other colour exists in the code — Tailwind's own palette is switched off.">
          <div className="grid grid-cols-3 gap-4">
            {COLOURS.map(([n, j]) => (
              <Swatch key={n} name={n} job={j} fill={FILL[n]} />
            ))}
          </div>
          <p className="type-group-title text-strong">Status pairs — badges and callouts only</p>
          <div className="flex gap-3">
            {PAIRS.map(([t, l]) => (
              <Badge key={t} tone={t}>
                {l}
              </Badge>
            ))}
            <StatusBadge status={{ label: "Rejected", tone: "error", overturned: true }} />
          </div>
        </Section>

        <Section id="text" title="Text styles" intro="Ten styles (nine plus button). Size, line height and weight always travel together; colour is separate.">
          <div className="flex flex-col divide-y divide-control">
            {TYPES.map(([cls, spec, use]) => (
              <div key={cls} className="grid grid-cols-12 items-baseline gap-4 py-3">
                <span className={`col-span-5 text-strong ${cls}`}>The quick brown fox · ₦2,438,750.00</span>
                <span className="col-span-3 type-body-strong text-strong">{cls}</span>
                <span className="col-span-4 type-caption text-muted">
                  {spec} — {use}
                </span>
              </div>
            ))}
          </div>
          <Notice>Casing: names are Title Case (menu items, screen titles, statuses, roles). Everything else is sentence case. Column headers are shown uppercase by their style.</Notice>
        </Section>

        <Section id="sizes" title="Sizes, corners and elevation" intro="Four control heights, three corners, two shadows — and a 4-px spacing grid.">
          <div className="flex items-end gap-4">
            {[
              ["h-control-sm", "32 · toolbar"],
              ["h-control", "36 · buttons"],
              ["h-control-lg", "40 · inputs"],
              ["h-control-xl", "44 · sign-in"],
              ["h-row", "48 · table row"],
            ].map(([h, l]) => (
              <div key={h} className="flex flex-col items-center gap-1">
                <span className={`w-24 rounded-control bg-info-bg ${h}`} />
                <span className="type-caption text-muted">{l}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-6">
            <div className="flex size-24 items-center justify-center rounded-control border border-control type-caption text-muted">control · 8</div>
            <div className="flex size-24 items-center justify-center rounded-card border border-card type-caption text-muted">card · 12</div>
            <div className="flex h-8 w-24 items-center justify-center rounded-full border border-control type-caption text-muted">full</div>
            <div className="flex size-24 items-center justify-center rounded-card bg-white shadow-overlay type-caption text-muted">overlay</div>
            <div className="flex size-24 items-center justify-center rounded-control border border-control bg-white shadow-hairline type-caption text-muted">hairline</div>
          </div>
        </Section>

        <Section id="buttons" title="Buttons" intro="One component. Exactly one primary per panel or pop-up; in a pop-up Cancel sits left of the confirm.">
          {(["primary", "secondary", "danger"] as ButtonVariant[]).map((v) => (
            <div key={v} className="flex items-center gap-3">
              <span className="w-24 type-label text-muted">{v}</span>
              {(["sm", "md"] as ButtonSize[]).map((s) => (
                <Button key={s} variant={v} size={s}>
                  {v === "danger" ? "Reject application" : v === "primary" ? "Approve and issue" : "Export"} · {s}
                </Button>
              ))}
              <Button variant={v} disabled>
                Disabled
              </Button>
              <Button variant={v} busy>
                Working
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <span className="w-24 type-label text-muted">link</span>
            <Button variant="link">Review</Button>
            <Button variant="link">Clear filters</Button>
            <Button variant="link" tone="danger">
              Remove
            </Button>
            <ButtonLink href="/styleguide/" variant="primary">
              ButtonLink (a link that looks like a button)
            </ButtonLink>
          </div>
          <div className="w-96">
            <Button variant="primary" size="lg">
              Log in · lg (sign-in only)
            </Button>
          </div>
        </Section>

        <Section id="forms" title="Form controls" intro="Shared controls only — never a hand-made input. 40 high; toolbar controls 32.">
          <div className="grid grid-cols-2 gap-6">
            <Field label="Full name" htmlFor="sg-name" hint="A hint sits under the field.">
              <TextInput id="sg-name" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Amina Bello" />
            </Field>
            <Field label="Work email" htmlFor="sg-email" required error="Must be a rera.gov.ng address.">
              <TextInput id="sg-email" error defaultValue="amina@gmail.com" />
            </Field>
            <ReasonField label="Why are you declining?" placeholder="Explain what is missing." value={reason} onChange={setReason} />
            <Field label="Authentication code" htmlFor="sg-code">
              <CodeInput id="sg-code" value={code} onChange={setCode} placeholder="6-digit code from your authenticator app" />
            </Field>
            <Field label="Notes" htmlFor="sg-notes">
              <TextArea id="sg-notes" placeholder="TextArea" />
            </Field>
            <div className="flex flex-col gap-3">
              <Checkbox checked={tick} onChange={setTick}>
                Licensing Reviewer
              </Checkbox>
              <Checkbox checked={!tick} onChange={(v) => setTick(!v)}>
                Licensing Authorizer
              </Checkbox>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SearchBox value={text} onChange={setText} />
            <FilterDropdown label="Status" value={filter} onChange={setFilter} options={[{ value: "Returned", count: 4 }, { value: "Under Review", count: 9 }]} />
            <Select label="Period" value={sel} onChange={setSel} options={[{ value: "2026-10", label: "October 2026", trailing: <Badge tone="success">Reconciled</Badge> }, { value: "2026-09", label: "September 2026", trailing: <Badge tone="neutral">Filed</Badge> }]} />
          </div>
          <Tabs tabs={[{ id: "a", label: "Collections" }, { id: "b", label: "Revenue" }, { id: "c", label: "Tax & remittance" }]} value={tab} onChange={setTab} />
        </Section>

        <Section id="cards" title="Cards, KPIs and banners" intro="Cards rely on their outline, never on elevation. Field groups are white with a control outline.">
          <KpiRow>
            <KpiCard label="Pending sign-off" value="15" caption="Awaiting your authorisation" />
            <KpiCard label="Gross collected" value="₦13,636,150.00" caption="All channels and tenders" />
            <KpiCard label="Oldest pending" value="6 days" caption="RRA/SO/2026/0218" />
          </KpiRow>
          <DetailHeader title="Licence revocation — Eko Realty Ltd" subtitle="RRA/SO/2026/0218" status={{ label: "Pending Sign-off", tone: "warning" }} meta={[{ label: "Source", value: "Licensing" }, { label: "Escalated", value: "6 days ago" }]} />
          <FieldGroup title="Applicant information" fields={[{ label: "Entity name", value: "Adron Homes & Properties" }, { label: "License number", value: "RC-20198" }, { label: "Contact", value: "registry@adronhomes.ng" }]} />
          <Banner tone="success">Reconciled — these figures are final unless the period is reopened.</Banner>
          <Banner tone="warning">Provisional — this period has not been reconciled. Figures may change.</Banner>
          <Banner tone="neutral">Filed — locked.</Banner>
          <Notice>Notice / callout: this is final. Once Licensing executes it, the licence is revoked.</Notice>
          <HelpBox title="What to do">Select at least one category, then save.</HelpBox>
        </Section>

        <TableCard
          title="Table — main (paginated, filtered, searchable)"
          filters={FILTERS}
          columns={COLUMNS}
          rows={ROWS}
          rowKey={(r) => r.reference}
          searchText={(r) => `${r.reference} ${r.applicant}`}
          paginate={{ one: "application", many: "applications" }}
          note="48-px rows · % column widths · money right-aligned · status as a badge · 10 rows per page."
        />

        <Section id="modals" title="Pop-ups and toast" intro="The six patterns of modals.md. Click to open each one.">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setModal("p1")}>P1 Confirm</Button>
            <Button onClick={() => { setReason(""); setModal("p2"); }}>P2 Reason required</Button>
            <Button onClick={() => { setAck(false); setModal("p3"); }}>P3 Destructive</Button>
            <Button onClick={() => setModal("p5")}>P5 Blocked</Button>
            <Button onClick={() => setModal("stepup")}>Step-up</Button>
            <Button onClick={() => showToast({ title: "Sign-off authorised", body: "RRA/SO/2026/0218 has returned to Licensing to execute the revocation." })}>Toast</Button>
          </div>
        </Section>
      </main>

      <Modal open={modal === "p1"} onClose={close} width={480} title="Reactivate this account?" description={<p>Sunday Okon gets their access back with the same role and category scope.</p>} actions={<><Button onClick={close}>Cancel</Button><Button variant="primary" onClick={close}>Reactivate account</Button></>} />
      <Modal open={modal === "p2"} onClose={close} width={480} title="Decline this sign-off?" description={<p>RRA/SO/2026/0218 returns to Licensing with your reason. Nothing is revoked.</p>} actions={<><Button onClick={close}>Cancel</Button><Button variant="danger" disabled={!reason.trim()} onClick={close}>Decline sign-off</Button></>}>
        <ReasonField label="Why are you declining?" placeholder="Explain what Licensing should do instead." value={reason} onChange={setReason} />
      </Modal>
      <Modal open={modal === "p3"} onClose={close} title="Deactivate this account?" description={<p>Ibrahim Musa loses access immediately. Deactivation is treated as permanent.</p>} actions={<><Button onClick={close}>Cancel</Button><Button variant="danger" disabled={!ack} onClick={close}>Deactivate account</Button></>}>
        <Notice>You&apos;ll be asked to re-authenticate. This is recorded against you in the audit trail.</Notice>
        <Acknowledge checked={ack} onChange={setAck}>I understand this is permanent.</Acknowledge>
      </Modal>
      <Modal open={modal === "p5"} onClose={close} title="A licensing role needs a category" description={<p>A licensing role can&apos;t be saved without at least one category scope.</p>} actions={<Button onClick={close}>Go back</Button>}>
        <HelpBox title="What to do">Select at least one category — Company Licensing & Permits, Individual Practitioner Credentials, or Institutional Accreditation — then save.</HelpBox>
      </Modal>
      <StepUpModal open={modal === "stepup"} action="Authorising a sign-off" onCancel={close} onConfirmed={close} />
      <ToastHost />
    </div>
  );
}
