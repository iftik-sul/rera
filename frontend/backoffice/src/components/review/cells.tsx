import type { Age } from "@/data/director-general/work-queue";

/** Age / SLA text: grey normally, amber when ageing, red when past the SLA. */
export function AgeText({ age }: { age: Age }) {
  const cls = age.tone === "breach" ? "text-danger" : age.tone === "warning" ? "text-age-warning" : "text-n400";
  return <span className={cls}>{age.text}</span>;
}
