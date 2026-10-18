/**
 * The "today" all sample data is written against. Figma's screens assume
 * 11 Oct 2026 (e.g. RRA/SO/2026/0218, escalated 05 Oct, is "6 days" old;
 * CRED/LIC/23/0044 was "cancelled on 11 Oct 2026"). Using one fixed date keeps
 * ages, expiries and counts consistent with each other. Replaced by the real
 * date once data comes from the backend.
 */
export const SAMPLE_TODAY = new Date("2026-10-11T12:00:00Z");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "05 Oct 2026" → Date */
export function parseDay(s: string): Date {
  const [d, m, y] = s.split(" ");
  return new Date(Date.UTC(Number(y), MONTHS.indexOf(m), Number(d), 12));
}

/** Whole days from `s` until SAMPLE_TODAY (positive = in the past). */
export function daysAgo(s: string): number {
  return Math.round((SAMPLE_TODAY.getTime() - parseDay(s).getTime()) / 86_400_000);
}

export const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;
