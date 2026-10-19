"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

/**
 * Confirmation message after an action (Figma component "Toast").
 * A page calls showToastOnNextPage() just before navigating; the next page
 * shows it top-right for a few seconds. showToast() shows one on the current page.
 */
/** `link` = "a read-only link back" to the item just decided (application-review.md §6b). */
type ToastMsg = { title: string; body: string; link?: { label: string; href: string } };
const KEY = "reran.toast";
const EVENT = "reran:toast";

/** Show a toast now, without leaving the page (e.g. after suspending an account). */
export function showToast(msg: ToastMsg) {
  window.dispatchEvent(new CustomEvent<ToastMsg>(EVENT, { detail: msg }));
}

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
    const onToast = (e: Event) => setMsg((e as CustomEvent<ToastMsg>).detail);
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 6000);
    return () => clearTimeout(t);
  }, [msg]);

  if (!msg) return null;
  return (
    <div role="status" className="fixed top-24 right-8 z-40 flex w-toast items-start gap-3 rounded-card border border-card bg-white px-4 py-3 shadow-overlay">
      <Icon name="check-circle" size={20} className="mt-0.5 text-valid" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="type-group-title text-strong">{msg.title}</p>
        <p className="type-caption text-muted">{msg.body}</p>
        {msg.link && (
          <Link href={msg.link.href} onClick={() => setMsg(null)} className="w-fit type-label text-link hover:underline focus-ring">
            {msg.link.label}
          </Link>
        )}
      </div>
      <button type="button" onClick={() => setMsg(null)} aria-label="Dismiss" className="cursor-pointer text-muted hover:text-strong">
        ×
      </button>
    </div>
  );
}
