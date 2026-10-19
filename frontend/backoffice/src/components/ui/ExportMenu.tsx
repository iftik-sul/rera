"use client";

import { showToast } from "@/components/shell/Toast";
import { Button } from "./Button";
import { PopoverItem, PopoverList, usePopover } from "./Popover";

export type ExportKind = "PDF" | "Spreadsheet";

/**
 * The one Export control (design standard D1). Revenue Reports, the Work Queue and a register
 * entry all use it, so they can't drift apart. With two formats it opens a menu; with one it
 * exports straight away. Either way a toast confirms it — `message` writes the toast body.
 * Every export is recorded in the Audit Trail as an access entry (KB audit-trail.md).
 */
export function ExportMenu({
  label = "Export",
  formats = ["PDF", "Spreadsheet"],
  title,
  message,
}: {
  label?: string;
  formats?: ExportKind[];
  /** Toast title, e.g. "Queue exported". */
  title: string;
  /** Toast body for the chosen format. */
  message: (kind: ExportKind) => string;
}) {
  const p = usePopover();
  const run = (kind: ExportKind) => {
    p.close();
    showToast({ title, body: message(kind) });
  };

  if (formats.length === 1) return <Button onClick={() => run(formats[0])}>{label}</Button>;

  return (
    <div ref={p.ref} className="relative">
      <Button aria-haspopup="menu" aria-expanded={p.open} onClick={p.toggle}>
        {label}
      </Button>
      {p.open && (
        <PopoverList role="menu" align="right">
          {formats.map((f) => (
            <PopoverItem key={f} role="menuitem" tick={false} onClick={() => run(f)}>
              {f}
            </PopoverItem>
          ))}
        </PopoverList>
      )}
    </div>
  );
}
