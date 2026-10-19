/**
 * Lists keep their page, filters and Open · Completed side in the web address. Each list
 * remembers that address here as it changes, so a breadcrumb back to the list lands where
 * the officer left it (2026-10-19 review: it used to drop to page 1, unfiltered).
 * Per tab (sessionStorage); a missing or blocked store just means a plain link.
 */
const KEY = (path: string) => `reran.list:${path.replace(/\/$/, "")}`;

export function rememberList() {
  try {
    sessionStorage.setItem(KEY(window.location.pathname), window.location.search);
  } catch {
    /* storage blocked — the breadcrumb falls back to the plain link */
  }
}

/** The list address to return to: the remembered one, unless it's on the other side of Open · Completed. */
export function recallList(href: string): string {
  try {
    const target = new URL(href, window.location.origin);
    const saved = sessionStorage.getItem(KEY(target.pathname));
    if (!saved) return href;
    const kept = new URLSearchParams(saved);
    if ((kept.get("view") ?? "open") !== (target.searchParams.get("view") ?? "open")) return href;
    return target.pathname + (saved.startsWith("?") || !saved ? saved : `?${saved}`);
  } catch {
    return href;
  }
}
