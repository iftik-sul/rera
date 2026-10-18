"use client";

import { useEffect, useId, useRef } from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-n900/60 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex max-h-full w-full flex-col gap-4 overflow-y-auto rounded-xl bg-white p-6 outline-none"
        style={{ maxWidth: width }}
      >
        <h2 id={titleId} className="text-lg leading-[27px] font-medium text-n900">
          {title}
        </h2>
        {description && <div className="flex flex-col gap-3 text-[13px] leading-5 text-n400">{description}</div>}
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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-n900">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="resize-none rounded-lg border border-n40 bg-white px-3 py-2.5 text-[13px] leading-5 text-n900 outline-none placeholder:text-n400 focus:border-blue-600"
      />
      <p className="text-xs text-n400">{optional ? "Recommended." : "Required."} Recorded against this item in the audit trail.</p>
    </div>
  );
}

/** "I understand…" tick box (Figma "Acknowledgement"). */
export function Acknowledge({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-5 text-n900">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-[18px] shrink-0 accent-blue-600" />
      <span>{children}</span>
    </label>
  );
}

/** Bordered "What would unblock this" box used in the blocker pop-ups. */
export function HelpBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-n40 bg-white px-4 py-3">
      <p className="text-xs font-medium text-n900">{title}</p>
      <p className="text-[13px] leading-5 text-n400">{children}</p>
    </div>
  );
}
