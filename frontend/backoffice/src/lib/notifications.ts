/**
 * Which notifications this browser tab has read. Shared by the Notifications screen and the
 * top-bar bell, so the bell's dot goes out when the last one is read.
 * DEMO: remembered for this tab only — the backend owns it later.
 */
import { notifications } from "@/data/director-general/notifications";

const KEY = "reran.notifications.read";
export const READ_EVENT = "reran:notifications-read";

export function loadRead(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveRead(ids: string[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* storage blocked — the page still works, it just won't remember */
  }
  window.dispatchEvent(new Event(READ_EVENT));
}

export const unreadCount = (read: string[]) => notifications.filter((n) => n.unread && !read.includes(n.id)).length;
