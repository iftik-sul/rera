"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

/**
 * Confirmation message after an action (Figma component "Toast").
 * A page calls showToastOnNextPage() just before navigating; the next page
 * shows it top-right for a few seconds.
 */
type ToastMsg = { title: string; body: string };
const KEY = "reran.toast";

export function showToastOnNextPage(msg: ToastMsg) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(msg));
  } catch {
    /* storage blocked — the action still completes, just without the message */
  }
}

export function ToastHost() {
  const pathname = usePathname();
  const [msg, setMsg] = useState<ToastMsg | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (!raw) return;
      sessionStorage.removeItem(KEY);
      setMsg(JSON.parse(raw) as ToastMsg);
    } catch {
      /* nothing to show */
    }
  }, [pathname]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 6000);
    return () => clearTimeout(t);
  }, [msg]);

  if (!msg) return null;
  return (
    <div role="status" className="fixed top-[94px] right-8 z-40 flex w-[380px] items-start gap-3 rounded-xl border border-n30 bg-white px-4 py-3 shadow-lg">
      <Icon name="check-circle" size={20} className="mt-0.5 text-valid" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-[13px] font-semibold text-n900">{msg.title}</p>
        <p className="text-xs text-n400">{msg.body}</p>
      </div>
      <button type="button" onClick={() => setMsg(null)} aria-label="Dismiss" className="cursor-pointer text-n400 hover:text-n900">
        ×
      </button>
    </div>
  );
}
