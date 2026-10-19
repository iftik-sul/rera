"use client";

import { useSyncExternalStore } from "react";
import type { Status } from "@/components/ui/Badge";
import type { AuditEntry } from "@/data/director-general/audit";
import { SAMPLE_TODAY } from "@/data/sample-date";

/**
 * Demo state — what the signed-in officer has done in this browser session.
 *
 * The prototype has no server, so every decision used to show a toast and change nothing.
 * Project-lead decision 2026-10-19: decisions stick for the rest of the session, so the
 * queues, counts, Completed sides, sign-offs, staff pages and the Audit Trail all reflect
 * them. Kept in sessionStorage (closing the tab resets the demo); every screen reads the
 * sample data through these overrides.
 */

const KEY = "reran.demo";
const EVENT = "reran:demo";

/** What happened to an application in this session. */
export type AppChange = {
  status: Status;
  /** "11 Oct 2026" */
  on: string;
  by: string;
  role: string;
  reason?: string;
  /** decided = Approve/Reject/Accept · overturned = DG override · with-applicant = Request Info / Return · chain = sent back to stage 1 or 2 */
  kind: "decided" | "overturned" | "with-applicant" | "chain";
  /** For an overturn: the outcome that was replaced. */
  replaced?: string;
  /** "11 Oct 2026, 14:07" — set when recorded. */
  at?: string;
};
export type SignoffChange = { status: "Authorised" | "Declined"; on: string; reason?: string };
export type StaffChange = Partial<{
  status: "Invited" | "Active" | "Suspended" | "Deactivated";
  mfa: "Enrolled" | "Not enrolled";
  roles: string[];
  scope: string[];
  /** null = the lock-out / MFA request was dealt with this session (null, not undefined, so it survives JSON). */
  lockedOut: null;
  mfaRequest: null;
}>;

export type Demo = {
  apps: Record<string, AppChange>;
  signoffs: Record<string, SignoffChange>;
  staff: Record<string, StaffChange>;
  /** Newest first. */
  audit: AuditEntry[];
};

const EMPTY: Demo = { apps: {}, signoffs: {}, staff: {}, audit: [] };

let cacheRaw: string | null = null;
let cache: Demo = EMPTY;

function read(): Demo {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw === cacheRaw) return cache;
    cacheRaw = raw;
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as Demo) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: Demo) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked — the screen still shows the toast, the change just doesn't persist */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** The session's demo state; re-renders when it changes. Empty during the static build. */
export function useDemo(): Demo {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** Read once, outside React (e.g. right before navigating). */
export const demoNow = () => read();

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** The prototype's "today" (11 Oct 2026), as the screens write dates. */
export const demoToday = () => `${SAMPLE_TODAY.getUTCDate()} ${MONTHS[SAMPLE_TODAY.getUTCMonth()]} ${SAMPLE_TODAY.getUTCFullYear()}`;
/** "11 Oct 2026, 14:07" — the date stays the sample day, the time is the real clock. */
export const demoStamp = () => {
  const t = new Date();
  return `${demoToday()}, ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
};

let seq = 0;
function audit(entry: Omit<AuditEntry, "id" | "timestamp">): AuditEntry {
  seq += 1;
  return { id: `demo-${Date.now()}-${seq}`, timestamp: demoStamp(), ...entry };
}

export const DG_NAME = "Adaeze Nwosu";
export const DG_ROLE = "Director-General / Registrar";

/** Record a change to an application, and its audit entry. */
export function recordApp(id: string, change: AppChange, entry: Omit<AuditEntry, "id" | "timestamp" | "actor" | "actedAs">) {
  const d = read();
  write({ ...d, apps: { ...d.apps, [id]: { at: demoStamp(), ...change } }, audit: [audit({ actor: change.by, actedAs: change.role, ...entry }), ...d.audit] });
}

export function recordSignoff(id: string, change: SignoffChange, entry: Omit<AuditEntry, "id" | "timestamp" | "actor" | "actedAs">) {
  const d = read();
  write({ ...d, signoffs: { ...d.signoffs, [id]: change }, audit: [audit({ actor: DG_NAME, actedAs: DG_ROLE, ...entry }), ...d.audit] });
}

export function recordStaff(id: string, change: StaffChange, entry: Omit<AuditEntry, "id" | "timestamp" | "actor" | "actedAs">) {
  const d = read();
  write({ ...d, staff: { ...d.staff, [id]: { ...d.staff[id], ...change } }, audit: [audit({ actor: DG_NAME, actedAs: DG_ROLE, ...entry }), ...d.audit] });
}

/** An audit entry with no state change (e.g. an export, which the toast promises is logged). */
export function recordAudit(entry: Omit<AuditEntry, "id" | "timestamp" | "actor" | "actedAs">) {
  const d = read();
  write({ ...d, audit: [audit({ actor: DG_NAME, actedAs: DG_ROLE, ...entry }), ...d.audit] });
}

/** Start the demo again from the sample data. */
export function resetDemo() {
  write(EMPTY);
}
