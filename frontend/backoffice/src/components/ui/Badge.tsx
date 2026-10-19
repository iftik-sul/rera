/**
 * Status badge (Figma "_Badge base"): small rounded pill.
 * Tone picks the colour pair; the words come from the screen.
 */
export type BadgeTone = "info" | "warning" | "success" | "error" | "neutral" | "indigo" | "purple" | "orange";

const tones: Record<BadgeTone, string> = {
  info: "bg-info-bg text-info-text",
  warning: "bg-warning-bg text-warning-text",
  success: "bg-success-bg text-success-text",
  error: "bg-error-bg text-error-text",
  neutral: "bg-neutral-bg text-neutral-text",
  // Extended — lifecycle badges only (licensing Review Stage)
  indigo: "bg-indigo-bg text-indigo-text",
  purple: "bg-purple-bg text-purple-text",
  orange: "bg-orange-bg text-orange-text",
};

export function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 type-label whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
}

/**
 * A status as stored in sample data. `overturned` adds the grey "Overturned"
 * badge in front of the outcome — Figma reference "A13 — Overturned status
 * pattern": two badges, Overturned first, 6px apart.
 */
export type Status = { label: string; tone: BadgeTone; overturned?: boolean };

export function StatusBadge({ status }: { status: Status }) {
  if (!status.overturned) return <Badge tone={status.tone}>{status.label}</Badge>;
  return (
    <span className="inline-flex gap-1.5">
      <Badge tone="neutral">Overturned</Badge>
      <Badge tone={status.tone}>{status.label}</Badge>
    </span>
  );
}
