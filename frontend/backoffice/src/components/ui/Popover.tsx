"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Floating lists (design standard D0.3/D0.4): filter options, the report period
 * picker, the Export menu. One look for all: white, grey outline, 8px corners,
 * the `overlay` shadow, 8px tall rows. Closes on choosing, clicking outside, or Esc.
 */
export function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return { open, setOpen, ref, toggle: () => setOpen((o) => !o), close: () => setOpen(false) };
}

export function PopoverList({
  role = "listbox",
  label,
  align = "left",
  children,
}: {
  role?: "listbox" | "menu";
  label?: string;
  align?: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <ul
      role={role}
      aria-label={label}
      className={`absolute top-full z-30 mt-1 max-h-72 min-w-56 overflow-y-auto rounded-control border border-control bg-white py-1 shadow-overlay ${align === "right" ? "right-0" : "left-0"}`}
    >
      {children}
    </ul>
  );
}

/** One row in a popover list. `selected` shows a tick and blue text (listbox); `trailing` = count, badge… */
export function PopoverItem({
  children,
  selected,
  trailing,
  onClick,
  role = "option",
  tick = true,
}: {
  children: React.ReactNode;
  selected?: boolean;
  trailing?: React.ReactNode;
  onClick: () => void;
  role?: "option" | "menuitem";
  /** Leave room for the ✓ column (listboxes); menus don't need it. */
  tick?: boolean;
}) {
  return (
    <li role={role === "option" ? "option" : "none"} aria-selected={role === "option" ? !!selected : undefined}>
      <button
        type="button"
        role={role === "menuitem" ? "menuitem" : undefined}
        onClick={onClick}
        className={`flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left hover:bg-page focus-ring ${selected ? "type-body-strong text-link" : "type-body text-strong"}`}
      >
        {tick && <span className="w-3 shrink-0">{selected ? "✓" : ""}</span>}
        <span className="flex-1 whitespace-nowrap">{children}</span>
        {trailing !== undefined && <span className="text-muted">{trailing}</span>}
      </button>
    </li>
  );
}
