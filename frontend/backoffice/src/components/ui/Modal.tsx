"use client";

import { useEffect, useId, useRef } from "react";
import { Checkbox, Field, TextArea } from "./Form";

/**
 * Pop-up dialog. In Figma each one is a separate frame (house rule for the
 * prototype); in code it opens on top of the page that raised it.
 * Dark-blue scrim at 60%, white 12px-rounded box, 24px padding.
 * Esc or Cancel closes it.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  width = 520,
  children,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  width?: 480 | 520;
  children?: React.ReactNode;
  actions: React.ReactNode;
}) {
  const titleId = useId();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    boxRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-strong/60 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex max-h-full w-full flex-col gap-4 overflow-y-auto rounded-card bg-white p-6 outline-none"
        style={{ maxWidth: width }}
      >
        <h2 id={titleId} className="type-page-title text-strong">
          {title}
        </h2>
        {description && <div className="flex flex-col gap-3 type-body text-muted">{description}</div>}
        {children}
        <div className="flex justify-end gap-3">{actions}</div>
      </div>
    </div>
  );
}

/** Free-text reason inside a dialog (Figma "Reason"). Required unless `optional`. */
export function ReasonField({
  label,
  placeholder,
  value,
  onChange,
  optional = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  /** Recommended but not required (e.g. a note on Authorise sign-off). */
  optional?: boolean;
}) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} hint={`${optional ? "Recommended." : "Required."} Recorded against this item in the audit trail.`}>
      <TextArea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </Field>
  );
}

/** "I understand…" tick box (Figma "Acknowledgement"). */
export function Acknowledge({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <Checkbox checked={checked} onChange={onChange}>
      {children}
    </Checkbox>
  );
}

/** Bordered "What would unblock this" box used in the blocker pop-ups. */
export function HelpBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-control border border-control bg-white px-4 py-3">
      <p className="type-label text-strong">{title}</p>
      <p className="type-body text-muted">{children}</p>
    </div>
  );
}
